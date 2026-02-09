import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Import API for direct calls

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [otpMessage, setOtpMessage] = useState('');

    const handleSendOtp = async (channel) => {
        try {
            setOtpMessage(`Sending OTP via ${channel}...`);
            await api.post('/auth/login/send-otp/', { email, channel });
            setOtpMessage(`OTP sent successfully to your ${channel}.`);
        } catch (err) {
            console.error("Failed to send OTP:", err);
            setOtpMessage('');
            setError("Failed to send OTP. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setOtpMessage('');
        try {
            await login(email, password, showOtp ? otp : null);
            navigate('/dashboard');
        } catch (err) {
            console.error("Login failed:", err);
            if (err.response) {
                console.log("Error Response Data:", err.response.data);
                console.log("Error Response Status:", err.response.status);
            }
            if (err.response && err.response.data) {
                const data = err.response.data;
                const errors = data.errors || {};

                console.log("Checking 2FA Signal...", { data, errors });

                // Check for 2FA_REQUIRED signal in various locations
                const is2FARequired =
                    data.code === '2FA_REQUIRED' || // Top level code
                    (Array.isArray(data.non_field_errors) && data.non_field_errors[0]?.code === '2FA_REQUIRED') || // DRF standard
                    (errors.code && Array.isArray(errors.code) && errors.code.includes('2FA_REQUIRED')) || // Array check
                    (errors.code === '2FA_REQUIRED') || // String check
                    (data.message && data.message.includes('OTP sent')); // Message content check

                console.log("is2FARequired:", is2FARequired);

                if (is2FARequired) {
                    setShowOtp(true);
                    // Use message from backend if available (e.g. "OTP sent to your email")
                    const msg = data.message || (errors.message ? errors.message[0] : 'Please enter your 2FA code.');
                    setError(msg);
                    return;
                }

                const msg = data.detail || data.error || data.message || (typeof data === 'string' ? data : 'Invalid credentials');
                setError(msg);
            } else if (err.message === "Network Error") {
                setError("Network Error: Unable to connect to backend");
            } else {
                setError('Invalid credentials');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {showOtp ? 'Verify Identity' : 'Sign in'}
                    </h2>
                    {showOtp && <p className="mt-2 text-sm text-gray-600">Enter the code from your Authenticator App, Email, or SMS.</p>}
                </div>

                {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">{error}</div>}
                {otpMessage && <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded border border-green-100">{otpMessage}</div>}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {!showOtp ? (
                        <>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mt-3"
                            />
                        </>
                    ) : (
                        <div>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 6-digit code"
                                maxLength="6"
                                required
                                autoFocus
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-xl tracking-widest mt-3"
                            />
                            <div className="mt-4 flex justify-between space-x-2">
                                <button
                                    type="button"
                                    onClick={() => handleSendOtp('email')}
                                    className="flex-1 py-1 px-2 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100"
                                >
                                    Resend Email OTP
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSendOtp('sms')}
                                    className="flex-1 py-1 px-2 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100"
                                >
                                    Resend SMS OTP
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-5"
                    >
                        {showOtp ? 'Verify' : 'Sign in'}
                    </button>

                    {showOtp && (
                        <button
                            type="button"
                            onClick={() => { setShowOtp(false); setOtp(''); setError(''); setOtpMessage(''); }}
                            className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500 mt-2"
                        >
                            Back to Login
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;
