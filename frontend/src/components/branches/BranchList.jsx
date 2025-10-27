import React, { useEffect, useState, useCallback } from 'react';
import { FaEdit, FaTrash, FaPlus, FaBuilding, FaUser, FaPhone, FaMapMarker, FaCalendar, FaSpinner, FaSearch, FaCrown, FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import branchService from '../../services/branchService';
import employeeService from '../../services/employeeService';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { notifyError, notifySuccess } from '../../pages/UI/Toast';
import { useNavigate } from 'react-router-dom';
import BranchForm from './BranchForm';

const BranchList = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [errors, setErrors] = useState({});

  const handleToggleSidebar = () => setSidebarCollapsed(prev => !prev);

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      setErrors({});
      console.log('🔧 Fetching branches...');
      
      const response = await branchService.getBranches();
      console.log('🔧 Branches API response:', response);
      
      // Handle response format
      let branchesData = [];
      
      if (response && response.success && Array.isArray(response.data)) {
        branchesData = response.data;
      } else if (Array.isArray(response)) {
        branchesData = response;
      } else if (response && Array.isArray(response.data)) {
        branchesData = response.data;
      } else {
        console.warn('Unexpected branches response format:', response);
        branchesData = [];
      }
      
      console.log('🔧 Processed branches data:', branchesData);
      setBranches(branchesData);
      
    } catch (err) {
      console.error('Error fetching branches:', err);
      setErrors({ fetch: err.message || 'Failed to load branches' });
      notifyError(err.message || 'Failed to load branches');
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllEmployees = useCallback(async () => {
    try {
      const response = await employeeService.getEmployees();
      let employeesData = [];
      
      if (response && response.success && Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (Array.isArray(response)) {
        employeesData = response;
      } else if (response && Array.isArray(response.data)) {
        employeesData = response.data;
      }
      
      console.log('🔧 Employees data for manager selection:', employeesData);
      setEmployees(employeesData);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setErrors(prev => ({ ...prev, employees: 'Failed to load employees' }));
    }
  }, []);

  useEffect(() => {
    fetchBranches();
    fetchAllEmployees();
  }, [fetchBranches, fetchAllEmployees]);

  const handleEditBranch = (branch) => {
    setEditingBranch({...branch});
    setErrors({});
    setEditModalOpen(true);
  };

  const handleSaveBranch = async () => {
    if (!editingBranch) return;

    setSaveLoading(true);
    setErrors({});
    try {
      console.log('🔄 Saving branch with ID:', editingBranch.id, 'Data:', editingBranch);
      
      // Prepare data for backend
      const updateData = {
        name: editingBranch.name,
        contact: editingBranch.contact,
        address: editingBranch.address,
        managerId: editingBranch.managerId || null
      };

      console.log('📤 Sending update data:', updateData);
      
      // Call the update service
      const response = await branchService.updateBranch(editingBranch.id, updateData);
      console.log('✅ Branch update response:', response);

      // Handle different response formats
      let updatedBranch;
      if (response && response.success && response.data) {
        updatedBranch = response.data;
      } else if (response && response.id) {
        updatedBranch = response;
      } else {
        updatedBranch = response;
      }

      // Update local state
      setBranches(prev => prev.map(branch => 
        branch.id === editingBranch.id ? updatedBranch : branch
      ));
      
      setEditModalOpen(false);
      setEditingBranch(null);
      notifySuccess('Branch updated successfully');
    } catch (err) {
      console.error('❌ Error updating branch:', err);
      setErrors({ save: err.message });
      notifyError(err.message || 'Failed to update branch');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteBranch = async (branchId) => {
    if (!window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return;
    }

    setDeletingId(branchId);
    setErrors({});
    try {
      await branchService.deleteBranch(branchId);
      setBranches(prev => prev.filter(branch => branch.id !== branchId));
      notifySuccess('Branch deleted successfully');
    } catch (err) {
      console.error(err);
      setErrors({ delete: err.message });
      notifyError('Failed to delete branch');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingBranch(null);
    setErrors({});
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Safe filtering and sorting
  const filteredAndSortedBranches = (branches || [])
    .filter(branch => {
      if (!branch) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        (branch.name?.toLowerCase() || '').includes(searchLower) ||
        (branch.manager?.name?.toLowerCase() || '').includes(searchLower) ||
        (branch.contact?.toLowerCase() || '').includes(searchLower) ||
        (branch.address?.toLowerCase() || '').includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle nested properties for manager name
      if (sortConfig.key === 'manager') {
        aValue = a.manager?.name;
        bValue = b.manager?.name;
      }
      
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

  // Safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      setLoading(true);
      const response = await branchService.testBranches();
      console.log('✅ Test API response:', response);
      notifySuccess('API connection successful!');
      fetchBranches(); // Refresh branches after test
    } catch (error) {
      console.error('❌ Test API failed:', error);
      notifyError('API connection failed: ' + error.message);
    } finally {
      setLoading(false);
    }
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
                onClick={fetchBranches}
                className="ml-auto px-3 py-1 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center"
              >
                <FaSyncAlt className="w-3 h-3 mr-1" />
                Retry
              </button>
            </div>
          )}

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div className="flex items-center">
              <FaBuilding className={`w-8 h-8 mr-3 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} />
              <div>
                <h1 className="text-2xl font-bold">Branch List</h1>
                <p className={`text-sm ${isDark ? 'text-cyan-200' : 'text-gray-600'}`}>
                  Manage your organization branches ({(branches || []).length} total)
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className={`relative flex-1 lg:flex-none lg:w-64 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search branches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-200 ${
                    isDark 
                      ? 'bg-cyan-900 border-cyan-700 text-white placeholder-cyan-400 focus:border-cyan-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#f85924]'
                  }`}
                />
              </div>
              
              {/* Test API Button */}
              <button
                onClick={testApiConnection}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                  isDark
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50'
                }`}
              >
                {loading ? (
                  <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <FaSyncAlt className="w-4 h-4 mr-2" />
                )}
                Test API
              </button>

              <button
                onClick={() => navigate('/app/branches/add')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl ${
                  isDark
                    ? 'bg-[#f85924] hover:bg-[#d13602] text-white'
                    : 'bg-[#f85924] hover:bg-[#d13602] text-white'
                }`}
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add Branch
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`rounded-xl p-4 ${isDark ? 'bg-cyan-800' : 'bg-blue-50'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-cyan-700' : 'bg-blue-100'}`}>
                  <FaBuilding className={isDark ? 'text-cyan-300' : 'text-blue-600'} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>Total Branches</p>
                  <p className="text-xl font-bold">{branches.length}</p>
                </div>
              </div>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-green-800' : 'bg-green-50'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-green-700' : 'bg-green-100'}`}>
                  <FaBuilding className={isDark ? 'text-green-300' : 'text-green-600'} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-green-300' : 'text-gray-600'}`}>Active Branches</p>
                  <p className="text-xl font-bold">{branches.filter(b => b.status === 'active').length}</p>
                </div>
              </div>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-purple-800' : 'bg-purple-50'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-purple-700' : 'bg-purple-100'}`}>
                  <FaUser className={isDark ? 'text-purple-300' : 'text-purple-600'} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>With Managers</p>
                  <p className="text-xl font-bold">{branches.filter(b => b.manager).length}</p>
                </div>
              </div>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-yellow-800' : 'bg-yellow-50'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-yellow-700' : 'bg-yellow-100'}`}>
                  <FaCalendar className={isDark ? 'text-yellow-300' : 'text-yellow-600'} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-gray-600'}`}>Established</p>
                  <p className="text-xl font-bold">{new Date().getFullYear()}</p>
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
                        Name
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
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedBranches.map((branch, index) => (
                    <tr 
                      key={branch.id} 
                      className={`transition-colors duration-150 ${
                        isDark 
                          ? `hover:bg-cyan-800 ${index !== filteredAndSortedBranches.length - 1 ? 'border-b border-cyan-700' : ''}` 
                          : `hover:bg-gray-50 ${index !== filteredAndSortedBranches.length - 1 ? 'border-b border-gray-200' : ''}`
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-semibold">{branch.name || 'N/A'}</div>
                        <div className={`text-xs mt-1 ${isDark ? 'text-cyan-400' : 'text-gray-500'}`}>
                          Status: <span className={`font-medium ${
                            branch.status === 'active' 
                              ? isDark ? 'text-green-400' : 'text-green-600'
                              : isDark ? 'text-red-400' : 'text-red-600'
                          }`}>
                            {branch.status || 'active'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaUser className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                          {branch.manager ? (
                            <div className="flex items-center">
                              <span className="font-medium">{branch.manager.name}</span>
                              {branch.manager.position?.toLowerCase().includes('manager') && (
                                <FaCrown className="w-3 h-3 ml-1 text-yellow-500" title="Manager" />
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">No manager assigned</span>
                          )}
                        </div>
                        {branch.manager && (
                          <div className="text-xs text-gray-500 mt-1">
                            {branch.manager.position} • {branch.manager.contact}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaPhone className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                          {branch.contact || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaMapMarker className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                          <span className="max-w-xs truncate" title={branch.address}>
                            {branch.address || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaCalendar className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                          {formatDate(branch.establishedAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditBranch(branch)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              isDark 
                                ? 'text-cyan-300 hover:text-cyan-200 hover:bg-cyan-700' 
                                : 'text-[#1D3557] hover:text-[#457B9D] hover:bg-blue-50'
                            }`}
                            title="Edit branch"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBranch(branch.id)}
                            disabled={deletingId === branch.id}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              isDark 
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/50 disabled:opacity-50' 
                                : 'text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50'
                            }`}
                            title="Delete branch"
                          >
                            {deletingId === branch.id ? (
                              <FaSpinner className="animate-spin w-4 h-4" />
                            ) : (
                              <FaTrash className="w-4 h-4" />
                            )}
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
                <span className="ml-3">Loading branches...</span>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredAndSortedBranches.length === 0 && (
              <div className="text-center py-12">
                <FaBuilding className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-cyan-600' : 'text-gray-400'}`} />
                <h3 className="text-xl font-bold mb-2">
                  {searchTerm ? 'No matching branches found' : 'No branches found'}
                </h3>
                <p className={`mb-6 ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first branch'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/app/branches/add')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center mx-auto shadow-lg hover:shadow-xl ${
                      isDark
                        ? 'bg-[#f85924] hover:bg-[#d13602] text-white'
                        : 'bg-[#f85924] hover:bg-[#d13602] text-white'
                    }`}
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Your First Branch
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Table Info Footer */}
          {filteredAndSortedBranches.length > 0 && (
            <div className={`mt-4 text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
              Showing {filteredAndSortedBranches.length} of {(branches || []).length} branches
              {searchTerm && ` for "${searchTerm}"`}
            </div>
          )}
        </div>
        <Footer />
      </div>

      {/* Edit Branch Modal */}
      {editModalOpen && (
        <BranchForm
          isEdit={true}
          branchData={editingBranch}
          onClose={handleCloseEditModal}
          onSave={handleSaveBranch}
        />
      )}
    </div>
  );
};

export default BranchList;