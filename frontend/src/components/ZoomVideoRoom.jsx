import React, { useEffect, useRef, useState, useContext } from 'react';
import ZoomVideo from '@zoom/videosdk';
import { AuthContext } from '../auth/AuthContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from 'lucide-react';

const ZoomVideoRoom = ({ signature, topic, userName, onLeave }) => {
    const [client, setClient] = useState(null);
    const [inSession, setInSession] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [mediaStream, setMediaStream] = useState(null);
    const videoCanvasRef = useRef(null);

    // Initialize Zoom SDK
    useEffect(() => {
        const init = async () => {
            const client = ZoomVideo.createClient();
            setClient(client);

            try {
                await client.init('en-US', 'CDN');

                await client.join(topic, signature, userName);
                setInSession(true);

                const stream = client.getMediaStream();
                setMediaStream(stream);

                // Attach video to canvas
                if (videoCanvasRef.current) {
                    await stream.startVideo();
                    await stream.renderVideo(videoCanvasRef.current, client.getCurrentUserInfo().userId, 960, 540, 0, 0, 3);
                }

                await stream.startAudio();

            } catch (e) {
                console.error('Zoom join error', e);
            }
        };

        if (signature && topic) {
            init();
        }

        return () => {
            if (client) {
                ZoomVideo.destroyClient();
            }
        };
    }, [signature, topic]);

    const toggleMute = async () => {
        if (mediaStream) {
            if (isMuted) {
                await mediaStream.unmuteAudio();
            } else {
                await mediaStream.muteAudio();
            }
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = async () => {
        if (mediaStream) {
            if (isVideoOff) {
                await mediaStream.startVideo();
                await mediaStream.renderVideo(videoCanvasRef.current, client.getCurrentUserInfo().userId, 960, 540, 0, 0, 3);
            } else {
                await mediaStream.stopVideo();
            }
            setIsVideoOff(!isVideoOff);
        }
    };

    const leaveSession = async () => {
        if (client) {
            await client.leave();
            setInSession(false);
            if (onLeave) onLeave();
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden relative">
            <div className="flex-1 relative flex items-center justify-center p-4">
                <canvas
                    ref={videoCanvasRef}
                    className="w-full h-full rounded-lg bg-black"
                    style={{ width: '100%', height: '100%' }}
                />
                {!inSession && (
                    <div className="absolute text-white">Connecting to Zoom...</div>
                )}
            </div>

            <div className="bg-gray-800 p-4 flex justify-center gap-6">
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition ${isMuted ? 'bg-red-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition ${isVideoOff ? 'bg-red-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
                >
                    {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>

                <button
                    onClick={leaveSession}
                    className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                >
                    <PhoneOff size={24} />
                </button>
            </div>
        </div>
    );
};

export default ZoomVideoRoom;
