import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';

const initialClients = [
  { id: 1, name: 'Gram Bangla', manager: 'Mr. Sohel', contact: '01710000001', address: 'Narayanganj', establishedAt: '2023-01-01' },
  { id: 2, name: 'Amin Metal', manager: 'Mr. Sohel', contact: '01710000001', address: 'Narayanganj', establishedAt: '2023-01-01' },
  { id: 3, name: 'Bukhari Steel', manager: 'Mr. Hossain', contact: '01710000002', address: 'Gazipur', establishedAt: '2022-11-20' },
];

const ClientList = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [clients, setClients] = useState(initialClients);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const handleToggleSidebar = () => setSidebarCollapsed(prev => !prev);

  const handleEditClient = (client) => {
    setEditingClient({...client});
    setEditModalOpen(true);
  };

  const handleSaveClient = () => {
    setClients(prev =>
      prev.map(client =>
        client.id === editingClient.id ? editingClient : client
      )
    );
    setEditModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#ffffff]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar
          onToggleSidebar={handleToggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <div className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Client List</h1>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isDark
                  ? 'bg-[#f85924] hover:bg-[#d13602] text-white shadow-lg'
                  : 'bg-[#f85924] hover:bg-[#d13602] text-white shadow-md'
              }`}
            >
              + Add Client
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
                  <th className="p-4 text-center font-semibold">Dues</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, index) => (
                  <tr 
                    key={client.id} 
                    className={`transition-colors duration-150 ${
                      isDark 
                        ? `bg-sky-950 hover:bg-[#0E2A45] ${index !== clients.length - 1 ? 'border-b border-[#457B9D]' : ''}`
                        : `bg-white hover:bg-gray-50 ${index !== clients.length - 1 ? 'border-b border-gray-200' : ''}`
                    }`}
                  >
                    <td className="p-4 font-medium">{client.name}</td>
                    <td className="p-4">{client.manager}</td>
                    <td className="p-4">{client.contact}</td>
                    <td className="p-4">{client.address}</td>
                    <td className="p-4">
                      <input
                        type="date"
                        value={client.establishedAt}
                        onChange={(e) => handleDateChange(client.id, e.target.value)}
                        className={`rounded-lg border px-3 py-2 text-sm w-full transition-colors duration-200 ${
                          isDark 
                            ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] hover:bg-sky-950 focus:bg-sky-950 focus:border-[#f85924]' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:bg-white focus:border-[#f85924]'
                        } focus:outline-none focus:ring-2 focus:ring-[#f85924] focus:ring-opacity-50`}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleEditClient(client)}
                        className={`text-sm font-medium px-3 py-1 rounded transition-colors duration-200 ${
                          isDark 
                            ? 'text-[#f85924] hover:text-[#d13602] hover:bg-[#2C2C2C]' 
                            : 'text-[#1D3557] hover:text-[#457B9D] hover:bg-blue-50'
                        }`}
                      >
                        Edit
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        className={`text-sm font-medium px-3 py-1 rounded transition-colors duration-200 ${
                          isDark 
                            ? 'text-green-400 hover:text-green-300 hover:bg-[#2C2C2C]' 
                            : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                        }`}
                      >
                        View Dues
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {clients.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'bg-sky-950 text-[#A8A8A8]' : 'bg-white text-gray-500'}`}>
                No clients found
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>

      {/* Edit Client Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 w-full max-w-md ${
            isDark ? 'bg-cyan-950 text-white' : 'bg-white text-gray-900'
          }`}>
            <h2 className="text-xl font-bold mb-4">Edit Client</h2>
            {editingClient && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
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
                    value={editingClient.manager}
                    onChange={(e) => setEditingClient({...editingClient, manager: e.target.value})}
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
                    value={editingClient.contact}
                    onChange={(e) => setEditingClient({...editingClient, contact: e.target.value})}
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
                    value={editingClient.address}
                    onChange={(e) => setEditingClient({...editingClient, address: e.target.value})}
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
                    value={editingClient.establishedAt}
                    onChange={(e) => setEditingClient({...editingClient, establishedAt: e.target.value})}
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
                onClick={handleSaveClient}
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

export default ClientList;