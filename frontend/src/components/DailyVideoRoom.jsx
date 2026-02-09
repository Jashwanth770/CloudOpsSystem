import React, { useEffect, useState, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';

const DailyVideoRoom = ({ roomUrl, onLeave }) => {
    const callWrapperRef = useRef(null);
    const [callObject, setCallObject] = useState(null);

    useEffect(() => {
        if (!roomUrl || !callWrapperRef.current) return;

        // Validation: Must be a Daily.co URL
        const isDailyUrl = roomUrl.includes('.daily.co/');
        if (!isDailyUrl) {
            console.error("Invalid Daily.co URL:", roomUrl);
            alert("Error: Please provide a valid Daily.co room URL (e.g., https://your-domain.daily.co/room-name)");
            if (onLeave) onLeave();
            return;
        }

        try {
            // Create the call object
            const newCallObject = DailyIframe.createFrame(callWrapperRef.current, {
                iframeStyle: {
                    height: '100%',
                    width: '100%',
                    aspectRatio: '16/9',
                    minWidth: '100%',
                    maxWidth: '100%',
                    border: '0',
                    borderRadius: '12px',
                },
                showLeaveButton: true,
                showFullscreenButton: true,
            });

            newCallObject.join({ url: roomUrl })
                .catch(e => {
                    console.error("Daily Join Error:", e);
                    alert("Failed to join meeting. Please check the URL.");
                    if (onLeave) onLeave();
                });

            setCallObject(newCallObject);

            // Event listeners
            newCallObject.on('left-meeting', () => {
                if (onLeave) onLeave();
            });

            newCallObject.on('error', (e) => {
                console.error("Daily Internal Error", e);
            });

            return () => {
                newCallObject.destroy();
            };
        } catch (error) {
            console.error("Daily Creation Error:", error);
        }
    }, [roomUrl]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 rounded-xl overflow-hidden relative">
            {!roomUrl && (
                <div className="text-white text-center p-6">
                    <h2 className="text-xl font-bold mb-4">Ready to Join?</h2>
                    <p className="mb-4 text-gray-400">Waiting for a valid Daily.co Room URL...</p>
                </div>
            )}
            <div ref={callWrapperRef} className="w-full h-full" />
        </div>
    );
};

export default DailyVideoRoom;
