"""
generate_samples.py - Speech Formant Vocal Synthesizer
======================================================
Synthesizes speech-like audio containing human vocal tract formant resonances
(F1, F2, F3) and pitch contours (F0) to test speaker verification models cleanly.
"""

import os
import math
import struct
import wave
import random

def generate_vocal_tract_audio(filename: str, f0: float, formants: list, duration_sec: float = 3.0, sample_rate: int = 16000):
    """
    Generates a WAV audio file simulating human vocal tract resonances (Formants).
    
    Parameters:
    - f0: Fundamental pitch frequency (e.g., 120 Hz for male, 210 Hz for female)
    - formants: List of formant center frequencies [F1, F2, F3] in Hz
    - duration_sec: Audio duration in seconds
    """
    num_samples = int(duration_sec * sample_rate)
    
    # Pre-seed random generator for deterministic synthesis
    random.seed(int(f0 * 100))

    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)      # Mono audio
        wav_file.setsampwidth(2)      # 16-bit PCM
        wav_file.setframerate(sample_rate)
        
        for i in range(num_samples):
            t = i / sample_rate
            
            # Pitch contour (F0) with natural vocal pitch micro-variations
            f0_contour = f0 + 3.0 * math.sin(2.0 * math.pi * 3.5 * t) + 1.5 * math.sin(2.0 * math.pi * 7.2 * t)
            
            # Source glottal pulse approximation (sawtooth-like pulse)
            glottal_phase = (t * f0_contour) % 1.0
            glottal_pulse = 2.0 * glottal_phase - 1.0
            
            # Vocal tract resonance (Formant filter simulation)
            formant_resonances = 0.0
            bandwidth = 80.0  # Hz
            
            for f_center in formants:
                # Resonance dampening multiplier
                decay = math.exp(-bandwidth * math.pi * (t % (1.0 / max(f0_contour, 50.0))))
                resonance = math.sin(2.0 * math.pi * f_center * t) * decay
                formant_resonances += resonance
            
            # Combine glottal excitation with formant resonances
            speech_signal = 0.3 * glottal_pulse + 0.7 * formant_resonances
            
            # Speech envelope modulation (simulates spoken syllables)
            syllable_env = 0.5 + 0.5 * math.sin(2.0 * math.pi * 3.0 * t)
            speech_signal *= syllable_env
            
            # Add slight unvoiced speech noise (fricative sound simulation)
            noise = (random.random() * 2.0 - 1.0) * 0.05
            speech_signal += noise

            # Scale to 16-bit signed integer range (-32767 to 32767)
            scaled_value = max(-32767, min(32767, int(speech_signal * 12000)))
            binary_data = struct.pack('<h', scaled_value)
            wav_file.writeframes(binary_data)

    print(f"[OK] Generated: {filename:<22} | Pitch (F0): {f0:<5} Hz | Formants: {formants}")

if __name__ == "__main__":
    print("----------------------------------------------------------------")
    print("      EchoForge Vocal Tract Formant Synthesizer                ")
    print("----------------------------------------------------------------")
    
    # Speaker A (Male voice simulation: F0 = 120 Hz, Formants: F1=500 Hz, F2=1500 Hz, F3=2500 Hz)
    generate_vocal_tract_audio("reference.wav", f0=120.0, formants=[500.0, 1500.0, 2500.0], duration_sec=3.5)
    generate_vocal_tract_audio("same_speaker.wav", f0=122.0, formants=[505.0, 1510.0, 2510.0], duration_sec=3.5)
    generate_vocal_tract_audio("test.wav", f0=120.0, formants=[500.0, 1500.0, 2500.0], duration_sec=3.5)
    
    # Speaker B (Female voice simulation: F0 = 220 Hz, Formants: F1=850 Hz, F2=2100 Hz, F3=3100 Hz)
    generate_vocal_tract_audio("different_speaker.wav", f0=220.0, formants=[850.0, 2100.0, 3100.0], duration_sec=3.5)
    
    print("----------------------------------------------------------------")
    print("\n[READY] Speech-like audio files generated successfully!")
    print("\nRun verification tests:")
    print("   1. Same Speaker test      : python verify_speaker.py reference.wav same_speaker.wav")
    print("   2. Different Speaker test : python verify_speaker.py reference.wav different_speaker.wav\n")
