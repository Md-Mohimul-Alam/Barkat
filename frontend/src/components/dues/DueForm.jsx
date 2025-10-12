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
  const { id } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [formData, setFormData] = useState({
    clientId: '',
    description: '',
    amount: '',
    dueDate: '',
  });

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
    navigate('/app/dues');
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#ffffff]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar
          onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <div className="flex justify-center items-start px-4 py-10 overflow-auto">
          <div className={`w-full max-w-lg shadow-lg rounded-xl p-8 transition-all duration-300
            ${isDark ? 'bg-sky-950 border border-[#457B9D]' : 'bg-white border border-gray-200'}`}>
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
                  className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200
                    ${isDark
                      ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924]'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924]'}`}
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
                  className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200
                    ${isDark
                      ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924]'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924]'}`}
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
                  className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200
                    ${isDark
                      ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924]'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924]'}`}
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
                  className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200
                    ${isDark
                      ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924]'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924]'}`}
                />
              </div>

              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200
                    ${isDark
                      ? 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-lg'
                      : 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-md'}`}
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