import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Lock, Mail } from 'lucide-react';
import  axios from 'axios';
import  {ACCESS_TOKEN, REFRESH_TOKEN} from '../constants';

export default function Login() {
  const navigate = useNavigate();
  const [name, setname] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      name,
      password,
    };

    axios.post("http://localhost:3000/api/login", user)
    .then((res) =>{
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("name", name)
        localStorage.setItem("id", res.data.id)
        console.log(res.data)
        navigate("/")
    })
    .catch((err) =>{
      console.log("wrong creds")
    })


    // Handle login logic here
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Logo and Form */}
      <div className="w-1/2 bg-gradient-to-br from-[#F66435] via-[#F66435]/80 to-[#F4EFCA] p-8 relative">
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
            <h2 className="text-3xl font-bold text-[#F4EFCA] mb-2">Welcome Back</h2>
            <p className="text-[#F4EFCA]/80 mb-8">Sign in to continue your journey</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#F4EFCA]/60 w-5 h-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setname(e.target.value)}
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
                Sign In
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#F4EFCA]/80">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#F4EFCA] font-semibold hover:text-[#F66435] transition-colors">
                  Sign up
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
            backgroundImage: 'url("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80")',
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
            "Success in interviews is not just about having the right answers, but about showing your authentic potential."
          </p>
          <p className="text-[#F66435]/80 font-semibold">LiberateAI</p>
        </motion.div>
      </div>
    </div>
  );
}