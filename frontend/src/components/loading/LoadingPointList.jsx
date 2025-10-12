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

const LoadingPointList = () => {
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

      {/* Edit Loading Point Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 w-full max-w-md ${
            isDark ? 'bg-cyan-950 text-white' : 'bg-white text-gray-900'
          }`}>
            <h2 className="text-xl font-bold mb-4">Edit Loading Point</h2>
            {editingPoint && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editingPoint.name}
                    onChange={(e) => setEditingPoint({...editingPoint, name: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      isDark 
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={editingPoint.type}
                    onChange={(e) => setEditingPoint({...editingPoint, type: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      isDark 
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="Port">Port</option>
                    <option value="Storage">Storage</option>
                    <option value="Vessel">Vessel</option>
                    <option value="Local">Local</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={editingPoint.location}
                    onChange={(e) => setEditingPoint({...editingPoint, location: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      isDark 
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditModalOpen(false)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isDark 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePoint}
                className="px-4 py-2 bg-[#f85924] text-white rounded-lg font-medium hover:bg-[#d13602]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingPointList;