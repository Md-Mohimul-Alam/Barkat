import React from 'react';
import { Link } from 'react-router-dom';

const DueCard = ({ due, isDark }) => {
  return (
    <div
      className={`border rounded-lg p-4 mb-4 shadow-sm transition-all duration-200
        ${isDark 
          ? 'bg-sky-950 border-[#457B9D] text-[#ffffff] hover:bg-[#0E2A45]' 
          : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{due.description}</h3>
        <Link
          to={`/app/dues/edit/${due.id}`}
          className={`text-sm font-medium px-3 py-1 rounded transition-colors duration-200 ${
            isDark 
              ? 'text-[#f85924] hover:text-[#d13602] hover:bg-[#2C2C2C]' 
              : 'text-[#1D3557] hover:text-[#457B9D] hover:bg-blue-50'
          }`}
        >
          Edit
        </Link>
      </div>
      <p><strong>Amount:</strong> ৳{due.amount.toLocaleString()}</p>
      <p><strong>Due Date:</strong> {due.dueDate}</p>
      <p><strong>Client ID:</strong> {due.clientId}</p>
    </div>
  );
};

export default DueCard;