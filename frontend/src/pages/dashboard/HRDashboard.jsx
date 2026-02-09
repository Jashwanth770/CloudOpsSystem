import React from 'react';
import { Users, UserPlus, Briefcase, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const HRDashboard = ({ user, stats }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-indigo-100 rounded-full mr-4">
                        <Users className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Employees</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.totalEmployees || 0}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                        <Building2 className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Departments</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.totalDepartments || 0}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">HR Operations</h3>
                <div className="flex gap-4 flex-wrap">
                    <Link to="/employees" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center">
                        <UserPlus size={18} className="mr-2" /> Add Employee
                    </Link>
                    <Link to="/attendance" className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                        Attendance Reports
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
