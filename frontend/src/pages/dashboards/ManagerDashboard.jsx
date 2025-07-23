// src/pages/dashboards/ManagerDashboard.jsx
import React from 'react';

const ManagerDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Branch Manager Dashboard</h1>
      <p className="mb-4 text-gray-600">Welcome! Here's your branch overview.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Assigned Orders</h2>
          <p className="text-2xl text-green-500">18</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Trips Scheduled</h2>
          <p className="text-2xl text-blue-500">9</p>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
