import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const mockBankData = {
  'Account 1': {
    details: {
      name: 'ABC Bank',
      branch: 'Dhaka',
      accountNumber: '1234567890',
      currentBalance: 1300,
    },
    transactions: [
      { date: '2025-07-15', description: 'Deposit', debit: null, credit: 1000, balance: 1500 },
      { date: '2025-07-16', description: 'ATM Withdrawal', debit: 200, credit: null, balance: 1300 },
    ],
  },
  'Account 2': {
    details: {
      name: 'XYZ Bank',
      branch: 'Chittagong',
      accountNumber: '9876543210',
      currentBalance: 3350,
    },
    transactions: [
      { date: '2025-07-10', description: 'Salary', debit: null, credit: 3000, balance: 3500 },
      { date: '2025-07-12', description: 'Grocery', debit: 150, credit: null, balance: 3350 },
    ],
  },
  'Account 3': {
    details: {
      name: 'National Bank',
      branch: 'Sylhet',
      accountNumber: '1122334455',
      currentBalance: 4550,
    },
    transactions: [
      { date: '2025-07-01', description: 'Online Transfer', debit: 500, credit: null, balance: 4500 },
      { date: '2025-07-05', description: 'Interest', debit: null, credit: 50, balance: 4550 },
    ],
  },
};

const accounts = Object.keys(mockBankData).map(key => ({
  value: key,
  label: key,
}));

const Statements = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [bankDetails, setBankDetails] = useState({});
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (selectedAccount) {
      const bank = mockBankData[selectedAccount];
      if (bank) {
        setBankDetails(bank.details);
        setTransactions(bank.transactions);
      }
    } else {
      setBankDetails({});
      setTransactions([]);
    }
  }, [selectedAccount]);

  const exportCSV = () => {
    const csvRows = [
      ['Date', 'Description', 'Debit', 'Credit', 'Balance'],
      ...transactions.map(txn => [
        txn.date,
        txn.description,
        txn.debit ?? '',
        txn.credit ?? '',
        txn.balance,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `${selectedAccount}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`${bankDetails.name} - Statement`, 14, 16);

    autoTable(doc, {
      startY: 22,
      head: [['Date', 'Description', 'Debit', 'Credit', 'Balance']],
      body: transactions.map(txn => [
        txn.date,
        txn.description,
        txn.debit ?? '-',
        txn.credit ?? '-',
        txn.balance,
      ]),
    });

    doc.save(`${selectedAccount}_transactions.pdf`);
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-mbts-blue text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Fixed sidebar with full viewport height */}
      <div className="flex-shrink-0 h-screen overflow-hidden">
        <SidebarWrapper collapsed={sidebarCollapsed} />
      </div>

      {/* Main content with independent scrolling */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto px-6 py-10 max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-extrabold mb-8 text-center">Bank Wise Statement</h1>

          {/* Account Selection */}
          <div
            className={`max-w-3xl w-full mx-auto p-8 rounded-xl shadow-lg border mb-12 ${
              isDark ? 'bg-[#1c2a3a] border-gray-700' : 'bg-white border-gray-300'
            }`}
          >
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

          {/* Bank Details */}
          {selectedAccount ? (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 rounded-xl shadow-md border mb-10 ${
                isDark ? 'bg-[#1c2a3a] border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div>
                <p className="text-sm font-medium">Bank Name:</p>
                <p className="text-lg">{bankDetails.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Branch:</p>
                <p className="text-lg">{bankDetails.branch}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Account Number:</p>
                <p className="text-lg">{bankDetails.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Current Balance:</p>
                <p className="text-lg font-bold text-green-600">৳{bankDetails.currentBalance}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 italic mb-10">Please select an account to view details.</p>
          )}

          {/* Transactions */}
          {selectedAccount && (
            <div className={`overflow-x-auto rounded-xl shadow-lg border mb-10 ${
              isDark ? 'bg-[#1c2a3a] border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex justify-between items-center p-4">
                <h2 className="text-2xl font-bold">Transactions</h2>
                {transactions.length > 0 && (
                  <div className="flex gap-3">
                    <button
                      onClick={exportCSV}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={exportPDF}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                    >
                      Export PDF
                    </button>
                  </div>
                )}
              </div>

              <table className="w-full table-auto border-collapse text-sm">
                <thead>
                  <tr className={`${isDark ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                    {['Date', 'Description', 'Debit', 'Credit', 'Balance'].map(heading => (
                      <th
                        key={heading}
                        className={`px-6 py-4 text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-gray-400 italic">
                        No transactions available.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn, idx) => (
                      <tr
                        key={idx}
                        className={`${idx % 2 === 0 ? (isDark ? 'bg-[#213549]' : 'bg-gray-50') : ''} border-b ${
                          isDark ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <td className="px-6 py-4 text-center">{txn.date}</td>
                        <td className="px-6 py-4 text-center">{txn.description}</td>
                        <td className="px-6 py-4 text-center">{txn.debit !== null ? `৳${txn.debit}` : '-'}</td>
                        <td className="px-6 py-4 text-center">{txn.credit !== null ? `৳${txn.credit}` : '-'}</td>
                        <td className="px-6 py-4 text-center font-semibold">৳{txn.balance}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Statements;
