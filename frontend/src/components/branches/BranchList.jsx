import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getBranches } from '../../services/branchService';
import { Link } from 'react-router-dom';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { notifyError } from '../../pages/UI/Toast';

const BranchList = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [branches, setBranches] = useState([]);

  const handleToggleSidebar = () => setSidebarCollapsed(prev => !prev);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getBranches(user.token);
        setBranches(data);
      } catch (err) {
        console.error(err);
        notifyError('Failed to load branches');
      }
    };
    fetchBranches();
  }, [user.token]);

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-mbts-blue text-white' : 'bg-gray-50 text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={handleToggleSidebar} sidebarCollapsed={sidebarCollapsed} />

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">Branch List</h1>
            <Link
              to="/app/branches/add"
              className={`px-4 py-2 rounded font-medium ${
                isDark
                  ? 'bg-mbts-orange hover:bg-mbts-orangeHover text-white'
                  : 'bg-mbts-orange hover:bg-mbts-orangeHover text-white'
              }`}
            >
              + Add Branch
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
                </tr>
              </thead>
              <tbody>
                {branches.map(branch => (
                  <tr key={branch.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="p-3">{branch.name}</td>
                    <td className="p-3">{branch.manager}</td>
                    <td className="p-3">{branch.contact}</td>
                    <td className="p-3">{branch.address}</td>
                    <td className="p-3">{branch.establishedAt?.split('T')[0]}</td>
                    <td className="p-3 text-center">
                      <Link
                        to={`/app/branches/edit/${branch.id}`}
                        className={`text-sm underline ${isDark ? 'text-mbts-orange' : 'text-blue-600'}`}
                      >
                        Edit
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

export default BranchList;
