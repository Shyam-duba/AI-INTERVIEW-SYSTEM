import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Clock, Users, Lightbulb, User } from 'lucide-react';
import Button from '../components/ui/Button';
import axios from 'axios';

function StartInterview() {
  const [duration, setDuration] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: <User className="h-6 w-6 text-orange-500" />,
      title: "AI-Powered Interviews",
      description: "Experience realistic interviews with our advanced AI system that adapts to your responses"
    },
    {
      icon: <Users className="h-6 w-6 text-orange-500" />,
      title: "Industry-Specific Questions",
      description: "Practice with questions tailored to your field and experience level"
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-orange-500" />,
      title: "Instant Feedback",
      description: "Receive constructive feedback on your responses and communication style"
    }
  ];

  const handleStartClick = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token')
      if (token === null) {
        navigate('/login')
      }
      console.log(token)
      const response = await axios.post('http://localhost:3000/api/interviews/create-interview/', {
        duration: duration,
        user_id:localStorage.getItem('id'),
        role:"ml",
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 403) {
        navigate('/login')
      }

      const { interview_id } = response.data;
      localStorage.setItem('currentInterviewId', interview_id);
      navigate(`/interview/${interview_id}`);
    } catch (error) {
      console.error('Failed to start interview:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
          <div className="flex items-center mb-6">
            <User className="h-10 w-10 text-orange-500 mr-3" />
            <h1 className="text-3xl font-bold text-white">AI Interview Simulator</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Master Your Interview Skills
            </h2>
            <p className="text-lg text-gray-300 mb-4">
              Welcome to the next generation of interview preparation. Our AI-powered system 
              simulates real-world interview scenarios, helping you build confidence and improve 
              your responses through practical experience.
            </p>
            <p className="text-lg text-gray-300 mb-6">
              Whether you're preparing for a tech interview, consulting role, or management position, 
              our system adapts to provide relevant, challenging questions while offering constructive 
              feedback on your performance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 border border-gray-700 rounded-xl hover:shadow-md transition-shadow bg-gray-800/50">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <label className="block text-gray-200 text-lg font-medium mb-2">
              Select Interview Duration
            </label>
            <div className="flex items-center space-x-4">
              <Clock className="h-6 w-6 text-orange-500" />
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="block w-full max-w-xs rounded-lg border border-gray-600 px-4 py-2 bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
              </select>
            </div>
          </div>

          <Button 
            onClick={handleStartClick} 
            size="large" 
            className={`w-full md:w-auto ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Starting...' : 'Start Interview'}
          </Button>
        </div>

        <p className="text-center text-gray-400">
          Powered by advanced AI technology to provide the most realistic interview experience
        </p>
      </div>
    </div>
  );
}

StartInterview.propTypes = {
  onStartInterview: PropTypes.func.isRequired
};

export default StartInterview;