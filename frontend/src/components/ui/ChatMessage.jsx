import React from 'react';
import { User } from 'lucide-react';

function ChatMessage({ message, sender, timestamp }) {
  const isAi = sender === 'ai';
  
  return (
    <div className={`flex ${isAi ? 'justify-start' : 'justify-end'} mb-4 animate-fadeIn`}>
      <div className={`flex max-w-3xl ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        <div 
          className={`flex items-center justify-center h-10 w-10 rounded-full flex-shrink-0 ${
            isAi ? 'bg-orange-400/20 text-orange-400' : 'bg-gray-700 text-gray-300'
          }`}
        >
          {isAi ? (
            <img
              src="https://images.pexels.com/photos/5989925/pexels-photo-5989925.jpeg?auto=compress&cs=tinysrgb&w=64"
              alt="AI Interviewer"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <User size={20} />
          )}
        </div>
        
        <div 
          className={`mx-3 px-4 py-3 rounded-2xl ${
            isAi 
              ? 'bg-gray-800 border border-gray-700 text-gray-100' 
              : 'bg-orange-500 text-white'
          }`}
        >
          <p className="text-sm md:text-base">{message}</p>
          <p className={`text-xs mt-1 ${isAi ? 'text-gray-400' : 'text-orange-200'}`}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;