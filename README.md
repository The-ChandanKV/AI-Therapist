# AI Therapist 🧠✨

> A sophisticated, AI-powered mental wellness companion that understands you through text, voice, and facial expressions.

![React](https://img.shields.io/badge/frontend-React-61DAFB.svg)
![Node](https://img.shields.io/badge/backend-Node.js-339933.svg)
![Python](https://img.shields.io/badge/ML-Python-3776AB.svg)
![TensorFlow](https://img.shields.io/badge/Model-TensorFlow-FF6F00.svg)

## ⚠️ Important Note

**API Key Requirement**: This project relies on OpenAI's GPT models for generating therapeutic responses. If you fork, clone, or repurpose this project, you **MUST** provide your own valid `OPENAI_API_KEY` in the `server/.env` file. The application will not function correctly without it.

## 🌟 Introduction

**AI Therapist** is a next-generation mental health application designed to provide accessible, empathetic, and interactive emotional support. Unlike meaningful chatbots, this application utilizes **multimodal emotion recognition**—analyzing not just what you say, but *how* you say it (voice tone) and your facial expressions.

Immerse yourself in a calming, **mood-adaptive environment** where the interface itself responds to your emotional state, creating a safe and soothing space for reflection.

## ✨ Key Features

### 🎨 Dynamic Atmosphere
- **Mood-Based Aesthetics**: The entire application's color palette and ambiance shift dynamically based on your selected mood (Calm, Happy, Anxious, Sad, Energetic, Stressed).
- **Glassmorphism UI**: A premium, modern interface featuring frosted glass effects, smooth transitions, and breathing animations.

### 🤖 Multimodal Intelligence
- **Text Analysis**: Advanced NLP (via OpenAI GPT) provides empathetic and context-aware responses.
- **Voice Emotion Recognition**: Speak your mind! The system analyzes vocal features (pitch, tone, cadence) to detect underlying emotions.
- **Facial Expression Analysis**: Real-time privacy-preserving computer vision detects your facial emotional cues to better understand your state.

### 🧘 Wellness Tools
- **Breathing Exercises**: Integrated guided breathing visualizers to help ground you in the moment.
- **Daily Affirmations**: Context-aware positive reinforcement tailored to your current mood.

## 🏗️ Architecture

The project follows a robust microservices-inspired architecture:

1.  **Frontend**: React (TypeScript) + Framer Motion + Tailwind CSS. Handles UI, animations, and real-time capture of audio/video.
2.  **Backend Server**: Node.js + Express + Socket.io. Orchestrates communication between the client, the ML service, and OpenAI.
3.  **ML Service**: Python (Flask) + TensorFlow + OpenCV + Librosa. Performs heavy lifting for audio signal processing and image classification.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (3.8+)
- npm or yarn

### Installation

We have streamlined the setup process with a unified command.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/ai-therapist.git
    cd ai-therapist
    ```

2.  **Install Dependencies** (Frontend, Backend, and ML models)
    ```bash
    npm run install:all
    ```
    *Note: This script installs `npm` modules for client/server and `pip` requirements for the python service.*

3.  **Environment Setup**
    - Create a `.env` file in `server/` with your OpenAI Key:
      ```env
      OPENAI_API_KEY=your_key_here
      PORT=3001
      ML_SERVICE_URL=http://localhost:5000
      ```
    - Ensure `ml_models/.env` exists (default port 5000).

### Running the Application

Launch the entire ecosystem with a single command:

```bash
npm run start:all
```

This will concurrently start:
- **Client**: `http://localhost:3000`
- **Server**: `http://localhost:3001`
- **ML Service**: `http://localhost:5000`

## 🛠️ Tech Stack Details

- **Frontend**: React 18, Framer Motion (Animations), Tailwind CSS (Styling), Socket.io-client.
- **Backend API**: Node.js, Express, Socket.io (Real-time), OpenAI API.
- **Machine Learning**: 
  - **Audio**: Librosa (Feature extraction), Custom CNN/LSTM models.
  - **Vision**: OpenCV (Face detection), TensorFlow (Emotion classification).
  - **NLP**: NLTK, Spacy (Sentiment analysis helper).

## 🔒 Privacy & Security

Your privacy is paramount.
- **Local Processing**: Audio and video analysis logic allows for future local-only implementations.
- **Ephemeral Data**: Audio and video streams are processed in real-time and are *not* stored permanently on the server.

---

<p align="center">
  Made with ❤️ for Mental Wellness
</p>