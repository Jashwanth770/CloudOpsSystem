import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../auth/AuthContext';
import { AttendanceChart, TaskPerformanceChart } from '../components/analytics/AnalyticsCharts';
import { Users, CheckCircle, Clock, Calendar } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

const Analytics = () => {
    const { user } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState([]);
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, trendsRes, perfRes] = await Promise.all([
                    api.get('/analytics/dashboard_summary/'),
                    api.get('/analytics/attendance_trends/'),
                    api.get('/analytics/task_performance/')
                ]);

                setSummary(summaryRes.data);
                setTrends(trendsRes.data);

                // Format performance data for chart
                const formattedPerf = perfRes.data.map(p => ({
                    name: `${p.assigned_to__user__first_name} ${p.assigned_to__user__last_name}`,
                    completed_count: p.completed_count
                }));
                setPerformance(formattedPerf);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>;

    if (!summary) return <div className="p-8 text-center text-red-500">Failed to load data.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Employees"
                    value={summary.employees.total}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatsCard
                    title="Active Today"
                    value={summary.employees.active_today}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <StatsCard
                    title="Pending Tasks"
                    value={summary.tasks.pending}
                    icon={Clock}
                    color="bg-yellow-500"
                />
                <StatsCard
                    title="Approved Leaves"
                    value={summary.leaves.approved}
                    icon={Calendar}
                    color="bg-purple-500"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttendanceChart data={trends} />
                <TaskPerformanceChart data={performance} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Status Overview</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-sm">Completed</p>
                        <p className="text-xl font-bold text-green-600">{summary.tasks.completed}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-sm">Pending</p>
                        <p className="text-xl font-bold text-yellow-600">{summary.tasks.pending}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-sm">High Priority</p>
                        <p className="text-xl font-bold text-red-600">{summary.tasks.high_priority}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
