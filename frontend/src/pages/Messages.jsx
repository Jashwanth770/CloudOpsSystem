import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../auth/AuthContext';
import { Mail, Send, Trash2, Edit, CheckCircle, Archive, Reply, X, Paperclip, User } from 'lucide-react';

const Messages = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('inbox');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showCompose, setShowCompose] = useState(false);
    const [users, setUsers] = useState([]);
    const [contactFiles, setContactFiles] = useState([]);

    // Compose State
    const [composeData, setComposeData] = useState({
        recipient: '',
        recipient_email: '',
        isExternal: false,
        subject: '',
        body: ''
    });

    useEffect(() => {
        fetchMessages();
    }, [activeTab]); // Remove showCompose dependency

    const handleComposeClick = () => {
        setShowCompose(true);
        fetchUsers();
    };

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'sent' ? '/messages/sent/' : '/messages/';
            const response = await api.get(endpoint);
            setMessages(Array.isArray(response.data) ? response.data : response.data.results || []);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            // First try valid user endpoint
            let userList = [];
            try {
                const response = await api.get('/auth/users/');
                userList = Array.isArray(response.data) ? response.data : (response.data.results || []);
            } catch (e) {
                // Fallback to employees
                console.log("Auth users failed/empty, trying employees", e);
                const empResponse = await api.get('/employees/');
                userList = Array.isArray(empResponse.data) ? empResponse.data : (empResponse.data.results || []);
            }
            setUsers(userList);
        } catch (error) {
            console.error("Failed to fetch users", error);
            setUsers([]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setContactFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index) => {
        setContactFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            if (composeData.isExternal) {
                formData.append('recipient_email', composeData.recipient_email);
            } else {
                formData.append('recipient', composeData.recipient);
            }
            formData.append('subject', composeData.subject);
            formData.append('body', composeData.body);

            contactFiles.forEach(file => {
                formData.append('uploads', file);
            });

            await api.post('/messages/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setShowCompose(false);
            setComposeData({ recipient: '', recipient_email: '', isExternal: false, subject: '', body: '' });
            setContactFiles([]);
            alert("Message sent!");
            if (activeTab === 'sent') fetchMessages();
        } catch (error) {
            alert("Failed to send: " + (error.response?.data?.error || error.message));
        }
    };

    const handleRead = async (msg) => {
        setSelectedMessage(msg);
        if (!msg.is_read && activeTab === 'inbox') {
            try {
                await api.post(`/messages/${msg.id}/mark_read/`);
                // Update local state
                setMessages(messages.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
            } catch (error) {
                console.error("Failed to mark read", error);
            }
        }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col flex-shrink-0">
                <div className="p-4">
                    <button
                        type="button"
                        onClick={handleComposeClick}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 font-medium transition-colors"
                    >
                        <Edit size={18} /> Compose
                    </button>
                </div>
                <nav className="flex-1 px-2 space-y-1">
                    <button
                        onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
                        className={`w-full flex items-center px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'inbox' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Mail size={18} className="mr-3" /> Inbox
                    </button>
                    <button
                        onClick={() => { setActiveTab('sent'); setSelectedMessage(null); }}
                        className={`w-full flex items-center px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'sent' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Send size={18} className="mr-3" /> Sent
                    </button>
                </nav>
            </div>

            {/* Message List */}
            <div className={`w-80 border-r border-gray-100 flex flex-col ${selectedMessage ? 'hidden md:flex' : 'flex-1'}`}>
                <div className="p-4 border-b border-gray-100 bg-white">
                    <h2 className="font-semibold text-gray-800 capitalize">{activeTab}</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : messages.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No messages found.</div>
                    ) : (
                        messages.map(msg => (
                            <div
                                key={msg.id}
                                onClick={() => handleRead(msg)}
                                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMessage?.id === msg.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''} ${!msg.is_read && activeTab === 'inbox' ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm ${!msg.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                        {activeTab === 'inbox' ? (msg.sender_details?.email || 'Unknown') : (msg.recipient_details?.email || 'Unknown')}
                                    </h4>
                                    <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleDateString()}</span>
                                </div>
                                <h5 className="text-sm font-medium text-gray-800 truncate mb-1">{msg.subject}</h5>
                                <p className="text-xs text-gray-500 truncate">{msg.body}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Message Detail */}
            <div className={`flex-1 flex flex-col bg-white ${selectedMessage ? 'flex' : 'hidden md:flex'}`}>
                {selectedMessage ? (
                    <>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h2>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                        {(activeTab === 'inbox' ? selectedMessage.sender_details?.first_name : selectedMessage.recipient_details?.first_name)?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 flex items-center gap-2">
                                            {activeTab === 'inbox' ? `From: ${selectedMessage.sender_details?.email}` : `To: ${selectedMessage.recipient_details?.email}`}

                                            {(activeTab === 'inbox' ? selectedMessage.sender_details?.employee_id : selectedMessage.recipient_details?.employee_id) && (
                                                <a
                                                    href={`/employees?id=${activeTab === 'inbox' ? selectedMessage.sender_details?.employee_id : selectedMessage.recipient_details?.employee_id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full hover:bg-indigo-100 flex items-center gap-1 border border-indigo-200"
                                                >
                                                    <User size={12} /> View Profile
                                                </a>
                                            )}
                                        </p>
                                        <p className="text-gray-400">{new Date(selectedMessage.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            {activeTab === 'inbox' && (
                                <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="Reply">
                                    <Reply size={20} />
                                </button>
                            )}
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto">
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedMessage.body}</p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <Mail size={48} className="mb-4 text-gray-200" />
                        <p>Select a message to read</p>
                    </div>
                )}
            </div>

            {/* Compose Modal */}
            {showCompose && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">New Message</h2>
                            <button onClick={() => setShowCompose(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSendMessage} className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="msgType"
                                        checked={!composeData.isExternal}
                                        onChange={() => setComposeData({ ...composeData, isExternal: false, recipient: '', recipient_email: '' })}
                                        className="text-indigo-600"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Internal User</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="msgType"
                                        checked={composeData.isExternal}
                                        onChange={() => setComposeData({ ...composeData, isExternal: true, recipient: '', recipient_email: '' })}
                                        className="text-indigo-600"
                                    />
                                    <span className="text-sm font-medium text-gray-700">External Email</span>
                                </label>
                            </div>

                            {!composeData.isExternal ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">To (Internal)</label>
                                    <select
                                        required={!composeData.isExternal}
                                        className="mt-1 block w-full rounded-md border p-2"
                                        value={composeData.recipient}
                                        onChange={e => setComposeData({ ...composeData, recipient: e.target.value })}
                                    >
                                        <option value="">Select Colleague</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.user?.id || u.id}>
                                                {u.user?.email || u.email || `${u.first_name || ''} ${u.last_name || ''}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">To (Email Address)</label>
                                    <input
                                        type="email"
                                        required={composeData.isExternal}
                                        placeholder="client@example.com"
                                        className="mt-1 block w-full rounded-md border p-2"
                                        value={composeData.recipient_email}
                                        onChange={e => setComposeData({ ...composeData, recipient_email: e.target.value })}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subject</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border p-2"
                                    value={composeData.subject}
                                    onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    required
                                    rows="6"
                                    className="mt-1 block w-full rounded-md border p-2"
                                    value={composeData.body}
                                    onChange={e => setComposeData({ ...composeData, body: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                                <div className="flex items-center gap-3">
                                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                        <Paperclip size={18} />
                                        <span className="text-sm font-medium">Attach Files</span>
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <span className="text-sm text-gray-500">
                                        {contactFiles.length > 0 ? `${contactFiles.length} file(s) selected` : 'No files attached'}
                                    </span>
                                </div>
                                {contactFiles.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {contactFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
                                                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCompose(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Discard</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                    <Send size={18} /> Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
