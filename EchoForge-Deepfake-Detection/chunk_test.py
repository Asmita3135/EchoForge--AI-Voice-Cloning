import os
import sys
import torch
import soundfile as sf
import librosa
import numpy as np

MODEL_NAME = "garystafford/wav2vec2-deepfake-voice-detector"

def process_chunk(chunk_data, sample_rate, feature_extractor, model):
    # Resample to 16,000 Hz if necessary
    if sample_rate != 16000:
        speech_array = librosa.resample(y=chunk_data.astype(np.float32), orig_sr=sample_rate, target_sr=16000)
    else:
        speech_array = chunk_data.astype(np.float32)

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

    return real_score, fake_score, prediction

def chunk_file(audio_path, chunk_duration_sec, min_chunk_sec, feature_extractor, model):
    if not os.path.exists(audio_path):
        print(f"[ERROR] File not found: {audio_path}")
        return []

    data, sample_rate = sf.read(audio_path)
    
    if data.ndim > 1:
        mono_data = np.mean(data, axis=1)
    else:
        mono_data = data

    total_samples = len(mono_data)
    chunk_samples = int(chunk_duration_sec * sample_rate)
    min_samples = int(min_chunk_sec * sample_rate)

    results = []
    chunk_idx = 1

    for start_sample in range(0, total_samples, chunk_samples):
        end_sample = min(start_sample + chunk_samples, total_samples)
        current_samples = end_sample - start_sample

        # Ignore extremely short final chunks
        if current_samples < min_samples:
            continue

        chunk_data = mono_data[start_sample:end_sample]
        duration_sec = current_samples / sample_rate

        real_score, fake_score, prediction = process_chunk(chunk_data, sample_rate, feature_extractor, model)

        results.append({
            "file": os.path.basename(audio_path),
            "chunk": f"Chunk {chunk_idx}",
            "duration": f"{duration_sec:.2f}s",
            "real_score": real_score,
            "fake_score": fake_score,
            "prediction": prediction
        })
        chunk_idx += 1

    return results

def main():
    from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

    feature_extractor = AutoFeatureExtractor.from_pretrained(MODEL_NAME)
    model = AutoModelForAudioClassification.from_pretrained(MODEL_NAME)

    print("=" * 70)
    print("      EchoForge CHUNK-BASED AUDIO DEEPFAKE DETECTION ANALYSIS      ")
    print("=" * 70)

    # 1. Process ai_sample.wav into ~7-second chunks
    ai_results = chunk_file("ai_sample.wav", chunk_duration_sec=7.0, min_chunk_sec=3.0, feature_extractor=feature_extractor, model=model)
    
    # 2. Process Test Rec.wav into ~3-4 second chunk
    genuine_results = chunk_file("Test Rec.wav", chunk_duration_sec=4.0, min_chunk_sec=2.0, feature_extractor=feature_extractor, model=model)

    all_results = genuine_results + ai_results

    # Print Summary Table
    print(f"\n{'File':<15} | {'Chunk':<8} | {'Duration':<8} | {'Real Score':<12} | {'Fake Score':<12} | {'Prediction':<10}")
    print("-" * 75)
    
    for r in all_results:
        print(f"{r['file']:<15} | {r['chunk']:<8} | {r['duration']:<8} | {r['real_score']:.4f}       | {r['fake_score']:.4f}       | {r['prediction']:<10}")

    # Calculate statistics for ai_sample.wav
    if ai_results:
        ai_fake_scores = [r['fake_score'] for r in ai_results]
        min_fake = min(ai_fake_scores)
        max_fake = max(ai_fake_scores)
        avg_fake = np.mean(ai_fake_scores)
        med_fake = float(np.median(ai_fake_scores))

        print("\n" + "=" * 50)
        print("  STATISTICS FOR ai_sample.wav (AI-Generated Speech)")
        print("=" * 50)
        print(f"Total Chunks Analyzed : {len(ai_results)}")
        print(f"Minimum Fake Score   : {min_fake:.4f} ({min_fake * 100:.2f}%)")
        print(f"Maximum Fake Score   : {max_fake:.4f} ({max_fake * 100:.2f}%)")
        print(f"Average Fake Score   : {avg_fake:.4f} ({avg_fake * 100:.2f}%)")
        print(f"Median Fake Score    : {med_fake:.4f} ({med_fake * 100:.2f}%)")

    # Calculate statistics for Test Rec.wav
    if genuine_results:
        gen_fake_scores = [r['fake_score'] for r in genuine_results]
        min_gen_fake = min(gen_fake_scores)
        max_gen_fake = max(gen_fake_scores)
        avg_gen_fake = np.mean(gen_fake_scores)
        med_gen_fake = float(np.median(gen_fake_scores))

        print("\n" + "=" * 50)
        print("  STATISTICS FOR Test Rec.wav (Genuine Speech)")
        print("=" * 50)
        print(f"Total Chunks Analyzed : {len(genuine_results)}")
        print(f"Minimum Fake Score   : {min_gen_fake:.4f} ({min_gen_fake * 100:.2f}%)")
        print(f"Maximum Fake Score   : {max_gen_fake:.4f} ({max_gen_fake * 100:.2f}%)")
        print(f"Average Fake Score   : {avg_gen_fake:.4f} ({avg_gen_fake * 100:.2f}%)")
        print(f"Median Fake Score    : {med_gen_fake:.4f} ({med_gen_fake * 100:.2f}%)")
        print("=" * 50 + "\n")

if __name__ == "__main__":
    main()
