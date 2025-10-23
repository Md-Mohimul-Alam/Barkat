import React, { useState, useEffect } from 'react';
import { 
  FaBuilding, FaUser, FaPhone, FaMapMarker, FaCalendar, 
  FaEye, FaArrowRight, FaUsers, FaChartBar, FaCog,
  FaPlus, FaDownload, FaShoppingCart, FaMoneyBillWave
} from 'react-icons/fa';
import TopBar from '../../components/shared/Topbar';
import SidebarWrapper from '../../components/shared/Sidebar';
import Footer from '../../components/shared/Footer';
import { useAuth } from '../../context/AuthContext';
import { getBranches } from '../../services/branchService';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStat, setActiveStat] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleViewAllBranches = () => {
    navigate('/app/branches');
  };

  const handleAddBranch = () => {
    navigate('/app/branches/add');
  };

  useEffect(() => {
    const fetchBranches = async () => {
      if (!user?.token) return;
      
      try {
        setLoading(true);
        const data = await getBranches(user.token);
        setBranches(data.slice(0, 6));
      } catch (err) {
        console.error('Failed to load branches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [user?.token]);

  // Enhanced Stats with real data integration
  const stats = [
    {
      title: 'Total Branches',
      value: branches.length,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-200',
      icon: <FaBuilding className="text-green-600 w-6 h-6" />,
      trend: '+2 this month',
      change: 'positive'
    },
    {
      title: 'Active Clients',
      value: '135',
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      icon: <FaUsers className="text-blue-600 w-6 h-6" />,
      trend: '+12 today',
      change: 'positive'
    },
    {
      title: 'Pending Orders',
      value: '42',
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      icon: <FaShoppingCart className="text-orange-600 w-6 h-6" />,
      trend: '-5 this week',
      change: 'negative'
    },
    {
      title: 'Revenue',
      value: 'TK 2.4L',
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      icon: <FaMoneyBillWave className="text-purple-600 w-6 h-6" />,
      trend: '+8.2% growth',
      change: 'positive'
    }
  ];

  // Enhanced Quick Actions
  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add or manage system users and permissions',
      icon: <FaUsers className="w-10 h-10" />,
      color: 'from-blue-500 via-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-600 hover:via-blue-700 hover:to-blue-800',
      path: '/app/employees'
    },
    {
      title: 'View Reports',
      description: 'Access system analytics and performance reports',
      icon: <FaChartBar className="w-10 h-10" />,
      color: 'from-green-500 via-green-600 to-green-700',
      hoverColor: 'hover:from-green-600 hover:via-green-700 hover:to-green-800',
      path: '/reports/yearly'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences and settings',
      icon: <FaCog className="w-10 h-10" />,
      color: 'from-purple-500 via-purple-600 to-purple-700',
      hoverColor: 'hover:from-purple-600 hover:via-purple-700 hover:to-purple-800',
      path: '/app/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      
      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <SidebarWrapper collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TopBar */}
      <TopBar onToggleSidebar={handleToggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            {/* Enhanced Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-600 text-lg">Welcome back, {user?.name}! Here's your system overview.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center text-sm">
                    <FaDownload className="w-4 h-4 mr-2" />
                    Export Report
                  </button>
                  <button 
                    onClick={handleAddBranch}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center text-sm"
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Branch
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className={`bg-white p-4 lg:p-6 rounded-2xl shadow-lg border ${stat.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer transform-gpu ${
                    activeStat === index ? 'ring-2 ring-blue-500 scale-105' : ''
                  }`}
                  onMouseEnter={() => setActiveStat(index)}
                  onMouseLeave={() => setActiveStat(null)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor} shadow-sm`}>
                      {stat.icon}
                    </div>
                    <span className={`text-xs lg:text-sm font-medium ${
                      stat.change === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className={`text-2xl lg:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="mt-3 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                </div>
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Recent Branches - Takes 2/3 on large screens */}
              <div className="xl:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 lg:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-blue-100 mr-3">
                          <FaBuilding className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">Recent Branches</h2>
                          <p className="text-gray-600 text-sm">Latest branches added to the system</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleViewAllBranches}
                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm group self-start sm:self-auto"
                      >
                        View All
                        <FaArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 lg:p-6">
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, index) => (
                          <div key={index} className="animate-pulse">
                            <div className="h-32 bg-gray-200 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : branches.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {branches.map((branch) => (
                          <div 
                            key={branch.id}
                            className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 group cursor-pointer"
                            onClick={() => navigate(`/app/branches/${branch.id}`)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center">
                                <div className="p-2 rounded-lg bg-blue-50 mr-3 group-hover:bg-blue-100 transition-colors">
                                  <FaBuilding className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-gray-800 truncate">{branch.name}</h3>
                                  <p className="text-gray-500 text-sm">ID: {branch.id}</p>
                                </div>
                              </div>
                              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-blue-600">
                                <FaEye className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center">
                                <FaUser className="w-3 h-3 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="text-gray-600 truncate">{branch.manager}</span>
                              </div>
                              <div className="flex items-center">
                                <FaMapMarker className="w-3 h-3 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="text-gray-600 truncate">{branch.address}</span>
                              </div>
                            </div>

                            <div className="mt-3 flex justify-between items-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                              <span className="text-xs text-gray-500">
                                {branch.establishedAt?.split('T')[0]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FaBuilding className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Branches Found</h3>
                        <p className="text-gray-500 mb-4">Get started by adding your first branch</p>
                        <button 
                          onClick={handleAddBranch}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                        >
                          <FaPlus className="w-4 h-4 mr-2" />
                          Add First Branch
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions & System Info - Takes 1/3 on large screens */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 lg:p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
                  </div>
                  <div className="p-4 space-y-3">
                    {quickActions.map((action, index) => (
                      <div 
                        key={index}
                        className={`bg-gradient-to-r ${action.color} rounded-xl p-4 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${action.hoverColor}`}
                        onClick={() => navigate(action.path)}
                      >
                        <div className="flex items-center">
                          {action.icon}
                          <div className="ml-3 min-w-0">
                            <h3 className="font-semibold truncate">{action.title}</h3>
                            <p className="text-white/80 text-sm truncate">{action.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 lg:p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">System Status</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Server Status', status: 'Operational', color: 'green' },
                      { label: 'Database', status: 'Connected', color: 'green' },
                      { label: 'API Services', status: 'Running', color: 'green' },
                      { label: 'Last Backup', status: '2 hours ago', color: 'blue' }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm lg:text-base">{item.label}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.color === 'green' ? 'bg-green-100 text-green-800' :
                          item.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;