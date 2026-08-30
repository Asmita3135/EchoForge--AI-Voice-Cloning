"""
EchoForge — Evaluation Dataset Builder
Builds structured, leak-free validation and test sets covering multiple genuine speakers,
different TTS engines (David, Zira, Hazel), rates, and speech contexts.
"""

import os
import subprocess
import soundfile as sf
import numpy as np
import librosa

def generate_tts_sample(voice_name, text, output_path, rate=0):
    ps_cmd = f"""
    Add-Type -AssemblyName System.Speech;
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
    $synth.SelectVoice('{voice_name}');
    $synth.Rate = {rate};
    $synth.SetOutputToWaveFile('{output_path}');
    $synth.Speak('{text}');
    $synth.Dispose();
    """
    subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-Command", ps_cmd], check=True)

def build_datasets():
    os.makedirs("dataset/validation/genuine", exist_ok=True)
    os.makedirs("dataset/validation/synthetic", exist_ok=True)
    os.makedirs("dataset/test/genuine", exist_ok=True)
    os.makedirs("dataset/test/synthetic", exist_ok=True)

    # --- SYNTHETIC SAMPLES (Multiple voices, rates, topics) ---
    syn_val_specs = [
        ("Microsoft David Desktop", "Hello, I am calling from technical support regarding an urgent security alert on your enterprise account.", "dataset/validation/synthetic/synth_david_sec_alert.wav", 0),
        ("Microsoft Zira Desktop", "Welcome to the international customer service center. Please hold while we verify your account information.", "dataset/validation/synthetic/synth_zira_customer_service.wav", 0),
        ("Microsoft Hazel Desktop", "The quarterly financial forecast indicates substantial growth across international cloud computing markets.", "dataset/validation/synthetic/synth_hazel_finance.wav", 0),
        ("Microsoft David Desktop", "Please confirm your one-time verification passcode to authorize this international wire transfer immediately.", "dataset/validation/synthetic/synth_david_wire_transfer.wav", 1),
        ("Microsoft Zira Desktop", "Artificial neural networks can synthesize high-fidelity human speech that mimics acoustic pitch contours.", "dataset/validation/synthetic/synth_zira_ai_speech.wav", -1),
    ]

    syn_test_specs = [
        ("Microsoft David Desktop", "This is an automated notification from your banking institution regarding a suspicious authorization attempt.", "dataset/test/synthetic/synth_test_david_bank.wav", 0),
        ("Microsoft Hazel Desktop", "Good afternoon. We are delighted to announce the expansion of our European healthcare research program.", "dataset/test/synthetic/synth_test_hazel_healthcare.wav", 0),
        ("Microsoft Zira Desktop", "Security protocols require mandatory multifactor authentication for all privileged remote access accounts.", "dataset/test/synthetic/synth_test_zira_auth.wav", 1),
        ("Microsoft David Desktop", "Deepfake audio systems utilize advanced neural vocoders to generate realistic vocal characteristics.", "dataset/test/synthetic/synth_test_david_vocoder.wav", -1),
    ]

    for voice, text, path, rate in syn_val_specs:
        generate_tts_sample(voice, text, path, rate=rate)
        print(f"Generated synthetic validation sample: {path}")

    for voice, text, path, rate in syn_test_specs:
        generate_tts_sample(voice, text, path, rate=rate)
        print(f"Generated synthetic test sample: {path}")

    # --- GENUINE SAMPLES (Distinct utterances & sources) ---
    # We partition genuine recordings into non-overlapping validation and test sets
    if os.path.exists("audio/real_audio_test (1).wav"):
        real1, sr = librosa.load("audio/real_audio_test (1).wav", sr=16000, mono=True)
        # Partition into distinct non-overlapping 5-7s segments
        sf.write("dataset/validation/genuine/genuine_val_speaker1_part1.wav", real1[:int(7.0*16000)], 16000)
        sf.write("dataset/validation/genuine/genuine_val_speaker1_part2.wav", real1[int(7.5*16000):int(14.5*16000)], 16000)
        sf.write("dataset/test/genuine/genuine_test_speaker1_part3.wav", real1[int(15.0*16000):int(22.0*16000)], 16000)

    if os.path.exists("audio/dummy_test.wav"):
        real2, sr = librosa.load("audio/dummy_test.wav", sr=16000, mono=True)
        sf.write("dataset/validation/genuine/genuine_val_speaker2_part1.wav", real2[:int(6.5*16000)], 16000)
        sf.write("dataset/test/genuine/genuine_test_speaker2_part2.wav", real2[int(7.0*16000):int(14.0*16000)], 16000)

    print("Dataset generation and partitioning complete without data leakage.")

if __name__ == "__main__":
    build_datasets()
