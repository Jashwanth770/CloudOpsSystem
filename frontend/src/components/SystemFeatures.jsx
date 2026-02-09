import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, ClipboardList, CheckSquare, Video, FileText, DollarSign, ShieldCheck, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const features = [
    { name: 'Employee Management', icon: Users, path: '/employees', color: 'bg-blue-500', roles: ['ADMIN', 'HR', 'MANAGER', 'HEAD'] },
    { name: 'Attendance Tracking', icon: Calendar, path: '/attendance', color: 'bg-green-500', roles: [] }, // All
    { name: 'Leave Management', icon: ClipboardList, path: '/leaves', color: 'bg-orange-500', roles: [] }, // All
    { name: 'Task Board', icon: CheckSquare, path: '/tasks', color: 'bg-purple-500', roles: [] }, // All
    { name: 'Video Conferencing', icon: Video, path: '/meetings', color: 'bg-pink-500', roles: [] }, // All
    { name: 'Document Storage', icon: FileText, path: '/documents', color: 'bg-yellow-500', roles: [] }, // All
    { name: 'Internal Chat', icon: MessageSquare, path: '/messages', color: 'bg-teal-500', roles: [] }, // All
    { name: 'Finance & Payroll', icon: DollarSign, path: '/finance/payroll', color: 'bg-emerald-600', roles: ['ADMIN', 'ACCOUNTANT', 'FINANCE_MANAGER'] },
    { name: 'Audit Logs', icon: ShieldCheck, path: '/admin/audit-logs', color: 'bg-gray-600', roles: ['ADMIN', 'SYSTEM_ADMIN'] },
];

const SystemFeatures = ({ user }) => {
    // Filter features based on user role
    const visibleFeatures = features.filter(feature => {
        if (!feature.roles || feature.roles.length === 0) return true; // Accessible to all
        return feature.roles.some(role => user?.role === role || user?.role?.includes(role));
    });
    return (
        <div className="mb-8">
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-semibold text-gray-600 mb-4"
            >
                System Modules
            </motion.h2>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            >
                {visibleFeatures.map((feature) => (
                    <motion.div key={feature.name} variants={item}>
                        <Link
                            to={feature.path}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className={`p-3 rounded-full text-white ${feature.color} group-hover:scale-110 transition-transform`}>
                                <feature.icon size={24} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 text-center">{feature.name}</span>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default SystemFeatures;
