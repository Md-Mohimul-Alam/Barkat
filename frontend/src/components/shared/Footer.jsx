import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer
      className={`w-full py-4 px-6 text-sm text-center mt-auto border-t transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700 text-white' 
          : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 text-gray-900'
      } shadow-sm`}
    >
      <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
        {/* Copyright Section */}
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <span className={`text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent`}>
            MS. Barkat Transport
          </span>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex items-center space-x-4">
          <Link 
            to="/privacy" 
            className={`transition-all duration-300 hover:scale-105 ${
              isDark 
                ? 'text-orange-400 hover:text-orange-300' 
                : 'text-orange-600 hover:text-orange-700'
            }`}
          >
            Privacy Policy
          </Link>
          <Link 
            to="/terms" 
            className={`transition-all duration-300 hover:scale-105 ${
              isDark 
                ? 'text-orange-400 hover:text-orange-300' 
                : 'text-orange-600 hover:text-orange-700'
            }`}
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;