import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import ChatMessage from '../components/ui/ChatMessage';
import Header from '../components/ui/Header';

function Interview() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const chatContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm Sarah, your interviewer. I'll be asking you questions about your experience and skills. You can either type your responses or use the microphone to record them. Let's begin: Could you tell me about your background and what brings you here today?",
        sender: 'ai',
        timestamp: new Date()
      }
    ]);

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputMessage(transcript);
      };
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    const newUserMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    
    setTimeout(() => {
      const aiResponses = [
        "Thank you for sharing that. Could you elaborate on a challenging project you've worked on recently?",
        "That's interesting. How do you typically handle stressful situations at work?",
        "Could you tell me about a time when you had to demonstrate leadership?",
        "What would you say is your greatest professional achievement?",
        "How do you approach problem-solving in your work?"
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const newAiMessage = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newAiMessage]);
    }, 1500);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please enable microphone access to continue with the interview.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      
      if (inputMessage.trim()) {
        handleSendMessage();
      }
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="AI Interview" />
      
      <div className="flex-1 flex bg-[url('https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center bg-no-repeat">
        <div className="flex-1 backdrop-blur-sm bg-gray-900/90">
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full h-full"
          >
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                sender={message.sender}
                timestamp={message.timestamp}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-700 bg-gray-800 p-4 shadow-lg">
        <div className="flex items-center space-x-4 max-w-3xl mx-auto">
          <button 
            onClick={toggleRecording}
            className={`p-4 rounded-full transition-all duration-200 ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse scale-110' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isRecording ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your response..."
            className="flex-1 border border-gray-600 rounded-full px-4 py-2 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === ''}
            className={`p-4 rounded-full transition-all duration-200 ${
              inputMessage.trim() === '' 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-center text-sm text-gray-400 mt-2">
          {isRecording 
            ? `Recording... ${formatTime(recordingTime)}` 
            : 'Click the microphone to start recording or type your response'}
        </p>
      </div>
    </div>
  );
}

export default Interview;