import React from 'react';
import { ClipboardList, Calendar, CheckSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = ({ user, stats }) => {
    return (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                        <CheckSquare className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pending Tasks</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.pendingTasks || 0}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-green-100 rounded-full mr-4">
                        <Calendar className="text-green-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Attendance</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.attendancePercentage || 0}%</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full mr-4">
                        <Clock className="text-purple-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Leave Balance</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.leaveBalance || 0}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="flex gap-4 flex-wrap">
                    <Link to="/attendance" className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                        Mark Attendance
                    </Link>
                    <Link to="/leaves" className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                        Apply Leave
                    </Link>
                    <Link to="/finance/expenses" className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                        File Expense Claim
                    </Link>
                </div>
            </div>

            {/* Recent Activity or Tasks Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">My Tasks</h3>
                    <div className="text-gray-500 text-sm">
                        No urgent tasks assigned.
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Announcements</h3>
                    <div className="text-gray-500 text-sm">
                        Welcome to the new CloudOps Dashboard!
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
