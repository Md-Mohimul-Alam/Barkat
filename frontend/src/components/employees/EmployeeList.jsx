import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import employeeService from '../../services/employeeService';
import branchService from '../../services/branchService';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { notifySuccess, notifyError } from '../../pages/UI/Toast';
import EmployeeForm from './EmployeeForm';
import { FaExclamationTriangle, FaSyncAlt, FaEdit, FaTrash, FaPlus, FaUser, FaPhone, FaMapMarker, FaCalendar, FaSpinner, FaSearch, FaEye, FaCrown, FaMoneyBillWave, FaTimes } from 'react-icons/fa';

const EmployeeList = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState({});
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [errors, setErrors] = useState({});

  // Debug state changes
  useEffect(() => {
    console.log('🔄 editModalOpen changed:', editModalOpen);
  }, [editModalOpen]);

  useEffect(() => {
    console.log('🔄 editingEmployee changed:', editingEmployee);
  }, [editingEmployee]);

  // Connection Status Component
  const ConnectionStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);

    if (!isOnline) {
      return (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          ⚠️ You are offline. Please check your internet connection.
        </div>
      );
    }

    return null;
  };

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setErrors({});
      console.log('🔧 Starting to fetch employees...');
      
      const response = await employeeService.getEmployees();
      console.log('✅ Employees data received:', response);
      
      const employeesData = response.data || response || [];
      console.log('📋 Extracted employees array:', employeesData);
      
      setEmployees(employeesData);
    } catch (error) {
      console.error('❌ Failed to fetch employees:', error);
      setErrors({ fetch: error.message || 'Failed to load employees' });
      
      if (error.message.includes('Cannot connect to server')) {
        notifyError('Backend server is not running. Please start the server on port 5050.');
      } else if (error.message.includes('session has expired')) {
        notifyError('Your session has expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        notifyError(error.message || 'Failed to load employees');
      }
      
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchBranches = useCallback(async () => {
    try {
      const response = await branchService.getBranches();
      const branchesData = response.data || response || [];
      const branchesMap = {};
      branchesData.forEach(branch => {
        branchesMap[branch.id || branch._id] = branch.name;
      });
      setBranches(branchesMap);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      setErrors(prev => ({ ...prev, branches: 'Failed to load branches' }));
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchBranches();
  }, [fetchEmployees, fetchBranches]);

  const handleAddEmployee = () => {
    navigate('/app/employees/add');
  };

  const handleEditEmployee = (employee) => {
    console.log('🎯 EDIT BUTTON CLICKED!', employee);
    console.log('📝 Employee data:', employee);
    
    setEditingEmployee(employee);
    setEditModalOpen(true);
    setErrors({});
  };

  const handleViewEmployee = (employee) => {
    setViewingEmployee(employee);
    setViewModalOpen(true);
  };

  const handleSaveEmployee = () => {
    console.log('💾 Employee saved, refreshing list...');
    setEditModalOpen(false);
    setEditingEmployee(null);
    fetchEmployees();
    notifySuccess('Employee updated successfully');
  };

  const handleCloseEditModal = () => {
    console.log('❌ Closing edit modal');
    setEditModalOpen(false);
    setEditingEmployee(null);
    setErrors({});
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    setDeletingId(employeeToDelete.id);
    setErrors({});
    
    try {
      await employeeService.deleteEmployee(employeeToDelete.id);
      setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
      notifySuccess('Employee deleted successfully');
    } catch (error) {
      console.error('Failed to delete employee:', error);
      setErrors({ delete: error.message });
      notifyError(error.message || 'Failed to delete employee');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setEmployeeToDelete(null);
    setErrors({});
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewingEmployee(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', text: 'Active', icon: '🟢' },
      inactive: { color: 'red', text: 'Inactive', icon: '🔴' },
      'on-leave': { color: 'yellow', text: 'On Leave', icon: '🟡' }
    };

    const config = statusConfig[status] || { color: 'gray', text: status, icon: '⚫' };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
        isDark 
          ? `bg-${config.color}-900 text-${config.color}-300` 
          : `bg-${config.color}-100 text-${config.color}-800`
      }`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredAndSortedEmployees = employees
    .filter(employee => {
      if (!employee) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        employee.name?.toLowerCase().includes(searchLower) ||
        employee.position?.toLowerCase().includes(searchLower) ||
        employee.contact?.toLowerCase().includes(searchLower) ||
        employee.email?.toLowerCase().includes(searchLower) ||
        employee.nid?.toLowerCase().includes(searchLower) ||
        employee.address?.toLowerCase().includes(searchLower) ||
        branches[employee.branchId]?.toLowerCase().includes(searchLower)
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return dateString.split('T')[0];
    } catch {
      return dateString;
    }
  };

  

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#ffffff]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="p-6 flex-1">
          {/* Connection Status */}
          <ConnectionStatus />

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
                onClick={fetchEmployees}
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
              <FaUser className={`w-8 h-8 mr-3 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} />
              <div>
                <h1 className="text-2xl font-bold">Employee List</h1>
                <p className={`text-sm ${isDark ? 'text-cyan-200' : 'text-gray-600'}`}>
                  Manage your organization employees ({employees.length} total)
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className={`relative flex-1 lg:flex-none lg:w-64 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search employees..."
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
                onClick={handleAddEmployee}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl ${
                  isDark
                    ? 'bg-[#f85924] hover:bg-[#d13602] text-white'
                    : 'bg-[#f85924] hover:bg-[#d13602] text-white'
                }`}
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add Employee
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`rounded-xl p-4 ${isDark ? 'bg-cyan-800' : 'bg-blue-50'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-cyan-700' : 'bg-blue-100'}`}>
                  <FaUser className={isDark ? 'text-cyan-300' : 'text-blue-600'} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>Total Employees</p>
                  <p className="text-xl font-bold">{employees.length}</p>
                </div>
              </div>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-green-800' : 'bg-green-50'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-green-700' : 'bg-green-100'}`}>
                  <FaUser className={isDark ? 'text-green-300' : 'text-green-600'} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-green-300' : 'text-gray-600'}`}>Active</p>
                  <p className="text-xl font-bold">{employees.filter(emp => emp.status === 'active').length}</p>
                </div>
              </div>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-yellow-800' : 'bg-yellow-50'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-yellow-700' : 'bg-yellow-100'}`}>
                  <FaUser className={isDark ? 'text-yellow-300' : 'text-yellow-600'} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-gray-600'}`}>On Leave</p>
                  <p className="text-xl font-bold">{employees.filter(emp => emp.status === 'on-leave').length}</p>
                </div>
              </div>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-purple-800' : 'bg-purple-50'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-purple-700' : 'bg-purple-100'}`}>
                  <FaCrown className={isDark ? 'text-purple-300' : 'text-purple-600'} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>Managers</p>
                  <p className="text-xl font-bold">{employees.filter(emp => emp.isManager).length}</p>
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
                        <FaUser className="w-4 h-4 mr-2" />
                        Name
                        <SortIcon columnKey="name" />
                      </div>
                    </th>
                    <th 
                      className="p-4 text-left font-semibold cursor-pointer hover:bg-opacity-50 transition-colors duration-200"
                      onClick={() => handleSort('position')}
                    >
                      <div className="flex items-center justify-center">
                        Position
                        <SortIcon columnKey="position" />
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold">
                      <div className="flex items-center">
                        <FaPhone className="w-4 h-4 mr-2" />
                        Contact
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold">NID</th>
                    <th className="p-4 text-left font-semibold">Age</th>
                    <th className="p-4 text-left font-semibold">Branch</th>
                    <th 
                      className="p-4 text-left font-semibold cursor-pointer hover:bg-opacity-50 transition-colors duration-200"
                      onClick={() => handleSort('salary')}
                    >
                      <div className="flex items-center">
                        <FaMoneyBillWave className="w-4 h-4 mr-2" />
                        Salary
                        <SortIcon columnKey="salary" />
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold">Status</th>
                    <th className="p-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center">
                        <div className="flex justify-center items-center">
                          <FaSpinner className="animate-spin w-8 h-8 text-[#f85924]" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredAndSortedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FaUser className={`w-16 h-16 mb-4 ${isDark ? 'text-cyan-600' : 'text-gray-400'}`} />
                          <p className={`text-lg font-medium ${isDark ? 'text-cyan-200' : 'text-gray-600'}`}>
                            {searchTerm ? 'No matching employees found' : 'No employees found'}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-cyan-400' : 'text-gray-500'}`}>
                            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first employee'}
                          </p>
                          {!searchTerm && (
                            <button
                              onClick={handleAddEmployee}
                              className={`mt-4 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                isDark
                                  ? 'bg-[#f85924] hover:bg-[#d13602] text-white'
                                  : 'bg-[#f85924] hover:bg-[#d13602] text-white'
                              }`}
                            >
                              <FaPlus className="w-4 h-4 mr-2 inline" />
                              Add Employee
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedEmployees.map((employee) => (
                      <tr 
                        key={employee.id} 
                        className={`border-b transition-colors duration-200 hover:bg-opacity-50 ${
                          isDark 
                            ? 'border-cyan-800 hover:bg-cyan-800' 
                            : 'border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              isDark ? 'bg-cyan-700' : 'bg-orange-100'
                            }`}>
                              <span className={`font-semibold ${
                                isDark ? 'text-cyan-200' : 'text-[#f85924]'
                              }`}>
                                {employee.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className={`text-xs ${isDark ? 'text-cyan-400' : 'text-gray-500'}`}>
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center">
                            <span className={`px-2 py-1 rounded-full text-sm font-medium flex items-center justify-center ${
                              isDark 
                                ? 'bg-cyan-700 text-cyan-200' 
                                : 'bg-orange-100 text-[#f85924]'
                            }`}>
                              {employee.position}
                            </span>
                            {employee.isManager && (
                              <FaCrown className="w-4 h-4 ml-2 text-yellow-500" title="Manager" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="font-mono text-sm">{employee.contact}</div>
                            {employee.whatsapp && (
                              <div className={`text-xs ${isDark ? 'text-cyan-400' : 'text-gray-500'}`}>
                                WhatsApp: {employee.whatsapp}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm">{employee.nid}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {calculateAge(employee.dob)} yrs
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isDark 
                              ? 'bg-purple-900 text-purple-200' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {branches[employee.branchId] || 'Unknown Branch'}
                          </span>
                        </td>
                        <td className="p-4 font-medium">
                          <div className="flex items-center">
                            <FaMoneyBillWave className="w-4 h-4 mr-2 text-green-500" />
                            {employee.salary?.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(employee.status)}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleViewEmployee(employee)}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                isDark 
                                  ? 'hover:bg-cyan-700 text-cyan-300' 
                                  : 'hover:bg-blue-100 text-blue-600'
                              }`}
                              title="View details"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                isDark 
                                  ? 'hover:bg-cyan-700 text-cyan-300' 
                                  : 'hover:bg-orange-100 text-[#f85924]'
                              }`}
                              title="Edit employee"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(employee)}
                              disabled={deletingId === employee.id}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                isDark 
                                  ? 'hover:bg-red-900 text-red-400' 
                                  : 'hover:bg-red-100 text-red-600'
                              } disabled:opacity-50`}
                              title="Delete employee"
                            >
                              {deletingId === employee.id ? (
                                <FaSpinner className="animate-spin w-4 h-4" />
                              ) : (
                                <FaTrash className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Info Footer */}
          {filteredAndSortedEmployees.length > 0 && (
            <div className={`mt-4 text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
              Showing {filteredAndSortedEmployees.length} of {employees.length} employees
              {searchTerm && ` for "${searchTerm}"`}
            </div>
          )}
        </div>
        <Footer />
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <EmployeeForm
          isEdit={true}
          employeeData={editingEmployee}
          onClose={handleCloseEditModal}
          onSave={handleSaveEmployee}
        />
      )}

      {/* View Details Modal */}
      {viewModalOpen && viewingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className={`rounded-2xl p-6 w-full max-w-2xl shadow-2xl ${
            isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 text-white border border-cyan-700' : 'bg-white text-gray-900 border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl mr-4 ${
                  isDark ? 'bg-cyan-800' : 'bg-orange-100'
                }`}>
                  <FaUser className={`w-6 h-6 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Employee Details</h2>
                  <p className={`text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                    Complete information about {viewingEmployee.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseViewModal}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDark ? 'hover:bg-cyan-800' : 'hover:bg-gray-100'
                }`}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Full Name</label>
                  <p className="font-semibold">{viewingEmployee.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Position</label>
                  <p>{viewingEmployee.position}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Email</label>
                  <p>{viewingEmployee.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">NID Number</label>
                  <p className="font-mono">{viewingEmployee.nid}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Date of Birth</label>
                  <p>{formatDate(viewingEmployee.dob)} (Age: {calculateAge(viewingEmployee.dob)} years)</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Contact Number</label>
                  <p>{viewingEmployee.contact}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">WhatsApp Number</label>
                  <p>{viewingEmployee.whatsapp || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Branch</label>
                  <p>{branches[viewingEmployee.branchId] || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Salary</label>
                  <p className="font-semibold">${viewingEmployee.salary?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Joined Date</label>
                  <p>{formatDate(viewingEmployee.joinedAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Status</label>
                  <div>{getStatusBadge(viewingEmployee.status)}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <label className="block text-sm font-medium mb-2 text-gray-500">Address</label>
              <p className="text-sm">{viewingEmployee.address}</p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseViewModal}
                className={`px-6 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isDark
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleCloseViewModal();
                  handleEditEmployee(viewingEmployee);
                }}
                className="px-6 py-2 bg-gradient-to-r from-[#f85924] to-[#e84a1a] text-white rounded-xl font-medium text-sm transition-all duration-200 hover:from-[#e84a1a] hover:to-[#d13602] shadow-lg hover:shadow-xl"
              >
                Edit Employee
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
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-lg mr-3 ${
                isDark ? 'bg-red-900' : 'bg-red-100'
              }`}>
                <FaExclamationTriangle className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Delete Employee</h3>
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
            
            <p className="mb-6">
              Are you sure you want to delete <strong>{employeeToDelete?.name}</strong>? This will permanently remove all their data.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseDeleteModal}
                disabled={deletingId}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isDark
                    ? 'bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {deletingId ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Employee'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;