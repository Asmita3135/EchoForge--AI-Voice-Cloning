import os
import sys
import torch
import soundfile as sf
import librosa
import numpy as np
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

MODEL_NAME = "garystafford/wav2vec2-deepfake-voice-detector"

def analyze_file(audio_path, actual_type, feature_extractor, model):
    if not os.path.exists(audio_path):
        print(f"[ERROR] File not found: {audio_path}")
        return None

    data, sample_rate = sf.read(audio_path)
    
    if data.ndim == 1:
        num_channels = 1
        mono_data = data
        duration = len(data) / sample_rate
    else:
        num_channels = data.shape[1]
        mono_data = np.mean(data, axis=1)
        duration = len(data) / sample_rate

    if sample_rate != 16000:
        speech_array = librosa.resample(y=mono_data.astype(np.float32), orig_sr=sample_rate, target_sr=16000)
    else:
        speech_array = mono_data.astype(np.float32)

    inputs = feature_extractor(speech_array, sampling_rate=16000, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits.squeeze()
        probs = torch.softmax(logits, dim=-1)

    id2label = model.config.id2label
    
    real_score = 0.0
    fake_score = 0.0

    for idx, prob in enumerate(probs.tolist()):
        lbl = str(id2label.get(idx, f"CLASS_{idx}")).lower()
        if 'real' in lbl or 'bonafide' in lbl:
            real_score = prob
        elif 'fake' in lbl or 'spoof' in lbl:
            fake_score = prob

    top_idx = torch.argmax(probs).item()
    prediction = id2label.get(top_idx, f"CLASS_{top_idx}").upper()

    print("==================================================")
    print(f"File             : {audio_path}")
    print(f"Actual Type      : {actual_type}")
    print(f"Duration         : {duration:.2f} seconds")
    print(f"Sample Rate      : {sample_rate} Hz")
    print(f"Channels         : {num_channels}")
    print(f"Real Score       : {real_score:.4f} ({real_score * 100:.2f}%)")
    print(f"Fake Score       : {fake_score:.4f} ({fake_score * 100:.2f}%)")
    print(f"Model Prediction : {prediction}")
    print("==================================================\n")

    return {
        "file": audio_path,
        "actual_type": actual_type,
        "duration": f"{duration:.2f}s",
        "sample_rate": f"{sample_rate} Hz",
        "channels": num_channels,
        "real_score": f"{real_score:.4f} ({real_score * 100:.2f}%)",
        "fake_score": f"{fake_score:.4f} ({fake_score * 100:.2f}%)",
        "prediction": prediction
    }

def main():
    feature_extractor = AutoFeatureExtractor.from_pretrained(MODEL_NAME)
    model = AutoModelForAudioClassification.from_pretrained(MODEL_NAME)

    res1 = analyze_file("Test Rec.wav", "Genuine Human Speech", feature_extractor, model)
    res2 = analyze_file("ai_sample.wav", "Known AI-Generated Speech", feature_extractor, model)

if __name__ == "__main__":
    main()
