"""
Adapter for Member 2 (Speaker Verification Module).
Wraps speaker comparison logic safely from Member 4 without modifying Member 2 source code.
Handles optional reference audio, skipped states, exceptions, and SystemExit isolation.
"""
import os
import math
import shutil
import pathlib
from typing import Optional
from adapters.result import AdapterResult

# Member 2 Code Thresholds (verify_speaker.py)
PROTOTYPE_THRESHOLD = 0.6000
UNCERTAINTY_MARGIN = 0.0500


def _prepare_speechbrain_model_dir(savedir: str) -> None:
    """Pre-downloads HF snapshot and copies all checkpoint files to avoid Windows symlink error 1314."""
    os.makedirs(savedir, exist_ok=True)
    try:
        from huggingface_hub import snapshot_download
        snapshot_path = snapshot_download(repo_id="speechbrain/spkrec-ecapa-voxceleb")
        for filename in os.listdir(snapshot_path):
            src_file = os.path.join(snapshot_path, filename)
            dst_file = os.path.join(savedir, filename)
            if os.path.isfile(src_file) and not os.path.exists(dst_file):
                shutil.copy2(src_file, dst_file)
        
        # Ensure label_encoder.ckpt exists as a physical copy if label_encoder.txt exists
        txt_encoder = os.path.join(savedir, "label_encoder.txt")
        ckpt_encoder = os.path.join(savedir, "label_encoder.ckpt")
        if os.path.exists(txt_encoder) and not os.path.exists(ckpt_encoder):
            shutil.copy2(txt_encoder, ckpt_encoder)
    except Exception:
        pass


def run(reference_audio_path: Optional[str], test_audio_path: str) -> AdapterResult:
    """
    Executes Member 2 speaker verification comparing reference and test audio.

    Args:
        reference_audio_path: Optional path to claimed speaker reference audio.
                              If None/empty/skipped, returns status "skipped".
        test_audio_path: Path to the test audio under investigation.

    Returns:
        AdapterResult with status "ok", "error", or "skipped".
    """
    # 1. Skipped state check
    if not reference_audio_path or str(reference_audio_path).strip().lower() in ("none", "skipped", ""):
        return AdapterResult(status="skipped", data=None, error_message=None)

    # 2. File existence check
    if not os.path.exists(reference_audio_path):
        return AdapterResult(
            status="error",
            error_message=f"Reference audio file not found: '{reference_audio_path}'",
        )
    if not os.path.exists(test_audio_path):
        return AdapterResult(
            status="error",
            error_message=f"Test audio file not found: '{test_audio_path}'",
        )

    # 3. Safely execute speaker verification using Member 2's underlying models/audio_converter
    ref_wav_path = None
    tst_wav_path = None
    ref_is_temp = False
    tst_is_temp = False

    try:
        import torch
        from audio_converter import convert_to_wav, cleanup_temp_file

        # Convert/resample audio to 16kHz WAV
        ref_wav_raw, ref_is_temp = convert_to_wav(reference_audio_path)
        ref_wav_path = pathlib.Path(ref_wav_raw).resolve().as_posix()

        tst_wav_raw, tst_is_temp = convert_to_wav(test_audio_path)
        tst_wav_path = pathlib.Path(tst_wav_raw).resolve().as_posix()

        # Load SpeechBrain SpeakerRecognition model (matching Member 2 verify_speaker.py)
        try:
            from speechbrain.inference.speaker import SpeakerRecognition
        except ImportError:
            from speechbrain.pretrained import SpeakerRecognition

        member2_dir = os.path.abspath("C:/Users/ASMITA/OneDrive/Desktop/EchoForge- Member-Repos/EchoForge--AI-Voice-Cloning-speaker_verification")
        savedir = pathlib.Path(member2_dir, "pretrained_model").resolve().as_posix()
        _prepare_speechbrain_model_dir(savedir)

        try:
            verification_model = SpeakerRecognition.from_hparams(
                source=savedir,
                savedir=savedir,
                run_opts={"device": "cpu"},
            )
        except Exception:
            verification_model = SpeakerRecognition.from_hparams(
                source="speechbrain/spkrec-ecapa-voxceleb",
                savedir=savedir,
                run_opts={"device": "cpu"},
            )

        signal_ref = verification_model.load_audio(ref_wav_path)
        signal_tst = verification_model.load_audio(tst_wav_path)

        embedding_ref = verification_model.encode_batch(signal_ref)
        embedding_tst = verification_model.encode_batch(signal_tst)

        dim = embedding_ref.shape[-1]
        raw_similarity_tensor = torch.nn.functional.cosine_similarity(
            embedding_ref, embedding_tst, dim=-1
        )
        raw_similarity_score = float(raw_similarity_tensor.squeeze().item())

        if not math.isfinite(raw_similarity_score):
            raise ValueError(f"Cosine similarity produced non-finite score: {raw_similarity_score}")

        # Apply Member 2 Code Thresholds (0.6000 ± 0.0500)
        if raw_similarity_score >= (PROTOTYPE_THRESHOLD + UNCERTAINTY_MARGIN):
            decision = "SAME SPEAKER"
        elif raw_similarity_score <= (PROTOTYPE_THRESHOLD - UNCERTAINTY_MARGIN):
            decision = "DIFFERENT SPEAKER"
        else:
            decision = "UNCERTAIN"

        data = {
            "similarity": raw_similarity_score,
            "decision": decision,
            "threshold": PROTOTYPE_THRESHOLD,
            "uncertainty_margin": UNCERTAINTY_MARGIN,
            "embedding_dim": dim,
        }
        return AdapterResult(status="ok", data=data)

    except SystemExit as se:
        return AdapterResult(
            status="error",
            error_message=f"Member 2 terminated with SystemExit: code {se.code}",
        )
    except Exception as e:
        return AdapterResult(
            status="error",
            error_message=f"Member 2 speaker verification failed: {e}",
        )
    finally:
        # Cleanup temporary files safely
        try:
            from audio_converter import cleanup_temp_file
            if ref_is_temp and ref_wav_path:
                cleanup_temp_file(ref_wav_path)
            if tst_is_temp and tst_wav_path:
                cleanup_temp_file(tst_wav_path)
        except Exception:
            pass
