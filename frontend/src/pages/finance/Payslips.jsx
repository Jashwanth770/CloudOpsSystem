import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';
import { FileText, Download } from 'lucide-react';

const Payslips = () => {
    const { user } = useAuth();
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayslips();
    }, []);

    const fetchPayslips = async () => {
        try {
            const response = await api.get('/finance/payslips/');
            setPayslips(response.data.results || []);
        } catch (error) {
            console.error("Failed to fetch payslips", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FileText className="mr-2" /> My Payslips
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {payslips.map((slip) => (
                    <div key={slip.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{slip.month} {slip.year}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${slip.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {slip.status}
                                </span>
                            </div>
                            <FileText className="text-indigo-500" size={24} />
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex justify-between">
                                <span>Total Earnings:</span>
                                <span className="font-medium">${slip.total_earnings}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Deductions:</span>
                                <span className="text-red-500">-${slip.total_deductions}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t font-bold text-gray-800">
                                <span>Net Pay:</span>
                                <span className="text-green-600">${slip.net_pay}</span>
                            </div>
                        </div>
                        <button className="w-full flex items-center justify-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition-colors">
                            <Download size={16} className="mr-2" /> Download PDF
                        </button>
                    </div>
                ))}
            </div>
            {payslips.length === 0 && !loading && (
                <div className="text-center text-gray-500 mt-10">No payslips found.</div>
            )}
        </div>
    );
};

export default Payslips;
