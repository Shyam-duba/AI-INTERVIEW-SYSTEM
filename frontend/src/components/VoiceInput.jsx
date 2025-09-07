import React, { useState, useRef } from 'react';
import { Mic, MicOff, Send, Square } from 'lucide-react';

const VoiceInput = ({ onSendMessage }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentRecording, setCurrentRecording] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = '';

        recognition.onresult = (event) => {
          let interimTranscript = '';
          finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const currentTranscript = finalTranscript + interimTranscript;
          if (currentTranscript.trim()) {
            setCurrentRecording((prev) =>
              prev
                ? { ...prev, transcription: currentTranscript.trim() }
                : null
            );
          }
        };

        recognition.onend = () => {
          if (currentRecording && finalTranscript.trim()) {
            setCurrentRecording((prev) =>
              prev ? { ...prev, transcription: finalTranscript.trim() } : null
            );
          }
          setIsTranscribing(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsTranscribing(true);
      }

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        setCurrentRecording({
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
        });

        stream.getTracks().forEach((track) => track.stop());

        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const sendTextMessage = () => {
    if (textInput.trim()) {
      onSendMessage({
        type: 'text',
        content: textInput.trim(),
        role: 'user',
      });
      setTextInput('');
    }
  };

  const sendVoiceMessage = () => {
    if (currentRecording) {
      onSendMessage({
        type: 'voice',
        content:
          currentRecording.transcription ||
          `Voice message (${currentRecording.duration}s)`,
        role: 'user',
        duration: currentRecording.duration,
        audioBlob: currentRecording.blob,
        transcription: currentRecording.transcription,
      });
      setCurrentRecording(null);
      setRecordingTime(0);
    }
  };

  const cancelRecording = () => {
    if (currentRecording) {
      URL.revokeObjectURL(currentRecording.url);
      setCurrentRecording(null);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {/* Voice Recording Status */}
      {(isRecording || currentRecording) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isRecording && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-700">
                    {isTranscribing
                      ? 'Recording & Transcribing...'
                      : 'Recording...'}
                  </span>
                </div>
              )}
              <span className="text-sm text-red-600 font-mono">
                {formatTime(recordingTime)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {currentRecording && (
                <>
                  <button
                    onClick={sendVoiceMessage}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Send
                  </button>
                  <button
                    onClick={cancelRecording}
                    className="px-3 py-1 bg-slate-200 text-slate-600 text-sm rounded-md hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Square className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Show transcription preview */}
          {currentRecording?.transcription && (
            <div className="pt-2 border-t border-red-200">
              <p className="text-sm text-slate-600 italic">
                Transcription: "{currentRecording.transcription}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Input Controls */}
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendTextMessage();
              }
            }}
            placeholder="Type your response or use voice..."
            className="w-full px-4 py-3 border border-slate-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            rows={1}
            disabled={isRecording}
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!!currentRecording}
            className={`p-3 rounded-full transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : currentRecording
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
            }`}
          >
            {isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {textInput.trim() && (
            <button
              onClick={sendTextMessage}
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;