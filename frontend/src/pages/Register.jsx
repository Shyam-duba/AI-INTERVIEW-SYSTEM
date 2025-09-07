import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Lock, Mail, User } from 'lucide-react';
import axios from 'axios';


export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/register/", {
        name: name,  // Ensure this matches Django's User model fields
        password: password,
        email: email,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      console.log("User registered:", response.data);
      navigate('/login');
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Logo and Form */}
      <div className="w-1/2 bg-gradient-to-br from-[#F4EFCA] via-[#F66435]/80 to-[#F66435] p-8 relative">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 mb-16"
        >
          <Bot className="w-10 h-10 text-[#F4EFCA]" />
          <span className="text-2xl font-bold text-[#F4EFCA]">LiberateAI</span>
        </motion.div>

        {/* Form Container */}
        <div className="max-w-md mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-[#F4EFCA] mb-2">Create Account</h2>
            <p className="text-[#F4EFCA]/80 mb-8">Start your interview preparation journey</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#F4EFCA]/60 w-5 h-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F4EFCA]/5 border border-[#F4EFCA]/10 rounded-lg px-10 py-3 text-[#F4EFCA] placeholder-[#F4EFCA]/60 focus:outline-none focus:ring-2 focus:ring-[#F66435] focus:border-transparent"
                    placeholder="Full name"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#F4EFCA]/60 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F4EFCA]/5 border border-[#F4EFCA]/10 rounded-lg px-10 py-3 text-[#F4EFCA] placeholder-[#F4EFCA]/60 focus:outline-none focus:ring-2 focus:ring-[#F66435] focus:border-transparent"
                    placeholder="Email address"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#F4EFCA]/60 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F4EFCA]/5 border border-[#F4EFCA]/10 rounded-lg px-10 py-3 text-[#F4EFCA] placeholder-[#F4EFCA]/60 focus:outline-none focus:ring-2 focus:ring-[#F66435] focus:border-transparent"
                    placeholder="Password"
                    required
                  />
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-[#F4EFCA] text-[#F66435] rounded-lg py-3 font-semibold shadow-lg hover:bg-[#F4EFCA]/90 transition-all duration-300"
              >
                Create Account
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#F4EFCA]/80">
                Already have an account?{' '}
                <Link to="/login" className="text-[#F4EFCA] font-semibold hover:text-[#F66435] transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Image and Quote */}
      <div className="w-1/2 bg-[#F4EFCA] p-8 flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80")',
            filter: 'brightness(0.9)'
          }}
        />
        <div className="absolute inset-0 bg-[#F66435]/10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 max-w-md text-center p-8 bg-[#F4EFCA]/90 rounded-lg shadow-xl"
        >
          <p className="text-2xl font-serif text-[#F66435] mb-4">
            "Your next career opportunity begins with preparation. Let AI guide your path to success."
          </p>
          <p className="text-[#F66435]/80 font-semibold">LiberateAI</p>
        </motion.div>
      </div>
    </div>
  );
}