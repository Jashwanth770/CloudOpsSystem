import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const AttendanceChart = ({ data }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-80">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Trends (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" name="Present Employees" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const TaskPerformanceChart = ({ data }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-80">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performers (Completed Tasks)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed_count" fill="#82ca9d" name="Tasks Completed" barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
