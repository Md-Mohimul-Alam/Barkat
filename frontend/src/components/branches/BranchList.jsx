import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaBuilding, FaUser, FaPhone, FaMapMarker, FaCalendar, FaSpinner, FaSearch, FaFilter } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getBranches, deleteBranch, updateBranch } from '../../services/branchService';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { notifyError, notifySuccess } from '../../pages/UI/Toast';

const BranchList = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [branches, setBranches] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleToggleSidebar = () => setSidebarCollapsed(prev => !prev);

  useEffect(() => {
    fetchBranches();
  }, [user.token]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await getBranches(user.token);
      setBranches(data);
    } catch (err) {
      console.error(err);
      notifyError('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBranch = (branch) => {
    setEditingBranch({...branch});
    setEditModalOpen(true);
  };

  const handleSaveBranch = async () => {
    if (!editingBranch) return;

    setSaveLoading(true);
    try {
      await updateBranch(editingBranch.id, editingBranch, user.token);
      setBranches(prev => prev.map(branch => 
        branch.id === editingBranch.id ? editingBranch : branch
      ));
      setEditModalOpen(false);
      setEditingBranch(null);
      notifySuccess('Branch updated successfully');
    } catch (err) {
      console.error(err);
      notifyError('Failed to update branch');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteBranch = async (branchId) => {
    if (!window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return;
    }

    setDeletingId(branchId);
    try {
      await deleteBranch(branchId, user.token);
      setBranches(prev => prev.filter(branch => branch.id !== branchId));
      notifySuccess('Branch deleted successfully');
    } catch (err) {
      console.error(err);
      notifyError('Failed to delete branch');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingBranch(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedBranches = branches
    .filter(branch => 
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
              <FaBuilding className={`w-8 h-8 mr-3 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} />
              <div>
                <h1 className="text-2xl font-bold">Branch List</h1>
                <p className={`text-sm ${isDark ? 'text-cyan-200' : 'text-gray-600'}`}>
                  Manage your organization branches ({branches.length} total)
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
              <button
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
                          ? `hover:bg-cyan-800 ${index !== branches.length - 1 ? 'border-b border-cyan-700' : ''}` 
                          : `hover:bg-gray-50 ${index !== branches.length - 1 ? 'border-b border-gray-200' : ''}`
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-semibold">{branch.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaUser className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                          {branch.manager}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaPhone className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                          {branch.contact}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaMapMarker className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                          <span className="max-w-xs truncate">{branch.address}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaCalendar className={`w-3 h-3 mr-2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                          {branch.establishedAt?.split('T')[0]}
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
              Showing {filteredAndSortedBranches.length} of {branches.length} branches
              {searchTerm && ` for "${searchTerm}"`}
            </div>
          )}
        </div>
        <Footer />
      </div>

      {/* Edit Branch Modal - Keep the same modal as before */}
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
                <h2 className="text-xl font-bold">Edit Branch</h2>
                <p className={`text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                  Update branch information
                </p>
              </div>
            </div>
            {editingBranch && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FaBuilding className="w-4 h-4 mr-2 text-gray-400" />
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={editingBranch.name}
                    onChange={(e) => setEditingBranch({...editingBranch, name: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                      isDark 
                        ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter branch name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FaUser className="w-4 h-4 mr-2 text-gray-400" />
                    Manager
                  </label>
                  <input
                    type="text"
                    value={editingBranch.manager}
                    onChange={(e) => setEditingBranch({...editingBranch, manager: e.target.value})}
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
                    Contact
                  </label>
                  <input
                    type="text"
                    value={editingBranch.contact}
                    onChange={(e) => setEditingBranch({...editingBranch, contact: e.target.value})}
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
                    <FaMapMarker className="w-4 h-4 mr-2 text-gray-400" />
                    Address
                  </label>
                  <textarea
                    value={editingBranch.address}
                    onChange={(e) => setEditingBranch({...editingBranch, address: e.target.value})}
                    rows="3"
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-[#f85924] focus:border-transparent ${
                      isDark 
                        ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter branch address"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={handleCloseEditModal}
                disabled={saveLoading}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 ${
                  isDark 
                    ? 'border-cyan-600 text-cyan-300 hover:bg-cyan-800 disabled:opacity-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBranch}
                disabled={saveLoading}
                className="px-6 py-3 bg-gradient-to-r from-[#f85924] to-[#e84a1a] text-white rounded-xl font-semibold transition-all duration-200 hover:from-[#e84a1a] hover:to-[#d13602] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center"
              >
                {saveLoading ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaEdit className="w-4 h-4 mr-2" />
                    Save Changes
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

export default BranchList;