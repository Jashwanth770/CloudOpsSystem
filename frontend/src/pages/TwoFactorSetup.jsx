import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShieldCheck, Copy, Check, AlertCircle } from 'lucide-react';

const TwoFactorSetup = () => {
    const [step, setStep] = useState('loading'); // loading, qr, verify, success
    const [qrData, setQrData] = useState(null);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchQR();
    }, []);

    const fetchQR = async () => {
        try {
            const response = await api.get('/auth/2fa/setup/');
            setQrData(response.data);
            setStep('qr');
        } catch (err) {
            if (err.response?.data?.message === "2FA is already enabled.") {
                setStep('success');
            } else {
                setError('Failed to load 2FA setup functionality.');
            }
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/auth/2fa/verify/', { otp });
            setStep('success');
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed. Please try again.');
        }
    };

    const copySecret = () => {
        if (qrData?.secret_key) {
            navigator.clipboard.writeText(qrData.secret_key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const disable2FA = async () => {
        const password = prompt("Enter your password to disable 2FA:");
        if (!password) return;

        try {
            await api.post('/auth/2fa/disable/', { password });
            fetchQR(); // Reset state
            setStep('qr');
            alert("2FA Disabled Successfully");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to disable 2FA");
        }
    };

    if (step === 'loading') return <div className="p-8 text-center text-gray-500">Loading security settings...</div>;

    if (step === 'success') {
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border border-green-100">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">2FA is Enabled</h2>
                    <p className="text-gray-500 mb-6">Your account is secured with two-factor authentication.</p>

                    <button
                        onClick={disable2FA}
                        className="text-red-600 hover:text-red-700 text-sm font-medium underline"
                    >
                        Disable 2FA
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-black">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-indigo-600" />
                Setup Two-Factor Authentication
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Instructions */}
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">1</div>
                        <div>
                            <h3 className="font-medium text-gray-900">Download Authenticator App</h3>
                            <p className="text-sm text-gray-500 mt-1">Install Google Authenticator or Authy on your phone.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">2</div>
                        <div>
                            <h3 className="font-medium text-gray-900">Scan QR Code</h3>
                            <p className="text-sm text-gray-500 mt-1">Open the app and scan the image.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">3</div>
                        <div>
                            <h3 className="font-medium text-gray-900">Enter Code</h3>
                            <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code to verify.</p>
                        </div>
                    </div>
                </div>

                {/* Right: QR and Form */}
                <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-lg text-black">
                    {qrData && (
                        <>
                            <div className="bg-white p-2 rounded shadow-sm mb-4">
                                <img src={qrData.qr_code} alt="2FA QR Code" className="w-48 h-48" />
                            </div>

                            <div className="w-full mb-4">
                                <p className="text-xs text-gray-500 mb-1 text-center">Can't scan? Use this code:</p>
                                <div className="flex items-center gap-2 bg-white border rounded px-2 py-1.5">
                                    <code className="text-xs font-mono flex-1 text-center text-black">{qrData.secret_key}</code>
                                    <button
                                        onClick={copySecret}
                                        className="text-gray-400 hover:text-indigo-600"
                                        title="Copy Secret"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleVerify} className="w-full">
                                <input
                                    type="text"
                                    maxLength="6"
                                    placeholder="000 000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full text-center text-xl tracking-widest py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full mt-3 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 font-medium transition-colors"
                                >
                                    Verify & Enable
                                </button>
                                {error && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1 justify-center">
                                        <AlertCircle className="h-3 w-3" /> {error}
                                    </p>
                                )}
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TwoFactorSetup;
