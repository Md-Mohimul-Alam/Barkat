import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  FaUser,
  FaBell,
  FaLock,
  FaPalette,
  FaDatabase,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaSun,
  FaMoon,
  FaCog,
  FaShieldAlt,
  FaEnvelope,
  FaGlobe,
  FaDownload
} from 'react-icons/fa';
import TopBar from '../components/shared/Topbar';
import Footer from '../components/shared/Footer';
import SidebarWrapper from '../components/shared/Sidebar';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  // State for different settings sections
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Profile Settings
  const [profile, setProfile] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    position: user?.role || '',
    department: 'Transport Management'
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    orderUpdates: true,
    paymentAlerts: true,
    systemMaintenance: false,
    marketingEmails: false
  });

  // Security Settings
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
    sessionTimeout: 30
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Appearance Settings
  const [appearance, setAppearance] = useState({
    theme: theme,
    language: 'en',
    fontSize: 'medium'
  });

  // System Settings
  const [system, setSystem] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '1year',
    apiAccess: false,
    debugMode: false
  });

  // Success state for save operations
  const [saveSuccess, setSaveSuccess] = useState({});

  const handleSaveProfile = () => {
    setSaveSuccess({ ...saveSuccess, profile: true });
    setTimeout(() => setSaveSuccess({ ...saveSuccess, profile: false }), 3000);
    console.log('Profile saved:', profile);
  };

  const handleSaveSecurity = () => {
    if (security.newPassword !== security.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (security.newPassword && security.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    setSecurity({
      ...security,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setSaveSuccess({ ...saveSuccess, security: true });
    setTimeout(() => setSaveSuccess({ ...saveSuccess, security: false }), 3000);
    console.log('Security settings saved');
  };

  const handleSaveAppearance = () => {
    if (appearance.theme !== theme) {
      toggleTheme();
    }
    setSaveSuccess({ ...saveSuccess, appearance: true });
    setTimeout(() => setSaveSuccess({ ...saveSuccess, appearance: false }), 3000);
    console.log('Appearance settings saved:', appearance);
  };

  const handleSaveSystem = () => {
    setSaveSuccess({ ...saveSuccess, system: true });
    setTimeout(() => setSaveSuccess({ ...saveSuccess, system: false }), 3000);
    console.log('System settings saved:', system);
  };

  const handleExportSettings = () => {
    const settingsData = {
      profile,
      notifications,
      appearance,
      system,
      exportedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(settingsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: <FaUser className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: <FaBell className="w-5 h-5" />,
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: <FaLock className="w-5 h-5" />,
      color: 'from-red-500 to-red-600'
    },
    { 
      id: 'appearance', 
      label: 'Appearance', 
      icon: <FaPalette className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'system', 
      label: 'System', 
      icon: <FaDatabase className="w-5 h-5" />,
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const SettingSection = ({ title, children, onSave, showSave = true }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          {saveSuccess[activeTab] && (
            <span className="text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
              ✓ Saved successfully!
            </span>
          )}
        </div>
      </div>
      <div className="p-6">
        {children}
        {showSave && onSave && (
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                // Reset form states if needed
              }}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-300 flex items-center"
            >
              <FaTimes className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
            >
              <FaSave className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-start justify-between space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-1">
        <span className="block text-sm font-medium text-gray-800 mb-1">
          {label}
        </span>
        {description && (
          <span className="block text-sm text-gray-600">
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        onClick={() => onChange(!enabled)}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  const InputField = ({ label, type = 'text', value, onChange, placeholder, icon, error }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            icon ? 'pl-10 pr-4' : 'px-4'
          } py-3 text-gray-900 placeholder-gray-500 ${
            error ? 'border-red-500' : ''
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
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
                    Settings
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Manage your account preferences and system configuration
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={handleExportSettings}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center text-sm"
                  >
                    <FaDownload className="w-4 h-4 mr-2" />
                    Export Settings
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
              {/* Settings Navigation - Takes 1/4 on large screens */}
              <div className="xl:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden sticky top-8">
                  <div className="p-4 lg:p-6 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-blue-100 mr-3">
                        <FaCog className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
                        <p className="text-gray-600 text-sm">Manage preferences</p>
                      </div>
                    </div>
                  </div>
                  <nav className="p-4 space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-left transition-all duration-300 group ${
                          activeTab === tab.id
                            ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                            : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          activeTab === tab.id 
                            ? 'bg-white/20' 
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          {tab.icon}
                        </div>
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content - Takes 3/4 on large screens */}
              <div className="xl:col-span-3 space-y-6">
                {/* Profile Settings */}
                {activeTab === 'profile' && (
                  <SettingSection title="Profile Information" onSave={handleSaveProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="First Name"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        placeholder="Enter your first name"
                      />
                      <InputField
                        label="Last Name"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        placeholder="Enter your last name"
                      />
                      <InputField
                        label="Email Address"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="Enter your email"
                        icon={<FaEnvelope className="w-4 h-4" />}
                      />
                      <InputField
                        label="Phone Number"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        icon={<FaUser className="w-4 h-4" />}
                      />
                      <InputField
                        label="Position"
                        value={profile.position}
                        onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                        placeholder="Your position"
                      />
                      <InputField
                        label="Department"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        placeholder="Your department"
                      />
                    </div>
                  </SettingSection>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <SettingSection title="Notification Preferences" onSave={() => setSaveSuccess({ ...saveSuccess, notifications: true })}>
                    <div className="divide-y divide-gray-200">
                      <ToggleSwitch
                        label="Email Notifications"
                        description="Receive notifications via email"
                        enabled={notifications.emailNotifications}
                        onChange={(enabled) => setNotifications({ ...notifications, emailNotifications: enabled })}
                      />
                      <ToggleSwitch
                        label="Push Notifications"
                        description="Receive browser push notifications"
                        enabled={notifications.pushNotifications}
                        onChange={(enabled) => setNotifications({ ...notifications, pushNotifications: enabled })}
                      />
                      <ToggleSwitch
                        label="Order Updates"
                        description="Get notified about order status changes"
                        enabled={notifications.orderUpdates}
                        onChange={(enabled) => setNotifications({ ...notifications, orderUpdates: enabled })}
                      />
                      <ToggleSwitch
                        label="Payment Alerts"
                        description="Receive payment confirmation alerts"
                        enabled={notifications.paymentAlerts}
                        onChange={(enabled) => setNotifications({ ...notifications, paymentAlerts: enabled })}
                      />
                      <ToggleSwitch
                        label="System Maintenance"
                        description="Notifications about system maintenance"
                        enabled={notifications.systemMaintenance}
                        onChange={(enabled) => setNotifications({ ...notifications, systemMaintenance: enabled })}
                      />
                      <ToggleSwitch
                        label="Marketing Emails"
                        description="Receive promotional and marketing emails"
                        enabled={notifications.marketingEmails}
                        onChange={(enabled) => setNotifications({ ...notifications, marketingEmails: enabled })}
                      />
                    </div>
                  </SettingSection>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <SettingSection title="Security Settings" onSave={handleSaveSecurity}>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="relative">
                          <InputField
                            label="Current Password"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={security.currentPassword}
                            onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                            icon={<FaLock className="w-4 h-4" />}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                          </button>
                        </div>
                        
                        <div className="relative">
                          <InputField
                            label="New Password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={security.newPassword}
                            onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                          </button>
                        </div>
                        
                        <div className="relative">
                          <InputField
                            label="Confirm New Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={security.confirmPassword}
                            onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            error={security.newPassword !== security.confirmPassword && security.confirmPassword ? "Passwords don't match" : ""}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 space-y-4">
                        <ToggleSwitch
                          label="Two-Factor Authentication"
                          description="Add an extra layer of security to your account"
                          enabled={security.twoFactorAuth}
                          onChange={(enabled) => setSecurity({ ...security, twoFactorAuth: enabled })}
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Session Timeout
                          </label>
                          <select
                            value={security.sessionTimeout}
                            onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) })}
                            className="w-full rounded-lg border border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 text-gray-900"
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={120}>2 hours</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </SettingSection>
                )}

                {/* Appearance Settings */}
                {activeTab === 'appearance' && (
                  <SettingSection title="Appearance Settings" onSave={handleSaveAppearance}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Theme
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            onClick={() => setAppearance({ ...appearance, theme: 'light' })}
                            className={`p-6 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg ${
                              appearance.theme === 'light'
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                          >
                            <FaSun className="w-8 h-8 text-yellow-500 mb-3" />
                            <div className="font-semibold text-gray-800">Light</div>
                            <div className="text-gray-600 text-sm">Bright theme</div>
                          </button>
                          
                          <button
                            onClick={() => setAppearance({ ...appearance, theme: 'dark' })}
                            className={`p-6 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg ${
                              appearance.theme === 'dark'
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                          >
                            <FaMoon className="w-8 h-8 text-blue-400 mb-3" />
                            <div className="font-semibold text-gray-800">Dark</div>
                            <div className="text-gray-600 text-sm">Dark theme</div>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                          </label>
                          <select
                            value={appearance.language}
                            onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 text-gray-900"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Font Size
                          </label>
                          <select
                            value={appearance.fontSize}
                            onChange={(e) => setAppearance({ ...appearance, fontSize: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 text-gray-900"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </SettingSection>
                )}

                {/* System Settings */}
                {activeTab === 'system' && (
                  <SettingSection title="System Preferences" onSave={handleSaveSystem}>
                    <div className="space-y-6">
                      <div className="divide-y divide-gray-200">
                        <ToggleSwitch
                          label="Automatic Backups"
                          description="Automatically backup your data"
                          enabled={system.autoBackup}
                          onChange={(enabled) => setSystem({ ...system, autoBackup: enabled })}
                        />
                        
                        <div className="py-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Backup Frequency
                          </label>
                          <select
                            value={system.backupFrequency}
                            onChange={(e) => setSystem({ ...system, backupFrequency: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 text-gray-900"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>

                        <div className="py-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data Retention Period
                          </label>
                          <select
                            value={system.dataRetention}
                            onChange={(e) => setSystem({ ...system, dataRetention: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 text-gray-900"
                          >
                            <option value="3months">3 Months</option>
                            <option value="6months">6 Months</option>
                            <option value="1year">1 Year</option>
                            <option value="2years">2 Years</option>
                          </select>
                        </div>

                        <ToggleSwitch
                          label="API Access"
                          description="Enable API access for integrations"
                          enabled={system.apiAccess}
                          onChange={(enabled) => setSystem({ ...system, apiAccess: enabled })}
                        />
                        
                        <ToggleSwitch
                          label="Debug Mode"
                          description="Enable debug mode for troubleshooting"
                          enabled={system.debugMode}
                          onChange={(enabled) => setSystem({ ...system, debugMode: enabled })}
                        />
                      </div>
                    </div>
                  </SettingSection>
                )}
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

export default Settings;