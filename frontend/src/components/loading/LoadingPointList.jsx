import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { useTheme } from '../../context/ThemeContext';

const initialLoadingPoints = [
  { id: 1, name: 'NCT', type: 'Port', location: 'Chattogram' },
  { id: 2, name: 'Yeard', type: 'Storage', location: 'Dhaka' },
  { id: 3, name: 'Ship', type: 'Vessel', location: 'Sea' },
  { id: 4, name: 'Shagorica (Karim Pipe)', type: 'Local', location: 'Sitakunda' },
];

const LoadingPointList = () => {
  const [points] = useState(initialLoadingPoints);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <TopBar />
      <div className="flex">
        <SidebarWrapper />
        <div className={`flex-1 p-6 min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Loading Points</h2>
            <Link
              to="/app/loading-points/add"
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
            >
              Add Loading Point
            </Link>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {points.map((point) => (
                  <tr key={point.id}>
                    <td className="px-6 py-4">{point.name}</td>
                    <td className="px-6 py-4">{point.type}</td>
                    <td className="px-6 py-4">{point.location}</td>
                    <td className="px-6 py-4">
                      <Link to={`/app/loading-points/edit/${point.id}`} className="text-orange-600 hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoadingPointList;
