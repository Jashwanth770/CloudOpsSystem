import React from 'react';
import { DollarSign, Receipt, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinanceDashboard = ({ user, stats }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-green-100 rounded-full mr-4">
                        <DollarSign className="text-green-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Payroll Status</p>
                        <p className="text-xl font-bold text-gray-800">Ready</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-red-100 rounded-full mr-4">
                        <Receipt className="text-red-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pending Expenses</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.pendingExpenses || 0}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Finance Actions</h3>
                <div className="flex gap-4 flex-wrap">
                    <Link to="/finance/payroll" className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                        Run Payroll
                    </Link>
                    <Link to="/finance/expenses" className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                        Process Claims
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
