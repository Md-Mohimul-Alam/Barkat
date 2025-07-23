import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/Login';
import Unauthorized from '../pages/Unauthorized';


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
import DueCard from '../components/dues/DueCard'; // Assuming this is the correct path for DueCard component
import DueForm from '../components/dues/DueForm';
import DueList from '../components/dues/DueList';
import CalculatorPage from '../components/Calculator/CalculatorPage'; // Assuming this is the correct path for the calculator page

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
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Role-based Dashboard to default page */}
      <Route path="/app/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/app/manager-dashboard" element={<ManagerDashboard />} />
      <Route path="/app/employee-dashboard" element={<EmployeeDashboard />} />

      {/* Private Routes */}
      <Route path="/app/branches" element={<BranchList />}/>
      <Route path="/app/branches/add" element={<BranchForm  />} />

      <Route path="/app/clients/add" element={<ClientForm />} />
      <Route path="/app/clients" element={<ClientList />} />
      <Route path="/app/cnfs/add" element={<CNFForm />} />
      <Route path="/app/cnfs" element={<CNFList />} />
      <Route path="/app/employees/add" element={<EmployeeForm />} />
      <Route path="/app/employees" element={<EmployeeList />} />
      <Route path="/app/dues/add" element={<DueForm />} />
      <Route path="/app/dues/edit/:id" element={<DueForm />} />
      <Route path="/app/dues" element={<DueList />} />
      <Route path="/app/dues/card/:id" element={<DueCard />} />
      
      <Route path="/app/banks/add" element={<BankForm />} />
      <Route path="/app/banks/statements" element={<Statements />} />
      <Route path="/app/banks/transactions/add" element={<BankTransactionForm />} />
      <Route path='/app/banks/transactions/list' element={<BankTransactionView />} />
      <Route path="/app/loading-points/add" element={<LoadingPointForm />} />
      <Route path="/app/loading-points/list" element={<LoadingPointList />} />

      <Route path="/app/calculator/CalculatorPage" element={<CalculatorPage />} />
      
     
    </Routes>
  );
};

export default AppRoutes;
