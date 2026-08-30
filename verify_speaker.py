"""
===============================================================================
 EchoForge - Speaker Verification Module (Milestone 1 Upgrade)
===============================================================================
 Accepts any supported audio (.wav, .mp3, .m4a, .aac, .flac, .ogg, .wma) or
 video (.mp4, .mkv, .avi, .mov, .webm) file, extracts 16 kHz mono WAV audio,
 and computes speaker similarity using SpeechBrain's pre-trained ECAPA-TDNN.

 Usage Examples:
   python verify_speaker.py reference.m4a test.m4a
   python verify_speaker.py reference.mp3 suspicious.mp4
   python verify_speaker.py reference.wav same_speaker.wav
===============================================================================
"""

import sys
import os
import shutil
import pathlib
import torch

from audio_converter import (
    convert_to_wav,
    cleanup_temp_file,
    FFmpegNotFoundError,
    NoAudioTrackError,
    AudioConversionError,
    ALL_SUPPORTED_EXTENSIONS
)

# -----------------------------------------------------------------------------
# STEP 0: Windows Terminal Encoding & OS Symlink Fallback Configuration
# -----------------------------------------------------------------------------
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Fix for Windows OS symlink privilege restriction (WinError 1314):
_original_symlink_to = pathlib.Path.symlink_to

def _safe_symlink_to(self, target, target_is_directory=False):
    try:
        _original_symlink_to(self, target, target_is_directory=target_is_directory)
    except OSError:
        if self.exists() or self.is_symlink():
            try:
                self.unlink()
            except Exception:
                pass
        target_path = pathlib.Path(target)
        if target_path.is_dir():
            shutil.copytree(target_path, self, dirs_exist_ok=True)
        else:
            shutil.copy2(target_path, self)

pathlib.Path.symlink_to = _safe_symlink_to

# -----------------------------------------------------------------------------
# STEP 1: SpeechBrain Model Imports
# -----------------------------------------------------------------------------
try:
    from speechbrain.inference.speaker import SpeakerRecognition
except ImportError:
    try:
        from speechbrain.pretrained import SpeakerRecognition
    except ImportError:
        print("\n[ERROR] 'speechbrain' library is not installed.")
        print("Please activate your environment and install dependencies using:")
        print("    pip install -r requirements.txt\n")
        sys.exit(1)


