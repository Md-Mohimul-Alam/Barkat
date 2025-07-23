import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';

const initialDues = [
  { id: 1, clientId: 1, amount: 5000, dueDate: '2024-08-01', description: 'Invoice #1001' },
  { id: 2, clientId: 2, amount: 12000, dueDate: '2024-08-10', description: 'Invoice #1002' },
  { id: 3, clientId: 1, amount: 7500, dueDate: '2024-08-15', description: 'Invoice #1003' },
  { id: 4, clientId: 3, amount: 3000, dueDate: '2024-08-20', description: 'Invoice #1004' },
];

const DueForm = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { id } = useParams(); // due id if editing
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // State for form data
  const [formData, setFormData] = useState({
    clientId: '',
    description: '',
    amount: '',
    dueDate: '',
  });

  // Load due data if editing
  useEffect(() => {
    if (id) {
      const dueToEdit = initialDues.find(d => d.id.toString() === id);
      if (dueToEdit) {
        setFormData({
          clientId: dueToEdit.clientId,
          description: dueToEdit.description,
          amount: dueToEdit.amount,
          dueDate: dueToEdit.dueDate,
        });
      }
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Due form submitted:', formData);
    // TODO: Implement actual save logic here (API call or state update)

    // After save, redirect to dues list (optionally with clientId filter)
    navigate('/app/dues');
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-mbts-blue text-white' : 'bg-gray-100 text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar
          onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <div className="flex justify-center items-start px-4 py-10 overflow-auto">
          <div className={`w-full max-w-lg shadow-lg rounded-xl p-8 transition-all duration-300
            ${isDark ? 'bg-[#1c2a3a] border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {id ? 'Edit Due' : 'Add New Due'}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
              <div className="flex flex-col">
                <label htmlFor="clientId" className="mb-1 font-medium">Client ID</label>
                <input
                  id="clientId"
                  name="clientId"
                  type="number"
                  min="1"
                  placeholder="Enter client ID"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                  className={`rounded border px-4 py-2 text-sm outline-none focus:ring-2 transition
                    ${isDark
                      ? 'bg-mbts-dark border-gray-600 text-white placeholder-gray-400 focus:ring-mbts-orange'
                      : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-400'}`}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="description" className="mb-1 font-medium">Description</label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="e.g. Invoice #1234"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className={`rounded border px-4 py-2 text-sm outline-none focus:ring-2 transition
                    ${isDark
                      ? 'bg-mbts-dark border-gray-600 text-white placeholder-gray-400 focus:ring-mbts-orange'
                      : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-400'}`}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="amount" className="mb-1 font-medium">Amount</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount in ৳"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className={`rounded border px-4 py-2 text-sm outline-none focus:ring-2 transition
                    ${isDark
                      ? 'bg-mbts-dark border-gray-600 text-white placeholder-gray-400 focus:ring-mbts-orange'
                      : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-400'}`}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="dueDate" className="mb-1 font-medium">Due Date</label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className={`rounded border px-4 py-2 text-sm outline-none focus:ring-2 transition
                    ${isDark
                      ? 'bg-mbts-dark border-gray-600 text-white placeholder-gray-400 focus:ring-mbts-orange'
                      : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-400'}`}
                />
              </div>

              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className={`px-8 py-2 rounded font-medium text-sm transition-all duration-200
                    ${isDark
                      ? 'bg-mbts-orange text-white hover:bg-mbts-orangeHover'
                      : 'bg-mbts-orange text-white hover:bg-mbts-orangeHover'}`}
                >
                  {id ? 'Update Due' : 'Save Due'}
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

export default DueForm;
