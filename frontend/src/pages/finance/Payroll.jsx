import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';
import { DollarSign, Users, Calculator, CheckCircle } from 'lucide-react';

const Payroll = () => {
    const { user } = useAuth();
    const [salaryStructures, setSalaryStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [formData, setFormData] = useState({
        basic_salary: '', hra: '', allowances: '', deductions: ''
    });

    useEffect(() => {
        fetchSalaryStructures();
    }, []);

    const fetchSalaryStructures = async () => {
        try {
            const response = await api.get('/finance/salary-structures/');
            setSalaryStructures(response.data.results || []);
        } catch (error) {
            console.error("Failed to fetch salaries", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/finance/salary-structures/', {
                employee: selectedEmployee,
                ...formData
            });
            setShowModal(false);
            fetchSalaryStructures();
            alert("Salary Structure Created!");
        } catch (error) {
            alert("Failed to create salary structure.");
        }
    };

    if (loading) return <div>Loading Payroll Data...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <DollarSign className="mr-2" /> Payroll Management
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    + Set Salary Structure
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HRA</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowances</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {salaryStructures.map((sal) => (
                            <tr key={sal.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{sal.employee}</td>
                                <td className="px-6 py-4 whitespace-nowrap">${sal.basic_salary}</td>
                                <td className="px-6 py-4 whitespace-nowrap">${sal.hra}</td>
                                <td className="px-6 py-4 whitespace-nowrap">${sal.allowances}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-red-500">-${sal.deductions}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">${sal.net_salary}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Simple Modal for Demo */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Set Salary Structure</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input
                                type="text" placeholder="Employee ID (e.g., 1)"
                                className="w-full border p-2 rounded"
                                value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Basic" className="border p-2 rounded"
                                    value={formData.basic_salary} onChange={e => setFormData({ ...formData, basic_salary: e.target.value })} />
                                <input type="number" placeholder="HRA" className="border p-2 rounded"
                                    value={formData.hra} onChange={e => setFormData({ ...formData, hra: e.target.value })} />
                                <input type="number" placeholder="Allowances" className="border p-2 rounded"
                                    value={formData.allowances} onChange={e => setFormData({ ...formData, allowances: e.target.value })} />
                                <input type="number" placeholder="Deductions" className="border p-2 rounded"
                                    value={formData.deductions} onChange={e => setFormData({ ...formData, deductions: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payroll;
