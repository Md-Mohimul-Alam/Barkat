import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';

const initialCNFs = [
  { id: 1, name: 'Unico', contact: '01711000000', address: 'Dhaka', establishedAt: '2021-01-01' },
  { id: 2, name: 'Sheba Shipping', contact: '01712000000', address: 'Chittagong', establishedAt: '2022-03-15' },
  { id: 3, name: 'Sheikh Shipping', contact: '01713000000', address: 'Khulna', establishedAt: '2020-08-10' },
];

const CNFList = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [cnfs, setCnfs] = useState(initialCNFs);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCNF, setEditingCNF] = useState(null);

  const handleEditCNF = (cnf) => {
    setEditingCNF({...cnf});
    setEditModalOpen(true);
  };

  const handleSaveCNF = () => {
    setCnfs(prev =>
      prev.map(cnf =>
        cnf.id === editingCNF.id ? editingCNF : cnf
      )
    );
    setEditModalOpen(false);
    setEditingCNF(null);
  };

  const handleDateChange = (id, newDate) => {
    setCnfs(prev =>
      prev.map(cnf =>
        cnf.id === id ? { ...cnf, establishedAt: newDate } : cnf
      )
    );
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#ffffff]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed}  />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">CNF List</h1>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isDark 
                  ? 'bg-[#f85924] hover:bg-[#d13602] text-white shadow-lg'
                  : 'bg-[#f85924] hover:bg-[#d13602] text-white shadow-md'
              }`}
            >
              + Add CNF
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-[#2C2C2C] text-[#ffffff]' : 'bg-white text-gray-700'} border-b ${isDark ? 'border-[#457B9D]' : 'border-gray-200'}`}>
                  <th className="p-4 text-left font-semibold">Name</th>
                  <th className="p-4 text-left font-semibold">Contact</th>
                  <th className="p-4 text-left font-semibold">Address</th>
                  <th className="p-4 text-left font-semibold">Established At</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cnfs.map((cnf, index) => (
                  <tr 
                    key={cnf.id} 
                    className={`transition-colors duration-150 ${
                      isDark 
                        ? `bg-sky-950 hover:bg-[#0E2A45] ${index !== cnfs.length - 1 ? 'border-b border-[#457B9D]' : ''}`
                        : `bg-white hover:bg-gray-50 ${index !== cnfs.length - 1 ? 'border-b border-gray-200' : ''}`
                    }`}
                  >
                    <td className="p-4 font-medium">{cnf.name}</td>
                    <td className="p-4">{cnf.contact}</td>
                    <td className="p-4">{cnf.address}</td>
                    <td className="p-4">
                      <input
                        type="date"
                        value={cnf.establishedAt}
                        onChange={(e) => handleDateChange(cnf.id, e.target.value)}
                        className={`rounded-lg border px-3 py-2 text-sm w-full transition-colors duration-200 ${
                          isDark 
                            ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] hover:bg-sky-950 focus:bg-sky-950 focus:border-[#f85924]' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:bg-white focus:border-[#f85924]'
                        } focus:outline-none focus:ring-2 focus:ring-[#f85924] focus:ring-opacity-50`}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleEditCNF(cnf)}
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
            {cnfs.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'bg-sky-950 text-[#A8A8A8]' : 'bg-white text-gray-500'}`}>
                No CNFs found
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>

      {/* Edit CNF Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 w-full max-w-md ${
            isDark ? 'bg-cyan-950 text-white' : 'bg-white text-gray-900'
          }`}>
            <h2 className="text-xl font-bold mb-4">Edit CNF</h2>
            {editingCNF && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editingCNF.name}
                    onChange={(e) => setEditingCNF({...editingCNF, name: e.target.value})}
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
                    value={editingCNF.contact}
                    onChange={(e) => setEditingCNF({...editingCNF, contact: e.target.value})}
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
                    value={editingCNF.address}
                    onChange={(e) => setEditingCNF({...editingCNF, address: e.target.value})}
                    rows="3"
                    className={`w-full rounded-lg border px-3 py-2 ${
                      isDark 
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Established At</label>
                  <input
                    type="date"
                    value={editingCNF.establishedAt}
                    onChange={(e) => setEditingCNF({...editingCNF, establishedAt: e.target.value})}
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
                onClick={handleSaveCNF}
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

export default CNFList;