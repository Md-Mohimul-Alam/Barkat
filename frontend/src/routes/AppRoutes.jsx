// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Unauthorized from '../pages/Unauthorized';

// Import all your components...
import AdminDashboard from '../pages/dashboards/AdminDashboard';
import ManagerDashboard from '../pages/dashboards/ManagerDashboard';
import EmployeeDashboard from '../pages/dashboards/EmployeesDashboard';
import BranchList from '../components/branches/BranchList';
import BranchForm from '../components/branches/BranchForm';
import EmployeeForm from '../components/employees/EmployeeForm';
import EmployeeList from '../components/employees/EmployeeList';
import ClientForm from '../components/clients/ClientForm';
import ClientList from '../components/clients/ClientList';
import CNFForm from '../components/cnf/CNFForm';
import CNFList from '../components/cnf/CNFList';
import LoadingPointForm from '../components/loading/LoadingPointForm';
import LoadingPointList from '../components/loading/LoadingPointList';
import UnloadingPointForm from '../components/unload/UnloadingPointForm';
import UnloadingPointList from '../components/unload/UnloadingPointList';
import DueCard from '../components/dues/DueCard';
import DueForm from '../components/dues/DueForm';
import DueList from '../components/dues/DueList';
import CalculatorPage from '../components/Calculator/CalculatorPage';
import Settings from '../pages/Settings';
import BankForm from '../components/banks/BankForm';
import Statements from '../components/banks/statements';
import BankTransactionForm from '../components/banks/BankTransactionForm';
import BankTransactionView from '../components/banks/BankTransectionList';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes with Role-based Access */}
      <Route 
        path="/app/admin-dashboard" 
        element={
          <PrivateRoute rolesAllowed={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/manager-dashboard" 
        element={
          <PrivateRoute rolesAllowed={['admin', 'manager']}>
            <ManagerDashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/employee-dashboard" 
        element={
          <PrivateRoute rolesAllowed={['admin', 'manager', 'employee']}>
            <EmployeeDashboard />
          </PrivateRoute>
        } 
      />

      {/* Branch Routes */}
      <Route 
        path="/app/branches" 
        element={
          <PrivateRoute>
            <BranchList />
          </PrivateRoute>
        }
      />
      <Route 
        path="/app/branches/add" 
        element={
          <PrivateRoute rolesAllowed={['admin', 'manager']}>
            <BranchForm />
          </PrivateRoute>
        } 
      />

      {/* CNF Routes - Restricted to Admin/Manager */}
      <Route 
        path="/app/cnfs/add" 
        element={
          <PrivateRoute rolesAllowed={['admin', 'manager']}>
            <CNFForm />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/cnfs" 
        element={
          <PrivateRoute rolesAllowed={['admin', 'manager']}>
            <CNFList />
          </PrivateRoute>
        } 
      />

      {/* Client Routes */}
      <Route 
        path="/app/clients/add" 
        element={
          <PrivateRoute>
            <ClientForm />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/clients" 
        element={
          <PrivateRoute>
            <ClientList />
          </PrivateRoute>
        } 
      />

      {/* Employee Routes - Restricted to Admin/Manager */}
      <Route 
        path="/app/employees/add" 
        element={
          <PrivateRoute rolesAllowed={['admin', 'manager']}>
            <EmployeeForm />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/employees" 
        element={
          <PrivateRoute rolesAllowed={['admin', 'manager']}>
            <EmployeeList />
          </PrivateRoute>
        } 
      />

      {/* Due Routes */}
      <Route 
        path="/app/dues/add" 
        element={
          <PrivateRoute>
            <DueForm />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/dues/edit/:id" 
        element={
          <PrivateRoute>
            <DueForm />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/dues" 
        element={
          <PrivateRoute>
            <DueList />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/dues/card/:id" 
        element={
          <PrivateRoute>
            <DueCard />
          </PrivateRoute>
        } 
      />
      
      {/* Bank Routes - Restricted to Admin/Manager */}
      <Route 
        path="/app/banks/add" 
        element={
          <PrivateRoute rolesAllowed={['admin', 'manager']}>
            <BankForm />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/banks/statements" 
        element={
          <PrivateRoute rolesAllowed={['admin', 'manager']}>
            <Statements />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/banks/transactions/add" 
        element={
          <PrivateRoute rolesAllowed={['admin', 'manager']}>
            <BankTransactionForm />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/banks/transactions/list" 
        element={
          <PrivateRoute rolesAllowed={['admin', 'manager']}>
            <BankTransactionView />
          </PrivateRoute>
        } 
      />

      {/* Loading/Unloading Points */}
      <Route 
        path="/app/loading-points/add" 
        element={
          <PrivateRoute>
            <LoadingPointForm />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/loading-points/list" 
        element={
          <PrivateRoute>
            <LoadingPointList />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/unloading-points/add" 
        element={
          <PrivateRoute>
            <UnloadingPointForm />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/app/unloading-points/list" 
        element={
          <PrivateRoute>
            <UnloadingPointList />
          </PrivateRoute>
        } 
      />

      {/* Settings - All authenticated users */}
      <Route 
        path="/app/settings" 
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } 
      />

      {/* Calculator - All authenticated users */}
      <Route 
        path="/app/calculator/CalculatorPage" 
        element={
          <PrivateRoute>
            <CalculatorPage />
          </PrivateRoute>
        } 
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;