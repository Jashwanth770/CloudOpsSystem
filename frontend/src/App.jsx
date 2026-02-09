import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './auth/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Leaves from './pages/Leaves';
import Attendance from './pages/Attendance';
import Tasks from './pages/Tasks';
import Employees from './pages/Employees';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Meetings from './pages/Meetings';
import MeetingRoom from './pages/MeetingRoom';
import Documents from './pages/Documents';
import Messages from './pages/Messages';
import AuditLogs from './pages/admin/AuditLogs';
import Payroll from './pages/finance/Payroll';
import Expenses from './pages/finance/Expenses';
import Payslips from './pages/finance/Payslips';

import TwoFactorSetup from './pages/TwoFactorSetup';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};


import { NotificationProvider } from './context/NotificationContext';

import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/audit-logs" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AuditLogs />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/2fa-setup" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TwoFactorSetup />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/leaves" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Leaves />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/attendance" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Attendance />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Tasks />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/employees" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Employees />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            {/* Analytics Route removed as per request */}
            <Route path="/meetings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Meetings />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/meet/:roomId" element={<MeetingRoom />} />
            <Route path="/documents" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Documents />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Messages />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            {/* Finance Module */}
            <Route path="/finance/payroll" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Payroll />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/finance/expenses" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Expenses />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/finance/payslips" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Payslips />
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
