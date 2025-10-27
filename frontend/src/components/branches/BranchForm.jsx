import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import branchService from '../../services/branchService';
import employeeService from '../../services/employeeService';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { notifySuccess, notifyError } from '../../pages/UI/Toast';
import { FaExclamationTriangle, FaBuilding, FaUser, FaPhone, FaMapMarker, FaCalendar, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';

const BranchForm = ({ isEdit = false, branchData = null, onClose = null }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    establishedAt: '',
    status: 'active',
    managerId: ''
  });

  // Function to fetch all employees with pagination
  const fetchAllEmployees = async () => {
    let allEmployees = [];
    let page = 1;
    let hasMore = true;

    try {
      while (hasMore) {
        console.log(`🔧 Fetching employees page ${page}...`);
        const response = await employeeService.getEmployees({ page, limit: 100 });
        console.log(`🔧 Employees API response for page ${page}:`, response);
        
        // Handle different response structures
        const responseData = response.data || response;
        let employeesData = [];
        let paginationInfo = null;

        if (Array.isArray(responseData)) {
          // If response is directly an array
          employeesData = responseData;
          hasMore = false; // Assume no pagination if array is returned directly
        } else if (responseData.data && Array.isArray(responseData.data)) {
          // If response has data array
          employeesData = responseData.data;
          paginationInfo = responseData.pagination || responseData.meta;
        } else if (responseData.employees && Array.isArray(responseData.employees)) {
          // If response has employees array
          employeesData = responseData.employees;
          paginationInfo = responseData.pagination || responseData.meta;
        }

        console.log(`🔧 Processed employees data for page ${page}:`, employeesData);

        // Add employees from this page
        allEmployees = [...allEmployees, ...employeesData];

        // Check if there are more pages
        if (paginationInfo) {
          hasMore = page < paginationInfo.totalPages;
          page++;
        } else {
          // If no pagination info, assume this is all data
          hasMore = false;
        }

        // Safety limit to prevent infinite loops
        if (page > 50) {
          console.warn('⚠️ Safety limit reached - stopping pagination');
          hasMore = false;
        }
      }

      console.log('🔧 All employees fetched:', allEmployees);
      return allEmployees;
    } catch (error) {
      console.error('❌ Error fetching employees:', error);
      throw error;
    }
  };

  // Fetch employees for manager selection
  useEffect(() => {
    const fetchEmployees = async () => {
      setEmployeesLoading(true);
      try {
        console.log('🔧 Fetching all employees for manager selection...');
        
        // Fetch all employees with pagination
        const allEmployees = await fetchAllEmployees();
        
        // Filter active employees who can be managers
        const potentialManagers = allEmployees.filter(emp => 
          emp && 
          emp.status === 'active' && 
          (emp.isManager || 
           ['manager', 'branch manager', 'general manager', 'senior manager', 'supervisor', 'head', 'director','employee']
           .some(title => emp.position?.toLowerCase().includes(title)))
        );
        
        console.log('🔧 Potential managers:', potentialManagers);
        setEmployees(potentialManagers);
        
        // If editing, populate form with branch data
        if (isEdit && branchData) {
          console.log('🔧 Populating form with branch data:', branchData);
          setFormData({
            name: branchData.name || '',
            contact: branchData.contact || '',
            address: branchData.address || '',
            establishedAt: branchData.establishedAt ? branchData.establishedAt.split('T')[0] : '',
            status: branchData.status || 'active',
            managerId: branchData.managerId || ''
          });
        }
      } catch (error) {
        console.error('❌ Failed to fetch employees:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load employees for manager selection';
        setErrors(prev => ({ ...prev, employees: errorMessage }));
        notifyError(errorMessage);
        
        // If editing, still populate the form even if employees fail to load
        if (isEdit && branchData) {
          setFormData({
            name: branchData.name || '',
            contact: branchData.contact || '',
            address: branchData.address || '',
            establishedAt: branchData.establishedAt ? branchData.establishedAt.split('T')[0] : '',
            status: branchData.status || 'active',
            managerId: branchData.managerId || ''
          });
        }
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchEmployees();
  }, [isEdit, branchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'Branch name is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.establishedAt) newErrors.establishedAt = 'Establishment date is required';

    // Contact validation
    const contactRegex = /^[0-9]{10,15}$/;
    if (formData.contact && !contactRegex.test(formData.contact)) {
      newErrors.contact = 'Contact must be 10-15 digits';
    }

    // Date validation
    const today = new Date();
    const establishedDate = new Date(formData.establishedAt);

    if (formData.establishedAt && establishedDate > today) {
      newErrors.establishedAt = 'Establishment date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notifyError('Please fix the form errors');
      return;
    }

    setSubmitting(true);
    setErrors({});
    
    try {
      console.log('💾 Saving branch data:', formData);
      
      if (isEdit && branchData) {
        // Update existing branch
        await branchService.updateBranch(branchData.id, formData);
        notifySuccess('Branch updated successfully!');
        if (onClose) onClose();
      } else {
        // Create new branch
        await branchService.createBranch(formData);
        notifySuccess('Branch created successfully!');
        navigate('/app/branches');
      }
    } catch (error) {
      console.error('❌ Failed to save branch:', error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${isEdit ? 'update' : 'create'} branch`;
      setErrors({ submit: errorMessage });
      notifyError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/app/branches');
    }
  };

  // Field component with error handling
  const FormField = ({ label, name, type = 'text', placeholder, required = false, value, onChange, error, children }) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-1 font-medium text-sm flex items-center">
        {name === 'name' && <FaBuilding className="w-4 h-4 mr-2 text-gray-400" />}
        {name === 'contact' && <FaPhone className="w-4 h-4 mr-2 text-gray-400" />}
        {name === 'address' && <FaMapMarker className="w-4 h-4 mr-2 text-gray-400" />}
        {name === 'establishedAt' && <FaCalendar className="w-4 h-4 mr-2 text-gray-400" />}
        {name === 'managerId' && <FaUser className="w-4 h-4 mr-2 text-gray-400" />}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children || (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={submitting}
          className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          } ${
            isDark
              ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
              : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
          }`}
        />
      )}
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center">
          <FaExclamationTriangle className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );

  // If this is a modal form, render without layout
  if (isEdit && onClose) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className={`rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 text-white border border-cyan-700' : 'bg-white text-gray-900 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-xl mr-4 ${
                isDark ? 'bg-cyan-800' : 'bg-orange-100'
              }`}>
                <FaBuilding className={`w-6 h-6 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Branch</h2>
                <p className={`text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                  Update branch information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDark ? 'hover:bg-cyan-800' : 'hover:bg-gray-100'
              }`}
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Error Display */}
          {errors.employees && (
            <div className={`mb-6 p-4 rounded-xl border ${
              isDark 
                ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}>
              <div className="flex items-center">
                <FaExclamationTriangle className="w-4 h-4 mr-2" />
                {errors.employees} - You can still save the branch without manager assignment.
              </div>
            </div>
          )}

          {errors.submit && (
            <div className={`mb-6 p-4 rounded-xl border ${
              isDark 
                ? 'bg-red-900/20 border-red-700 text-red-300' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                <FaExclamationTriangle className="w-4 h-4 mr-2" />
                {errors.submit}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Branch Name */}
              <FormField
                label="Branch Name"
                name="name"
                type="text"
                placeholder="Enter branch name"
                required={true}
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
              />

              {/* Contact */}
              <FormField
                label="Contact Number"
                name="contact"
                type="tel"
                placeholder="e.g., 01712345678"
                required={true}
                value={formData.contact}
                onChange={handleChange}
                error={errors.contact}
              />

              {/* Establishment Date */}
              <FormField
                label="Established At"
                name="establishedAt"
                type="date"
                required={true}
                value={formData.establishedAt}
                onChange={handleChange}
                error={errors.establishedAt}
              />

              {/* Status */}
              <FormField
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                error={errors.status}
              >
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={submitting}
                  className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                    isDark
                      ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      : 'bg-white border-gray-300 text-gray-800 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FormField>

              {/* Manager Selection */}
              <div className="md:col-span-2">
                <FormField
                  label="Branch Manager"
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                  error={errors.managerId}
                >
                  <select
                    id="managerId"
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleChange}
                    disabled={employeesLoading || submitting}
                    className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                      isDark
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        : 'bg-white border-gray-300 text-gray-800 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                    }`}
                  >
                    <option value="">Select a manager (optional)</option>
                    {employeesLoading ? (
                      <option value="" disabled>Loading managers... ({employees.length} loaded)</option>
                    ) : employees.length > 0 ? (
                      employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} - {employee.position}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No managers available</option>
                    )}
                  </select>
                </FormField>
                <p className="text-xs text-gray-500 mt-1">
                  {employeesLoading 
                    ? 'Loading employees...' 
                    : `${employees.length} potential managers found`}
                </p>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <FormField
                  label="Address"
                  name="address"
                  required={true}
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                >
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    placeholder="Enter complete branch address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 resize-vertical w-full ${
                      isDark
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                    }`}
                  />
                </FormField>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className={`px-6 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isDark
                    ? 'bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50'
                }`}
              >
                <FaTimes className="w-4 h-4 mr-2 inline" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-[#f85924] to-[#e84a1a] text-white rounded-xl font-medium text-sm transition-all duration-200 hover:from-[#e84a1a] hover:to-[#d13602] shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Full page form
  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#ffffff]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="flex justify-center items-start px-4 py-10 overflow-auto">
          <div className={`w-full max-w-3xl shadow-lg rounded-xl p-8 transition-all duration-300
            ${isDark ? 'bg-sky-950 border border-[#457B9D]' : 'bg-white border border-gray-200'}
          `}>
            {/* Error Display */}
            {errors.employees && (
              <div className={`mb-6 p-4 rounded-xl border ${
                isDark 
                  ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' 
                  : 'bg-yellow-50 border-yellow-200 text-yellow-700'
              }`}>
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-4 h-4 mr-2" />
                  {errors.employees} - You can still save the branch without manager assignment.
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{isEdit ? 'Edit Branch' : 'Add New Branch'}</h2>
              <button
                onClick={() => navigate('/app/branches')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${isDark
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
              >
                ← Back to Branches
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Branch Name */}
                <FormField
                  label="Branch Name"
                  name="name"
                  type="text"
                  placeholder="Enter branch name"
                  required={true}
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />

                {/* Contact */}
                <FormField
                  label="Contact Number"
                  name="contact"
                  type="tel"
                  placeholder="e.g., 01712345678"
                  required={true}
                  value={formData.contact}
                  onChange={handleChange}
                  error={errors.contact}
                />

                {/* Establishment Date */}
                <FormField
                  label="Established At"
                  name="establishedAt"
                  type="date"
                  required={true}
                  value={formData.establishedAt}
                  onChange={handleChange}
                  error={errors.establishedAt}
                />

                {/* Status */}
                <FormField
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  error={errors.status}
                >
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={submitting}
                    className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                      isDark
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        : 'bg-white border-gray-300 text-gray-800 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </FormField>

                {/* Manager Selection */}
                <div className="md:col-span-2">
                  <FormField
                    label="Branch Manager"
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleChange}
                    error={errors.managerId}
                  >
                    <select
                      id="managerId"
                      name="managerId"
                      value={formData.managerId}
                      onChange={handleChange}
                      disabled={employeesLoading || submitting}
                      className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                        isDark
                          ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                          : 'bg-white border-gray-300 text-gray-800 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      }`}
                    >
                      <option value="">Select a manager (optional)</option>
                      {employeesLoading ? (
                        <option value="" disabled>Loading managers... ({employees.length} loaded)</option>
                      ) : employees.length > 0 ? (
                        employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name} - {employee.position}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No managers available</option>
                      )}
                    </select>
                  </FormField>
                  <p className="text-xs text-gray-500 mt-1">
                    {employeesLoading 
                      ? 'Loading employees...' 
                      : `${employees.length} potential managers found`}
                  </p>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <FormField
                    label="Address"
                    name="address"
                    required={true}
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                  >
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      placeholder="Enter complete branch address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 resize-vertical w-full ${
                        isDark
                          ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                          : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      }`}
                    />
                  </FormField>
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200
                    ${isDark
                      ? 'bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2
                    ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isDark
                      ? 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-lg'
                      : 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-md'}`}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin w-4 h-4" />
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEdit ? 'Update Branch' : 'Create Branch'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default BranchForm;