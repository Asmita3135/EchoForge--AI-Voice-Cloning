# EchoForge — AI Voice Cloning & Audio Authenticity Platform

EchoForge is designed to help users evaluate whether a spoken sample is authentic, compare it against a reference voice, and surface analysis results in a clean, user-friendly dashboard.

Live demo: https://echo-forge-ai-voice-cloning.vercel.app  
Repository: https://github.com/Asmita3135/EchoForge--AI-Voice-Cloning

## Overview

EchoForge provides an interactive interface for:
- Uploading a target audio file
- Optional reference audio upload for comparison
- Validating file types and file sizes
- Sending analysis requests to a backend API
- Reviewing results in a structured security and safety dashboard
- Exploring product education pages including safety guidance, FAQ, and usage documentation

This repository contains the frontend application. It communicates with a backend service that exposes health and analysis endpoints.

## Why EchoForge?

Voice cloning and synthetic audio generation have become increasingly realistic and accessible. EchoForge aims to bring transparency and trust to audio workflows by making it easier to:
- assess suspicious recordings,
- compare target audio with claimed reference audio,
- understand the system’s evaluation process,
- and review safety-oriented guidance.

## Features

- Audio file upload and validation
- Optional reference audio matching
- Real-time backend health checks
- Safety and security result dashboard
- Live demo simulation
- Educational pages:
  - How It Works
  - Safety Center
  - FAQ
  - About
  - Contact
- Clean, responsive UI built with React and Vite

## Tech Stack

- React 18
- Vite
- JavaScript
- CSS
- Lucide React icons

## Architecture

This project uses a frontend-only application flow:

1. User uploads target/reference audio
2. Frontend validates file inputs
3. Analysis request is sent to the API backend
4. Backend processes the audio
5. Results are returned and displayed in the results page

Key frontend responsibilities:
- state management for the analysis workflow
- file validation
- health checking
- API communication
- result rendering

## Project Structure

```text
EchoForge--AI-Voice-Cloning/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── components/
│   │   ├── common/
│   │   └── navigation/
│   ├── hooks/
│   │   ├── useAnalyze.js
│   │   └── useHealthCheck.js
│   ├── pages/
│   │   ├── AnalyzeCallPage.jsx
│   │   ├── LiveCallSimPage.jsx
│   │   ├── SecurityResultsPage.jsx
│   │   ├── SafetyCenterPage.jsx
│   │   ├── FaqPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── HowItWorksPage.jsx
│   │   └── ...
│   ├── services/
│   │   └── echoforgeApi.js
│   └── utils/
│       └── fileValidation.js
└── ...
