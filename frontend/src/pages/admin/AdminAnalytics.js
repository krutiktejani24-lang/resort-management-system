import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { analyticsService } from '../../services/api';

function formatINR(value) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)}Cr`;
  if (abs >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)}L`;
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

export default function AdminAnalytics() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: revenueData, isLoading: revLoading } = useQuery({
    queryKey: ['revenueReport', year],
    queryFn: () => analyticsService.getRevenue({ year }),
  });

  const { data: occupancyData, isLoading: occLoading } = useQuery({
    queryKey: ['occupancyReport'],
    queryFn: () => analyticsService.getOccupancy({}),
  });

  const monthlyData = revenueData?.data?.data || [];
  const occupancy = occupancyData?.data?.data || [];

  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);
  const totalBookings = monthlyData.reduce((s, m) => s + m.bookings, 0);
  const totalGuests = monthlyData.reduce((s, m) => s + m.guests, 0);
  const avgMonthly = totalRevenue / (monthlyData.filter(m => m.revenue > 0).length || 1);

  const years = [2022, 2023, 2024, 2025, 2026];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Comprehensive revenue and occupancy insights</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="input-field w-32"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Annual Revenue', value: formatINR(totalRevenue), sub: `Year ${year}` },
          { label: 'Total Bookings', value: totalBookings, sub: 'All year' },
          { label: 'Total Guests', value: totalGuests, sub: 'All year' },
          { label: 'Avg Monthly Revenue', value: formatINR(avgMonthly), sub: 'Per month' },
        ].map(card => (
          <div key={card.label} className="bg-white shadow-resort p-6">
            <p className="text-2xl font-display font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{card.label}</p>
            <p className="text-xs text-resort-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white shadow-resort p-6 mb-6">
        <h2 className="font-display text-lg font-semibold text-gray-900 mb-6">
          Monthly Revenue — {year}
        </h2>
        {revLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-resort-200 border-t-resort-600 rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatINR(v)} />
              <Tooltip
                formatter={(value) => [formatINR(value),'Revenue']}
                contentStyle={{ borderRadius: 0, border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bookings & Guests Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-resort p-6">
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-6">Monthly Bookings</h2>
          {revLoading ? (
            <div className="h-48 animate-pulse bg-gray-50" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 0, fontSize: 12 }} />
                <Bar dataKey="bookings" fill="#16a34a" radius={[2,2,0,0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white shadow-resort p-6">
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-6">Guest Traffic</h2>
          {revLoading ? (
            <div className="h-48 animate-pulse bg-gray-50" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 0, fontSize: 12 }} />
                <Line type="monotone" dataKey="guests" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} name="Guests" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Room Occupancy Table */}
      <div className="bg-white shadow-resort p-6">
        <h2 className="font-display text-lg font-semibold text-gray-900 mb-6">Room Occupancy</h2>
        {occLoading ? (
          <div className="h-48 animate-pulse bg-gray-50" />
        ) : occupancy.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No occupancy data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-resort">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Room Number</th>
                  <th>Status</th>
                  <th>Total Bookings</th>
                  <th>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {occupancy.map(room => {
                  const maxBookings = Math.max(...occupancy.map(r => r.totalBookings), 1);
                  const utilPct = Math.round((room.totalBookings / maxBookings) * 100);
                  return (
                    <tr key={room.id}>
                      <td className="font-medium text-gray-900">{room.name}</td>
                      <td className="text-gray-500 text-sm">#{room.roomNumber}</td>
                      <td>
                        <span className={`badge text-xs ${
                          room.status === 'AVAILABLE' ? 'badge-green' :
                          room.status === 'OCCUPIED' ? 'badge bg-blue-50 text-blue-700' :
                          'badge-red'
                        }`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="font-semibold text-resort-700">{room.totalBookings}</td>
                      <td className="w-48">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-100 h-2">
                            <div
                              className="bg-resort-500 h-2 transition-all duration-500"
                              style={{ width: `${utilPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8">{utilPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
