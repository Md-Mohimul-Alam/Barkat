import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';

// Mock bank accounts
const accounts = [
  { label: 'Account 1 - 1234567890', value: 'acc1' },
  { label: 'Account 2 - 9876543210', value: 'acc2' },
  { label: 'Account 3 - 1122334455', value: 'acc3' },
];

const BankTransactionForm = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [selectedAccount, setSelectedAccount] = useState('');
  const [formData, setFormData] = useState({
    date: '',
    transactionNumber: '',
    type: 'credit',
    description: '',
    amount: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAccount) return alert('Please select an account first!');
    console.log('Bank transaction submitted for', selectedAccount, formData);
    // API call can go here

    setFormData({
      date: '',
      transactionNumber: '',
      type: 'credit',
      description: '',
      amount: '',
    });
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-mbts-blue text-white' : 'bg-gray-100 text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="flex justify-center items-start px-4 py-10 overflow-auto w-full">
          <div
            className={`w-full max-w-3xl shadow-lg rounded-xl p-8 transition-all duration-300 ${
              isDark ? 'bg-[#1c2a3a] border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Manual Bank Transaction Entry</h2>

            {/* Account Dropdown */}
            <div className="mb-6">
              <label htmlFor="accountSelect" className="font-medium text-base mb-2 block">
                Select Account:
              </label>
              <select
                id="accountSelect"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className={`w-full px-4 py-2 rounded border text-sm focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-mbts-dark border-gray-600 text-white focus:ring-mbts-orange'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-400'
                }`}
              >
                <option value="">-- Select Account --</option>
                {accounts.map((acc) => (
                  <option key={acc.value} value={acc.value}>
                    {acc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Only show form if account selected */}
            {selectedAccount && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div className="flex flex-col">
                  <label htmlFor="date" className="mb-1 font-medium">Transaction Date</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className={`rounded border px-4 py-2 text-sm outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-mbts-dark border-gray-600 text-white focus:ring-mbts-orange'
                        : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-400'
                    }`}
                  />
                </div>

                {/* Transaction Number */}
                <div className="flex flex-col">
                  <label htmlFor="transactionNumber" className="mb-1 font-medium">Transaction Number</label>
                  <input
                    id="transactionNumber"
                    name="transactionNumber"
                    type="text"
                    value={formData.transactionNumber}
                    onChange={handleChange}
                    required
                    className={`rounded border px-4 py-2 text-sm outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-mbts-dark border-gray-600 text-white focus:ring-mbts-orange'
                        : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-400'
                    }`}
                  />
                </div>

                {/* Type */}
                <div className="flex flex-col">
                  <label htmlFor="type" className="mb-1 font-medium">Transaction Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`rounded border px-4 py-2 text-sm outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-mbts-dark border-gray-600 text-white focus:ring-mbts-orange'
                        : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-400'
                    }`}
                  >
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>

                {/* Description */}
                <div className="flex flex-col">
                  <label htmlFor="description" className="mb-1 font-medium">Description</label>
                  <input
                    id="description"
                    name="description"
                    type="text"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className={`rounded border px-4 py-2 text-sm outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-mbts-dark border-gray-600 text-white focus:ring-mbts-orange'
                        : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-400'
                    }`}
                  />
                </div>

                {/* Amount */}
                <div className="flex flex-col">
                  <label htmlFor="amount" className="mb-1 font-medium">Amount</label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    className={`rounded border px-4 py-2 text-sm outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-mbts-dark border-gray-600 text-white focus:ring-mbts-orange'
                        : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-400'
                    }`}
                  />
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2 flex justify-center mt-4">
                  <button
                    type="submit"
                    className={`px-8 py-2 rounded font-medium text-sm transition-all duration-200 ${
                      isDark
                        ? 'bg-mbts-orange text-white hover:bg-mbts-orangeHover'
                        : 'bg-mbts-orange text-white hover:bg-mbts-orangeHover'
                    }`}
                  >
                    Save Transaction
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default BankTransactionForm;
