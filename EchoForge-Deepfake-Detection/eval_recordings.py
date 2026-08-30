import os
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
from recording_detector import analyze_recording, MODEL_NAME

def main():
    feature_extractor = AutoFeatureExtractor.from_pretrained(MODEL_NAME)
    model = AutoModelForAudioClassification.from_pretrained(MODEL_NAME)

    res1 = analyze_recording("Test Rec.wav", feature_extractor, model, verbose=True)
    res2 = analyze_recording("ai_sample.wav", feature_extractor, model, verbose=True)

    print("\n" + "=" * 80)
    print("                 EchoForge FINAL RECORDING-LEVEL COMPARISON TABLE")
    print("=" * 80)
    print(f"{'File':<15} | {'Actual Type':<25} | {'Chunks':<6} | {'Median Fake Score':<18} | {'Mean Fake Score':<15} | {'Evidence':<10}")
    print("-" * 95)
    
    print(f"{res1['file']:<15} | {'Genuine Human Speech':<25} | {res1['chunks']:<6} | {res1['median_fake']:.4f} ({res1['median_fake']*100:.2f}%)   | {res1['mean_fake']:.4f} ({res1['mean_fake']*100:.2f}%)  | {res1['evidence']:<10}")
    print(f"{res2['file']:<15} | {'Known AI-Generated Speech':<25} | {res2['chunks']:<6} | {res2['median_fake']:.4f} ({res2['median_fake']*100:.2f}%)   | {res2['mean_fake']:.4f} ({res2['mean_fake']*100:.2f}%)  | {res2['evidence']:<10}")
    print("=" * 95 + "\n")

if __name__ == "__main__":
    main()
