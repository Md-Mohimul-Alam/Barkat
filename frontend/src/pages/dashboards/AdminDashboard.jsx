import React, { useState } from 'react';
import TopBar from '../../components/shared/Topbar';
import SidebarWrapper from '../../components/shared/Sidebar';
import Footer from '../../components/shared/Footer';
const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <SidebarWrapper collapsed={sidebarCollapsed} className='bg-transparent'/>
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={handleToggleSidebar} sidebarCollapsed={sidebarCollapsed} />
        <main className="p-5 flex-1 bg-gray-50">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">Admin Dashboard</h1>
          <p className="mb-6 text-gray-600 text-lg">Welcome, Admin! Here's your system overview.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <h2 className="text-md font-semibold text-gray-700 mb-2">Total Clients</h2>
              <p className="text-3xl font-bold text-green-600">135</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <h2 className="text-md font-semibold text-gray-700 mb-2">Pending Orders</h2>
              <p className="text-3xl font-bold text-yellow-500">42</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <h2 className="text-md font-semibold text-gray-700 mb-2">System Users</h2>
              <p className="text-3xl font-bold text-blue-600">15</p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
