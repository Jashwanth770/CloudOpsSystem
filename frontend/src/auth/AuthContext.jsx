import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
// import { jwtDecode } from 'jwt-decode';

// I didn't install jwt-decode in npm install step. I should fallback to simple parsing or install it. 
// I'll add `npm install jwt-decode` to next step or use simple decode.
// Actually, I can just rely on the user info returned from login if available, but decoding token is better.
// I will implement without jwt-decode for now to avoid dependency error, or just decode base64.
// Better to install it. I'll add a step to install it.

// For now, I'll store user object in local storage or fetch profile.

export const AuthContext = createContext();
export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => { // Verify token valid or load user
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await api.get('/auth/profile/');
                    setUser(response.data);
                } catch (error) {
                    localStorage.removeItem('access_token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password, otp = null) => {
        const payload = { email, password };
        if (otp) payload.otp = otp;

        const response = await api.post('/auth/login/', payload);
        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        // Fetch user profile immediately
        const userRes = await api.get('/auth/profile/');
        setUser(userRes.data);
        return userRes.data;
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
