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
import branchService from '../../services/branchService';
import cnfService from '../../services/cnfService';
import clientService from '../../services/clientService';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [branches, setBranches] = useState([]);
  const [cnfs, setCnfs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeStat, setActiveStat] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleViewAllBranches = () => {
    navigate('/app/branches');
  };

  const handleViewAllCNFs = () => {
    navigate('/app/cnfs');
  };

  const handleViewAllClients = () => {
    navigate('/app/clients');
  };

  const handleAddBranch = () => {
    navigate('/app/branches/add');
  };

  const handleAddCNF = () => {
    navigate('/app/cnfs/add');
  };

  const handleAddClient = () => {
    navigate('/app/clients/add');
  };

  // Debug the auth context
  console.log('🔐 Auth Context Debug:', {
    user: user,
    hasToken: !!user?.token,
    token: user?.token ? '***' + user.token.slice(-10) : 'No token',
    userData: user
  });

  // Also check localStorage directly
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    console.log('💾 LocalStorage Debug:', {
      token: token ? '***' + token.slice(-10) : 'No token',
      userData: userData ? JSON.parse(userData) : 'No user data'
    });
  }, []);
  // Fetch all dashboard data
useEffect(() => {
  const fetchDashboardData = async () => {
    // Check multiple places for token
    const tokenFromContext = user?.token;
    const tokenFromStorage = localStorage.getItem('token');
    const currentToken = tokenFromContext || tokenFromStorage;
    
    console.log('🔍 Token check:', {
      fromContext: !!tokenFromContext,
      fromStorage: !!tokenFromStorage,
      currentToken: currentToken ? '***' + currentToken.slice(-10) : 'No token'
    });

    if (!currentToken) {
      console.log('❌ No token available - redirecting to login');
      setStatsLoading(false);
      // Optionally redirect to login
      // navigate('/login');
      return;
    }
    
    try {
      setStatsLoading(true);
      console.log('🔄 Starting dashboard data fetch with token...');
      
      // Fetch with timeout to prevent hanging
      const fetchWithTimeout = (serviceCall, timeout = 10000) => {
        return Promise.race([
          serviceCall,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ]);
      };

      const [branchesData, cnfsData, clientsData] = await Promise.allSettled([
        fetchWithTimeout(branchService.getBranches()),
        fetchWithTimeout(cnfService.getAllCNFs()),
        fetchWithTimeout(clientService.getClients())
      ]);

      console.log('📊 Dashboard fetch results:', {
        branches: branchesData,
        cnfs: cnfsData,
        clients: clientsData
      });

      // Handle branches
      if (branchesData.status === 'fulfilled') {
        const branchesArray = extractArrayFromResponse(branchesData.value, 'branches');
        console.log('✅ Branches loaded:', branchesArray.length);
        setBranches(branchesArray.slice(0, 6));
      } else {
        console.error('❌ Branches failed:', branchesData.reason);
        setBranches([]);
      }

      // Handle CNFs
      if (cnfsData.status === 'fulfilled') {
        const cnfsArray = extractArrayFromResponse(cnfsData.value, 'cnfs');
        console.log('✅ CNFs loaded:', cnfsArray.length);
        setCnfs(cnfsArray.slice(0, 6));
      } else {
        console.error('❌ CNFs failed:', cnfsData.reason);
        setCnfs([]);
      }

      // Handle clients
      if (clientsData.status === 'fulfilled') {
        const clientsArray = extractArrayFromResponse(clientsData.value, 'clients');
        console.log('✅ Clients loaded:', clientsArray.length);
        setClients(clientsArray.slice(0, 6));
      } else {
        console.error('❌ Clients failed:', clientsData.reason);
        setClients([]);
      }

    } catch (err) {
      console.error('💥 Dashboard data fetch error:', err);
    } finally {
      console.log('🏁 Dashboard loading complete');
      setStatsLoading(false);
    }
  };

  // Helper function to extract arrays from various response formats
  const extractArrayFromResponse = (response, type) => {
    console.log(`🛠️ Extracting ${type} from:`, response);
    
    if (!response) {
      console.log(`❌ No response for ${type}`);
      return [];
    }
    
    if (Array.isArray(response)) {
      console.log(`✅ ${type}: Direct array with ${response.length} items`);
      return response;
    }
    
    if (response.data && Array.isArray(response.data)) {
      console.log(`✅ ${type}: response.data array with ${response.data.length} items`);
      return response.data;
    }
    
    if (response[type] && Array.isArray(response[type])) {
      console.log(`✅ ${type}: response.${type} array with ${response[type].length} items`);
      return response[type];
    }
    
    if (response.success && response.data && Array.isArray(response.data)) {
      console.log(`✅ ${type}: response.success.data array with ${response.data.length} items`);
      return response.data;
    }
    
    if (typeof response === 'object' && response !== null && !Array.isArray(response)) {
      console.log(`✅ ${type}: Single object, wrapping in array`);
      return [response];
    }
    
    console.log(`❌ ${type}: Could not extract array from response, returning empty array`);
    return [];
  };

  fetchDashboardData();
}, [user?.token, navigate]); // Add navigate to dependencies
  // Enhanced Stats with real data integration
  const stats = [
    {
      title: 'Total Branches',
      value: statsLoading ? '...' : branches.length,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-200',
      icon: <FaBuilding className="text-green-600 w-6 h-6" />,
      trend: '+2 this month',
      change: 'positive',
      onClick: handleViewAllBranches
    },
    {
      title: 'Total CNFs',
      value: statsLoading ? '...' : cnfs.length,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      icon: <FaUsers className="text-blue-600 w-6 h-6" />,
      trend: '+12 today',
      change: 'positive',
      onClick: handleViewAllCNFs
    },
    {
      title: 'Total Clients',
      value: statsLoading ? '...' : clients.length,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      icon: <FaUser className="text-orange-600 w-6 h-6" />,
      trend: '+8 this week',
      change: 'positive',
      onClick: handleViewAllClients
    },
    {
      title: 'Revenue',
      value: 'TK 2.4L',
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      icon: <FaMoneyBillWave className="text-purple-600 w-6 h-6" />,
      trend: '+8.2% growth',
      change: 'positive',
      onClick: () => navigate('/app/reports')
    }
  ];

  // Enhanced Quick Actions
  const quickActions = [
    {
      title: 'Manage Branches',
      description: 'Add or manage system branches',
      icon: <FaBuilding className="w-8 h-8" />,
      color: 'from-blue-500 via-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-600 hover:via-blue-700 hover:to-blue-800',
      path: '/app/branches',
      action: handleAddBranch
    },
    {
      title: 'Manage CNFs',
      description: 'Add or manage CNF partners',
      icon: <FaUsers className="w-8 h-8" />,
      color: 'from-green-500 via-green-600 to-green-700',
      hoverColor: 'hover:from-green-600 hover:via-green-700 hover:to-green-800',
      path: '/app/cnfs',
      action: handleAddCNF
    },
    {
      title: 'Manage Clients',
      description: 'Add or manage client accounts',
      icon: <FaUser className="w-8 h-8" />,
      color: 'from-orange-500 via-orange-600 to-orange-700',
      hoverColor: 'hover:from-orange-600 hover:via-orange-700 hover:to-orange-800',
      path: '/app/clients',
      action: handleAddClient
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: <FaCog className="w-8 h-8" />,
      color: 'from-purple-500 via-purple-600 to-purple-700',
      hoverColor: 'hover:from-purple-600 hover:via-purple-700 hover:to-purple-800',
      path: '/app/settings'
    }
  ];

  // Render loading skeleton for stats
  const renderStatSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gray-200 w-12 h-12"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );

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
                  <button className="bg-[#fb8129] border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-[#df6006] transition-colors flex items-center text-sm">
                    <FaDownload className="w-4 h-4 mr-2" />
                    Export Report
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {statsLoading ? (
                <>
                  {renderStatSkeleton()}
                  {renderStatSkeleton()}
                  {renderStatSkeleton()}
                  {renderStatSkeleton()}
                </>
              ) : (
                stats.map((stat, index) => (
                  <div 
                    key={index}
                    className={`bg-white p-4 lg:p-6 rounded-2xl shadow-lg border ${stat.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer transform-gpu ${
                      activeStat === index ? 'ring-2 ring-blue-500 scale-105' : ''
                    }`}
                    onMouseEnter={() => setActiveStat(index)}
                    onMouseLeave={() => setActiveStat(null)}
                    onClick={stat.onClick}
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
                ))
              )}
            </div>

            {/* Three Column Layout for Recent Items */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 mb-8">
              {/* Recent Branches */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-green-100 mr-3">
                        <FaBuilding className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">Recent Branches</h2>
                        <p className="text-gray-600 text-sm">Latest branches in system</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleViewAllBranches}
                      className="flex items-center text-[#f97316] hover:text-[#e45f00] font-medium text-sm group self-start sm:self-auto"
                    >
                      View All
                      <FaArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="p-4 lg:p-6">
                  {statsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="h-20 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : branches.length > 0 ? (
                    <div className="space-y-4">
                      {branches.slice(0, 3).map((branch) => (
                        <div 
                          key={branch.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all duration-300 group cursor-pointer"
                          onClick={() => navigate(`/app/branches`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center min-w-0">
                              <div className="p-2 rounded-lg bg-green-50 mr-3 group-hover:bg-green-100 transition-colors">
                                <FaBuilding className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-gray-800 truncate">{branch.name}</h3>
                                <p className="text-gray-500 text-sm truncate">{branch.manager}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{branch.contact}</span>
                            <span>{branch.establishedAt?.split('T')[0]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FaBuilding className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No branches found</p>
                      <button 
                        onClick={handleAddBranch}
                        className="text-green-600 hover:text-green-700 text-sm font-medium mt-2"
                      >
                        Add First Branch
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent CNFs */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-blue-100 mr-3">
                        <FaUsers className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">Recent CNFs</h2>
                        <p className="text-gray-600 text-sm">Latest CNF partners</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleViewAllCNFs}
                    className="flex items-center text-[#f97316] hover:text-[#e45f00] font-medium text-sm group self-start sm:self-auto"
                    >
                      View All
                      <FaArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="p-4 lg:p-6">
                  {statsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="h-20 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : cnfs.length > 0 ? (
                    <div className="space-y-4">
                      {cnfs.slice(0, 2).map((cnf) => (
                        <div 
                          key={cnf.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 group cursor-pointer"
                          onClick={() => navigate(`/app/cnfs`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center min-w-0">
                              <div className="p-2 rounded-lg bg-blue-50 mr-3 group-hover:bg-blue-100 transition-colors">
                                <FaUsers className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-gray-800 truncate">{cnf.name}</h3>
                                <p className="text-gray-500 text-sm truncate">{cnf.contact}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span className="truncate">{cnf.address}</span>
                            <span>{cnf.establishedAt?.split('T')[0]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No CNFs found</p>
                      <button 
                        onClick={handleAddCNF}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                      >
                        Add First CNF
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Clients */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-orange-100 mr-3">
                        <FaUser className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">Recent Clients</h2>
                        <p className="text-gray-600 text-sm">Latest client accounts</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleViewAllClients}
                      className="flex items-center text-[#f97316] hover:text-[#e45f00] font-medium text-sm group self-start sm:self-auto"
                    >
                      View All
                      <FaArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="p-4 lg:p-6">
                  {statsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="h-20 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : clients.length > 0 ? (
                    <div className="space-y-4">
                      {clients.slice(0, 2).map((client) => (
                        <div 
                          key={client.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all duration-300 group cursor-pointer"
                          onClick={() => navigate(`/app/clients`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center min-w-0">
                              <div className="p-2 rounded-lg bg-orange-50 mr-3 group-hover:bg-orange-100 transition-colors">
                                <FaUser className="w-4 h-4 text-orange-600" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-gray-800 truncate">{client.name}</h3>
                                <p className="text-gray-500 text-sm truncate">{client.manager}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{client.contact}</span>
                            <span>{client.establishedAt?.split('T')[0]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FaUser className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No clients found</p>
                      <button 
                        onClick={handleAddClient}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-2"
                      >
                        Add First Client
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
                <p className="text-gray-600 text-sm mt-1">Common tasks and quick access</p>
              </div>
              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <div 
                      key={index}
                      className={`bg-gradient-to-r ${action.color} rounded-xl p-4 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${action.hoverColor} flex flex-col items-center text-center`}
                      onClick={action.action || (() => navigate(action.path))}
                    >
                      <div className="mb-3">
                        {action.icon}
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                      <p className="text-white/80 text-xs">{action.description}</p>
                    </div>
                  ))}
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