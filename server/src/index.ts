import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import axios from 'axios';
import FormData from 'form-data';

interface MLResponse {
  emotion: string;
  confidence: number;
}

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
});

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ML service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', async (data) => {
    console.log('Received message:', data.type);
    try {
      const { type, text, audio, image } = data;
      let response;
      
      if (type === 'text') {
        console.log('Processing text input:', text);
        if (!text || typeof text !== 'string') {
          throw new Error('Invalid text input');
        }

        // Use OpenAI to generate a therapeutic response
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a supportive and empathetic AI therapist. Provide helpful, psychology-informed responses while maintaining appropriate boundaries."
            },
            {
              role: "user",
              content: text
            }
          ],
        });

        response = completion.choices[0].message?.content;
        console.log('Generated response:', response);

        if (!response) {
          throw new Error('No response generated from OpenAI');
        }
      } else if (type === 'voice') {
        console.log('Processing voice input');
        // Send audio data to ML service for emotion analysis
        const formData = new FormData();
        formData.append('audio', audio, 'audio.wav');

        const mlResponse = await axios.post<MLResponse>(`${ML_SERVICE_URL}/analyze/voice`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
        });

        console.log('Voice emotion analysis:', mlResponse.data);

        // Use the emotion analysis result to generate a response
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a supportive and empathetic AI therapist. Provide helpful, psychology-informed responses while maintaining appropriate boundaries."
            },
            {
              role: "user",
              content: `I'm feeling ${mlResponse.data.emotion} based on my voice tone. Can you help me understand and process these emotions?`
            }
          ],
        });

        response = completion.choices[0].message?.content;
      } else if (type === 'face') {
        console.log('Processing face input');
        // Send image data to ML service for emotion analysis
        const formData = new FormData();
        formData.append('image', image);

        const mlResponse = await axios.post<MLResponse>(`${ML_SERVICE_URL}/analyze/face`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
        });

        console.log('Face emotion analysis:', mlResponse.data);

        // Use the emotion analysis result to generate a response
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a supportive and empathetic AI therapist. Provide helpful, psychology-informed responses while maintaining appropriate boundaries."
            },
            {
              role: "user",
              content: `I'm feeling ${mlResponse.data.emotion} based on my facial expression. Can you help me understand and process these emotions?`
            }
          ],
        });

        response = completion.choices[0].message?.content;
      } else {
        throw new Error('Invalid message type');
      }

      console.log('Sending response to client');
      socket.emit('response', {
        type: 'text',
        content: response,
      });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Sorry, I encountered an error processing your message.',
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 