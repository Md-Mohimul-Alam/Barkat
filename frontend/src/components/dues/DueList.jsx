import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSearchParams, Link } from 'react-router-dom';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';

const initialDues = [
  { id: 1, clientId: 1, amount: 5000, dueDate: '2024-08-01', description: 'Invoice #1001' },
  { id: 2, clientId: 2, amount: 12000, dueDate: '2024-08-10', description: 'Invoice #1002' },
  { id: 3, clientId: 1, amount: 7500, dueDate: '2024-08-15', description: 'Invoice #1003' },
  { id: 4, clientId: 3, amount: 3000, dueDate: '2024-08-20', description: 'Invoice #1004' },
];

const DueList = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);
  const [searchParams] = useSearchParams();

  const clientId = searchParams.get('clientId');
  const [dues, setDues] = useState(initialDues);

  // Filter dues by clientId if present
  const filteredDues = clientId
    ? dues.filter(due => due.clientId.toString() === clientId)
    : dues;

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-mbts-blue text-white' : 'bg-gray-50 text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="p-6 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">
              {clientId ? `Dues for Client #${clientId}` : 'All Dues'}
            </h1>
            <Link
              to="/app/dues/add"
              className={`px-4 py-2 rounded font-medium
                ${isDark
                  ? 'bg-mbts-orange hover:bg-mbts-orangeHover text-white'
                  : 'bg-mbts-orange hover:bg-mbts-orangeHover text-white'}`}
            >
              + Add Due
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-mbts-dark text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Due Date</th>
                  <th className="p-3 text-left">Client ID</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDues.map(due => (
                  <tr key={due.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="p-3">{due.description}</td>
                    <td className="p-3">{due.amount}</td>
                    <td className="p-3">{due.dueDate}</td>
                    <td className="p-3">{due.clientId}</td>
                    <td className="p-3 text-center">
                      <Link
                        to={`/app/dues/edit/${due.id}`}
                        className={`text-sm underline ${isDark ? 'text-mbts-orange' : 'text-blue-600'}`}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}

                {filteredDues.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No dues found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default DueList;
