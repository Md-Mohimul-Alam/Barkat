import React, { useState } from 'react';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { useTheme } from '../../context/ThemeContext';

const LoadingPointForm = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
  });

  const fields = [
    { label: 'Name', name: 'name', type: 'text' },
    { label: 'Type', name: 'type', type: 'text' },
    { label: 'Location', name: 'location', type: 'text' },
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Loading Point Submitted:', formData);
    // Add to IndexedDB or API call here
  };

  return (
    <>
      <TopBar />
      <div className="flex">
        <SidebarWrapper />
        <div className={`flex-1 p-6 min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Add Loading Point</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(({ label, name, type }) => (
                <div key={name}>
                  <label className="block mb-1 font-medium">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              ))}
              <div className="md:col-span-2 text-center mt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoadingPointForm;
