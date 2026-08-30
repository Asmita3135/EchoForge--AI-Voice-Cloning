"""
EchoForge — Member 1 Audio Preprocessing
Conservative, non-destructive audio standardization for Track A deepfake detection.
"""

import os
import numpy as np
import soundfile as sf
import librosa
import torch
import torchaudio


def load_and_standardize_audio(audio_path: str, target_sr: int = 16000, remove_dc: bool = True):
    """
    Loads audio from standard formats (WAV, MP3, FLAC, M4A, AAC, OGG),
    converts to mono via channel averaging, validates finite numbers,
    resamples to target_sr (16 kHz), and removes DC offset.

    Returns:
        audio: 1D numpy array of float32 samples.
        sr: int, sample rate (target_sr).
        original_info: dict with original sample rate, channels, and duration.
    """
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    original_sr = None
    original_channels = 1
    raw_audio = None

    # Strategy 1: librosa (handles most formats including mp3/ogg/flac/m4a if backend is present)
    try:
        raw_audio, original_sr = librosa.load(audio_path, sr=None, mono=False)
        if raw_audio.ndim > 1:
            original_channels = raw_audio.shape[0]
            raw_audio = np.mean(raw_audio, axis=0)
        else:
            original_channels = 1
    except Exception:
        # Strategy 2: soundfile
        try:
            data, original_sr = sf.read(audio_path, dtype="float32")
            if data.ndim > 1:
                original_channels = data.shape[1]
                raw_audio = np.mean(data, axis=1)
            else:
                original_channels = 1
                raw_audio = data
        except Exception:
            # Strategy 3: torchaudio
            try:
                wav, original_sr = torchaudio.load(audio_path)
                original_channels = wav.shape[0]
                if wav.shape[0] > 1:
                    wav = wav.mean(dim=0)
                else:
                    wav = wav.squeeze(0)
                raw_audio = wav.cpu().numpy()
            except Exception as e:
                raise ValueError(f"Failed to read audio file '{audio_path}' with any audio backend: {e}")

    # Validate non-empty
    if raw_audio is None or len(raw_audio) == 0:
        raise ValueError(f"Audio file '{audio_path}' is empty or contains 0 samples.")

    # Clean non-finite samples (NaN, Inf)
    raw_audio = np.nan_to_num(raw_audio, nan=0.0, posinf=0.0, neginf=0.0)

    original_duration = float(len(raw_audio) / original_sr) if original_sr else 0.0

    # Resample if needed
    if original_sr != target_sr:
        audio = librosa.resample(raw_audio, orig_sr=original_sr, target_sr=target_sr)
    else:
        audio = raw_audio

    # DC offset removal (mean subtraction) - preserves high freq synthetic artifacts while stabilizing zero baseline
    if remove_dc and len(audio) > 0:
        audio = audio - np.mean(audio)

    audio = audio.astype(np.float32)

    original_info = {
        "original_sample_rate": original_sr,
        "original_channels": original_channels,
        "original_duration_sec": round(original_duration, 4),
    }

    return audio, target_sr, original_info
