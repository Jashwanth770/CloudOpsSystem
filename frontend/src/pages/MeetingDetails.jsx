import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FileAudio, Upload, Play, CheckCircle, FileText, List, ArrowLeft, Loader2 } from 'lucide-react';

const MeetingDetails = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();
    const [meeting, setMeeting] = useState(null);
    const [recording, setRecording] = useState(null);
    const [transcript, setTranscript] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [taskCreating, setTaskCreating] = useState(null); // ID of action item being converted

    useEffect(() => {
        fetchMeetingDetails();
    }, [meetingId]);

    const fetchMeetingDetails = async () => {
        try {
            const res = await api.get(`/meetings/${meetingId}/`);
            setMeeting(res.data);
            if (res.data.recording) {
                setRecording(res.data.recording);
                if (res.data.recording.transcript) {
                    setTranscript(res.data.recording.transcript);
                }
            }
        } catch (error) {
            console.error("Failed to fetch meeting details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await api.post(`/meetings/${meetingId}/upload_recording/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setRecording(res.data);
            alert("Recording uploaded successfully!");
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload recording.");
        } finally {
            setUploading(false);
        }
    };

    const processRecording = async () => {
        setProcessing(true);
        try {
            const res = await api.post(`/meetings/${meetingId}/process/`);
            alert("Processing complete!");
            fetchMeetingDetails(); // Refresh to get transcript/AI insights
        } catch (error) {
            console.error("Processing failed", error);
            alert("Failed to process recording.");
        } finally {
            setProcessing(false);
        }
    };

    const convertToTask = async (actionItem) => {
        setTaskCreating(actionItem.id);

        // Prompt for assigned_to (For demo, we might need a list of employees, 
        // but for now let's just ask for an ID or pick the first available if not robust UI)
        // Ideally, we should have a dropdown. For now, I'll hardcode or ask user to input ID.
        // To make it better, let's fetch employees first? 
        // For simplicity in this step, let's assume we pass the CURRENT USER as the assignee or just ask for an ID.
        // Wait, the backend requires `assigned_to` (Employee ID).

        // Let's implement a simple prompt for Employee ID for now to verify functionality.
        const employeeId = prompt("Enter Employee ID to assign this task to:", "1");
        if (!employeeId) {
            setTaskCreating(null);
            return;
        }

        try {
            await api.post(`/meetings/action_items/${actionItem.id}/convert/`, {
                assigned_to: employeeId,
                priority: 'MEDIUM',
                due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow
            });
            alert("Task created successfully!");
            fetchMeetingDetails(); // Refresh to update UI
        } catch (error) {
            console.error("Failed to create task", error);
            alert("Failed to create task.");
        } finally {
            setTaskCreating(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!meeting) return <div className="p-8 text-center">Meeting not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/meetings')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{meeting.title}</h1>
                    <p className="text-gray-500">Host: {meeting.host_name} • {new Date(meeting.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Recording Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileAudio className="text-indigo-600" />
                    Recording
                </h2>

                {!recording ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                        <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-gray-600 mb-4">Upload meeting recording (MP3, WAV, etc.)</p>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="hidden"
                            id="recording-upload"
                        />
                        <label
                            htmlFor="recording-upload"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 inline-block"
                        >
                            {uploading ? 'Uploading...' : 'Select File'}
                        </label>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <FileAudio className="text-indigo-600" size={32} />
                            <div>
                                <p className="font-medium text-gray-900">Recording Uploaded</p>
                                <p className="text-sm text-gray-500">{new Date(recording.uploaded_at).toLocaleString()}</p>
                            </div>
                            <div className="ml-auto">
                                {!recording.processed && (
                                    <button
                                        onClick={processRecording}
                                        disabled={processing}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                                    >
                                        {processing ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                                        {processing ? 'Processing...' : 'Generate Insights'}
                                    </button>
                                )}
                                {recording.processed && (
                                    <span className="text-green-600 flex items-center gap-1 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                        <CheckCircle size={16} />
                                        Processed
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Insights Section */}
            {transcript && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Summary */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="text-purple-600" />
                            Summary
                        </h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {transcript.summary || "No summary available."}
                        </p>
                    </div>

                    {/* Action Items */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <List className="text-blue-600" />
                            Action Items
                        </h2>
                        {transcript.action_items && transcript.action_items.length > 0 ? (
                            <ul className="space-y-4">
                                {transcript.action_items.map((item) => (
                                    <li key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-gray-800 mb-2">{item.description}</p>
                                        {item.task ? (
                                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                <CheckCircle size={12} />
                                                Task Created
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => convertToTask(item)}
                                                disabled={taskCreating === item.id}
                                                className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                                            >
                                                {taskCreating === item.id ? 'Creating...' : '+ Create Task'}
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">No action items detected.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Full Transcript (Collapsible or Bottom) */}
            {transcript && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Full Transcript</h2>
                    <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {transcript.content}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingDetails;
