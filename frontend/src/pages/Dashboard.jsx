import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import { motion } from 'framer-motion';
import SystemFeatures from '../components/SystemFeatures';

// Import Role-Based Components
import EmployeeDashboard from './dashboard/EmployeeDashboard';
import ManagerDashboard from './dashboard/ManagerDashboard';
import HRDashboard from './dashboard/HRDashboard';
import FinanceDashboard from './dashboard/FinanceDashboard';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch relevant stats based on role
                // For now, using a generic stats endpoint or mocking
                const response = await api.get('/analytics/dashboard-stats/');
                setStats(response.data);
            } catch (error) {
                // console.error("Failed to fetch dashboard stats", error);
                // Fallback stats for demo or just ignore if 403
                setStats(prev => ({
                    ...prev,
                    pendingTasks: Math.floor(Math.random() * 10), // Simulate change
                    attendancePercentage: 92,
                    leaveBalance: 12,
                    teamSize: 8,
                    pendingApprovals: 3,
                    totalEmployees: 45,
                    totalDepartments: 6,
                    pendingExpenses: 2
                }));
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats(); // Initial fetch
            const interval = setInterval(fetchStats, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user?.role]);

    if (loading) return <div className="p-6">Loading Dashboard...</div>;

    const renderDashboard = () => {
        switch (user?.role) {
            case 'SYSTEM_ADMIN':
            case 'OFFICE_ADMIN':
            case 'HR_MANAGER':
            case 'HR_EXEC':
            case 'RECRUITER':
                return <HRDashboard user={user} stats={stats} />;

            case 'MANAGER':
            case 'TEAM_LEAD':
            case 'PROJECT_MANAGER':
            case 'DEPT_HEAD':
            case 'OPERATIONS_MANAGER':
            case 'SALES_MANAGER':
            case 'MARKETING_MANAGER':
            case 'SUPPORT_MANAGER':
                return <ManagerDashboard user={user} stats={stats} />;

            case 'ACCOUNTANT':
            case 'FINANCE_MANAGER':
                return <FinanceDashboard user={user} stats={stats} />;

            default:
                // Default to Employee Dashboard for engineers, execs, etc.
                return <EmployeeDashboard user={user} stats={stats} />;
        }
    };

    return (
        <div className="p-6">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-2xl font-bold text-gray-800 mb-2"
            >
                Good Morning, {user?.first_name}!
            </motion.h1>
            <p className="text-gray-500 mb-8">Here's what's happening today.</p>

            <SystemFeatures user={user} />

            {renderDashboard()}
        </div>
    );
};

export default Dashboard;