def compare_speakers(reference_input: str, test_input: str):
    """
    Executes end-to-end speaker verification:
    1. Preprocesses/converts audio or video input files into 16 kHz mono WAV.
    2. Validates temporary filesystem paths.
    3. Passes audio through pre-trained SpeechBrain ECAPA-TDNN model.
    4. Extracts 192-dimensional speaker embeddings.
    5. Computes raw Cosine Similarity score.
    6. Evaluates threshold decision (SAME SPEAKER / DIFFERENT SPEAKER / UNCERTAIN).
    7. Automatically cleans up temporary WAV files after execution is complete.
    """

    ref_wav_path = None
    ref_is_temp = False
    tst_wav_path = None
    tst_is_temp = False

    print("\n==================================================")
    print("          EchoForge SPEAKER VERIFICATION          ")
    print("==================================================")
    print(f"\nReference : {reference_input}")
    print(f"Test      : {test_input}")

    try:
        # STEP 2: Automatic Audio/Video Conversion & Preprocessing
        print("\nAudio preprocessing:")
        
        ref_wav_path_raw, ref_is_temp = convert_to_wav(reference_input)
        ref_wav_path = pathlib.Path(ref_wav_path_raw).resolve().as_posix()
        ref_ext = pathlib.Path(reference_input).suffix.lower()
        
        if ref_ext in {".mp4", ".mkv", ".avi", ".mov", ".webm"}:
            print("  ✓ Reference audio extracted and converted to 16 kHz mono WAV")
        else:
            print("  ✓ Reference audio converted to 16 kHz mono WAV")

        tst_wav_path_raw, tst_is_temp = convert_to_wav(test_input)
        tst_wav_path = pathlib.Path(tst_wav_path_raw).resolve().as_posix()
        tst_ext = pathlib.Path(test_input).suffix.lower()
        
        if tst_ext in {".mp4", ".mkv", ".avi", ".mov", ".webm"}:
            print("  ✓ Test audio extracted and converted to 16 kHz mono WAV")
        else:
            print("  ✓ Test audio converted to 16 kHz mono WAV")

        # STEP 3: Debug Check - Verify Temporary Audio Paths Exist
        print("\nDebug File Check:")
        print(f"  Reference WAV: {ref_wav_path}")
        print(f"  Test WAV     : {tst_wav_path}")
        print(f"  Temporary reference WAV exists: {os.path.exists(ref_wav_path)}")
        print(f"  Temporary test WAV exists     : {os.path.exists(tst_wav_path)}")

        if not os.path.exists(ref_wav_path):
            raise FileNotFoundError(f"Converted reference WAV file does not exist: '{ref_wav_path}'")

        if not os.path.exists(tst_wav_path):
            raise FileNotFoundError(f"Converted test WAV file does not exist: '{tst_wav_path}'")

        # STEP 4: Load Pretrained SpeechBrain ECAPA-TDNN Model
        print("\nEmbedding:")
        savedir = pathlib.Path(os.path.dirname(__file__), "pretrained_model").resolve().as_posix()
        
        try:
            from huggingface_hub import snapshot_download
            snapshot_download(
                repo_id="speechbrain/spkrec-ecapa-voxceleb",
                local_dir=savedir,
                local_dir_use_symlinks=False
            )
        except Exception:
            pass

        verification_model = SpeakerRecognition.from_hparams(
            source=savedir,
            savedir=savedir
        )
        print("  ✓ ECAPA-TDNN")

        # STEP 5: Embedding Extraction & Cosine Similarity Calculation
        signal_ref = verification_model.load_audio(ref_wav_path)
        signal_tst = verification_model.load_audio(tst_wav_path)

        embedding_ref = verification_model.encode_batch(signal_ref)
        embedding_tst = verification_model.encode_batch(signal_tst)

        dim = embedding_ref.shape[-1]
        print(f"  ✓ {dim}-dimensional speaker embedding")

        raw_similarity_tensor = torch.nn.functional.cosine_similarity(embedding_ref, embedding_tst, dim=-1)
        raw_similarity_score = float(raw_similarity_tensor.squeeze().item())

        # STEP 6: Decision Logic
        PROTOTYPE_THRESHOLD = 0.6000
        UNCERTAINTY_MARGIN = 0.0500

        if raw_similarity_score >= (PROTOTYPE_THRESHOLD + UNCERTAINTY_MARGIN):
            decision = "SAME SPEAKER"
        elif raw_similarity_score <= (PROTOTYPE_THRESHOLD - UNCERTAINTY_MARGIN):
            decision = "DIFFERENT SPEAKER"
        else:
            decision = "UNCERTAIN"

        # STEP 7: Display Clean Verification Results
        print("\n" + "-" * 50)
        print(f"Raw Cosine Similarity : {raw_similarity_score:.4f}")
        print(f"Prototype Threshold   : {PROTOTYPE_THRESHOLD:.4f}")
        print(f"\nDecision               : {decision}")
        print("=" * 50 + "\n")

    except (FFmpegNotFoundError, NoAudioTrackError, ValueError, FileNotFoundError) as e:
        print("\n" + "!" * 50)
        print(" [ERROR] Input Processing Failed")
        print("!" * 50)
        print(f"{str(e)}")
        print("!" * 50 + "\n")
        sys.exit(1)

    except AudioConversionError as e:
        print("\n" + "!" * 50)
        print(" [ERROR] Audio Conversion Error")
        print("!" * 50)
        print(f"{str(e)}")
        print("!" * 50 + "\n")
        sys.exit(1)

    except Exception as e:
        print("\n" + "!" * 50)
        print(f" [ERROR] Verification Failed: {str(e)}")
        print("!" * 50 + "\n")
        sys.exit(1)

    finally:
        # STEP 8: Automatic Temp File Cleanup after verification completes
        if ref_is_temp:
            cleanup_temp_file(ref_wav_path)
        if tst_is_temp:
            cleanup_temp_file(tst_wav_path)


if __name__ == "__main__":
    if len(sys.argv) == 3:
        ref_file = sys.argv[1]
        tst_file = sys.argv[2]
    elif len(sys.argv) == 1:
        ref_file = "reference.wav"
        tst_file = "test.wav"
    else:
        print("\nUsage:")
        print("   python verify_speaker.py <reference_file> <test_file>")
        print("\nSupported formats:")
        print("   Audio: .wav, .mp3, .m4a, .aac, .flac, .ogg, .wma")
        print("   Video: .mp4, .mkv, .avi, .mov, .webm")
        print("\nExamples:")
        print("   python verify_speaker.py reference.m4a test.m4a")
        print("   python verify_speaker.py reference.mp3 suspicious.mp4\n")
        sys.exit(1)

    compare_speakers(ref_file, tst_file)
