// Placeholder for vehicles/VehicleList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import vehicleService from '../../services/vehicleService';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import VehicleForm from './VehicleForm';
import { notifySuccess, notifyError } from '../../pages/UI/Toast';

const VehicleList = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch vehicles
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getVehicles();
      const vehiclesData = response.data || response;
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      notifyError('Failed to load vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Filter vehicles based on search and filters
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (vehicleId) => {
    try {
      await vehicleService.deleteVehicle(vehicleId);
      notifySuccess('Vehicle deleted successfully!');
      setDeleteConfirm(null);
      fetchVehicles();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      notifyError(error.message || 'Failed to delete vehicle');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVehicle(null);
    fetchVehicles();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800';
      case 'in-use':
        return isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      case 'out-of-service':
        return isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800';
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'car':
        return '🚗';
      case 'truck':
        return '🚚';
      case 'van':
        return '🚐';
      case 'bus':
        return '🚌';
      case 'motorcycle':
        return '🏍️';
      default:
        return '🚙';
    }
  };

  const statusTypes = ['all', 'available', 'in-use', 'maintenance', 'out-of-service'];
  const vehicleTypes = ['all', 'car', 'truck', 'van', 'bus', 'motorcycle', 'other'];

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <TopBar />
        <div className="flex">
          <SidebarWrapper 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
          <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f85924]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <TopBar />
      <div className="flex">
        <SidebarWrapper 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl mr-4 ${
                      isDark ? 'bg-cyan-800' : 'bg-orange-100'
                    }`}>
                      <svg className={`w-8 h-8 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">Vehicle Management</h1>
                      <p className={`mt-1 ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                        Manage your fleet of vehicles
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-[#f85924] to-[#e84a1a] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:from-[#e84a1a] hover:to-[#d13602] shadow-lg hover:shadow-xl flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Vehicle
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className={`rounded-2xl p-6 shadow-lg ${
                  isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 border border-cyan-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                        Total Vehicles
                      </p>
                      <p className="text-2xl font-bold mt-1">{vehicles.length}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      isDark ? 'bg-cyan-800' : 'bg-orange-100'
                    }`}>
                      <svg className={`w-6 h-6 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl p-6 shadow-lg ${
                  isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 border border-cyan-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                        Available
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {vehicles.filter(v => v.status === 'available').length}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-green-500 bg-opacity-20`}>
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl p-6 shadow-lg ${
                  isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 border border-cyan-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                        In Maintenance
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {vehicles.filter(v => v.status === 'maintenance').length}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-yellow-500 bg-opacity-20`}>
                      <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl p-6 shadow-lg ${
                  isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 border border-cyan-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                        Out of Service
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {vehicles.filter(v => v.status === 'out-of-service').length}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-red-500 bg-opacity-20`}>
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <div className={`rounded-2xl p-6 mb-6 shadow-lg ${
                isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 border border-cyan-700' : 'bg-white border border-gray-200'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="search" className="block text-sm font-medium mb-2">
                      Search Vehicles
                    </label>
                    <div className="relative">
                      <input
                        id="search"
                        type="text"
                        placeholder="Search by vehicle number, model, or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full rounded-lg border px-4 py-2 pl-10 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                          isDark
                            ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924]'
                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924]'
                        }`}
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="statusFilter" className="block text-sm font-medium mb-2">
                      Filter by Status
                    </label>
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                        isDark
                          ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] focus:ring-[#f85924] focus:border-[#f85924]'
                          : 'bg-white border-gray-300 text-gray-800 focus:ring-[#f85924] focus:border-[#f85924]'
                      }`}
                    >
                      {statusTypes.map(status => (
                        <option key={status} value={status}>
                          {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="typeFilter" className="block text-sm font-medium mb-2">
                      Filter by Type
                    </label>
                    <select
                      id="typeFilter"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                        isDark
                          ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] focus:ring-[#f85924] focus:border-[#f85924]'
                          : 'bg-white border-gray-300 text-gray-800 focus:ring-[#f85924] focus:border-[#f85924]'
                      }`}
                    >
                      {vehicleTypes.map(type => (
                        <option key={type} value={type}>
                          {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Vehicles Grid */}
              {filteredVehicles.length === 0 ? (
                <div className={`rounded-2xl p-12 text-center shadow-lg ${
                  isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 border border-cyan-700' : 'bg-white border border-gray-200'
                }`}>
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
                  <p className={`mb-6 ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                    {vehicles.length === 0 
                      ? 'Get started by adding your first vehicle to the fleet.'
                      : 'No vehicles match your search criteria. Try adjusting your filters.'
                    }
                  </p>
                  {vehicles.length === 0 && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-gradient-to-r from-[#f85924] to-[#e84a1a] text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:from-[#e84a1a] hover:to-[#d13602] shadow-lg hover:shadow-xl"
                    >
                      Add Your First Vehicle
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id || vehicle._id}
                      className={`rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${
                        isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 border border-cyan-700' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getTypeIcon(vehicle.type)}</span>
                          <div>
                            <h3 className="font-bold text-lg">{vehicle.vehicleNumber}</h3>
                            <p className={`text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                              {vehicle.model}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status.replace('-', ' ')}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className={isDark ? 'text-cyan-300' : 'text-gray-600'}>Type:</span>
                          <span className="font-medium">{vehicle.type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={isDark ? 'text-cyan-300' : 'text-gray-600'}>Capacity:</span>
                          <span className="font-medium">{vehicle.capacity} persons</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={isDark ? 'text-cyan-300' : 'text-gray-600'}>Fuel:</span>
                          <span className="font-medium">{vehicle.fuelType}</span>
                        </div>
                        {vehicle.currentMileage && (
                          <div className="flex justify-between text-sm">
                            <span className={isDark ? 'text-cyan-300' : 'text-gray-600'}>Mileage:</span>
                            <span className="font-medium">{vehicle.currentMileage} km</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between pt-4 border-t border-gray-700">
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            isDark 
                              ? 'bg-cyan-800 hover:bg-cyan-700 text-cyan-300' 
                              : 'bg-orange-100 hover:bg-orange-200 text-[#f85924]'
                          }`}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(vehicle.id || vehicle._id)}
                          className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </div>

      {/* Vehicle Form Modal */}
      {showForm && (
        <VehicleForm
          isEdit={!!editingVehicle}
          vehicleData={editingVehicle}
          onClose={handleFormClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className={`rounded-2xl p-6 w-full max-w-md shadow-2xl ${
            isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 border border-cyan-700' : 'bg-white text-gray-900 border border-gray-200'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-lg mr-3 bg-red-500 bg-opacity-20`}>
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            </div>
            <p className={`mb-6 ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm transition-colors duration-200 hover:bg-red-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;