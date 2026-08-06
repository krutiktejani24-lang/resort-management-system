import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Bed, MessageSquare, Star } from 'lucide-react';
import { format } from 'date-fns';
import { analyticsService } from '../../services/api';

function formatINR(value) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)}Cr`;
  if (abs >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)}L`;
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

function StatCard({ icon: Icon, label, value, change, trend, color = 'resort' }) {
  const isUp = trend === 'up';
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}-50 flex items-center justify-center`}>
          <Icon size={20} className={`text-${color}-600`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-xs font-medium ${isUp ? 'text-resort-600' : 'text-red-500'}`}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

const COLORS = ['#16a34a', '#22c55e', '#86efac', '#bbf7d0', '#f59e0b'];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: analyticsService.getDashboard,
    refetchInterval: 60000,
  });
  const stats = data?.data?.data?.stats;
  const monthlyRevenue = data?.data?.data?.monthlyRevenue || [];
  const recentBookings = data?.data?.data?.recentBookings || [];
  const topRooms = data?.data?.data?.topRooms || [];

  const occupancyData = stats ? [
    { name: 'Occupied', value: Number(stats.occupiedRooms) },
    { name: 'Available', value: Number(stats.availableRooms) },
    { name: 'Other', value: stats.totalRooms - stats.occupiedRooms - stats.availableRooms },
  ].filter(d => d.value > 0) : [];

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-gray-100 animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back — here's what's happening at Mango Tree today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatINR(stats?.totalRevenue)} change={stats?.revenueGrowth} trend={stats?.revenueGrowth >= 0 ? 'up' : 'down'} />
        <StatCard icon={Calendar} label="Total Bookings" value={stats?.totalBookings || 0} change={stats?.bookingGrowth} trend={stats?.bookingGrowth >= 0 ? 'up' : 'down'} />
        <StatCard icon={Users} label="Total Guests" value={stats?.totalGuests || 0} />
        <StatCard icon={Bed} label="Occupancy Rate" value={`${Number(stats?.occupancyRate || 0).toFixed(1)}%`} color="blue" />
        <StatCard icon={DollarSign} label="This Month Revenue" value={formatINR(stats?.monthRevenue)} color="gold" />
        <StatCard icon={Calendar} label="This Month Bookings" value={stats?.monthBookings || 0} />
        <StatCard icon={MessageSquare} label="New Leads" value={stats?.pendingLeads || 0} color="orange" />
        <StatCard icon={Star} label="Approved Reviews" value={stats?.totalReviews || 0} color="gold" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white shadow-resort p-6">
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-6">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyRevenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="monthName" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatINR(v)} />
              <Tooltip
  formatter={(value) => {
    const amount = Number(value || 0);

    return [
      `₹${amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      "Revenue",
    ];
  }}
/>
              <Bar dataKey="total" fill="#16a34a" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Occupancy pie */}
        <div className="bg-white shadow-resort p-6">
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-6">Room Status</h2>
          {occupancyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {occupancyData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend iconSize={10} formatter={v => <span className="text-xs text-gray-600">{v}</span>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-300 text-sm">No room data</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white shadow-resort p-6">
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No recent bookings</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-resort text-sm">
                <thead><tr><th>Guest</th><th>Room</th><th>Check In</th><th>Status</th></tr></thead>
                <tbody>
                  {recentBookings.map(b => (
                    <tr key={b.id}>
                      <td className="font-medium">{b.user?.firstName} {b.user?.lastName}</td>
                      <td className="text-gray-500">{b.room?.name}</td>
                      <td className="text-gray-500">{format(new Date(b.checkIn), 'MMM d')}</td>
                      <td>
                        <span className={`badge text-xs ${b.status === 'CONFIRMED' ? 'badge-green' : b.status === 'PENDING' ? 'badge-gray' : 'badge-red'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Rooms */}
        <div className="bg-white shadow-resort p-6">
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">Top Performing Rooms</h2>
          {topRooms.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No data available</p>
          ) : (
            <div className="space-y-4">
              {topRooms.map((room, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-resort-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{room.name}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="flex-1 bg-gray-100 h-1.5">
                        <div className="bg-resort-500 h-1.5" style={{ width: `${(room.bookings / (topRooms[0]?.bookings || 1)) * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{room.bookings} bookings</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-resort-700">{formatINR(room.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
