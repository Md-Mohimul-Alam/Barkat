import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import branchService from '../../services/branchService';
import employeeService from '../../services/employeeService';
import { notifySuccess, notifyError } from '../../pages/UI/Toast';
import { 
  FaExclamationTriangle, 
  FaUser, 
  FaPhone, 
  FaMapMarker, 
  FaCalendar, 
  FaBuilding, 
  FaMoneyBillWave, 
  FaSave, 
  FaTimes, 
  FaSpinner, 
  FaIdCard,
  FaHeart,
  FaVenusMars
} from 'react-icons/fa';
import SidebarWrapper from '../shared/Sidebar';
import TopBar from '../shared/TopBar';
import Footer from '../shared/Footer';

const EmployeeForm = ({ isEdit = false, employeeData = null, onClose = null, onSave = null }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Field configurations
  const personalFields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter full name', required: true, icon: FaUser },
    { name: 'position', label: 'Position', type: 'text', placeholder: 'Enter position', required: true },
    { name: 'nid', label: 'NID Number', type: 'text', placeholder: 'Enter NID number', required: true, icon: FaIdCard },
    { name: 'dob', label: 'Date of Birth', type: 'date', required: true, icon: FaCalendar }
  ];

  const contactFields = [
    { name: 'contact', label: 'Contact Number', type: 'tel', placeholder: 'e.g., 01712345678', required: true, icon: FaPhone },
    { name: 'whatsapp', label: 'WhatsApp Number', type: 'tel', placeholder: 'e.g., 01712345678' },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter email address', required: true }
  ];

  const dateFields = [
    { name: 'dob', label: 'Date of Birth', type: 'date', required: true, icon: FaCalendar },
    { name: 'joinedAt', label: 'Join Date', type: 'date', required: true, icon: FaCalendar }
  ];

  // Options for dropdowns
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const maritalStatuses = ['single', 'married', 'divorced', 'widowed'];
  const employmentTypes = ['full-time', 'part-time', 'contract', 'internship'];

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    contact: '',
    whatsapp: '',
    email: '',
    nid: '',
    dob: '',
    address: '',
    joinedAt: '',
    branchId: '',
    salary: '',
    status: 'active',
    isManager: false,
    bloodGroup: '',
    maritalStatus: '',
    employmentType: 'full-time'
  });

  // Form Field Component
  const FormField = ({ field, value, onChange, error }) => {
    const FieldIcon = field.icon;
    
    return (
      <div className="flex flex-col">
        <label htmlFor={field.name} className="mb-2 font-medium flex items-center">
          {FieldIcon && <FieldIcon className="w-4 h-4 mr-2 text-gray-400" />}
          {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          id={field.name}
          name={field.name}
          type={field.type}
          placeholder={field.placeholder}
          value={value}
          onChange={onChange}
          required={field.required}
          disabled={submitting}
          className={`rounded-xl border-2 px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          } ${
            isDark
              ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
          }`}
        />
        {error && (
          <p className="text-red-500 text-xs mt-2 flex items-center">
            <FaExclamationTriangle className="w-3 h-3 mr-1" />
            {error}
          </p>
        )}
      </div>
    );
  };

  // Fetch branches and populate form if editing
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const response = await branchService.getBranches();
        const branchesData = response.data || response || [];
        setBranches(branchesData);
        
        console.log('🔄 EmployeeForm: Populating form data');
        console.log('📝 Employee data received:', employeeData);
        
        // If editing, populate form with employee data
        if (isEdit && employeeData) {
          setFormData({
            name: employeeData.name || '',
            position: employeeData.position || '',
            contact: employeeData.contact || '',
            whatsapp: employeeData.whatsapp || '',
            email: employeeData.email || '',
            nid: employeeData.nid || '',
            dob: employeeData.dob ? employeeData.dob.split('T')[0] : '',
            address: employeeData.address || '',
            joinedAt: employeeData.joinedAt ? employeeData.joinedAt.split('T')[0] : '',
            branchId: employeeData.branchId || '',
            salary: employeeData.salary || '',
            status: employeeData.status || 'active',
            isManager: employeeData.isManager || false,
            bloodGroup: employeeData.bloodGroup || '',
            maritalStatus: employeeData.maritalStatus || '',
            employmentType: employeeData.employmentType || 'full-time'
          });
          console.log('✅ Form data populated:', formData);
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error);
        setErrors({ fetch: 'Failed to load branches' });
        notifyError('Failed to load branches');
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [isEdit, employeeData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'Employee name is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.nid.trim()) newErrors.nid = 'NID number is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.joinedAt) newErrors.joinedAt = 'Join date is required';
    if (!formData.branchId) newErrors.branchId = 'Branch selection is required';
    if (!formData.salary || formData.salary <= 0) newErrors.salary = 'Valid salary is required';

    // Contact validation
    const contactRegex = /^[0-9]{10,15}$/;
    if (formData.contact && !contactRegex.test(formData.contact)) {
      newErrors.contact = 'Contact must be 10-15 digits';
    }

    // WhatsApp validation (if provided)
    if (formData.whatsapp && !contactRegex.test(formData.whatsapp)) {
      newErrors.whatsapp = 'WhatsApp must be 10-15 digits';
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // NID validation
    if (formData.nid && !/^[0-9]{10,17}$/.test(formData.nid)) {
      newErrors.nid = 'NID must be 10-17 digits';
    }

    // Date validation
    const today = new Date();
    const dob = new Date(formData.dob);
    const joinDate = new Date(formData.joinedAt);

    if (formData.dob && dob >= today) {
      newErrors.dob = 'Date of birth must be in the past';
    }

    if (formData.joinedAt && joinDate > today) {
      newErrors.joinedAt = 'Join date cannot be in the future';
    }

    if (formData.dob && formData.joinedAt && joinDate < dob) {
      newErrors.joinedAt = 'Join date cannot be before date of birth';
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
    console.log('💾 Saving employee data:', formData);
    
    if (isEdit && employeeData) {
      // Update existing employee
      const response = await employeeService.updateEmployee(employeeData.id, formData);
      console.log('✅ Employee update response:', response);
      
      notifySuccess('Employee updated successfully!');
      if (onSave) onSave(); // This should trigger the refresh in EmployeeList
      if (onClose) onClose();
    } else {
      // Create new employee
      await employeeService.createEmployee(formData);
      notifySuccess('Employee created successfully!');
      navigate('/app/employees');
    }
  } catch (error) {
    console.error('Failed to save employee:', error);
    const errorMessage = error.response?.data?.message || error.message || `Failed to ${isEdit ? 'update' : 'create'} employee`;
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
      navigate('/app/employees');
    }
  };

  // Modal form version
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
                <FaUser className={`w-6 h-6 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Employee</h2>
                <p className={`text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                  Update employee information
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
              {/* Name */}
              <div className="flex flex-col">
                <label htmlFor="name" className="mb-1 font-medium text-sm flex items-center">
                  <FaUser className="w-4 h-4 mr-2 text-gray-400" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                    errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  } ${
                    isDark
                      ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <FaExclamationTriangle className="w-3 h-3 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Position */}
              <div className="flex flex-col">
                <label htmlFor="position" className="mb-1 font-medium text-sm">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  id="position"
                  name="position"
                  type="text"
                  placeholder="Enter position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                    errors.position ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  } ${
                    isDark
                      ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                  }`}
                />
                {errors.position && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <FaExclamationTriangle className="w-3 h-3 mr-1" />
                    {errors.position}
                  </p>
                )}
              </div>

              {/* Contact */}
              <div className="flex flex-col">
                <label htmlFor="contact" className="mb-1 font-medium text-sm flex items-center">
                  <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                  Contact <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact"
                  name="contact"
                  type="tel"
                  placeholder="e.g., 01712345678"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                    errors.contact ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  } ${
                    isDark
                      ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                  }`}
                />
                {errors.contact && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <FaExclamationTriangle className="w-3 h-3 mr-1" />
                    {errors.contact}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label htmlFor="email" className="mb-1 font-medium text-sm">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  } ${
                    isDark
                      ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <FaExclamationTriangle className="w-3 h-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Salary */}
              <div className="flex flex-col">
                <label htmlFor="salary" className="mb-1 font-medium text-sm flex items-center">
                  <FaMoneyBillWave className="w-4 h-4 mr-2 text-gray-400" />
                  Salary <span className="text-red-500">*</span>
                </label>
                <input
                  id="salary"
                  name="salary"
                  type="number"
                  placeholder="Enter salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                    errors.salary ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  } ${
                    isDark
                      ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                  }`}
                />
                {errors.salary && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <FaExclamationTriangle className="w-3 h-3 mr-1" />
                    {errors.salary}
                  </p>
                )}
              </div>

              {/* Branch */}
              <div className="flex flex-col">
                <label htmlFor="branchId" className="mb-1 font-medium text-sm flex items-center">
                  <FaBuilding className="w-4 h-4 mr-2 text-gray-400" />
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  id="branchId"
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  required
                  disabled={loading || submitting}
                  className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                    errors.branchId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  } ${
                    isDark
                      ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      : 'bg-white border-gray-300 text-gray-800 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                  }`}
                >
                  <option value="">Select a branch</option>
                  {loading ? (
                    <option value="" disabled>Loading branches...</option>
                  ) : (
                    branches.map((branch) => (
                      <option key={branch.id || branch._id} value={branch.id || branch._id}>
                        {branch.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.branchId && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <FaExclamationTriangle className="w-3 h-3 mr-1" />
                    {errors.branchId}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label htmlFor="status" className="mb-1 font-medium text-sm">
                  Status
                </label>
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
                  <option value="on-leave">On Leave</option>
                </select>
              </div>

              {/* Is Manager */}
              <div className="flex items-center">
                <input
                  id="isManager"
                  name="isManager"
                  type="checkbox"
                  checked={formData.isManager}
                  onChange={handleChange}
                  disabled={submitting}
                  className={`w-4 h-4 rounded focus:ring-2 focus:ring-[#f85924] ${
                    isDark 
                      ? 'bg-cyan-700 border-cyan-600 text-[#f85924]' 
                      : 'border-gray-300 text-[#f85924]'
                  }`}
                />
                <label htmlFor="isManager" className="ml-2 text-sm font-medium">
                  This employee is a manager
                </label>
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col">
              <label htmlFor="address" className="mb-1 font-medium text-sm flex items-center">
                <FaMapMarker className="w-4 h-4 mr-2 text-gray-400" />
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                rows="3"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={submitting}
                className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 resize-vertical w-full ${
                  errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                } ${
                  isDark
                    ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                }`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <FaExclamationTriangle className="w-3 h-3 mr-1" />
                  {errors.address}
                </p>
              )}
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

  // Full page form (for add employee)
  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#ffffff]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl mr-4 ${
                  isDark ? 'bg-cyan-800' : 'bg-orange-100'
                }`}>
                  <FaUser className={`w-8 h-8 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h1>
                  <p className={`mt-2 ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                    {isEdit ? 'Update employee information' : 'Register a new employee in the system'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/app/employees')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
                  isDark
                    ? 'bg-cyan-800 hover:bg-cyan-700 text-cyan-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <FaTimes className="w-4 h-4 mr-2" />
                Back to Employees
              </button>
            </div>

            {/* Error Display */}
            {errors.fetch && (
              <div className={`mb-6 p-4 rounded-xl border ${
                isDark 
                  ? 'bg-red-900/20 border-red-700 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-5 h-5 mr-2" />
                  {errors.fetch}
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
                  <FaExclamationTriangle className="w-5 h-5 mr-2" />
                  {errors.submit}
                </div>
              </div>
            )}

            <div className={`rounded-2xl p-8 shadow-xl ${
              isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 border border-cyan-700' : 'bg-white border border-gray-200'
            }`}>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <FaUser className="w-5 h-5 mr-3 text-[#f85924]" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {personalFields.map((field) => (
                      <FormField
                        key={field.name}
                        field={field}
                        value={formData[field.name]}
                        onChange={handleChange}
                        error={errors[field.name]}
                        submitting={submitting}
                        isDark={isDark}
                      />
                    ))}
                    
                    {/* Additional Personal Info */}
                    <div className="flex flex-col">
                      <label htmlFor="bloodGroup" className="mb-2 font-medium flex items-center">
                        <FaHeart className="w-4 h-4 mr-2 text-gray-400" />
                        Blood Group
                      </label>
                      <select
                        id="bloodGroup"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        disabled={submitting}
                        className={`rounded-xl border-2 px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                          isDark
                            ? 'bg-cyan-800 border-cyan-600 text-white focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        }`}
                      >
                        <option value="">Select Blood Group</option>
                        {bloodGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor="maritalStatus" className="mb-2 font-medium flex items-center">
                        <FaVenusMars className="w-4 h-4 mr-2 text-gray-400" />
                        Marital Status
                      </label>
                      <select
                        id="maritalStatus"
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleChange}
                        disabled={submitting}
                        className={`rounded-xl border-2 px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                          isDark
                            ? 'bg-cyan-800 border-cyan-600 text-white focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        }`}
                      >
                        <option value="">Select Marital Status</option>
                        {maritalStatuses.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <FaPhone className="w-5 h-5 mr-3 text-[#f85924]" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contactFields.map((field) => (
                      <FormField
                        key={field.name}
                        field={field}
                        value={formData[field.name]}
                        onChange={handleChange}
                        error={errors[field.name]}
                        submitting={submitting}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <FaMapMarker className="w-5 h-5 mr-3 text-[#f85924]" />
                    Address
                  </h3>
                  <div className="flex flex-col">
                    <label htmlFor="address" className="mb-2 font-medium flex items-center">
                      <FaMapMarker className="w-4 h-4 mr-2 text-gray-400" />
                      Full Address <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows="4"
                      placeholder="Enter complete address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      className={`rounded-xl border-2 px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 resize-vertical ${
                        errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      } ${
                        isDark
                          ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-2 flex items-center">
                        <FaExclamationTriangle className="w-3 h-3 mr-1" />
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date Information Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <FaCalendar className="w-5 h-5 mr-3 text-[#f85924]" />
                    Date Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dateFields.map((field) => (
                      <FormField
                        key={field.name}
                        field={field}
                        value={formData[field.name]}
                        onChange={handleChange}
                        error={errors[field.name]}
                        submitting={submitting}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                </div>

                {/* Employment Information Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <FaBuilding className="w-5 h-5 mr-3 text-[#f85924]" />
                    Employment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Branch Dropdown */}
                    <div className="flex flex-col">
                      <label htmlFor="branchId" className="mb-2 font-medium flex items-center">
                        <FaBuilding className="w-4 h-4 mr-2 text-gray-400" />
                        Branch <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        id="branchId"
                        name="branchId"
                        value={formData.branchId}
                        onChange={handleChange}
                        required
                        disabled={loading || submitting}
                        className={`rounded-xl border-2 px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                          errors.branchId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        } ${
                          isDark
                            ? 'bg-cyan-800 border-cyan-600 text-white focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        }`}
                      >
                        <option value="">Select a branch</option>
                        {loading ? (
                          <option value="" disabled>Loading branches...</option>
                        ) : (
                          branches.map((branch) => (
                            <option key={branch.id || branch._id} value={branch.id || branch._id}>
                              {branch.name}
                            </option>
                          ))
                        )}
                      </select>
                      {errors.branchId && (
                        <p className="text-red-500 text-xs mt-2 flex items-center">
                          <FaExclamationTriangle className="w-3 h-3 mr-1" />
                          {errors.branchId}
                        </p>
                      )}
                    </div>

                    {/* Salary */}
                    <div className="flex flex-col">
                      <label htmlFor="salary" className="mb-2 font-medium flex items-center">
                        <FaMoneyBillWave className="w-4 h-4 mr-2 text-gray-400" />
                        Salary <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        id="salary"
                        name="salary"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter salary"
                        value={formData.salary}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        className={`rounded-xl border-2 px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                          errors.salary ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        } ${
                          isDark
                            ? 'bg-cyan-800 border-cyan-600 text-white placeholder-cyan-400 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        }`}
                      />
                      {errors.salary && (
                        <p className="text-red-500 text-xs mt-2 flex items-center">
                          <FaExclamationTriangle className="w-3 h-3 mr-1" />
                          {errors.salary}
                        </p>
                      )}
                    </div>

                    {/* Employment Type */}
                    <div className="flex flex-col">
                      <label htmlFor="employmentType" className="mb-2 font-medium">
                        Employment Type
                      </label>
                      <select
                        id="employmentType"
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleChange}
                        disabled={submitting}
                        className={`rounded-xl border-2 px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                          isDark
                            ? 'bg-cyan-800 border-cyan-600 text-white focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        }`}
                      >
                        {employmentTypes.map(type => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex flex-col">
                      <label htmlFor="status" className="mb-2 font-medium">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        disabled={submitting}
                        className={`rounded-xl border-2 px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                          isDark
                            ? 'bg-cyan-800 border-cyan-600 text-white focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on-leave">On Leave</option>
                      </select>
                    </div>

                    {/* Is Manager Checkbox */}
                    <div className="flex items-center mt-6 col-span-full">
                      <input
                        id="isManager"
                        name="isManager"
                        type="checkbox"
                        checked={formData.isManager}
                        onChange={handleChange}
                        disabled={submitting}
                        className={`w-5 h-5 rounded focus:ring-2 focus:ring-[#f85924] ${
                          isDark 
                            ? 'bg-cyan-700 border-cyan-600 text-[#f85924]' 
                            : 'border-gray-300 text-[#f85924]'
                        }`}
                      />
                      <label htmlFor="isManager" className="ml-3 text-lg font-medium">
                        This employee is a manager
                      </label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className={`px-8 py-3 rounded-xl font-medium text-lg transition-all duration-200 ${
                      isDark
                        ? 'bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50'
                    }`}
                  >
                    <FaTimes className="w-5 h-5 mr-2 inline" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-[#f85924] to-[#e84a1a] text-white rounded-xl font-medium text-lg transition-all duration-200 hover:from-[#e84a1a] hover:to-[#d13602] shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin w-5 h-5 mr-2" />
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <FaSave className="w-5 h-5 mr-2" />
                        {isEdit ? 'Update Employee' : 'Create Employee'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default EmployeeForm;