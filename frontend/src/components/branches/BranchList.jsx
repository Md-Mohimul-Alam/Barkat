import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getBranches } from '../../services/branchService';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { notifyError } from '../../pages/UI/Toast';

const BranchList = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [branches, setBranches] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const handleToggleSidebar = () => setSidebarCollapsed(prev => !prev);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getBranches(user.token);
        setBranches(data);
      } catch (err) {
        console.error(err);
        notifyError('Failed to load branches');
      }
    };
    fetchBranches();
  }, [user.token]);

  const handleEditBranch = (branch) => {
    setEditingBranch({...branch});
    setEditModalOpen(true);
  };

  const handleSaveBranch = () => {
    // API call to update branch would go here
    setBranches(prev => prev.map(branch => 
      branch.id === editingBranch.id ? editingBranch : branch
    ));
    setEditModalOpen(false);
    setEditingBranch(null);
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#ffffff]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={handleToggleSidebar} sidebarCollapsed={sidebarCollapsed} />

        <div className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Branch List</h1>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isDark
                  ? 'bg-[#f85924] hover:bg-[#d13602] text-white shadow-lg'
                  : 'bg-[#f85924] hover:bg-[#d13602] text-white shadow-md'
              }`}
            >
              + Add Branch
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-[#2C2C2C] text-[#ffffff]' : 'bg-white text-gray-700'} border-b ${isDark ? 'border-[#457B9D]' : 'border-gray-200'}`}>
                  <th className="p-4 text-left font-semibold">Name</th>
                  <th className="p-4 text-left font-semibold">Manager</th>
                  <th className="p-4 text-left font-semibold">Contact</th>
                  <th className="p-4 text-left font-semibold">Address</th>
                  <th className="p-4 text-left font-semibold">Established At</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch, index) => (
                  <tr 
                    key={branch.id} 
                    className={`transition-colors duration-150 ${
                      isDark 
                        ? `bg-sky-950 hover:bg-[#0E2A45] ${index !== branches.length - 1 ? 'border-b border-[#457B9D]' : ''}`
                        : `bg-white hover:bg-gray-50 ${index !== branches.length - 1 ? 'border-b border-gray-200' : ''}`
                    }`}
                  >
                    <td className="p-4 font-medium">{branch.name}</td>
                    <td className="p-4">{branch.manager}</td>
                    <td className="p-4">{branch.contact}</td>
                    <td className="p-4">{branch.address}</td>
                    <td className="p-4">{branch.establishedAt?.split('T')[0]}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleEditBranch(branch)}
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
            {branches.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'bg-sky-950 text-[#A8A8A8]' : 'bg-white text-gray-500'}`}>
                No branches found
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>

      {/* Edit Branch Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 w-full max-w-md ${
            isDark ? 'bg-cyan-950 text-white' : 'bg-white text-gray-900'
          }`}>
            <h2 className="text-xl font-bold mb-4">Edit Branch</h2>
            {editingBranch && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editingBranch.name}
                    onChange={(e) => setEditingBranch({...editingBranch, name: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      isDark 
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Manager</label>
                  <input
                    type="text"
                    value={editingBranch.manager}
                    onChange={(e) => setEditingBranch({...editingBranch, manager: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      isDark 
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact</label>
                  <input
                    type="text"
                    value={editingBranch.contact}
                    onChange={(e) => setEditingBranch({...editingBranch, contact: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      isDark 
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    value={editingBranch.address}
                    onChange={(e) => setEditingBranch({...editingBranch, address: e.target.value})}
                    rows="3"
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
                onClick={handleSaveBranch}
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

export default BranchList;