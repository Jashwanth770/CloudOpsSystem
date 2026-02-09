import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../auth/AuthContext';
import { FileText, Upload, Trash2, Download, Eye } from 'lucide-react';

const Documents = () => {
    const { user } = useContext(AuthContext);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploadData, setUploadData] = useState({ title: '', file: null, description: '' });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await api.get('/documents/');
            setDocuments(Array.isArray(response.data) ? response.data : response.data.results || []);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setUploadData({ ...uploadData, file: e.target.files[0] });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', uploadData.title);
        formData.append('file', uploadData.file);
        formData.append('description', uploadData.description);

        try {
            await api.post('/documents/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowModal(false);
            setUploadData({ title: '', file: null, description: '' });
            fetchDocuments();
            alert("Document uploaded successfully!");
        } catch (error) {
            alert('Upload failed: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this document?")) return;
        try {
            await api.delete(`/documents/${id}/`);
            setDocuments(documents.filter(doc => doc.id !== id));
        } catch (error) {
            alert("Delete failed: " + error.message);
        }
    };

    const canUpload = user && ['SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'DEPT_HEAD', 'HR_MANAGER'].some(role => user.role.includes(role));
    // Admin can delete any. Managers can delete their own dept docs.
    const canDelete = (doc) => {
        if (['SYSTEM_ADMIN', 'ADMIN'].includes(user.role)) return true;
        if (user.role.includes('MANAGER') || user.role === 'DEPT_HEAD') {
            return doc.department === user.employee_profile?.department;
        }
        return false;
    };

    if (loading) return <div className="p-6">Loading documents...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
                {canUpload && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Upload size={20} /> Upload Document
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Document</th>
                            <th className="p-4 font-semibold text-gray-600">Department</th>
                            <th className="p-4 font-semibold text-gray-600">Uploaded By</th>
                            <th className="p-4 font-semibold text-gray-600">Date</th>
                            <th className="p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.length === 0 ? (
                            <tr><td colSpan="5" className="p-6 text-center text-gray-500">No documents found.</td></tr>
                        ) : (
                            documents.map((doc) => (
                                <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{doc.title}</p>
                                                <p className="text-sm text-gray-500">{doc.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{doc.department_name}</span></td>
                                    <td className="p-4 text-sm text-gray-600">{doc.uploaded_by?.email}</td>
                                    <td className="p-4 text-sm text-gray-600">{new Date(doc.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 flex gap-2">
                                        <a href={doc.file} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="View">
                                            <Eye size={18} />
                                        </a>
                                        {canDelete(doc) && (
                                            <button onClick={() => handleDelete(doc.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Upload Document</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" required className="mt-1 block w-full rounded-md border p-2" value={uploadData.title} onChange={e => setUploadData({ ...uploadData, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea className="mt-1 block w-full rounded-md border p-2" value={uploadData.description} onChange={e => setUploadData({ ...uploadData, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">File</label>
                                <input type="file" required className="mt-1 block w-full" onChange={handleFileChange} />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;
