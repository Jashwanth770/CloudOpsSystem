import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Cloud, Zap, Users, Lock, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white font-sans">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <Cloud className="w-8 h-8 text-indigo-400" />
                    <span className="text-2xl font-bold tracking-tight">CloudOps</span>
                </div>
                <div className="flex gap-4">
                    {user ? (
                        <Link to="/dashboard" className="px-5 py-2 rounded-full border border-indigo-400 text-indigo-100 hover:bg-indigo-800 transition-all font-medium flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                    ) : (
                        <Link to="/login" className="px-5 py-2 rounded-full border border-indigo-400 text-indigo-100 hover:bg-indigo-800 transition-all font-medium">Log In</Link>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <header className="max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="lg:w-1/2 space-y-8"
                >
                    <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">CloudOps</span>
                    </h1>
                    <p className="text-xl text-indigo-200 leading-relaxed max-w-lg">
                        <strong>Our Aim:</strong> To provide a secure, unified platform that streamlines employee management, finance, and operations for modern enterprises.
                    </p>
                    <div className="flex gap-4">
                        {user ? (
                            <Link to="/dashboard" className="group px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                                Go to Dashboard <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <Link to="/login" className="group px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                                Get Started <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="lg:w-1/2 relative"
                >
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <img
                        src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt="Dashboard Preview"
                        className="rounded-2xl shadow-2xl border border-indigo-700 relative z-10 rotate-2 hover:rotate-0 transition-transform duration-500"
                    />
                </motion.div>
            </header>

            {/* Features Section */}
            <section className="bg-indigo-950 py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why CloudOps?</h2>
                        <p className="text-indigo-300">Enterprise-grade tools built for modern teams.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: ShieldCheck, title: "Bank-Grade Security", desc: "AES-256 encryption, 2FA, and Audit Logs ensure your data is safe." },
                            { icon: Zap, title: "Real-Time Collaboration", desc: "Video conferencing, instant messaging, and task boards." },
                            { icon: Users, title: "HR & Finance", desc: "Automated payroll, leave tracking, and employee management." }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                viewport={{ once: true }}
                                className="bg-indigo-900/50 p-8 rounded-2xl border border-indigo-800 hover:bg-indigo-800/80 transition-colors"
                            >
                                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-indigo-300">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-indigo-800 py-12 text-center text-indigo-400">
                <p>&copy; 2026 CloudOps Systems. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
