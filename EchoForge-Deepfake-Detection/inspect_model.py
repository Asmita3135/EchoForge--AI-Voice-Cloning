import torch
import soundfile as sf
import librosa
import numpy as np
import os
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

MODEL_NAME = "garystafford/wav2vec2-deepfake-voice-detector"

def debug_audio_file(audio_path):
    print("=" * 60)
    print(f"DEBUGGING AUDIO FILE: {audio_path}")
    print("=" * 60)
    
    if not os.path.exists(audio_path):
        print(f"File not found: {audio_path}")
        return

    # Load audio raw
    data, sample_rate = sf.read(audio_path)
    
    # Duration
    total_samples = len(data) if data.ndim == 1 else len(data)
    duration_sec = total_samples / sample_rate
    
    num_channels = 1 if data.ndim == 1 else data.shape[1]
    
    if data.ndim > 1:
        mono_data = np.mean(data, axis=1)
    else:
        mono_data = data

    # Resample
    if sample_rate != 16000:
        resampled_speech = librosa.resample(y=mono_data.astype(np.float32), orig_sr=sample_rate, target_sr=16000)
    else:
        resampled_speech = mono_data.astype(np.float32)

    # Signal stats
    min_val = float(np.min(resampled_speech))
    max_val = float(np.max(resampled_speech))
    mean_val = float(np.mean(resampled_speech))
    std_val = float(np.std(resampled_speech))
    peak_abs = float(np.max(np.abs(resampled_speech)))
    
    # Check clipping
    is_clipped = peak_abs >= 0.999
    clipped_count = np.sum(np.abs(resampled_speech) >= 0.999)
    
    # Silence detection
    non_silent_intervals = librosa.effects.split(resampled_speech, top_db=30)
    non_silent_duration = sum((end - start) for start, end in non_silent_intervals) / 16000.0 if len(non_silent_intervals) > 0 else 0.0
    leading_silence = non_silent_intervals[0][0] / 16000.0 if len(non_silent_intervals) > 0 else duration_sec
    trailing_silence = (len(resampled_speech) - non_silent_intervals[-1][1]) / 16000.0 if len(non_silent_intervals) > 0 else 0.0

    print(f"Original Sample Rate    : {sample_rate} Hz")
    print(f"Original Channels       : {num_channels}")
    print(f"Total Duration          : {duration_sec:.2f} seconds")
    print(f"Non-Silent Duration     : {non_silent_duration:.2f} seconds")
    print(f"Leading Silence         : {leading_silence:.2f} seconds")
    print(f"Trailing Silence        : {trailing_silence:.2f} seconds")
    print(f"Amplitude Range         : [{min_val:.4f}, {max_val:.4f}]")
    print(f"Peak Absolute Amplitude : {peak_abs:.4f}")
    print(f"Is Amplitude Normal/Std : Mean={mean_val:.4f}, Std={std_val:.4f}")
    print(f"Clipping Detected?      : {is_clipped} ({clipped_count} samples clipped)")

    # Model inference
    print("\n--- MODEL INSPECTION & LOGITS ---")
    feature_extractor = AutoFeatureExtractor.from_pretrained(MODEL_NAME)
    model = AutoModelForAudioClassification.from_pretrained(MODEL_NAME)
    
    print(f"model.config.id2label : {model.config.id2label}")
    print(f"model.config.label2id : {model.config.label2id}")

    inputs = feature_extractor(resampled_speech, sampling_rate=16000, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits.squeeze()
        probs = torch.softmax(logits, dim=-1)

    print(f"Raw Logits            : {logits.tolist()}")
    print(f"Softmax Probabilities : {probs.tolist()}")

    # Map class probabilities
    id2label = model.config.id2label
    for idx, prob in enumerate(probs.tolist()):
        label = id2label.get(idx, f"CLASS_{idx}")
        print(f"  Class {idx} ({label}) Prob : {prob:.4f} ({prob*100:.2f}%)")

    top_idx = torch.argmax(probs).item()
    pred_label = id2label.get(top_idx, f"CLASS_{top_idx}")
    print(f"\nFinal Prediction       : {pred_label.upper()} (Score: {probs[top_idx].item():.4f})")

if __name__ == "__main__":
    debug_audio_file("Test Rec.wav")
    debug_audio_file("test.wav")
