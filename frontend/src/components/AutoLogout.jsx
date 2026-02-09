import React, { useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';

const AutoLogout = ({ timeout = 15 * 60 * 1000 }) => { // Default 15 mins
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const timerRef = useRef(null);

    useEffect(() => {
        if (!user) return; // Only track if logged in

        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(handleLogout, timeout);
        };

        const handleLogout = () => {
            logout();
            navigate('/login');
            alert("Session expired due to inactivity.");
        };

        const events = ['mousemove', 'keydown', 'click', 'scroll'];

        // Initial set
        resetTimer();

        // Add listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [user, logout, navigate, timeout]);

    return null; // Render nothing
};

export default AutoLogout;
