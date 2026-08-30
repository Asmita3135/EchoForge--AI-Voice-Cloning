# EchoForge - Speaker Verification Module (Milestone 1 Upgrade)

A beginner-friendly Python module for **Speaker Verification** built for the **EchoForge** SIH project.

This system accepts any common **audio** (`.wav`, `.mp3`, `.m4a`, `.aac`, `.flac`, `.ogg`, `.wma`) or **video** (`.mp4`, `.mkv`, `.avi`, `.mov`, `.webm`) file, automatically extracts/converts the soundtrack to **16 kHz mono WAV**, and calculates speaker similarity using **SpeechBrain's pre-trained ECAPA-TDNN model**.

---

## 🛠️ Step-by-Step Setup Guide (Windows)

### STEP 1: Create and Activate Virtual Environment
Open PowerShell or Command Prompt in the project folder (`cd "C:\Users\ASMITA\OneDrive\Desktop\EchoForge- Speaker Verification"`):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### STEP 2: Install Python Dependencies
```powershell
pip install -r requirements.txt
```

### STEP 3: Install FFmpeg on Windows
FFmpeg is a system dependency required for extracting and converting audio/video formats.

**Option A (Recommended - 1 Command via WinGet):**
```powershell
winget install --id Gyan.FFmpeg
```

**Option B (Manual Installation):**
1. Download `ffmpeg-git-full.7z` or zip from [Gyan.dev FFmpeg Builds](https://www.gyan.dev/ffmpeg/builds/).
2. Extract the archive to `C:\ffmpeg`.
3. Add `C:\ffmpeg\bin` to your System **PATH** environment variable:
   - Search for **"Edit the system environment variables"** in the Windows Start menu.
   - Click **Environment Variables** -> Select **Path** under User variables -> Click **Edit**.
   - Click **New** -> Add `C:\ffmpeg\bin` -> Click **OK**.

### STEP 4: Verify FFmpeg Installation
Close and reopen your terminal, then verify:
```powershell
ffmpeg -version
```
*You should see FFmpeg version information printed on your screen.*

---

## 🚀 How to Run Speaker Verification

### STEP 5: Place Your Audio/Video Files in the Project Folder
You can compare any supported formats (e.g. `.mp3`, `.mp4`, `.wav`, `.m4a`).

### STEP 6: Run Verification Commands

```powershell
# Compare an MP3 audio file with an MP4 video file:
python verify_speaker.py reference.mp3 suspicious.mp4

# Compare an MP3 audio file with an M4A audio file:
python verify_speaker.py reference.mp3 different_speaker.m4a

# Compare WAV audio files:
python verify_speaker.py reference.wav same_speaker.wav
```

---

## 📊 Output Format Example

```text
==================================================
          EchoForge SPEAKER VERIFICATION          
==================================================

Reference : reference.mp3
Test      : suspicious.mp4

Audio preprocessing:
  ✓ Reference audio converted to 16 kHz mono WAV
  ✓ Test audio extracted and converted to 16 kHz mono WAV

Embedding:
  ✓ ECAPA-TDNN
  ✓ 192-dimensional speaker embedding

--------------------------------------------------
Raw Cosine Similarity : 0.4160
Prototype Threshold   : 0.5000

Decision               : DIFFERENT SPEAKER
==================================================
```

---

## 🧪 Testing Guidance & Real-World Considerations

- **Same Speaker Recordings**: Same speaker clips generally yield higher cosine similarity scores ($\ge 0.55$).
- **Different Speaker Recordings**: Different speakers generally yield lower cosine similarity scores ($\le 0.45$).
- **Prototype Threshold**: The decision threshold (`0.5000`) is an empirical prototype threshold. In production, thresholds should be benchmarked against target user populations.
- **Audio Quality Limitations**: Short clips ($< 1.5\text{ seconds}$), heavy background noise, room reverberation, or low-bitrate compression can reduce verification reliability.

---

## 📁 Supported Formats

| Category | Extensions |
| :--- | :--- |
| **Audio** | `.wav`, `.mp3`, `.m4a`, `.aac`, `.flac`, `.ogg`, `.wma` |
| **Video** | `.mp4`, `.mkv`, `.avi`, `.mov`, `.webm` |
