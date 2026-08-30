import os
import librosa

audio_path = "audio/real_audio_test (1).wav"
if not os.path.exists(audio_path) and os.path.exists("audio"):
    candidates = [
        os.path.join("audio", f)
        for f in os.listdir("audio")
        if f.lower().endswith((".wav", ".mp3", ".flac", ".m4a"))
    ]
    if candidates:
        audio_path = candidates[0]

audio, sample_rate = librosa.load(audio_path, sr=None)

duration = librosa.get_duration(y=audio, sr=sample_rate)

print(f"Audio loaded successfully: {audio_path}")
print("Sample rate:", sample_rate)
print("Number of samples:", len(audio))
print(f"Duration: {duration:.4f} seconds")
 