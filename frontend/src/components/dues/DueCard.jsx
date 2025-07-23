import React from 'react';
import { Link } from 'react-router-dom';

const DueCard = ({ due, isDark }) => {
  return (
    <div
      className={`border rounded-md p-4 mb-4 shadow-sm
        ${isDark ? 'bg-mbts-dark border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{due.description}</h3>
        <Link
          to={`/app/dues/edit/${due.id}`}
          className={`text-sm underline ${isDark ? 'text-mbts-orange' : 'text-blue-600'}`}
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
