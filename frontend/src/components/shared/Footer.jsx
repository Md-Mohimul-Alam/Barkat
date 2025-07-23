import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`fixed bottom-0 left-0 w-full py-6 px-6 text-sm text-center z-50 
      ${isDark ? 'bg-mbts-dark text-white' : 'bg-gray-100 text-gray-600'}`}>
      <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
        <p className="mb-2 md:mb-0 text-mbts-orange">
          &copy; {new Date().getFullYear()} MS. Barkat Transport Service. All rights reserved.
        </p>
        <div className="space-x-4">
          <Link href="/privacy" className={`hover:underline ${isDark ? 'text-mbts-orange' : 'text-blue-600'}`}>
            Privacy Policy
          </Link>
          <Link href="/terms" className={`hover:underline ${isDark ? 'text-mbts-orange' : 'text-blue-600'}`}>
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
