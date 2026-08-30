# EchoForge - Audio Deepfake Detection (Member 1 Prototype)

A working prototype for audio deepfake and AI voice manipulation detection using modern self-supervised deep learning (`Wav2Vec2`).

---

## 📌 Project Overview
EchoForge Member 1 focuses on **Audio Deepfake & Synthetic Voice Detection**. This module analyzes an input WAV audio file and determines whether the voice recording is authentic (**REAL**) or AI-generated/manipulated (**FAKE**).

---

## 🛠️ Prerequisites & Installation

### 1. Requirements
* Windows 10/11
* Python 3.8+
* Active internet connection (for initial model weights download ~360 MB)

### 2. Install Dependencies
Open Command Prompt / PowerShell in this directory and run:

```bash
pip install -r requirements.txt
```

---

## 🚀 How to Run

Pass any `.wav` audio file as a command-line argument to `detect.py`:

```bash
python detect.py test.wav
```

### Example Output

```text
[1/3] Loading and preprocessing audio file: 'test.wav'...
      - Original Sample Rate : 16000 Hz
      - Original Channels    : 1
      - Processed Sample Rate: 16000 Hz (Mono)

[2/3] Loading pretrained model 'garystafford/wav2vec2-deepfake-voice-detector'...

[3/3] Running model inference...

------------------------------------------------
DEBUG: Raw Model Output from Hugging Face:
[{'label': 'real', 'score': 0.9845}, {'label': 'fake', 'score': 0.0155}]
------------------------------------------------

================================================
       EchoForge AUDIO DEEPFAKE DETECTION       
================================================
File              : test.wav
Sample Rate       : 16000 Hz
Channels          : 1 (Mono)
Model             : Wav2Vec2 Deepfake Voice Detector
------------------------------------------------
Detection Score   : 0.9845 (98.45%)
Model Label       : REAL
================================================
```

---

## ⚙️ How It Works (For SIH Presentation & Judges)

1. **Audio Preprocessing**:
   - Reads input WAV file.
   - Converts multi-channel (stereo) audio into single-channel (mono).
   - Resamples audio to **16,000 Hz (16 kHz)**, which is the required input sample rate for Wav2Vec2.

2. **Model Architecture (`Wav2Vec2`)**:
   - Uses `garystafford/wav2vec2-deepfake-voice-detector`, a fine-tuned Wav2Vec 2.0 transformer model.
   - Wav2Vec 2.0 extracts temporal acoustic feature maps from raw waveforms.
   - The fine-tuned classifier head detects subtle synthetic voice artifacts produced by AI voice cloning models (e.g., ElevenLabs, Amazon Polly).

3. **Output Interpretation**:
   - **Detection Score**: Confidence score output by the model classifier (0.0 to 1.0).
   - **Model Label**: Predicted category (`REAL` for genuine human voice, `FAKE` for AI voice).
