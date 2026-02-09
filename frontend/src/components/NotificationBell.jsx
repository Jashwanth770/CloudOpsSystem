import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import { Bell, Check, ExternalLink } from 'lucide-react';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = (n) => {
        if (!n.is_read) {
            markAsRead(n.id);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative mr-4" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-300 relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-50 animate-fadeIn">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center transition-colors"
                            >
                                <Check size={14} className="mr-1" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-slate-400 text-sm">
                                No notifications
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-700">
                                {notifications.map((n) => (
                                    <li key={n.id} className={`transition-colors hover:bg-slate-750 ${n.is_read ? 'bg-slate-800 opacity-60' : 'bg-slate-800'}`}>
                                        <div className="block px-4 py-3">
                                            <div className="flex justify-between">
                                                <p className={`text-sm font-medium ${n.is_read ? 'text-slate-400' : 'text-white'}`}>
                                                    {n.title}
                                                </p>
                                                <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                                {n.message}
                                            </p>

                                            {n.link ? (
                                                <Link
                                                    to={n.link}
                                                    onClick={() => handleNotificationClick(n)}
                                                    className="mt-2 inline-flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    View Details <ExternalLink size={10} className="ml-1" />
                                                </Link>
                                            ) : (
                                                !n.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(n.id)}
                                                        className="mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
