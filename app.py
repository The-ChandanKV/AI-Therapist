from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import librosa
import tensorflow as tf
from tensorflow.keras.models import load_model
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import spacy
import os
from dotenv import load_dotenv
import base64
import io
from PIL import Image

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Download required NLTK data
nltk.download('vader_lexicon')

# Initialize models and analyzers
sia = SentimentIntensityAnalyzer()
nlp = spacy.load('en_core_web_sm')

# Load face emotion detection model
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Load pre-trained emotion detection model
# TODO: Replace with your actual model path
# emotion_model = load_model('path_to_your_model')

def analyze_text_emotion(text):
    """Analyze text emotion using NLTK and spaCy."""
    # Get sentiment scores
    sentiment_scores = sia.polarity_scores(text)
    
    # Get emotion-related words using spaCy
    doc = nlp(text)
    emotion_words = [token.text for token in doc if token.pos_ == 'ADJ']
    
    return {
        'sentiment': sentiment_scores,
        'emotion_words': emotion_words
    }

def analyze_voice_emotion(audio_data):
    """Analyze voice emotion using librosa."""
    try:
        # Convert audio data to numpy array
        audio_array, sr = librosa.load(io.BytesIO(audio_data), sr=None)
        
        # Extract audio features
        mfccs = librosa.feature.mfcc(y=audio_array, sr=sr, n_mfcc=13)
        spectral_centroid = librosa.feature.spectral_centroid(y=audio_array, sr=sr)
        spectral_rolloff = librosa.feature.spectral_rolloff(y=audio_array, sr=sr)
        
        # Calculate basic statistics
        mfccs_mean = np.mean(mfccs, axis=1)
        spectral_centroid_mean = np.mean(spectral_centroid)
        spectral_rolloff_mean = np.mean(spectral_rolloff)
        
        # TODO: Use these features with your trained model to predict emotion
        # For now, return a placeholder emotion
        return {
            'emotion': 'neutral',
            'confidence': 0.8
        }
    except Exception as e:
        print(f"Error analyzing voice emotion: {str(e)}")
        return {
            'emotion': 'unknown',
            'confidence': 0.0
        }

def analyze_face_emotion(image_data):
    """Analyze facial emotion using OpenCV and CNN."""
    try:
        # Decode base64 image
        if isinstance(image_data, str) and image_data.startswith('data:image'):
            # Remove the data URL prefix
            image_data = image_data.split(',')[1]
        
        # Decode base64 to image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert PIL Image to OpenCV format
        image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return {'error': 'No face detected'}
        
        # Get the first face
        x, y, w, h = faces[0]
        face_roi = gray[y:y+h, x:x+w]
        
        # Resize face to match model input size
        face_roi = cv2.resize(face_roi, (48, 48))
        
        # TODO: Use your trained model to predict emotion
        # For now, return a placeholder emotion
        return {
            'emotion': 'happy',
            'confidence': 0.9
        }
    except Exception as e:
        print(f"Error analyzing face emotion: {str(e)}")
        return {
            'emotion': 'unknown',
            'confidence': 0.0
        }

@app.route('/analyze/text', methods=['POST'])
def analyze_text():
    """Endpoint for text emotion analysis."""
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    result = analyze_text_emotion(text)
    return jsonify(result)

@app.route('/analyze/voice', methods=['POST'])
def analyze_voice():
    """Endpoint for voice emotion analysis."""
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    audio_file = request.files['audio']
    result = analyze_voice_emotion(audio_file.read())
    return jsonify(result)

@app.route('/analyze/face', methods=['POST'])
def analyze_face():
    """Endpoint for facial emotion analysis."""
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    image_file = request.files['image']
    result = analyze_face_emotion(image_file.read())
    return jsonify(result)

if __name__ == '__main__':
    port = int(os.getenv('ML_SERVICE_PORT', 5000))
    app.run(host='0.0.0.0', port=port) 