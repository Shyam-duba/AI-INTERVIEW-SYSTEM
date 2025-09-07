import React from 'react';
import { Play, Pause } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = React.useState(false);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePlayVoice = () => {
    if (message.audioBlob) {
      const audio = new Audio(URL.createObjectURL(message.audioBlob));
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
      }
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-white text-slate-800 shadow-sm border border-slate-200 rounded-bl-md'
        }`}
      >
        {message.type === 'text' ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="flex items-center space-x-3">
            {/* Show transcribed text */}
            {message.transcription && (
              <p className="text-sm leading-relaxed">{message.transcription}</p>
            )}

            {/* Voice controls */}
            <button
              onClick={handlePlayVoice}
              className={`p-2 rounded-full transition-colors ${
                isUser
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-1">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isUser ? 'bg-blue-200' : 'bg-slate-300'
                    }`}
                    style={{
                      height: `${Math.random() * 20 + 8}px`,
                      opacity: isPlaying ? 0.8 : 0.6,
                    }}
                  />
                ))}
              </div>
              <p
                className={`text-xs mt-1 ${
                  isUser ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                {message.duration ? `${message.duration}s` : 'Voice message'}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-2">
          <span
            className={`text-xs ${
              isUser ? 'text-blue-100' : 'text-slate-400'
            }`}
          >
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;