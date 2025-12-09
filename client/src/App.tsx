import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import io from 'socket.io-client';
import MoodEffects from './MoodEffects';

interface ServerResponse {
  content: string;
}

interface ServerError {
  message: string;
}

// Mood Configuration
const MOODS = {
  Calm: {
    label: 'Calm',
    gradient: 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)',
    textColor: 'text-sky-800'
  },
  Happy: {
    label: 'Happy',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    textColor: 'text-orange-800'
  },
  Anxious: {
    label: 'Anxious',
    gradient: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
    textColor: 'text-slate-800'
  },
  Sad: {
    label: 'Sad',
    gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    textColor: 'text-indigo-800'
  },
  Energetic: {
    label: 'Energetic',
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    textColor: 'text-teal-800'
  },
  Stressed: {
    label: 'Stressed',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    textColor: 'text-rose-800'
  }
};

type MoodType = keyof typeof MOODS;

// Update socket connection with explicit configuration
const socket = io('http://localhost:3001', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

function App() {
  const [currentMood, setCurrentMood] = useState<MoodType>('Calm');
  const [inputMode, setInputMode] = useState<'text' | 'voice' | 'face'>('text');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [response, setResponse] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize TensorFlow.js
    tf.ready().then(() => {
      console.log('TensorFlow.js is ready');
    });

    // Socket connection status
    socket.on('connect', () => {
      console.log('Socket connected');
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      setConnectionStatus('error');
    });

    // Socket event listeners
    socket.on('response', (data: ServerResponse) => {
      console.log('Received response:', data);
      if (data && data.content) {
        setResponse(data.content);
      } else {
        console.error('Invalid response format:', data);
        setResponse('Sorry, I received an invalid response. Please try again.');
      }
      setIsProcessing(false);
    });

    socket.on('error', (error: ServerError) => {
      console.error('Socket error:', error);
      setResponse(error.message || 'Sorry, an error occurred. Please try again.');
      setIsProcessing(false);
    });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      socket.off('response');
      socket.off('error');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []);

  const handleMoodChange = (mood: MoodType) => {
    setCurrentMood(mood);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

        setIsProcessing(true);
        socket.emit('message', {
          type: 'voice',
          audio: audioBlob
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      startFaceDetection();
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOn(false);
  };

  const startFaceDetection = async () => {
    try {
      const model = await facemesh.load();
      const video = videoRef.current;
      if (!video) return;

      const detectFaces = async () => {
        if (!isCameraOn) return;

        const predictions = await model.estimateFaces(video);
        if (predictions.length > 0) {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg');

            socket.emit('message', {
              type: 'face',
              image: imageData
            });
          }
        }

        requestAnimationFrame(detectFaces);
      };

      detectFaces();
    } catch (error) {
      console.error('Error loading face detection model:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (connectionStatus !== 'connected') {
      setResponse('Not connected to server. Please refresh the page and try again.');
      return;
    }

    setIsProcessing(true);

    if (inputMode === 'text' && message.trim()) {
      try {
        socket.emit('message', {
          type: 'text',
          text: message
        });
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        setResponse('Error sending message. Please try again.');
        setIsProcessing(false);
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen p-4 md:p-8 transition-all duration-1000 ease-in-out"
      style={{ background: MOODS[currentMood].gradient }}
      animate={{ background: MOODS[currentMood].gradient }}
      transition={{ duration: 1.5 }}
    >
      <MoodEffects mood={currentMood} />
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-10 space-y-4 md:space-y-0"
        >
          <div>
            <h1 className={`text-5xl font-extrabold ${MOODS[currentMood].textColor} drop-shadow-sm`}>
              AI Therapist
            </h1>
            <p className="text-gray-700/80 text-lg font-medium mt-1">
              Your personal mental wellness companion
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
            <span className="text-sm font-semibold text-gray-700">
              {connectionStatus === 'connected' ? 'System Online' :
                connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
            </span>
          </div>
        </motion.header>

        {/* Mood Selector - NEW FEATURE */}
        <motion.div
          className="mb-8 overflow-x-auto pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-center flex-wrap gap-4">
            {Object.keys(MOODS).map((mood) => (
              <motion.button
                key={mood}
                onClick={() => handleMoodChange(mood as MoodType)}
                className={`mood-pill ${currentMood === mood ? 'active' : 'bg-white/20'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mood}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Interaction */}
          <motion.div
            className="lg:col-span-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden">
              {/* Decorative shapes */}
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

              {/* Input Mode Tabs */}
              <div className="flex space-x-2 mb-6 bg-white/20 p-1.5 rounded-xl w-fit">
                {['text', 'voice', 'face'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setInputMode(mode as any);
                      if (mode !== 'voice') stopVoiceRecording();
                      if (mode !== 'face') stopCamera();
                    }}
                    className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-300 ${inputMode === mode
                      ? 'bg-white shadow-sm text-gray-800'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
                      }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Interaction Area */}
              <div className="flex-grow flex flex-col">
                {/* Result / Chat Area */}
                <div className="flex-grow min-h-[300px] mb-6 rounded-2xl bg-white/30 border border-white/20 p-6 overflow-y-auto">
                  {response ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">{response}</p>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500/60">
                      <span className="text-6xl mb-4 opacity-50">🌱</span>
                      <p className="text-lg">How are you feeling today?</p>
                      <p className="text-sm">Select a mood or start typing/speaking</p>
                    </div>
                  )}
                </div>

                {/* Input Forms */}
                <form onSubmit={handleSubmit} className="relative">
                  {inputMode === 'text' && (
                    <div className="relative">
                      <textarea
                        className="glass-input w-full min-h-[100px] pr-24 resize-none"
                        placeholder="Share your thoughts..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                      />
                      <button
                        type="submit"
                        disabled={isProcessing || !message.trim()}
                        className="absolute bottom-3 right-3 btn-primary text-sm py-2 px-4 shadow-sm"
                      >
                        {isProcessing ? '...' : 'Send'}
                      </button>
                    </div>
                  )}

                  {inputMode === 'voice' && (
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/40 rounded-2xl bg-white/10 transition-colors hover:bg-white/20">
                      {!isRecording ? (
                        <button type="button" onClick={startVoiceRecording} className="flex flex-col items-center group">
                          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg mb-2 group-hover:scale-110 transition-transform">
                            🎤
                          </div>
                          <span className="font-semibold text-indigo-800">Start Recording</span>
                        </button>
                      ) : (
                        <button type="button" onClick={stopVoiceRecording} className="flex flex-col items-center group animate-pulse">
                          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg mb-2">
                            ⏹
                          </div>
                          <span className="font-semibold text-red-700">Stop & Analyze</span>
                        </button>
                      )}
                    </div>
                  )}

                  {inputMode === 'face' && (
                    <div className="relative h-[300px] border-2 border-dashed border-white/40 rounded-2xl overflow-hidden bg-black/5">
                      {!isCameraOn ? (
                        <div className="h-full flex items-center justify-center">
                          <button type="button" onClick={startCamera} className="btn-secondary">
                            Enable Camera
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute bottom-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow-lg backdrop-blur-sm"
                            onClick={stopCamera}
                          >
                            End Session
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Widgets */}
          <motion.div
            className="lg:col-span-4 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Breathing Exercise */}
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Breathing Space</h2>
              <div className="breathing-circle w-40 h-40 bg-white/40 rounded-full flex items-center justify-center border-4 border-white/50 shadow-inner">
                <span className="text-gray-700 font-medium text-lg tracking-widest uppercase">Inhale</span>
              </div>
              <p className="mt-6 text-sm text-gray-600 font-medium">Follow the rhythm to center yourself</p>
            </div>

            {/* Quick Tips or Affirmation based on Mood */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Daily Affirmation</h3>
              <p className="text-gray-700 italic">
                "{
                  currentMood === 'Calm' ? "Peace comes from within. Do not seek it without." :
                    currentMood === 'Happy' ? "Happiness is a direction, not a place." :
                      currentMood === 'Anxious' ? "This too shall pass. You are stronger than you know." :
                        currentMood === 'Sad' ? "It's okay not to be okay. Tomorrow is a new day." :
                          currentMood === 'Energetic' ? "Channel your energy into something great today." :
                            "One step at a time. You've got this."
                }"
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}

export default App;
