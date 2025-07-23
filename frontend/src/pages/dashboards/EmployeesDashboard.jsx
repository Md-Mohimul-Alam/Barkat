// src/pages/dashboards/EmployeesDashboard.jsx
import React from 'react';

const EmployeesDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Employee Dashboard</h1>
      <p className="mb-4 text-gray-600">Here are your assigned tasks and updates.</p>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Today’s Tasks</h2>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Confirm delivery for order #4562</li>
          <li>Submit vehicle maintenance report</li>
          <li>Update trip log for Zone B</li>
        </ul>
      </div>
    </div>
  );
};

export default EmployeesDashboard;
