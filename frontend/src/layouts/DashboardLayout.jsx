import React, { useContext, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, ClipboardList, CheckSquare, LogOut, Lock, X, Menu, TrendingUp, Video, Mail, ArrowLeft, ShieldCheck, DollarSign, Receipt, FileText } from 'lucide-react';
import api from '../api/axios';
import NotificationBell from '../components/NotificationBell';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await api.put('/auth/change-password/', passwords);
            alert("Password changed successfully!");
            setShowPasswordModal(false);
            setPasswords({ old_password: '', new_password: '' });
        } catch (error) {
            alert('Failed to change password: ' + (JSON.stringify(error.response?.data) || error.message));
        }
    };

    const navItems = [
        { name: 'Dashboard', icon: Home, path: '/dashboard', roles: [] }, // Empty roles = All
        { name: 'Employees', icon: Users, path: '/employees', roles: ['ADMIN', 'HR', 'MANAGER', 'HEAD'] },
        { name: 'Attendance', icon: Calendar, path: '/attendance', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'ENGINEER', 'EXEC', 'OFFICER'] },
        { name: 'Leaves', icon: ClipboardList, path: '/leaves', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'ENGINEER', 'EXEC', 'OFFICER'] },
        { name: 'Tasks', icon: CheckSquare, path: '/tasks', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'ENGINEER', 'EXEC', 'OFFICER'] },
        { name: 'Documents', icon: ClipboardList, path: '/documents', roles: ['ADMIN', 'MANAGER', 'HEAD', 'EMPLOYEE', 'ENGINEER', 'EXEC', 'OFFICER'] },
        { name: 'Meetings', icon: Video, path: '/meetings', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'ENGINEER', 'EXEC', 'OFFICER'] },
        { name: 'Messages', icon: Mail, path: '/messages', roles: [] },
        // Finance Module
        { name: 'Payroll', icon: DollarSign, path: '/finance/payroll', roles: ['ADMIN', 'ACCOUNTANT', 'FINANCE_MANAGER'] },
        { name: 'Expenses', icon: Receipt, path: '/finance/expenses', roles: [] },
        { name: 'Payslips', icon: FileText, path: '/finance/payslips', roles: [] }, // All
        // Admin
        { name: 'Audit Logs', icon: ShieldCheck, path: '/admin/audit-logs', roles: ['ADMIN', 'SYSTEM_ADMIN'] },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-indigo-800 text-white">
            <div className="p-4 flex justify-between items-center">
                <Link to="/dashboard" className="text-2xl font-bold hover:text-indigo-200 transition-colors">CloudOps</Link>
                {/* Close button for mobile */}
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white hover:text-gray-300">
                    <X size={24} />
                </button>
            </div>
            <nav className="mt-4 flex-1">
                {navItems.filter(item => {
                    // Empty roles = All users
                    if (!item.roles || item.roles.length === 0) return true;

                    // Check if user has any of the allowed roles (substring match)
                    return item.roles.some(allowedRole => user?.role?.includes(allowedRole) || user?.role === allowedRole);
                }).map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center px-4 py-3 hover:bg-indigo-700 transition-colors ${location.pathname === item.path ? 'bg-indigo-900 border-l-4 border-indigo-400' : ''}`}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                    </Link>
                ))}
                {(user?.role?.includes('ADMIN') || user?.role?.includes('HR')) && (
                    // Analytics removed as per user request
                    null
                )}
            </nav>
            <div className="p-4 border-t border-indigo-700">
                <button
                    onClick={() => { setShowPasswordModal(true); setIsSidebarOpen(false); }}
                    className="w-full flex items-center px-4 py-2 hover:bg-indigo-700 transition-colors text-left rounded mb-2 text-sm"
                >
                    <Lock className="w-4 h-4 mr-3" />
                    Change Password
                </button>
                <Link
                    to="/2fa-setup"
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full flex items-center px-4 py-2 hover:bg-indigo-700 transition-colors text-left rounded mb-2 text-sm"
                >
                    <ShieldCheck className="w-4 h-4 mr-3" />
                    2FA Security
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 hover:bg-indigo-700 transition-colors text-left rounded text-sm text-red-200 hover:text-white"
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-800 animate-slide-in-left">
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow p-4 flex justify-between items-center z-10">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="mr-4 text-gray-500 hover:text-gray-700 md:hidden foco:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            <Menu size={24} />
                        </button>

                        {location.pathname !== '/' && (
                            <button
                                onClick={() => navigate(-1)}
                                className="mr-4 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                                title="Go Back"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}

                        <h2 className="text-xl font-semibold text-gray-800 truncate">
                            {location.pathname === '/dashboard' ? 'Dashboard' : location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.substring(2)}
                        </h2>
                    </div>
                    <div className="flex items-center">
                        <NotificationBell />
                        <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                            {user?.role}
                        </span>
                        <div
                            className="bg-indigo-100 rounded-full h-8 w-8 flex items-center justify-center text-indigo-800 font-bold text-sm cursor-pointer hover:bg-indigo-200 transition-colors"
                            onClick={() => {
                                if (user?.employee_id) {
                                    window.open(`/employees?id=${user.employee_id}`, '_blank');
                                } else {
                                    alert("Profile not found or you are not an employee.");
                                }
                            }}
                            title="View My Profile"
                        >
                            {user?.first_name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    {children}
                </main>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 animate-fade-in">
                    {/* Backdrop */}
                    <div className="absolute inset-0" onClick={() => setShowPasswordModal(false)}></div>

                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative z-10 animate-scale-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Change Password</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Old Password</label>
                                <input
                                    type="password"
                                    required
                                    className="mt-1 block w-full rounded-md border p-2 w-full"
                                    value={passwords.old_password}
                                    onChange={e => setPasswords({ ...passwords, old_password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="mt-1 block w-full rounded-md border p-2 w-full"
                                    value={passwords.new_password}
                                    onChange={e => setPasswords({ ...passwords, new_password: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium w-full">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
