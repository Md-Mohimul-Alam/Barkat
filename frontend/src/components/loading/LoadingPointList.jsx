import React, { useState, useEffect } from 'react';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { useTheme } from '../../context/ThemeContext';
import loadingPointService from '../../services/loadingPointService';

const LoadingPointList = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);

  useEffect(() => {
    fetchLoadingPoints();
  }, []);

  const fetchLoadingPoints = async () => {
    try {
      setLoading(true);
      const response = await loadingPointService.getAllLoadingPoints();
      if (response.success) {
        setPoints(response.data);
      }
    } catch (error) {
      console.error('Error fetching loading points:', error);
      alert(error.message || 'Failed to fetch loading points');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPoint = (point) => {
    setEditingPoint({...point});
    setEditModalOpen(true);
  };

  const handleSavePoint = async () => {
    try {
      const response = await loadingPointService.updateLoadingPoint(editingPoint.id, editingPoint);
      if (response.success) {
        setPoints(prev =>
          prev.map(point =>
            point.id === editingPoint.id ? editingPoint : point
          )
        );
        setEditModalOpen(false);
        setEditingPoint(null);
        alert('Loading point updated successfully');
      }
    } catch (error) {
      console.error('Error updating loading point:', error);
      alert(error.message || 'Failed to update loading point');
    }
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingPoint(null);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#F1FAEE]' : 'bg-[#ffffff] text-gray-900'}`}>
        <SidebarWrapper collapsed={sidebarCollapsed} />
        <div className="flex-1 flex flex-col">
          <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />
          <div className="p-6 flex-1 flex items-center justify-center">
            <div className="text-center">Loading loading points...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#F1FAEE]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Loading Points</h1>
            <button
              onClick={() => window.location.href = '/app/loading-points/add'}
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
                  <th className="p-4 text-left font-semibold">Contact</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point, index) => (
                  <tr
                    key={point.id}
                    className={`${isDark ? 'bg-[#1E1E1E] hover:bg-[#2C2C2C] text-[#F1FAEE]' : 'bg-white hover:bg-gray-50 text-gray-700'} border-b ${isDark ? 'border-[#457B9D]' : 'border-gray-200'} transition-colors duration-150`}
                  >
                    <td className="p-4">{point.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        point.type === 'Port' ? 'bg-blue-100 text-blue-800' :
                        point.type === 'Warehouse' ? 'bg-green-100 text-green-800' :
                        point.type === 'Factory' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {point.type}
                      </span>
                    </td>
                    <td className="p-4">{point.location}</td>
                    <td className="p-4">{point.contactNumber || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        point.status === 'active' ? 'bg-green-100 text-green-800' :
                        point.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {point.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPoint(point)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                            isDark
                              ? 'bg-[#457B9D] hover:bg-[#1D3557] text-[#F1FAEE]'
                              : 'bg-[#457B9D] hover:bg-[#1D3557] text-white'
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => window.location.href = `/app/loading-points/${point.id}`}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                            isDark
                              ? 'bg-[#A8DADC] hover:bg-[#457B9D] text-[#1D3557]'
                              : 'bg-[#A8DADC] hover:bg-[#457B9D] text-[#1D3557]'
                          }`}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Footer />
      </div>

      {/* Edit Modal */}
      {editModalOpen && editingPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-6 w-full max-w-md ${isDark ? 'bg-[#2C2C2C] text-[#F1FAEE]' : 'bg-white text-gray-900'}`}>
            <h2 className="text-xl font-bold mb-4">Edit Loading Point</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editingPoint.name}
                  onChange={(e) => setEditingPoint({...editingPoint, name: e.target.value})}
                  className={`w-full p-2 border rounded ${
                    isDark ? 'bg-[#1E1E1E] border-[#457B9D] text-[#F1FAEE]' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={editingPoint.location}
                  onChange={(e) => setEditingPoint({...editingPoint, location: e.target.value})}
                  className={`w-full p-2 border rounded ${
                    isDark ? 'bg-[#1E1E1E] border-[#457B9D] text-[#F1FAEE]' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editingPoint.status}
                  onChange={(e) => setEditingPoint({...editingPoint, status: e.target.value})}
                  className={`w-full p-2 border rounded ${
                    isDark ? 'bg-[#1E1E1E] border-[#457B9D] text-[#F1FAEE]' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleCloseModal}
                className={`px-4 py-2 rounded font-medium ${
                  isDark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePoint}
                className="px-4 py-2 rounded font-medium bg-[#f85924] hover:bg-[#d13602] text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingPointList;