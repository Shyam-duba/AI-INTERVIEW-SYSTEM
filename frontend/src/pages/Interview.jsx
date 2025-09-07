import React, { use, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, X } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import SessionHeader from '../components/SessionHeader';
import { useNavigate, useParams } from "react-router-dom"; 


const InterviewPage = () => {
  const navigate = useNavigate();
  const {id} = useParams();
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'text',
      content: 'Welcome to your interview session! Please introduce yourself.',
      role: 'assistant',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    },
  ]);

  const [sessionStartTime] = useState(new Date());
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  const get_ai_response = async (messages) => {
    try {
      // convert messages into history format
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // last user query
      const lastMessage = history[history.length - 1];

      const payload = {
        history: history.slice(0, -1), // all except last
        query: lastMessage.content,    // current query
      };

      const res = await axios.post(
        "http://localhost:5000/api/interview/get_respone", // replace with your backend endpoint
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${yourToken}`, // if JWT is required
          },
        }
      );

      console.log("AI Response Data:", res.data); // Debug log

      if (res.data && res.data.response) {
        const aiMessage = {
          id: Date.now().toString(),
          type: "text",
          content: res.data.response,
          role: "assistant",
          timestamp: new Date(),
        };
        console.log("AI Response:", aiMessage); 
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error("Error fetching AI response:", err);
    }
  };

  const addMessage = (message) => {
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    console.log("New Message Added:", newMessage);
    
    if (message.role === "user") {
      console.log("user",message.role);
      get_ai_response([...messages, newMessage]);
      console.log("AI response triggered");
    }
  };

  const save_reports = async (report, history) =>{
    const token = localStorage.getItem('token');
    // Save the report using the id and history

    const payload = {
      interview_id: id,
      history: history,
      report: report
    };

    try {
      const res = await axios.post(
        "http://localhost:3000/api/interviews/end-interview", // replace with your backend endpoint
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // if JWT is required
          },
        }
      )

      console.log("Report saved successfully:", res.data);
    }
    catch(err){
      console.log("Error saving report:", err);
      console.log(err);
    }
  }

  const generate_report = async (history) =>{
    const payload = {
      history: history 
    }

    const res = await axios.post(
        "http://localhost:5000/api/interview/get_report", // replace with your backend endpoint
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${yourToken}`, // if JWT is required
          },
        }
      );
      console.log("Report Data:", res.data); // Debug log
      if (res.data) {
        console.log("Report Response:", res.data); 
      
        await save_reports(res.data, history);

        navigate(`/reports/${id}`, { state: { report: res.data } });
      }
  }

  const handleEndSession = () => {
    setShowEndConfirmation(true);

  
    

  };

  const confirmEndSession = () => {
    // Add your end session logic here
    // This could include:
    // - Saving the session data
    // - Navigating to a results page
    // - Cleaning up resources
    // - API call to end the session
    
    console.log('Session ended');
    
    // For now, we'll just close the confirmation
    setShowEndConfirmation(false);
    const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    generate_report(history);
    // Example: Navigate to results or home page
    // window.location.href = '/results';
  };

  const cancelEndSession = () => {
    setShowEndConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <SessionHeader startTime={sessionStartTime} />
      
      {/* End Session Button */}
      <div className="flex justify-end px-4 py-2">
        <button
          onClick={handleEndSession}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <X size={18} />
          End Interview
        </button>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pb-4">
        <ChatInterface messages={messages} onAddMessage={addMessage} />
      </div>

      {/* End Session Confirmation Modal */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">End Interview Session</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to end this interview session? Your progress will be saved, but you won't be able to continue this conversation.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelEndSession}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndSession}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;