import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../auth/AuthContext';
import { User, Mail, Phone, Briefcase, Plus, X, Trash2 } from 'lucide-react';

const Employees = () => {
    const { user } = useContext(AuthContext);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]); // Restoring missing state
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [newEmp, setNewEmp] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        department: '', // Changed from department_name to department (ID)
        designation: '',
        phone_number: '',
        joining_date: '',
        role: 'SOFTWARE_ENGINEER' // New default
    });

    // Safe check for role to prevent crashes if user or role is missing
    const canAddEmployee = user?.role && (
        ['SYSTEM_ADMIN', 'OFFICE_ADMIN', 'HR_MANAGER', 'HR_EXEC', 'RECRUITER', 'PAYROLL_OFFICER'].includes(user.role) ||
        user.role.includes('MANAGER') ||
        user.role.includes('HEAD') ||
        user.role.includes('ADMIN') ||
        user.role.includes('HR')
    );

    const canDeleteEmployee = user?.role && (
        ['SYSTEM_ADMIN', 'OFFICE_ADMIN', 'HR_MANAGER', 'HR_EXEC'].includes(user.role) ||
        (user.role.includes('ADMIN') && !user.role.includes('OFFICE')) // Explicitly ensuring Admin check is robust
    );

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
    }, []);

    // Filter employees based on URL param
    const filteredEmployees = employees.filter(emp => {
        const searchParams = new URLSearchParams(window.location.search);
        const filterId = searchParams.get('id');
        if (filterId) return emp.id.toString() === filterId;
        return true;
    });

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees/');
            setEmployees(Array.isArray(response.data) ? response.data : response.data.results || []);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/employees/departments/');
            setDepartments(Array.isArray(response.data) ? response.data : response.data.results || []);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            await api.post('/employees/', newEmp);
            setShowModal(false);
            setNewEmp({
                first_name: '', last_name: '', email: '', password: '',
                department: '', designation: '', phone_number: '',
                joining_date: '', role: 'SOFTWARE_ENGINEER'
            });
            fetchEmployees();
            alert("Employee added successfully!");
        } catch (error) {
            alert('Failed to add employee: ' + (JSON.stringify(error.response?.data) || error.message));
        }
    };

    const rolesList = {
        "Administration": ["SYSTEM_ADMIN", "OFFICE_ADMIN"],
        "HR": ["HR_EXEC", "HR_MANAGER", "RECRUITER", "PAYROLL_OFFICER"],
        "Management": ["MANAGER", "TEAM_LEAD", "PROJECT_MANAGER", "DEPT_HEAD"],
        "Engineering": ["SOFTWARE_ENGINEER", "BACKEND_DEV", "FRONTEND_DEV", "DEVOPS", "QA_ENGINEER"],
        "Finance": ["ACCOUNTANT", "FINANCE_MANAGER"],
        "Operations": ["OPERATIONS_EXEC", "OPERATIONS_MANAGER"],
        "Sales": ["SALES_EXEC", "SALES_MANAGER"],
        "Marketing": ["MARKETING_EXEC", "MARKETING_MANAGER"],
        "Customer Support": ["SUPPORT_EXEC", "SUPPORT_MANAGER"]
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm("Are you sure you want to remove this employee? This action cannot be undone.")) return;
        try {
            await api.delete(`/employees/${id}/`);
            setEmployees(employees.filter(emp => emp.id !== id));
            alert("Employee removed successfully.");
        } catch (error) {
            alert("Failed to delete employee: " + error.message);
        }
    };

    if (loading) return <div className="p-6">Loading employees...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
                {canAddEmployee && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Employee
                    </button>
                )}
            </div>



            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEmployees.map((emp) => (
                    <div key={emp.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative group">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4 font-bold text-xl relative group">
                            {emp.user?.first_name?.[0]}{emp.user?.last_name?.[0]}
                        </div>
                        {canDeleteEmployee && (
                            <button
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
                                title="Remove Employee"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">{emp.user?.first_name} {emp.user?.last_name}</h3>
                        <p className="text-gray-500 text-xs mb-1 font-mono bg-gray-100 px-2 py-0.5 rounded-full inline-block">{emp.employee_id || 'ID Pending'}</p>
                        <p className="text-indigo-600 text-sm mb-4 font-medium">{emp.designation}</p>

                        <div className="w-full space-y-3 text-sm text-gray-600 text-left bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Briefcase size={16} className="text-gray-400" />
                                <span className="font-medium">{emp.department_details?.name || 'No Dept'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-gray-400" />
                                <span className="truncate" title={emp.user?.email}>{emp.user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-gray-400" />
                                <span className="truncate">{emp.phone_number}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Employee Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Add New Employee</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" required className="mt-1 block w-full rounded-md border p-2" value={newEmp.first_name} onChange={e => setNewEmp({ ...newEmp, first_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" required className="mt-1 block w-full rounded-md border p-2" value={newEmp.last_name} onChange={e => setNewEmp({ ...newEmp, last_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" required className="mt-1 block w-full rounded-md border p-2" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input type="password" required className="mt-1 block w-full rounded-md border p-2" value={newEmp.password} onChange={e => setNewEmp({ ...newEmp, password: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                <select
                                    className="mt-1 block w-full rounded-md border p-2"
                                    value={newEmp.department}
                                    onChange={e => setNewEmp({ ...newEmp, department: e.target.value })}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Designation</label>
                                <input type="text" required className="mt-1 block w-full rounded-md border p-2" value={newEmp.designation} onChange={e => setNewEmp({ ...newEmp, designation: e.target.value })} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    className="mt-1 block w-full rounded-md border p-2"
                                    value={newEmp.role}
                                    onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}
                                >
                                    {Object.entries(rolesList).map(([category, roles]) => (
                                        <optgroup key={category} label={category}>
                                            {roles.map(role => (
                                                <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input type="tel" className="mt-1 block w-full rounded-md border p-2" value={newEmp.phone_number} onChange={e => setNewEmp({ ...newEmp, phone_number: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                                <input type="date" required className="mt-1 block w-full rounded-md border p-2" value={newEmp.joining_date} onChange={e => setNewEmp({ ...newEmp, joining_date: e.target.value })} />
                            </div>

                            <div className="col-span-full flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Employee</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
