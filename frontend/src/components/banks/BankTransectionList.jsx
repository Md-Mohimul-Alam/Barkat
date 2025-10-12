import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';

const bankOptions = [
  { id: 'bank1', name: 'City Bank', balance: 45000, branch: 'Main Branch', manager: 'Mr. John Doe', contact: '01710000000' },
  { id: 'bank2', name: 'DBBL', balance: 32500, branch: 'Uttara Branch', manager: 'Ms. Jahanara', contact: '01820000000' },
  { id: 'bank3', name: 'Sonali Bank', balance: 78000, branch: 'Kawran Bazar', manager: 'Mr. Hasan Ali', contact: '01930000000' },
];

const allTransactions = [
  { bankId: 'bank1', date: '2025-07-01', amount: 1000, type: 'Credit', description: 'Payment received' },
  { bankId: 'bank1', date: '2025-07-03', amount: 500, type: 'Debit', description: 'Office rent' },
  { bankId: 'bank2', date: '2025-07-02', amount: 700, type: 'Credit', description: 'Invoice #124' },
  { bankId: 'bank3', date: '2025-07-04', amount: 1200, type: 'Debit', description: 'Utility bill' },
];

const BankTransactionView = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleBankChange = (e) => {
    const bankId = e.target.value;
    setSelectedBankId(bankId);
    setSelectedBank(bankOptions.find(b => b.id === bankId) || null);
    setSearchTerm('');
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setEditModalOpen(true);
  };

  const handleSaveTransaction = () => {
    // Here you would typically make an API call to save the changes
    console.log('Saving transaction:', editingTransaction);
    setEditModalOpen(false);
    setEditingTransaction(null);
  };

  const filteredTransactions = allTransactions
    .filter(txn => txn.bankId === selectedBankId)
    .filter(txn =>
      txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.date.includes(searchTerm)
    );

  const totalCredit = filteredTransactions
    .filter(txn => txn.type === 'Credit')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalDebit = filteredTransactions
    .filter(txn => txn.type === 'Debit')
    .reduce((sum, txn) => sum + txn.amount, 0);

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#ffffff]' : 'bg-[#ffffff] text-gray-900'}`}>
      {/* Sidebar fixed width and height */}
      <div className="flex-shrink-0 h-screen overflow-hidden">
        <SidebarWrapper collapsed={sidebarCollapsed} />
      </div>

      {/* Main content area flex column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto px-4 py-10">
          {/* Bank Selector */}
          <div
            className={`max-w-3xl w-full mx-auto p-8 rounded-xl shadow-lg border mb-12 ${
              isDark ? 'bg-sky-950 border-[#457B9D]' : 'bg-white border-gray-300'
            }`}
          >
            <h1 className="text-3xl font-extrabold text-center mb-8">Bank Wise Transactions</h1>

            <label htmlFor="bankSelect" className="block mb-3 text-lg font-semibold">
              Select Bank
            </label>
            <select
              id="bankSelect"
              value={selectedBankId}
              onChange={handleBankChange}
              className={`w-full rounded-lg border px-5 py-3 text-base focus:outline-none focus:ring-2 transition-all duration-200 ${
                isDark
                  ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] focus:ring-[#f85924] focus:border-[#f85924]'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f85924] focus:border-[#f85924]'
              }`}
            >
              <option value="">-- Choose a bank --</option>
              {bankOptions.map(bank => (
                <option key={bank.id} value={bank.id}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bank Information */}
          {selectedBank && (
            <div
              className={`max-w-3xl w-full mx-auto p-7 rounded-xl shadow-md border mb-12 ${
                isDark ? 'bg-sky-950 border-[#457B9D]' : 'bg-white border-gray-300'
              }`}
            >
              <h2 className="text-2xl font-semibold mb-6 border-b pb-2 border-[#457B9D]">Bank Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center sm:text-left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#A8A8A8] mb-1">Bank Name</p>
                  <p className="text-lg font-semibold">{selectedBank.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#A8A8A8] mb-1">Branch</p>
                  <p className="text-lg font-semibold">{selectedBank.branch}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#A8A8A8] mb-1">Manager</p>
                  <p className="text-lg font-semibold">{selectedBank.manager}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#A8A8A8] mb-1">Contact</p>
                  <p className="text-lg font-semibold">{selectedBank.contact}</p>
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#A8A8A8] mb-1">Current Balance</p>
                  <p className="text-lg font-bold text-green-500">{selectedBank.balance} TK</p>
                </div>
              </div>
            </div>
          )}

          {/* Search & Transactions Table */}
          {selectedBankId && (
            <div
              className={`max-w-5xl w-full mx-auto p-7 mb-10 rounded-xl shadow-md border ${
                isDark ? 'bg-sky-950 border-[#457B9D]' : 'bg-white border-gray-300'
              }`}
            >
              <div className="mb-6 max-w-sm mx-auto sm:mx-0">
                <input
                  type="text"
                  placeholder="Search by date or description..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`w-full rounded-lg border px-5 py-3 text-base focus:outline-none focus:ring-2 transition-all duration-200 ${
                    isDark
                      ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924]'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924]'
                  }`}
                />
              </div>

              <div className="overflow-x-auto rounded-lg shadow-sm border border-[#457B9D]">
                <table className="min-w-full table-auto border-collapse text-sm">
                  <thead>
                    <tr className={`${isDark ? 'bg-[#2C2C2C]' : 'bg-gray-100'}`}>
                      {['Date', 'Type', 'Amount (TK)', 'Description', 'Actions'].map(heading => (
                        <th
                          key={heading}
                          className="px-6 py-3 text-center font-semibold tracking-wide border-b border-[#457B9D]"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-10 text-center italic text-[#A8A8A8]">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((txn, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-[#457B9D] ${
                            idx % 2 === 0 ? (isDark ? 'bg-sky-950' : 'bg-gray-50') : ''
                          } hover:bg-[#f85924]/20 transition-colors`}
                        >
                          <td className="px-6 py-4 text-center">{txn.date}</td>
                          <td className="px-6 py-4 text-center">{txn.type}</td>
                          <td className="px-6 py-4 text-center">{txn.amount}</td>
                          <td className="px-6 py-4 text-center">{txn.description}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleEditTransaction(txn)}
                              className={`text-sm font-medium px-3 py-1 rounded transition-colors duration-200 ${
                                isDark 
                                  ? 'text-[#f85924] hover:text-[#d13602] hover:bg-[#2C2C2C]' 
                                  : 'text-[#1D3557] hover:text-[#457B9D] hover:bg-blue-50'
                              }`}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredTransactions.length > 0 && (
                <div className="mt-5 flex justify-end gap-12 text-base font-semibold">
                  <span>
                    Total Credit: <span className="text-green-600">{totalCredit} TK</span>
                  </span>
                  <span>
                    Total Debit: <span className="text-red-600">{totalDebit} TK</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* Edit Transaction Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 w-full max-w-md ${
            isDark ? 'bg-cyan-950 text-white' : 'bg-white text-gray-900'
          }`}>
            <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>
            {editingTransaction && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={editingTransaction.date}
                    onChange={(e) => setEditingTransaction({...editingTransaction, date: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      isDark 
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input
                    type="number"
                    value={editingTransaction.amount}
                    onChange={(e) => setEditingTransaction({...editingTransaction, amount: parseInt(e.target.value)})}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      isDark 
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={editingTransaction.description}
                    onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      isDark 
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditModalOpen(false)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isDark 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTransaction}
                className="px-4 py-2 bg-[#f85924] text-white rounded-lg font-medium hover:bg-[#d13602]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankTransactionView;