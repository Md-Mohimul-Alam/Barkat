import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import branchService from '../../services/branchService'; // ✅ Change to default import
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { notifySuccess, notifyError } from '../../pages/UI/Toast';

const BranchForm = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(false); // ✅ Add loading state

  const [formData, setFormData] = useState({
    name: '',
    manager: '',
    contact: '',
    address: '',
    establishedAt: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ Start loading
    
    try {
      // ✅ Use default import pattern
      await branchService.createBranch(formData);
      notifySuccess('Branch created successfully!');
      navigate('/app/branches');
    } catch (err) {
      console.error(err);
      notifyError(err.message || 'Failed to create branch');
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#ffffff]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="flex justify-center items-start px-4 py-10 overflow-auto">
          <div className={`w-full max-w-3xl shadow-lg rounded-xl p-8 transition-all duration-300
            ${isDark ? 'bg-sky-950 border border-[#457B9D]' : 'bg-white border border-gray-200'}
          `}>
            <h2 className="text-2xl font-bold mb-6 text-center">Add New Branch</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'name', label: 'Branch Name', type: 'text' },
                { id: 'manager', label: 'Manager', type: 'text' },
                { id: 'contact', label: 'Contact', type: 'tel', placeholder: 'e.g., 01712345678', pattern: '[0-9]{10,15}' },
                { id: 'address', label: 'Address', type: 'text' },
                { id: 'establishedAt', label: 'Established At', type: 'date' },
              ].map(({ id, label, type, placeholder, pattern }) => (
                <div key={id} className="flex flex-col">
                  <label htmlFor={id} className="mb-1 font-medium">{label}</label>
                  <input
                    id={id}
                    name={id}
                    type={type}
                    placeholder={placeholder}
                    pattern={pattern}
                    value={formData[id]}
                    onChange={handleChange}
                    required
                    disabled={loading} // ✅ Disable inputs when loading
                    className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                      isDark
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                    }`}
                  />
                </div>
              ))}

              <div className="md:col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  disabled={loading} // ✅ Disable button when loading
                  className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${
                    isDark
                      ? 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-lg disabled:bg-orange-400 disabled:cursor-not-allowed'
                      : 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-md disabled:bg-orange-400 disabled:cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Save Branch'
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