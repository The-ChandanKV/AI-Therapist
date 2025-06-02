# AI-Powered Personal Therapist 🤖

A highly intelligent AI web assistant that provides mental wellness guidance through multimodal interaction and emotional intelligence.

## Features

- **Multimodal Input Support**
  - Text-based conversation
  - Voice emotion analysis
  - Facial expression detection
  - Combined input processing

- **Advanced Emotion Detection**
  - Text sentiment analysis using NLP
  - Voice tone analysis
  - Real-time facial emotion recognition
  - Multi-modal emotion fusion

- **Intelligent Response System**
  - Psychology-informed guidance
  - Personalized coping strategies
  - Breathing exercises
  - Journaling prompts
  - Calming music recommendations

- **Modern UI/UX**
  - Glassmorphic design
  - Calming color scheme
  - Breathing animations
  - Ambient sound integration
  - Responsive layout

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion
- TensorFlow.js
- WebRTC

### Backend
- Node.js/Express
- Python (AI/ML components)
- WebSocket for real-time communication

### AI/ML Components
- OpenAI GPT API
- NLTK/SpaCy for NLP
- Librosa for audio processing
- OpenCV + CNN for facial recognition
- BERT/VADER for sentiment analysis

## Project Structure

```
ai-therapist/
├── client/                 # Frontend React application
├── server/                 # Backend Node.js/Express server
├── ml_models/             # Python ML models and utilities
├── docs/                  # Documentation
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- npm or yarn
- Webcam (for facial recognition)
- Microphone (for voice analysis)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-therapist.git
cd ai-therapist
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

3. Install backend dependencies:
```bash
cd ../server
npm install
```

4. Install Python dependencies:
```bash
cd ../ml_models
pip install -r requirements.txt
```

5. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the frontend development server:
```bash
cd client
npm start
```

3. Start the ML service:
```bash
cd ml_models
python app.py
```

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for GPT API
- TensorFlow.js team
- OpenCV community
- All contributors and supporters 
