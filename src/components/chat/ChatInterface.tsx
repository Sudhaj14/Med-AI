'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { SpeechService } from '@/utils/speech';

interface Message {
  message: string;
  response: string;
  timestamp: string;
  type: 'text' | 'audio';
}

export default function ChatInterface() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechService = useRef(new SpeechService());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history
    if (session) {
      fetch('/api/chat')
        .then(res => res.json())
        .then(data => {
          if (data.messages) {
            setMessages(data.messages.reverse());
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const sendMessage = async (message: string, type: 'text' | 'audio' = 'text') => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      // Include conversation context for better responses
      const contextMessages = messages.slice(-5).map(msg => ({
        user: msg.message,
        assistant: msg.response
      }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          type,
          context: contextMessages 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data]);
        
        // Auto-speak the response if text-to-speech is supported
        if (speechService.current.isSpeechSynthesisSupported()) {
          setIsSpeaking(true);
          speechService.current.speak(data.response, {
            rate: 0.9,
            pitch: 1,
            volume: 0.8
          });
          
          // Stop speaking indicator when done
          setTimeout(() => setIsSpeaking(false), 5000);
        }
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
    setInputMessage('');
  };

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsRecording(false);
        sendMessage(transcript, 'audio');
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Medical Chat</h2>
      
      <div className="h-96 overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">Start a conversation with the medical assistant...</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-blue-600">You:</span>
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-800 mb-3">{msg.message}</p>
              
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-green-600">Assistant:</span>
                <div className="flex items-center gap-2">
                  {isSpeaking && (
                    <span className="text-xs text-green-600 animate-pulse">🔊 Speaking...</span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{msg.response}</p>
              
              {/* Text-to-speech controls */}
              {speechService.current.isSpeechSynthesisSupported() && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      speechService.current.speak(msg.response);
                      setIsSpeaking(true);
                      setTimeout(() => setIsSpeaking(false), 5000);
                    }}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    🔊 Speak
                  </button>
                  <button
                    onClick={() => {
                      speechService.current.stopSpeaking();
                      setIsSpeaking(false);
                    }}
                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    🔇 Stop
                  </button>
                </div>
              )}
              
              {index < messages.length - 1 && <hr className="my-4" />}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about your health concerns..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={startRecording}
          disabled={isRecording || isLoading}
          className={`px-4 py-2 rounded-lg ${
            isRecording 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } disabled:opacity-50`}
        >
          {isRecording ? '🎤 Recording...' : '🎤'}
        </button>
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
