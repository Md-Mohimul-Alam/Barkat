import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';

const initialClients = [
  { id: 1, name: 'Gram Bangla', manager: 'Mr. Sohel', contact: '01710000001', address: 'Narayanganj', establishedAt: '2023-01-01' },
  { id: 2, name: 'Amin Metal', manager: 'Mr. Sohel', contact: '01710000001', address: 'Narayanganj', establishedAt: '2023-01-01' },
  { id: 3, name: 'Bukhari Steel', manager: 'Mr. Hossain', contact: '01710000002', address: 'Gazipur', establishedAt: '2022-11-20' },
  { id: 4, name: 'A.R Trade', manager: 'Mr. Azad', contact: '01710000003', address: 'Tongi', establishedAt: '2024-02-10' },
  { id: 5, name: 'Rumman Trade', manager: 'Mr. Rumman', contact: '01710000004', address: 'Demra', establishedAt: '2023-07-15' },
  { id: 6, name: 'Bhawal Steel', manager: 'Mr. Islam', contact: '01710000005', address: 'Bhawal', establishedAt: '2022-09-05' },
  { id: 7, name: 'Jashim & Brothers', manager: 'Mr. Jashim', contact: '01710000006', address: 'Keraniganj', establishedAt: '2023-04-01' },
  { id: 8, name: 'SS Steel', manager: 'Mr. Rubel', contact: '01710000007', address: 'Narsingdi', establishedAt: '2022-05-12' },
  { id: 9, name: 'Rubel Enterprises', manager: 'Mr. Rubel', contact: '01710000007', address: 'Narsingdi', establishedAt: '2022-05-12' },
  { id: 10, name: 'Makkah Transport (Local)', manager: 'Mr. Kamal', contact: '01710000008', address: 'Savar', establishedAt: '2021-12-01' },
];

const ClientList = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [clients, setClients] = useState(initialClients);

  const handleToggleSidebar = () => setSidebarCollapsed(prev => !prev);

  const handleDateChange = (id, newDate) => {
    setClients(prev =>
      prev.map(client =>
        client.id === id ? { ...client, establishedAt: newDate } : client
      )
    );
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-mbts-blue text-white' : 'bg-gray-50 text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar
          onToggleSidebar={handleToggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">Client List</h1>
            <Link
              to="/app/clients/add"
              className={`px-4 py-2 rounded font-medium
                ${isDark
                  ? 'bg-mbts-orange hover:bg-mbts-orangeHover text-white'
                  : 'bg-mbts-orange hover:bg-mbts-orangeHover text-white'}`}
            >
              + Add Client
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-mbts-dark text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Manager</th>
                  <th className="p-3 text-left">Contact</th>
                  <th className="p-3 text-left">Address</th>
                  <th className="p-3 text-left">Established At</th>
                  <th className="p-3 text-center">Actions</th>
                  <th className="p-3 text-center">Dues</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="p-3">{client.name}</td>
                    <td className="p-3">{client.manager}</td>
                    <td className="p-3">{client.contact}</td>
                    <td className="p-3">{client.address}</td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={client.establishedAt}
                        onChange={(e) => handleDateChange(client.id, e.target.value)}
                        className={`rounded border px-2 py-1 text-sm w-full
                          ${isDark ? 'bg-mbts-dark text-white' : 'bg-gray-100 text-gray-700'}`}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        to={`/app/clients/edit/${client.id}`}
                        className={`text-sm underline ${isDark ? 'text-mbts-orange' : 'text-blue-600'}`}
                      >
                        Edit
                      </Link>
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        to={`/app/dues?clientId=${client.id}`}
                        className={`text-sm underline ${isDark ? 'text-mbts-orange' : 'text-blue-600'}`}
                      >
                        View Dues
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ClientList;
