import React from 'react';
import { Users, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManagerDashboard = ({ user, stats }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-indigo-100 rounded-full mr-4">
                        <Users className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Team Size</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.teamSize || 0}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-full mr-4">
                        <AlertCircle className="text-yellow-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pending Approvals</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.pendingApprovals || 0}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Management</h3>
                <div className="flex gap-4 flex-wrap">
                    <Link to="/leaves" className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
                        Approve Leaves
                    </Link>
                    <Link to="/finance/expenses" className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
                        Approve Expenses
                    </Link>
                    <Link to="/tasks" className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                        Assign Tasks
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
