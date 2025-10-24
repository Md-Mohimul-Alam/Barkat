import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaBuilding, FaUser, FaPhone, FaMapMarker, FaCalendar, FaSpinner, FaSearch, FaMoneyBillWave, FaSave, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import clientService from '../../services/clientService'; // ✅ Change to default import
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { notifyError, notifySuccess } from '../../pages/UI/Toast';
import { useNavigate } from 'react-router-dom';

const ClientList = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [clients, setClients] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const handleToggleSidebar = () => setSidebarCollapsed(prev => !prev);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getClients();
      
      // Data should now be the array directly
      if (data && Array.isArray(data)) {
        setClients(data);
      } else {
        console.error('Unexpected data format:', data);
        setClients([]);
        notifyError('Invalid data format received');
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      
      // Only show error if it's not an auth redirect
      if (!err.message?.includes('Authentication failed')) {
        notifyError(err.message || 'Failed to load clients');
      }
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = (client) => {
    setEditingClient({...client});
    setEditModalOpen(true);
  };

  const handleSaveClient = async () => {
    if (!editingClient) return;

    // Validation
    if (!editingClient.name?.trim() || !editingClient.manager?.trim() || 
        !editingClient.contact?.trim() || !editingClient.address?.trim() || 
        !editingClient.establishedAt) {
      notifyError('Please fill in all required fields');
      return;
    }

    setSaveLoading(true);
    try {
      // ✅ Use default import pattern
      const response = await clientService.updateClient(editingClient.id, editingClient);
      
      // Check if response contains the updated client data
      const updatedClient = response || editingClient;
      
      setClients(prev => prev.map(client => 
        client.id === editingClient.id ? updatedClient : client
      ));
      setEditModalOpen(false);
      setEditingClient(null);
      notifySuccess('Client updated successfully');
    } catch (err) {
      console.error('Error updating client:', err);
      notifyError(err.message || 'Failed to update client');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    setDeletingId(clientToDelete.id);
    try {
      // ✅ Use default import pattern
      await clientService.deleteClient(clientToDelete.id);
      setClients(prev => prev.filter(client => client.id !== clientToDelete.id));
      setDeleteModalOpen(false);
      setClientToDelete(null);
      notifySuccess('Client deleted successfully');
    } catch (err) {
      console.error('Error deleting client:', err);
      notifyError(err.message || 'Failed to delete client');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingClient(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDateChange = async (clientId, newDate) => {
    if (!newDate) return;
    
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      // ✅ Use default import pattern
      await clientService.updateClient(clientId, { ...client, establishedAt: newDate });
      setClients(prev => prev.map(client => 
        client.id === clientId ? { ...client, establishedAt: newDate } : client
      ));
      notifySuccess('Date updated successfully');
    } catch (err) {
      console.error('Error updating date:', err);
      notifyError(err.message || 'Failed to update date');
    }
  };

  // Safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return dateString.split('T')[0];
    } catch {
      return dateString;
    }
  };

  const filteredAndSortedClients = clients
    .filter(client => {
      if (!client) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        client.name?.toLowerCase().includes(searchLower) ||
        client.manager?.toLowerCase().includes(searchLower) ||
        client.contact?.toLowerCase().includes(searchLower) ||
        client.address?.toLowerCase().includes(searchLower) ||
        (client.email && client.email.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400 ml-1">↕</span>;
    }
    return (
      <span className="ml-1">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#ffffff]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={handleToggleSidebar} sidebarCollapsed={sidebarCollapsed} />

        <div className="p-6 flex-1">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div className="flex items-center">
              <FaUser className={`w-8 h-8 mr-3 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} />
              <div>
                <h1 className="text-2xl font-bold">Client List</h1>
                <p className={`text-sm ${isDark ? 'text-cyan-200' : 'text-gray-600'}`}>
                  Manage your organization clients ({clients.length} total)
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className={`relative flex-1 lg:flex-none lg:w-64 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-200 ${
                    isDark 
                      ? 'bg-cyan-900 border-cyan-700 text-white placeholder-cyan-400 focus:border-cyan-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#f85924]'
                  }`}
                />
              </div>
              <button
                onClick={() => navigate('/app/clients/add')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl ${
                  isDark
                    ? 'bg-[#f85924] hover:bg-[#d13602] text-white'
                    : 'bg-[#f85924] hover:bg-[#d13602] text-white'
                }`}
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add Client
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className={`rounded-2xl shadow-lg overflow-hidden border ${
            isDark ? 'border-cyan-700 bg-cyan-900' : 'border-gray-200 bg-white'
          }`}>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${
                    isDark ? 'border-cyan-700 bg-cyan-800' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <th 
                      className="p-4 text-left font-semibold cursor-pointer hover:bg-opacity-50 transition-colors duration-200"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        <FaBuilding className="w-4 h-4 mr-2" />
                        Client Name
                        <SortIcon columnKey="name" />
                      </div>
                    </th>
                    <th 
                      className="p-4 text-left font-semibold cursor-pointer hover:bg-opacity-50 transition-colors duration-200"
                      onClick={() => handleSort('manager')}
                    >
                      <div className="flex items-center">
                        <FaUser className="w-4 h-4 mr-2" />
                        Manager
                        <SortIcon columnKey="manager" />
                      </div>
                    </th>
                    <th 
                      className="p-4 text-left font-semibold cursor-pointer hover:bg-opacity-50 transition-colors duration-200"
                      onClick={() => handleSort('contact')}
                    >
                      <div className="flex items-center">
                        <FaPhone className="w-4 h-4 mr-2" />
                        Contact
                        <SortIcon columnKey="contact" />
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold">
                      <div className="flex items-center">
                        <FaMapMarker className="w-4 h-4 mr-2" />
                        Address
                      </div>
                    </th>
                    <th 
                      className="p-4 text-left font-semibold cursor-pointer hover:bg-opacity-50 transition-colors duration-200"
                      onClick={() => handleSort('establishedAt')}
                    >
                      <div className="flex items-center">
                        <FaCalendar className="w-4 h-4 mr-2" />
                        Established
                        <SortIcon columnKey="establishedAt" />
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold">Actions</th>
                    <th className="p-4 text-center font-semibold">Dues</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedClients.map((client, index) => (
                    <tr 
                      key={client.id} 
                      className={`transition-colors duration-150 ${
                        isDark 
                          ? `hover:bg-cyan-800 ${index !== clients.length - 1 ? 'border-b border-cyan-700' : ''}` 
                          : `hover:bg-gray-50 ${index !== clients.length - 1 ? 'border-b border-gray-200' : ''}`
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-semibold">{client.name || 'N/A'}</div>
                        {client.email && (
                          <div className={`text-xs mt-1 ${isDark ? 'text-cyan-300' : 'text-gray-500'}`}>
                            {client.email}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaUser className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                          {client.manager || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaPhone className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                          {client.contact || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaMapMarker className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                          <span className="max-w-xs truncate" title={client.address}>
                            {client.address || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <FaCalendar className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                            {formatDate(client.establishedAt)}
                          </div>
                          <input
                            type="date"
                            value={formatDate(client.establishedAt)}
                            onChange={(e) => handleDateChange(client.id, e.target.value)}
                            className={`text-xs rounded border px-2 py-1 w-full transition-colors duration-200 ${
                              isDark 
                                ? 'bg-cyan-800 border-cyan-600 text-white hover:bg-cyan-700 focus:bg-cyan-700' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:bg-white'
                            } focus:outline-none focus:ring-1 focus:ring-[#f85924] focus:border-[#f85924]`}
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center space-x-3">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditClient(client)}
                            className={`group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center shadow-md hover:shadow-lg ${
                              isDark 
                                ? 'bg-cyan-700 text-cyan-100 hover:bg-cyan-600 hover:scale-105' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105'
                            }`}
                            title="Edit client"
                          >
                            <FaEdit className={`w-3 h-3 mr-2 transition-transform duration-300 group-hover:scale-110 ${
                              isDark ? 'text-cyan-200' : 'text-blue-600'
                            }`} />
                            Edit
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteClick(client)}
                            disabled={deletingId === client.id}
                            className={`group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                              isDark 
                                ? 'bg-red-700 text-red-100 hover:bg-red-600 hover:scale-105' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105'
                            }`}
                            title="Delete client"
                          >
                            {deletingId === client.id ? (
                              <>
                                <FaSpinner className="animate-spin w-3 h-3 mr-2" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <FaTrash className={`w-3 h-3 mr-2 transition-transform duration-300 group-hover:scale-110 ${
                                  isDark ? 'text-red-200' : 'text-red-600'
                                }`} />
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            className={`group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center shadow-md hover:shadow-lg ${
                              isDark 
                                ? 'bg-green-700 text-green-100 hover:bg-green-600 hover:scale-105' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105'
                            }`}
                            title="View dues and payments"
                          >
                            <FaMoneyBillWave className={`w-3 h-3 mr-2 transition-transform duration-300 group-hover:scale-110 ${
                              isDark ? 'text-green-200' : 'text-green-600'
                            }`} />
                            View Dues
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <FaSpinner className="animate-spin w-8 h-8 text-[#f85924]" />
                <span className="ml-3">Loading clients...</span>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredAndSortedClients.length === 0 && (
              <div className="text-center py-12">
                <FaUser className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-cyan-600' : 'text-gray-400'}`} />
                <h3 className="text-xl font-bold mb-2">
                  {searchTerm ? 'No matching clients found' : 'No clients found'}
                </h3>
                <p className={`mb-6 ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first client'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/app/clients/add')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center mx-auto shadow-lg hover:shadow-xl ${
                      isDark
                        ? 'bg-[#f85924] hover:bg-[#d13602] text-white'
                        : 'bg-[#f85924] hover:bg-[#d13602] text-white'
                    }`}
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Your First Client
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Table Info Footer */}
          {filteredAndSortedClients.length > 0 && (
            <div className={`mt-4 text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
              Showing {filteredAndSortedClients.length} of {clients.length} clients
              {searchTerm && ` for "${searchTerm}"`}
            </div>
          )}
        </div>
        <Footer />
      </div>

      {/* Edit Client Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className={`rounded-2xl p-6 w-full max-w-md shadow-2xl ${
            isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 text-white border border-cyan-700' : 'bg-white text-gray-900 border border-gray-200'
          }`}>
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-xl mr-4 ${
                isDark ? 'bg-cyan-800' : 'bg-orange-100'
              }`}>
                <FaEdit className={`w-6 h-6 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Client</h2>
                <p className={`text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                  Update client information
                </p>
              </div>
            </div>
            {editingClient && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FaBuilding className="w-4 h-4 mr-2 text-gray-400" />
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={editingClient.name || ''}
                    onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                      isDark 
                        ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FaUser className="w-4 h-4 mr-2 text-gray-400" />
                    Manager *
                  </label>
                  <input
                    type="text"
                    value={editingClient.manager || ''}
                    onChange={(e) => setEditingClient({...editingClient, manager: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                      isDark 
                        ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter manager name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                    Contact *
                  </label>
                  <input
                    type="text"
                    value={editingClient.contact || ''}
                    onChange={(e) => setEditingClient({...editingClient, contact: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                      isDark 
                        ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter contact number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FaUser className="w-4 h-4 mr-2 text-gray-400" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingClient.email || ''}
                    onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                      isDark 
                        ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter email address (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FaMapMarker className="w-4 h-4 mr-2 text-gray-400" />
                    Address *
                  </label>
                  <textarea
                    value={editingClient.address || ''}
                    onChange={(e) => setEditingClient({...editingClient, address: e.target.value})}
                    rows="3"
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                      isDark 
                        ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter client address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FaCalendar className="w-4 h-4 mr-2 text-gray-400" />
                    Established At *
                  </label>
                  <input
                    type="date"
                    value={formatDate(editingClient.establishedAt)}
                    onChange={(e) => setEditingClient({...editingClient, establishedAt: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                      isDark 
                        ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={handleCloseEditModal}
                disabled={saveLoading}
                className={`group px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center border-2 ${
                  isDark 
                    ? 'border-cyan-600 text-cyan-300 hover:bg-cyan-800 hover:scale-105 disabled:opacity-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:scale-105 disabled:opacity-50'
                }`}
              >
                <FaTimes className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Cancel
              </button>
              <button
                onClick={handleSaveClient}
                disabled={saveLoading}
                className="group px-6 py-3 bg-gradient-to-r from-[#f85924] to-[#e84a1a] text-white rounded-xl font-semibold transition-all duration-300 hover:from-[#e84a1a] hover:to-[#d13602] shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 flex items-center"
              >
                {saveLoading ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className={`rounded-2xl p-6 w-full max-w-md shadow-2xl ${
            isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 text-white border border-cyan-700' : 'bg-white text-gray-900 border border-gray-200'
          }`}>
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-xl mr-4 ${
                isDark ? 'bg-red-800' : 'bg-red-100'
              }`}>
                <FaTrash className={`w-6 h-6 ${isDark ? 'text-red-300' : 'text-red-600'}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Confirm Delete</h2>
                <p className={`text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="mb-4">
                Are you sure you want to delete <strong className="text-[#f85924]">{clientToDelete?.name}</strong>?
              </p>
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-cyan-800' : 'bg-gray-100'
              }`}>
                <p className="text-sm">
                  This will permanently remove the client and all associated data from the system.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
              <button
                onClick={handleCloseDeleteModal}
                disabled={deletingId}
                className={`group px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center border-2 ${
                  isDark 
                    ? 'border-cyan-600 text-cyan-300 hover:bg-cyan-800 hover:scale-105 disabled:opacity-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:scale-105 disabled:opacity-50'
                }`}
              >
                <FaTimes className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId}
                className="group px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold transition-all duration-300 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 flex items-center"
              >
                {deletingId ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Delete Client
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;