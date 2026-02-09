import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../auth/AuthContext';

const Leaves = () => {
    const { user } = useContext(AuthContext);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        leave_type: 'SICK',
        start_date: '',
        end_date: '',
        reason: '',
    });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const response = await api.get('/leaves/');
            const serviceData = response.data.results || response.data;
            setLeaves(Array.isArray(serviceData) ? serviceData : []);
        } catch (error) {
            console.error("Failed to fetch leaves", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveAction = async (id, action) => {
        try {
            await api.post(`/leaves/${id}/${action}/`);
            fetchLeaves();
        } catch (error) {
            console.error(`Failed to ${action} leave`, error);
            alert(`Failed to ${action} leave`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leaves/', formData);
            setShowModal(false);
            fetchLeaves();
            setFormData({ leave_type: 'SICK', start_date: '', end_date: '', reason: '' });
        } catch (error) {
            console.error("Failed to apply for leave", error);
            // Show alert for better UX
            alert("Failed to apply for leave. Please check your data.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Leave Application Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Apply for Leave
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {leaves.map((leave) => (
                        <li key={leave.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-indigo-600">{leave.leave_type}</p>
                                    <p className="text-sm text-gray-500">{leave.start_date} to {leave.end_date}</p>
                                    <p className="text-sm text-gray-500 mt-1">{leave.reason}</p>
                                </div>
                                <div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {leave.status}
                                        </span>
                                        {/* Managers and HR/Admin can approve/reject pending leaves */}
                                        {['ADMIN', 'HR', 'MANAGER'].includes(user?.role) && leave.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleLeaveAction(leave.id, 'approve')}
                                                    className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleLeaveAction(leave.id, 'reject')}
                                                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">Apply Leave</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                                <select
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700"
                                    value={formData.leave_type}
                                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                >
                                    <option value="SICK">Sick Leave</option>
                                    <option value="CASUAL">Casual Leave</option>
                                    <option value="ANNUAL">Annual Leave</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
                                <input
                                    type="date"
                                    required
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Reason</label>
                                <textarea
                                    required
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="mr-2 px-4 py-2 text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaves;
