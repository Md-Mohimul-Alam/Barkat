import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchEmployees();
    fetchBranches();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log('🔧 Starting to fetch employees...');
      
      const response = await employeeService.getEmployees();
      console.log('✅ Employees data received:', response);
      
      // Extract the data array from the response
      const employeesData = response.data || [];
      console.log('📋 Extracted employees array:', employeesData);
      
      setEmployees(employeesData);
    } catch (error) {
      console.error('❌ Failed to fetch employees:', error);
      
      // Show specific error messages based on error type
      if (error.message.includes('Cannot connect to server')) {
        notifyError('Backend server is not running. Please start the server on port 5050.');
      } else if (error.message.includes('session has expired')) {
        notifyError('Your session has expired. Please login again.');
        // Optional: Redirect to login after a delay
        setTimeout(() => navigate('/login'), 2000);
      } else {
        notifyError(error.message || 'Failed to load employees');
      }
      
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const branchesData = await branchService.getBranches();
      const branchesMap = {};
      branchesData.forEach(branch => {
        branchesMap[branch.id || branch._id] = branch.name;
      });
      setBranches(branchesMap);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const handleAddEmployee = () => {
    navigate('/app/employees/add');
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setEditModalOpen(true);
  };

  const handleViewEmployee = (employee) => {
    setViewingEmployee(employee);
    setViewModalOpen(true);
  };

  const handleSaveEmployee = () => {
    setEditModalOpen(false);
    setEditingEmployee(null);
    fetchEmployees(); // Refresh the list
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    setDeletingId(employeeToDelete.id);
    try {
      await employeeService.deleteEmployee(employeeToDelete.id);
      setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
      notifySuccess('Employee deleted successfully');
    } catch (error) {
      console.error('Failed to delete employee:', error);
      notifyError(error.message || 'Failed to delete employee');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setEmployeeToDelete(null);
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
      active: { color: 'green', text: 'Active' },
      inactive: { color: 'red', text: 'Inactive' },
      'on-leave': { color: 'yellow', text: 'On Leave' }
    };

    const config = statusConfig[status] || { color: 'gray', text: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
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

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div className="flex items-center">
              <svg className={`w-8 h-8 mr-3 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
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
                <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Employee
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
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Name
                        <SortIcon columnKey="name" />
                      </div>
                    </th>
                    <th 
                      className="p-4 text-left font-semibold cursor-pointer hover:bg-opacity-50 transition-colors duration-200"
                      onClick={() => handleSort('position')}
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                        Position
                        <SortIcon columnKey="position" />
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
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
                        <svg
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ff9500"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16.5 15.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                          <path d="M7 7a2 2 0 1 1 4 0v9a3 3 0 0 0 6 0v-.5" />
                          <path d="M8 11h6" />
                        </svg>
                        Salary
                        <SortIcon columnKey="salary" />
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold">Status</th>
                    <th className="p-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center">
                        <div className="flex justify-center items-center">
                          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                            isDark ? 'border-cyan-400' : 'border-[#f85924]'
                          }`}></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAndSortedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className={`w-16 h-16 mb-4 ${isDark ? 'text-cyan-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <p className={`text-lg font-medium ${isDark ? 'text-cyan-200' : 'text-gray-600'}`}>
                            No employees found
                          </p>
                          <p className={`text-sm ${isDark ? 'text-cyan-400' : 'text-gray-500'}`}>
                            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first employee'}
                          </p>
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
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isDark 
                              ? 'bg-cyan-700 text-cyan-200' 
                              : 'bg-orange-100 text-[#f85924]'
                          }`}>
                            {employee.position}
                          </span>
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
                            <svg
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#ff9500"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M16.5 15.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                              <path d="M7 7a2 2 0 1 1 4 0v9a3 3 0 0 0 6 0v-.5" />
                              <path d="M8 11h6" />
                            </svg>
                            {employee.salary?.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(employee.status)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewEmployee(employee)}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                isDark 
                                  ? 'hover:bg-cyan-700 text-cyan-300' 
                                  : 'hover:bg-blue-100 text-blue-600'
                              }`}
                              title="View details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
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
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
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
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
          onClose={handleSaveEmployee}
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
                  <svg className={`w-6 h-6 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="font-semibold">{viewingEmployee.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Position</label>
                  <p>{viewingEmployee.position}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p>{viewingEmployee.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">NID Number</label>
                  <p className="font-mono">{viewingEmployee.nid}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                  <p>{formatDate(viewingEmployee.dob)} (Age: {calculateAge(viewingEmployee.dob)} years)</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
                  <p>{viewingEmployee.contact}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">WhatsApp Number</label>
                  <p>{viewingEmployee.whatsapp || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Branch</label>
                  <p>{branches[viewingEmployee.branchId] || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Salary</label>
                  <p className="font-semibold">${viewingEmployee.salary?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Joined Date</label>
                  <p>{formatDate(viewingEmployee.joinedAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <div>{getStatusBadge(viewingEmployee.status)}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <label className="block text-sm font-medium text-gray-500 mb-2">Address</label>
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
                <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">Delete Employee</h3>
                <p className={`text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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