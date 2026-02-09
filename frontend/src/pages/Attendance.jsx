import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../auth/AuthContext';
import { Clock, LogIn, LogOut } from 'lucide-react';

const Attendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [status, setStatus] = useState(null); // 'checked_in' or 'checked_out'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Attendance Component Mounted");
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await api.get('/attendance/');
            // Handle pagination (response.data.results) or fall back to response.data if generic list
            const serviceData = response.data.results || response.data;

            // Ensure we have an array
            const dataArray = Array.isArray(serviceData) ? serviceData : [];
            setAttendance(dataArray);

            // Determine current status from the latest record
            const todayStr = new Date().toISOString().split('T')[0];
            const todayRecord = dataArray.find(r => r.date === todayStr);

            if (todayRecord && !todayRecord.clock_out) {
                setStatus('checked_in');
            } else {
                setStatus('checked_out');
            }
        } catch (error) {
            console.error("Failed to fetch attendance", error);
            setAttendance([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClockIn = async () => {
        try {
            await api.post('/attendance/clock_in/');
            fetchAttendance();
        } catch (error) {
            console.error("Clock in failed", error);
            alert("Clock in failed: " + (error.response?.data?.error || "Unknown error"));
        }
    };

    const handleClockOut = async () => {
        try {
            await api.post('/attendance/clock_out/');
            fetchAttendance();
        } catch (error) {
            console.error("Clock out failed", error);
            alert("Clock out failed: " + (error.response?.data?.error || "Unknown error"));
        }
    };

    if (loading) return <div>Loading...</div>;

    const { user } = useContext(AuthContext);
    const isManagerOrAdmin = user && ['ADMIN', 'HR', 'MANAGER'].includes(user.role);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Today's Action</h2>
                    <p className="text-gray-500">Mark your attendance for today.</p>
                </div>
                <div className="space-x-4">
                    {status !== 'checked_in' ? (
                        <button
                            onClick={handleClockIn}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <LogIn size={20} /> Clock In
                        </button>
                    ) : (
                        <button
                            onClick={handleClockOut}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                            <LogOut size={20} /> Clock Out
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {isManagerOrAdmin && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {attendance.map((record) => (
                                <tr key={record.id}>
                                    {isManagerOrAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {record.employee_name || 'N/A'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {record.clock_in ? new Date(record.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {record.clock_out ? new Date(record.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
