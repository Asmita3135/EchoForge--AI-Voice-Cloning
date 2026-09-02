# External Member Repositories

Member 4 does NOT duplicate or copy Member 1, Member 2, or Member 3 source code into this repository.

Instead, Member 4 imports them directly from their local repository locations:

- **Member 1 (Deepfake Detection):** `C:\Users\ASMITA\OneDrive\Desktop\EchoForge- Member-Repos\EchoForge--AI-Voice-Cloning-deepfake-voice-detection\Member 1`
- **Member 2 (Speaker Verification):** `C:\Users\ASMITA\OneDrive\Desktop\EchoForge- Member-Repos\EchoForge--AI-Voice-Cloning-speaker_verification`
- **Member 3 (STT + Context Analysis):** `C:\Users\ASMITA\OneDrive\Desktop\EchoForge- Member-Repos\EchoForge--AI-Voice-Cloning-context_analysis`

To make these importable, the paths can be added via `echoforge_paths.pth` inside virtual environment `site-packages` or dynamically via `sys.path`.
