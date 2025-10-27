import React, { useEffect, useState, useCallback } from 'react';
import { FaEdit, FaTrash, FaPlus, FaBuilding, FaPhone, FaMapMarker, FaCalendar, FaSpinner, FaSearch, FaSave, FaTimes, FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { notifyError, notifySuccess } from '../../pages/UI/Toast';
import { useNavigate } from 'react-router-dom';
import cnfService from '../../services/cnfService';

const CNFList = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [cnfs, setCnfs] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCNF, setEditingCNF] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cnfToDelete, setCnfToDelete] = useState(null);
  const [errors, setErrors] = useState({});

  const handleToggleSidebar = () => setSidebarCollapsed(prev => !prev);

  const fetchCNFs = useCallback(async () => {
    try {
      setLoading(true);
      setErrors({});
      
      // ✅ Fix: Use getCNFs instead of getAllCNFs
      const response = await cnfService.getCNFs();
      console.log('🔧 CNF API response:', response);
      
      // Handle different response formats
      let cnfsData = [];
      
      if (Array.isArray(response)) {
        cnfsData = response;
      } else if (response && Array.isArray(response.data)) {
        cnfsData = response.data;
      } else if (response && response.data && Array.isArray(response.data.cnfs)) {
        cnfsData = response.data.cnfs;
      } else if (response && response.cnfs) {
        cnfsData = response.cnfs;
      } else if (response && response.success && Array.isArray(response.data)) {
        cnfsData = response.data;
      } else {
        console.warn('Unexpected CNF response format:', response);
        cnfsData = [];
      }
      
      setCnfs(cnfsData);
    } catch (err) {
      console.error('Error fetching CNFs:', err);
      setErrors({ fetch: err.message || 'Failed to load CNFs' });
      
      // Handle role permission errors gracefully
      if (err.message?.includes('Access denied') || err.message?.includes('role not permitted')) {
        notifyError('You do not have permission to access CNF data');
        setCnfs([]);
      } else {
        notifyError(err.message || 'Failed to load CNFs');
        setCnfs([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCNFs();
  }, [fetchCNFs]);

  const validateCNFForm = (cnf) => {
    const newErrors = {};
    
    if (!cnf.name?.trim()) newErrors.name = 'CNF name is required';
    if (!cnf.contact?.trim()) newErrors.contact = 'Contact number is required';
    if (!cnf.address?.trim()) newErrors.address = 'Address is required';
    if (!cnf.establishedAt) newErrors.establishedAt = 'Establishment date is required';

    // Contact validation
    const contactRegex = /^[0-9]{10,15}$/;
    if (cnf.contact && !contactRegex.test(cnf.contact)) {
      newErrors.contact = 'Contact must be 10-15 digits';
    }

    return newErrors;
  };

  const handleEditCNF = (cnf) => {
    setEditingCNF({...cnf});
    setErrors({});
    setEditModalOpen(true);
  };

  const handleSaveCNF = async () => {
    if (!editingCNF) return;

    const formErrors = validateCNFForm(editingCNF);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      notifyError('Please fix the form errors');
      return;
    }

    setSaveLoading(true);
    setErrors({});
    try {
      const response = await cnfService.updateCNF(editingCNF.id, editingCNF);
      
      // Check if response contains the updated CNF data
      const updatedCNF = response.data || editingCNF;
      
      setCnfs(prev => prev.map(cnf => 
        cnf.id === editingCNF.id ? updatedCNF : cnf
      ));
      setEditModalOpen(false);
      setEditingCNF(null);
      notifySuccess('CNF updated successfully');
    } catch (err) {
      console.error('Error updating CNF:', err);
      setErrors({ save: err.message });
      notifyError(err.message || 'Failed to update CNF');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteClick = (cnf) => {
    setCnfToDelete(cnf);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cnfToDelete) return;

    setDeletingId(cnfToDelete.id);
    setErrors({});
    try {
      await cnfService.deleteCNF(cnfToDelete.id);
      setCnfs(prev => prev.filter(cnf => cnf.id !== cnfToDelete.id));
      setDeleteModalOpen(false);
      setCnfToDelete(null);
      notifySuccess('CNF deleted successfully');
    } catch (err) {
      console.error('Error deleting CNF:', err);
      setErrors({ delete: err.message });
      notifyError(err.message || 'Failed to delete CNF');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingCNF(null);
    setErrors({});
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setCnfToDelete(null);
    setErrors({});
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDateChange = async (cnfId, newDate) => {
    if (!newDate) return;
    
    try {
      const cnf = cnfs.find(c => c.id === cnfId);
      if (!cnf) return;

      await cnfService.updateCNF(cnfId, { ...cnf, establishedAt: newDate });
      setCnfs(prev => prev.map(cnf => 
        cnf.id === cnfId ? { ...cnf, establishedAt: newDate } : cnf
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

  // Safe filtering and sorting
  const filteredAndSortedCNFs = (cnfs || [])
    .filter(cnf => {
      if (!cnf) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        (cnf.name?.toLowerCase() || '').includes(searchLower) ||
        (cnf.contact?.toLowerCase() || '').includes(searchLower) ||
        (cnf.address?.toLowerCase() || '').includes(searchLower)
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
          {/* Error Banner */}
          {errors.fetch && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center ${
              isDark 
                ? 'bg-red-900/20 border-red-700 text-red-300' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <FaExclamationTriangle className="w-5 h-5 mr-2" />
              {errors.fetch}
              <button 
                onClick={fetchCNFs}
                className="ml-auto px-3 py-1 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center"
              >
                <FaSyncAlt className="w-3 h-3 mr-1" />
                Retry
              </button>
            </div>
          )}

          {/* Permission Notice for non-admin/managers */}
          {user && !['admin', 'manager'].includes(user.role) && (
            <div className={`mb-6 p-4 rounded-lg border ${
              isDark ? 'bg-cyan-800 border-cyan-600' : 'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-sm ${isDark ? 'text-cyan-200' : 'text-blue-700'}`}>
                ⚠️ <strong>Limited Access:</strong> Your role ({user.role}) may not have permission to view or manage CNF data.
                Please contact an administrator if you need access.
              </p>
            </div>
          )}

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div className="flex items-center">
              <FaBuilding className={`w-8 h-8 mr-3 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} />
              <div>
                <h1 className="text-2xl font-bold">CNF List</h1>
                <p className={`text-sm ${isDark ? 'text-cyan-200' : 'text-gray-600'}`}>
                  Manage your CNF partners ({(cnfs || []).length} total)
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className={`relative flex-1 lg:flex-none lg:w-64 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search CNFs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-200 ${
                    isDark 
                      ? 'bg-cyan-900 border-cyan-700 text-white placeholder-cyan-400 focus:border-cyan-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#f85924]'
                  }`}
                />
              </div>
              {['admin', 'manager'].includes(user?.role) && (
                <button
                  onClick={() => navigate('/app/cnfs/add')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl ${
                    isDark
                      ? 'bg-[#f85924] hover:bg-[#d13602] text-white'
                      : 'bg-[#f85924] hover:bg-[#d13602] text-white'
                  }`}
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Add CNF
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className={`rounded-xl p-4 ${isDark ? 'bg-cyan-800' : 'bg-blue-50'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-cyan-700' : 'bg-blue-100'}`}>
                  <FaBuilding className={isDark ? 'text-cyan-300' : 'text-blue-600'} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>Total CNFs</p>
                  <p className="text-xl font-bold">{cnfs.length}</p>
                </div>
              </div>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-green-800' : 'bg-green-50'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-green-700' : 'bg-green-100'}`}>
                  <FaCalendar className={isDark ? 'text-green-300' : 'text-green-600'} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-green-300' : 'text-gray-600'}`}>Active Partners</p>
                  <p className="text-xl font-bold">{cnfs.length}</p>
                </div>
              </div>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-purple-800' : 'bg-purple-50'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-purple-700' : 'bg-purple-100'}`}>
                  <FaPhone className={isDark ? 'text-purple-300' : 'text-purple-600'} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>Contactable</p>
                  <p className="text-xl font-bold">{cnfs.filter(cnf => cnf.contact).length}</p>
                </div>
              </div>
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
                        CNF Name
                        <SortIcon columnKey="name" />
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
                    {['admin', 'manager'].includes(user?.role) && (
                      <th className="p-4 text-center font-semibold">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedCNFs.map((cnf, index) => (
                    <tr 
                      key={cnf.id} 
                      className={`transition-colors duration-150 ${
                        isDark 
                          ? `hover:bg-cyan-800 ${index !== filteredAndSortedCNFs.length - 1 ? 'border-b border-cyan-700' : ''}` 
                          : `hover:bg-gray-50 ${index !== filteredAndSortedCNFs.length - 1 ? 'border-b border-gray-200' : ''}`
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-semibold">{cnf.name || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaPhone className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                          {cnf.contact || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaMapMarker className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                          <span className="max-w-xs truncate" title={cnf.address}>
                            {cnf.address || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <FaCalendar className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                            {formatDate(cnf.establishedAt)}
                          </div>
                          {['admin', 'manager'].includes(user?.role) && (
                            <input
                              type="date"
                              value={formatDate(cnf.establishedAt)}
                              onChange={(e) => handleDateChange(cnf.id, e.target.value)}
                              className={`text-xs rounded border px-2 py-1 w-full transition-colors duration-200 ${
                                isDark 
                                  ? 'bg-cyan-800 border-cyan-600 text-white hover:bg-cyan-700 focus:bg-cyan-700' 
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:bg-white'
                              } focus:outline-none focus:ring-1 focus:ring-[#f85924] focus:border-[#f85924]`}
                            />
                          )}
                        </div>
                      </td>
                      {['admin', 'manager'].includes(user?.role) && (
                        <td className="p-4">
                          <div className="flex justify-center space-x-3">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditCNF(cnf)}
                              className={`group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center shadow-md hover:shadow-lg ${
                                isDark 
                                  ? 'bg-cyan-700 text-cyan-100 hover:bg-cyan-600 hover:scale-105' 
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105'
                              }`}
                              title="Edit CNF"
                            >
                              <FaEdit className={`w-3 h-3 mr-2 transition-transform duration-300 group-hover:scale-110 ${
                                isDark ? 'text-cyan-200' : 'text-blue-600'
                              }`} />
                              Edit
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteClick(cnf)}
                              disabled={deletingId === cnf.id}
                              className={`group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                                isDark 
                                  ? 'bg-red-700 text-red-100 hover:bg-red-600 hover:scale-105' 
                                  : 'bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105'
                              }`}
                              title="Delete CNF"
                            >
                              {deletingId === cnf.id ? (
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
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <FaSpinner className="animate-spin w-8 h-8 text-[#f85924]" />
                <span className="ml-3">Loading CNFs...</span>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredAndSortedCNFs.length === 0 && (
              <div className="text-center py-12">
                <FaBuilding className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-cyan-600' : 'text-gray-400'}`} />
                <h3 className="text-xl font-bold mb-2">
                  {user && !['admin', 'manager'].includes(user.role) 
                    ? 'Access Restricted' 
                    : searchTerm ? 'No matching CNFs found' : 'No CNFs found'
                  }
                </h3>
                <p className={`mb-6 ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                  {user && !['admin', 'manager'].includes(user.role)
                    ? 'Your user role does not have permission to access CNF data.'
                    : searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first CNF'
                  }
                </p>
                {!searchTerm && ['admin', 'manager'].includes(user?.role) && (
                  <button
                    onClick={() => navigate('/app/cnfs/add')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center mx-auto shadow-lg hover:shadow-xl ${
                      isDark
                        ? 'bg-[#f85924] hover:bg-[#d13602] text-white'
                        : 'bg-[#f85924] hover:bg-[#d13602] text-white'
                    }`}
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Your First CNF
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Table Info Footer */}
          {filteredAndSortedCNFs.length > 0 && (
            <div className={`mt-4 text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
              Showing {filteredAndSortedCNFs.length} of {(cnfs || []).length} CNFs
              {searchTerm && ` for "${searchTerm}"`}
            </div>
          )}
        </div>
        <Footer />
      </div>

      {/* Edit CNF Modal */}
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
                <h2 className="text-xl font-bold">Edit CNF</h2>
                <p className={`text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                  Update CNF information
                </p>
              </div>
            </div>

            {/* Error Display */}
            {errors.save && (
              <div className={`mb-4 p-3 rounded-xl border ${
                isDark 
                  ? 'bg-red-900/20 border-red-700 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-4 h-4 mr-2" />
                  {errors.save}
                </div>
              </div>
            )}

            {editingCNF && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FaBuilding className="w-4 h-4 mr-2 text-gray-400" />
                    CNF Name *
                  </label>
                  <input
                    type="text"
                    value={editingCNF.name || ''}
                    onChange={(e) => setEditingCNF({...editingCNF, name: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                      errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    } ${
                      isDark 
                        ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter CNF name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <FaExclamationTriangle className="w-3 h-3 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                    Contact *
                  </label>
                  <input
                    type="text"
                    value={editingCNF.contact || ''}
                    onChange={(e) => setEditingCNF({...editingCNF, contact: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                      errors.contact ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    } ${
                      isDark 
                        ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter contact number"
                  />
                  {errors.contact && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <FaExclamationTriangle className="w-3 h-3 mr-1" />
                      {errors.contact}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FaMapMarker className="w-4 h-4 mr-2 text-gray-400" />
                    Address *
                  </label>
                  <textarea
                    value={editingCNF.address || ''}
                    onChange={(e) => setEditingCNF({...editingCNF, address: e.target.value})}
                    rows="3"
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                      errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    } ${
                      isDark 
                        ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter CNF address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <FaExclamationTriangle className="w-3 h-3 mr-1" />
                      {errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FaCalendar className="w-4 h-4 mr-2 text-gray-400" />
                    Established At *
                  </label>
                  <input
                    type="date"
                    value={formatDate(editingCNF.establishedAt)}
                    onChange={(e) => setEditingCNF({...editingCNF, establishedAt: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                      errors.establishedAt ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    } ${
                      isDark 
                        ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  {errors.establishedAt && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <FaExclamationTriangle className="w-3 h-3 mr-1" />
                      {errors.establishedAt}
                    </p>
                  )}
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
                onClick={handleSaveCNF}
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

            {/* Error Display */}
            {errors.delete && (
              <div className={`mb-4 p-3 rounded-xl border ${
                isDark 
                  ? 'bg-red-900/20 border-red-700 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-4 h-4 mr-2" />
                  {errors.delete}
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <p className="mb-4">
                Are you sure you want to delete <strong className="text-[#f85924]">{cnfToDelete?.name}</strong>?
              </p>
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-cyan-800' : 'bg-gray-100'
              }`}>
                <p className="text-sm">
                  This will permanently remove the CNF and all associated data from the system.
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
                    Delete CNF
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

export default CNFList;