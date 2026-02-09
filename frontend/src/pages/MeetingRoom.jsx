import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JitsiVideoRoom from '../components/JitsiVideoRoom';
import { AuthContext } from '../auth/AuthContext';
import api from '../api/axios';

const MeetingRoom = () => {
    const { roomId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isValid, setIsValid] = useState(null);
    const [meetingTitle, setMeetingTitle] = useState('');
    const [userName, setUserName] = useState('');
    const [isHost, setIsHost] = useState(false);

    useEffect(() => {
        // Validate room
        const checkRoom = async () => {
            try {
                const res = await api.get(`/meetings/validate/${roomId}/`);
                if (res.data.valid) {
                    setIsValid(true);
                    setMeetingTitle(res.data.title);
                    setIsHost(res.data.is_host);
                    // Use user's name or a default
                    setUserName(user ? `${user.first_name} ${user.last_name}` : 'Guest');
                } else if (res.data.reason === 'ended') {
                    setIsValid('ended');
                } else {
                    setIsValid(false);
                }
            } catch (error) {
                console.error("Invalid room", error);
                // Check if the backend returned a specific reason even with 404 (optional if we changed 404 behavior, but views.py returns 200 for 'ended' now?) 
                // Wait, views.py returns 200 for 'ended' (valid: False), so it falls into the 'else' above if not handled.
                // But for 404 Not Found, it throws error.
                if (error.response && error.response.data && error.response.data.reason === 'ended') {
                    setIsValid('ended');
                } else {
                    setIsValid(false);
                }
            }
        };
        checkRoom();
    }, [roomId, user]);

    const handleLeave = () => {
        navigate('/meetings');
    };

    const handleEndMeeting = async () => {
        if (window.confirm("Are you sure you want to END this meeting for everyone?")) {
            try {
                await api.post(`/meetings/${roomId}/end_meeting/`);
            } catch (err) {
                console.warn("Could not end meeting:", err);
                alert("Failed to end meeting. Backend error: " + (err.response?.data?.detail || err.message));
            }
            navigate('/meetings');
        }
    };

    if (isValid === null) return <div className="flex items-center justify-center h-screen text-white">Validating Meeting Link...</div>;

    if (isValid === 'ended') return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white gap-4">
            <h1 className="text-3xl font-bold text-red-500">Meeting Ended</h1>
            <p className="text-gray-400">The host has ended this meeting.</p>
            <button
                onClick={() => navigate('/meetings')}
                className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded font-bold"
            >
                Back to Dashboard
            </button>
        </div>
    );

    if (isValid === false) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white gap-4">
            <h1 className="text-3xl font-bold text-red-500">Invalid Meeting Link</h1>
            <p className="text-gray-400">This meeting room does not exist.</p>
            <button
                onClick={() => navigate('/meetings')}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded font-bold"
            >
                Go Back
            </button>
        </div>
    );

    return (
        <div className="h-screen w-full bg-gray-900 flex flex-col">
            <div className="bg-indigo-900 text-white p-4 flex justify-between items-center shadow-md z-10">
                <div>
                    <h1 className="text-xl font-bold">{meetingTitle}</h1>
                    <p className="text-xs text-indigo-200">Room ID: {roomId}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.open(`https://meet.jit.si/CloudOps-${roomId}`, '_blank')}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
                    >
                        <span>🚀</span> Open Unlimited (New Tab)
                    </button>
                    {/* End Meeting button for host to deactivate the meeting in DB */}
                    {isHost && (
                        <button onClick={handleEndMeeting} className="bg-red-800 hover:bg-red-900 px-4 py-2 rounded text-sm font-bold border border-red-600">
                            End Meeting
                        </button>
                    )}
                    <button onClick={handleLeave} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm font-bold">
                        Leave
                    </button>
                </div>
            </div>

            <div className="flex-1 relative">
                <JitsiVideoRoom
                    roomName={`CloudOps-${roomId}`}
                    displayName={userName}
                    onLeave={handleLeave}
                />
            </div>
        </div>
    );
};

export default MeetingRoom;
