import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bot,
  LayoutDashboard,
  Video,
  UserSquare2,
  FileText,
  LogOut,
  Bell,
  Settings,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { REFRESH_TOKEN, ACCESS_TOKEN } from '../constants';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const name = localStorage.getItem('name');
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest('#profile-menu')) {
      setIsProfileMenuOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  const handleLogOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/edit-profile');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const isMobile = window.innerWidth < 1024;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Hover trigger area for desktop only */}
      <div
        className="hidden lg:block fixed left-0 top-0 w-2 h-screen z-40"
        onMouseEnter={() => setIsSidebarOpen(true)}
      />

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed left-0 top-0 h-screen w-64 bg-[#F66435] text-[#F4EFCA] p-6 space-y-8 z-30 shadow-lg"
            onMouseLeave={() => !isMobile && setIsSidebarOpen(false)}
          >
            {/* Close button for mobile */}
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-[#F4EFCA]/10 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <Bot className="w-8 h-8" />
              <span className="text-xl font-bold">LiberateAI</span>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <Link to="/home" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#F4EFCA]/10 text-[#F4EFCA] hover:bg-[#F4EFCA]/20 transition-colors">
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link to="/interview" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#F4EFCA]/80 hover:bg-[#F4EFCA]/10 transition-colors">
                <Video className="w-5 h-5" />
                <span>New Interview</span>
              </Link>
              <Link to="/coach" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#F4EFCA]/80 hover:bg-[#F4EFCA]/10 transition-colors">
                <UserSquare2 className="w-5 h-5" />
                <span>Learn with Coach</span>
              </Link>
              <Link to="/resumeAnalyzer" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#F4EFCA]/80 hover:bg-[#F4EFCA]/10 transition-colors">
                <FileText className="w-5 h-5" />
                <span>Resume Analyzer</span>
              </Link>
            </nav>

            {/* Logout */}
            <div className="pt-8 mt-auto">
              <button
                onClick={handleLogOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#F4EFCA]/80 hover:bg-[#F4EFCA]/10 transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className={`h-16 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b flex items-center justify-between px-4 lg:px-8 transition-colors duration-200`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            >
              <Menu className={`w-6 h-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`} />
            </button>
            <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-gray-200" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>

            {/* Notifications */}
            <button className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg relative`}>
              <Bell className={`w-5 h-5 ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg`}>
              <Settings className={`w-5 h-5 ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`} />
            </button>

            {/* Profile */}
            <div className="relative" id="profile-menu">
  <button
    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
    className={`flex items-center gap-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} p-2 rounded-lg`}
  >
    <img
      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80"
      alt="Profile"
      className="w-8 h-8 rounded-full object-cover"
    />
    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{name}</span>
    <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
  </button>

  {/* Dropdown Menu */}
  {isProfileMenuOpen && (
    <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <ul className="py-1 text-sm">
        <li>
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={handleProfile}>View Profile</button>
        </li>
        <li>
          <button onClick={handleLogOut} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
        </li>
      </ul>
    </div>
  )}
</div>

          </div>
        </motion.div>

        {/* Dashboard Stats */}
        <div className="p-4 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Total Interviews', value: '24', delay: 0.1 },
              { title: 'Coach Sessions', value: '8', delay: 0.2 },
              { title: 'Resume Score', value: '92%', delay: 0.3 }
            ].map(({ title, value, delay }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm transition-colors duration-200`}
              >
                <h3 className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{title}</h3>
                <p className={`text-2xl font-semibold mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
