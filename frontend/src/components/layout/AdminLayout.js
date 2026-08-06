import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Bed, Calendar, Users, Image, BookOpen,
  MessageSquare, BarChart2, Menu, X, LogOut, Settings,DollarSign
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/rooms', label: 'Rooms', icon: Bed },
  { to: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/leads', label: 'CRM Leads', icon: MessageSquare },
  { to: '/admin/gallery', label: 'Gallery', icon: Image },
  { to: '/admin/blog', label: 'Blog', icon: BookOpen },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/admin/transactions', label: 'Transactions', icon: DollarSign },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-forest-dark flex-shrink-0 flex flex-col transition-all duration-300 min-h-screen fixed lg:static z-40`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-700">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-md">
  <img
    src="/logo/logo.png"
    alt="Mango Tree Resort"
    className="w-full h-full object-contain"
  />
</div>
              <div>
                <div className="font-display font-bold text-white text-sm">Mango Tree</div>
                <div className="text-xs text-resort-400 tracking-widest">ADMIN</div>
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-md">
  <img
    src="/logo/logo.png"
    alt="Mango Tree Resort"
    className="w-full h-full object-contain"
  />
</div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 space-y-1 px-2">
          {sidebarLinks.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              title={!sidebarOpen ? label : ''}
              className={`flex items-center ${sidebarOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-3 text-sm transition-all duration-200 group ${
                isActive(to, exact)
                  ? 'bg-resort-gradient text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-700">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 overflow-hidden rounded-md flex-shrink-0 bg-white">
  <img
    src="/logo/logo.png"
    alt="Mango Tree Resort"
    className="w-full h-full object-contain"
  />
</div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-gray-400 text-xs truncate">{user?.role}</p>
              </div>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            className={`flex items-center ${sidebarOpen ? 'space-x-2 w-full' : 'justify-center w-full'} text-gray-400 hover:text-red-400 text-sm transition-colors py-2`}
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-w-0 ${sidebarOpen ? 'lg:ml-0' : ''}`}>
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center space-x-4">
            <Link to="/" target="_blank" className="text-xs text-resort-600 hover:underline font-medium">
              View Site →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
