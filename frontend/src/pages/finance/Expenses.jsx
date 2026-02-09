import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';
import { Receipt, Check, X, Plus } from 'lucide-react';

const Expenses = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '', amount: '', category: 'TRAVEL'
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await api.get('/finance/expenses/');
            setExpenses(response.data.results || []);
        } catch (error) {
            console.error("Failed to fetch expenses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/finance/expenses/', formData);
            setShowModal(false);
            fetchExpenses();
            alert("Expense Claim Submitted!");
        } catch (error) {
            alert("Failed to submit claim.");
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.post(`/finance/expenses/${id}/approve/`);
            fetchExpenses();
        } catch (error) {
            alert("Failed to approve.");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Receipt className="mr-2" /> Expense Claims
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center"
                >
                    <Plus size={18} className="mr-1" /> New Claim
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            {(user.role === 'MANAGER' || user.role === 'ACCOUNTANT') && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {expenses.map((expense) => (
                            <tr key={expense.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{expense.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100">{expense.category}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">${expense.amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full 
                                        ${expense.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            expense.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'}`}>
                                        {expense.status}
                                    </span>
                                </td>
                                {(user.role === 'MANAGER' || user.role === 'ACCOUNTANT') && expense.status === 'PENDING' && (
                                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                                        <button onClick={() => handleApprove(expense.id)} className="text-green-600 hover:text-green-900" title="Approve">
                                            <Check size={18} />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900" title="Reject">
                                            <X size={18} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {expenses.length === 0 && !loading && <div className="p-4 text-center text-gray-500">No expense claims found.</div>}
            </div>

            {/* New Claim Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Submit Expense Claim</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text" placeholder="Description (e.g., Client Lunch)"
                                className="w-full border p-2 rounded" required
                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                            <select
                                className="w-full border p-2 rounded"
                                value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="TRAVEL">Travel</option>
                                <option value="FOOD">Food</option>
                                <option value="EQUIPMENT">Equipment</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <input
                                type="number" placeholder="Amount ($)" step="0.01"
                                className="w-full border p-2 rounded" required
                                value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
