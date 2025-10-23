import React, { useState } from 'react';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { useTheme } from '../../context/ThemeContext';

const initialLoadingPoints = [
  { id: 1, name: 'NCT', type: 'Port', location: 'Chattogram' },
  { id: 2, name: 'Yeard', type: 'Storage', location: 'Dhaka' },
  { id: 3, name: 'Ship', type: 'Vessel', location: 'Sea' },
  { id: 4, name: 'Shagorica (Karim Pipe)', type: 'Local', location: 'Sitakunda' },
];

const UnloadingPointList = () => {
  const [points, setPoints] = useState(initialLoadingPoints);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);

  const handleEditPoint = (point) => {
    setEditingPoint({...point});
    setEditModalOpen(true);
  };

  const handleSavePoint = () => {
    setPoints(prev =>
      prev.map(point =>
        point.id === editingPoint.id ? editingPoint : point
      )
    );
    setEditModalOpen(false);
    setEditingPoint(null);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingPoint(null);
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#F1FAEE]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Loading Points</h1>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isDark
                  ? 'bg-[#f85924] hover:bg-[#d13602] text-white shadow-lg'
                  : 'bg-[#f85924] hover:bg-[#d13602] text-white shadow-md'
              }`}
            >
              + Add Loading Point
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-[#2C2C2C] text-[#F1FAEE]' : 'bg-white text-gray-700'} border-b ${isDark ? 'border-[#457B9D]' : 'border-gray-200'}`}>
                  <th className="p-4 text-left font-semibold">Name</th>
                  <th className="p-4 text-left font-semibold">Type</th>
                  <th className="p-4 text-left font-semibold">Location</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point, index) => (
                  <tr 
                    key={point.id} 
                    className={`transition-colors duration-150 ${
                      isDark 
                        ? `bg-sky-950 hover:bg-[#0E2A45] ${index !== points.length - 1 ? 'border-b border-[#457B9D]' : ''}`
                        : `bg-white hover:bg-gray-50 ${index !== points.length - 1 ? 'border-b border-gray-200' : ''}`
                    }`}
                  >
                    <td className="p-4 font-medium">{point.name}</td>
                    <td className="p-4">{point.type}</td>
                    <td className="p-4">{point.location}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleEditPoint(point)}
                        className={`text-sm font-medium px-3 py-1 rounded transition-colors duration-200 ${
                          isDark 
                            ? 'text-[#f85924] hover:text-[#d13602] hover:bg-[#2C2C2C]' 
                            : 'text-[#1D3557] hover:text-[#457B9D] hover:bg-blue-50'
                        }`}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {points.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'bg-sky-950 text-[#A8A8A8]' : 'bg-white text-gray-500'}`}>
                No loading points found
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>

      {/* Transparent Background Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Transparent Backdrop */}
          <div 
            className="absolute inset-0 backdrop-blur-[.1px] transition-opacity duration-300"
            onClick={handleCloseModal}
          />

          
          {/* Modal Content - Fully Transparent */}
          <div 
            className={`relative rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 border ${
              isDark 
                ? 'bg-transparent text-white border-gray-600/30 backdrop-blur-md' 
                : 'bg-transparent text-gray-900 border-gray-100/30 backdrop-blur-sm'
            }`}
          >
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-600/30' : 'border-gray-300/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isDark ? 'bg-gray-100/30' : 'bg-orange-100/30'
                  }`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-cyan-300' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Edit Loading Point</h2>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      Update the loading point details
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isDark 
                      ? 'hover:bg-gray-800/30 text-gray-300' 
                      : 'hover:bg-gray-200/30 text-gray-500'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {editingPoint && (
                <div className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Point Name
                    </label>
                    <input
                      type="text"
                      value={editingPoint.name}
                      onChange={(e) => setEditingPoint({...editingPoint, name: e.target.value})}
                      className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                        isDark 
                          ? 'bg-gray-800/30 border-gray-600/30 text-white placeholder-gray-400' 
                          : 'bg-white/30 border-gray-300/30 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Enter loading point name"
                    />
                  </div>

                  {/* Type Field */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Type
                    </label>
                    <select
                      value={editingPoint.type}
                      onChange={(e) => setEditingPoint({...editingPoint, type: e.target.value})}
                      className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent appearance-none ${
                        isDark 
                          ? 'bg-gray-800/30 border-gray-600/30 text-white' 
                          : 'bg-white/30 border-gray-300/30 text-gray-900'
                      }`}
                    >
                      <option value="Port">Port</option>
                      <option value="Storage">Storage</option>
                      <option value="Vessel">Vessel</option>
                      <option value="Local">Local</option>
                    </select>
                  </div>

                  {/* Location Field */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location
                    </label>
                    <input
                      type="text"
                      value={editingPoint.location}
                      onChange={(e) => setEditingPoint({...editingPoint, location: e.target.value})}
                      className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                        isDark 
                          ? 'bg-gray-800/30 border-gray-600/30 text-white placeholder-gray-400' 
                          : 'bg-white/30 border-gray-300/30 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Enter location"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-600/30' : 'border-gray-300/30'}`}>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border ${
                    isDark 
                      ? 'border-gray-600/30 text-gray-300 hover:bg-gray-800/30' 
                      : 'border-gray-300/30 text-gray-700 hover:bg-gray-200/30'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePoint}
                  className="px-6 py-3 bg-gradient-to-r from-[#f85924] to-[#e84a1a] text-white rounded-xl font-semibold transition-all duration-200 hover:from-[#e84a1a] hover:to-[#d13602] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnloadingPointList;