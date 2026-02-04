import React, { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, ClipboardList, CheckSquare, LogOut } from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: Home, path: '/', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Employees', icon: Users, path: '/employees', roles: ['ADMIN', 'HR', 'MANAGER'] },
        { name: 'Attendance', icon: Calendar, path: '/attendance', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Leaves', icon: ClipboardList, path: '/leaves', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Tasks', icon: CheckSquare, path: '/tasks', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-indigo-800 text-white">
                <div className="p-4">
                    <h1 className="text-2xl font-bold">CloudOps</h1>
                </div>
                <nav className="mt-4">
                    {navItems.filter(item => item.roles.includes(user?.role)).map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="flex items-center px-4 py-3 hover:bg-indigo-700 transition-colors"
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 hover:bg-indigo-700 transition-colors text-left"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow p-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Welcome, {user?.first_name}</h2>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {user?.role}
                    </span>
                </header>
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
