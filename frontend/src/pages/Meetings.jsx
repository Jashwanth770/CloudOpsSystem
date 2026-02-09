import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Video, Plus, Link as LinkIcon, Copy, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Meetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const fetchMeetings = async () => {
        try {
            const res = await api.get('/meetings/');
            // Handle pagination (DRF returns { count, next, previous, results: [...] })
            setMeetings(Array.isArray(res.data) ? res.data : res.data.results || []);
        } catch (error) {
            console.error("Failed to fetch meetings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const createMeeting = async () => {
        setCreating(true);
        const title = prompt("Enter meeting title:", "Team Sync");
        if (!title) {
            setCreating(false);
            return;
        }

        try {
            const res = await api.post('/meetings/', { title });
            setMeetings([res.data, ...meetings]);
            // alert(`Meeting Created! Link: ${window.location.origin}/meet/${res.data.room_id}`);
        } catch (error) {
            alert("Failed to create meeting");
        } finally {
            setCreating(false);
        }
    };

    const copyLink = (roomId) => {
        const link = `${window.location.origin}/meet/${roomId}`;
        navigator.clipboard.writeText(link);
        alert("Link copied to clipboard!");
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Video Conferences</h1>
                <button
                    onClick={createMeeting}
                    disabled={creating}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    {creating ? 'Creating...' : 'New Meeting'}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading meetings...</div>
            ) : meetings.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
                    <Video size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No meetings yet</h3>
                    <p className="text-gray-500 mb-6">Create a new video conference to collaborate with your team.</p>
                    <button onClick={createMeeting} className="text-indigo-600 font-medium hover:text-indigo-800">
                        Create your first meeting
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {meetings.map((meeting) => (
                        <div key={meeting.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                                    <Video size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{meeting.title}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        Host: {meeting.host_name} • Created: {new Date(meeting.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {meeting.is_active ? (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                        LIVE
                                    </span>
                                ) : (
                                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-bold">
                                        ENDED
                                    </span>
                                )}
                                <button
                                    onClick={() => copyLink(meeting.room_id)}
                                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Copy Link"
                                >
                                    <Copy size={20} />
                                </button>
                                {meeting.is_active && (
                                    <Link
                                        to={`/meet/${meeting.room_id}`}
                                        target="_blank"
                                        className="flex items-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium"
                                    >
                                        Join
                                        <ExternalLink size={16} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Meetings;
