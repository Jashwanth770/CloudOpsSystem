import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../auth/AuthContext';
import { CheckCircle, Clock, AlertCircle, Plus, X, Eye, Trash2 } from 'lucide-react';

const Tasks = () => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null); // For details modal

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        due_date: '',
        priority: 'MEDIUM',
        assigned_to: ''
    });

    // Permissions
    // "Delete: restricts only the admin and only manager not every manager"
    const canDeleteTask = user && ['SYSTEM_ADMIN', 'OFFICE_ADMIN', 'MANAGER', 'ADMIN'].includes(user.role);

    // Assign: System Admins, HR, and all Management roles
    const canAssignTask = user && (
        ['SYSTEM_ADMIN', 'OFFICE_ADMIN', 'HR_MANAGER', 'MANAGER', 'TEAM_LEAD', 'PROJECT_MANAGER', 'DEPT_HEAD', 'ADMIN'].includes(user.role) ||
        user.role?.includes('ADMIN') || user.role?.includes('MANAGER') // Fallback/Broad check for assigning
    );

    useEffect(() => {
        fetchTasks();
        if (canAssignTask) {
            fetchEmployees();
        }
    }, [user]);

    const fetchTasks = async () => {
        try {
            // Add timestamp to prevent caching
            const response = await api.get(`/tasks/?_=${new Date().getTime()}`);
            const serviceData = response.data.results || response.data;
            setTasks(Array.isArray(serviceData) ? serviceData : []);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees/');
            const serviceData = response.data.results || response.data;
            setEmployees(Array.isArray(serviceData) ? serviceData : []);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks/', newTask);
            setShowCreateModal(false);
            setNewTask({ title: '', description: '', due_date: '', priority: 'MEDIUM', assigned_to: '' });
            fetchTasks();
        } catch (error) {
            alert('Failed to create task: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
        }
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}/`, { status: newStatus });
            // Update local state
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask({ ...selectedTask, status: newStatus });
            }
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleDeleteTask = async (e, taskId) => {
        e.stopPropagation(); // Prevent opening details modal
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await api.delete(`/tasks/${taskId}/`);
            setTasks(tasks.filter(t => t.id !== taskId));
            if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask(null);
            }
            alert("Task deleted successfully");
        } catch (error) {
            alert("Failed to delete task: " + (error.response?.data?.detail || error.message));
        }
    };

    if (loading) return <div className="p-6">Loading tasks...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
                {canAssignTask && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus size={20} /> Assign Task
                    </button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map(task => (
                    <div key={task.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer relative" onClick={() => setSelectedTask(task)}>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold text-gray-900 pr-2">{task.title}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                    {task.priority}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{task.description}</p>
                        </div>

                        {canDeleteTask && (
                            <button
                                onClick={(e) => handleDeleteTask(e, task.id)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-1"
                                title="Delete Task"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}

                        <div className="space-y-2 pt-4 border-t border-gray-50">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Assigned To:</span>
                                <span className="font-medium text-gray-700">
                                    {task.assigned_to_name || (typeof task.assigned_to === 'object' ? task.assigned_to.name : 'ID: ' + task.assigned_to)}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Due:</span>
                                <span>{task.due_date}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Status:</span>
                                <span className={`capitalize font-medium px-2 py-0.5 rounded ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>{task.status.replace('_', ' ')}</span>
                            </div>
                            <button className="text-indigo-600 text-xs font-medium mt-2 flex items-center gap-1">
                                <Eye size={14} /> View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {tasks.length === 0 && (
                <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
                    <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p>No tasks assigned yet.</p>
                </div>
            )}

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Assign New Task</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" required className="mt-1 block w-full rounded-md border p-2" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea required className="mt-1 block w-full rounded-md border p-2" rows="3" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                    <input type="date" required className="mt-1 block w-full rounded-md border p-2" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                                    <select className="mt-1 block w-full rounded-md border p-2" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Assign To</label>
                                <select required className="mt-1 block w-full rounded-md border p-2" value={newTask.assigned_to} onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })}>
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.user_details?.first_name} {emp.user_details?.last_name} ({emp.designation})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg">Assign Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Details Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 animate-fade-in">
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0" onClick={() => setSelectedTask(null)}></div>

                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 animate-scale-up overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-gray-900 truncate max-w-[200px]" title={selectedTask.title}>{selectedTask.title}</h2>
                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${selectedTask.priority === 'HIGH' ? 'bg-red-100 text-red-800' : selectedTask.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                    {selectedTask.priority}
                                </span>
                            </div>
                            <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                                <Clock size={16} />
                                <span>Due: {new Date(selectedTask.due_date).toLocaleDateString()}</span>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
                                <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {selectedTask.description}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div>
                                    <span className="text-xs text-gray-500 block mb-1">Current Status</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${selectedTask.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                        selectedTask.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {selectedTask.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    {/* Only the assigned employee can update status */}
                                    {user?.employee_id === selectedTask.assigned_to && (
                                        <>
                                            {selectedTask.status !== 'IN_PROGRESS' && selectedTask.status !== 'COMPLETED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(selectedTask.id, 'IN_PROGRESS')}
                                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium shadow-sm transition-colors"
                                                >
                                                    Start Task
                                                </button>
                                            )}
                                            {selectedTask.status !== 'COMPLETED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(selectedTask.id, 'COMPLETED')}
                                                    className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-medium shadow-sm transition-colors"
                                                >
                                                    Mark Complete
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
