import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Mail, ChevronDown, User, LogOut, Calendar, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBg = scrolled || !isHome
    ? 'bg-white shadow-sm border-b border-gray-100'
    : 'bg-transparent';
  const textColor = scrolled || !isHome ? 'text-gray-700' : 'text-white';
  const logoColor = scrolled || !isHome ? 'text-resort-700' : 'text-white';

  const handleLogout = () => { logout(); setUserMenuOpen(false); navigate('/'); };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/rooms', label: 'Rooms & Suites' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/blog', label: 'Journal' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-md">
  <img
    src="/logo/logo.png"
    alt="Mango Tree Resort"
    className="w-full h-full object-contain"
  />
</div>
            <div>
              <div className={`font-display font-bold text-xl ${logoColor} transition-colors`}>Mango Tree</div>
              <div className={`text-xs tracking-widest uppercase ${scrolled || !isHome ? 'text-resort-500' : 'text-resort-200'} transition-colors`}>destination wedding lawn and weekend stay</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${textColor} transition-colors ${location.pathname === link.to ? (scrolled || !isHome ? 'text-resort-600' : 'text-resort-300') : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA & Auth */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center space-x-2 ${textColor} hover:text-resort-600 transition-colors`}
                >
                  <div className="w-8 h-8 bg-resort-100 flex items-center justify-center">
                    <User size={16} className="text-resort-600" />
                  </div>
                  <span className="text-sm font-medium">{user?.firstName}</span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-white shadow-resort-lg border border-gray-100 z-50">
                    <div className="p-4 border-b border-gray-50">
                      <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to="/my-bookings" onClick={() => setUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 text-sm hover:bg-resort-50 text-gray-700">
                        <Calendar size={14} /> <span>My Bookings</span>
                      </Link>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 text-sm hover:bg-resort-50 text-gray-700">
                        <Settings size={14} /> <span>Profile Settings</span>
                      </Link>
                      {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 text-sm hover:bg-resort-50 text-gray-700">
                          <Settings size={14} /> <span>Admin Panel</span>
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-3 text-sm hover:bg-red-50 text-red-600">
                        <LogOut size={14} /> <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className={`nav-link ${textColor}`}>Sign In</Link>
            )}
            <Link to="/rooms" className="btn-primary text-xs py-2.5">
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden ${textColor}`}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className="block text-gray-700 font-medium py-2 border-b border-gray-50">{link.label}</Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/my-bookings" onClick={() => setMobileOpen(false)} className="block text-gray-700 py-2">My Bookings</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block text-red-600 py-2">Sign Out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-gray-700 py-2">Sign In</Link>
            )}
            <Link to="/rooms" onClick={() => setMobileOpen(false)} className="btn-primary block text-center mt-4">Book Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-forest-dark text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-md">
  <img
    src="/logo/logo.png"
    alt="Mango Tree Resort"
    className="w-full h-full object-contain"
  />
</div>
              <div>
                <div className="font-display font-bold text-xl text-white">Mango Tree</div>
                <div className="text-xs tracking-widest text-resort-400">destination wedding lawn and weekend stay</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              A sanctuary of unparalleled luxury where nature meets elegance. Experience paradise redefined.
            </p>
            <div className="flex space-x-3">
              {['FB', 'IG', 'TW', 'YT'].map(s => (
                <button key={s} className="w-9 h-9 border border-gray-600 flex items-center justify-center text-xs text-gray-400 hover:bg-resort-600 hover:border-resort-600 hover:text-white transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold tracking-widest text-sm uppercase mb-6">Explore</h4>
            <ul className="space-y-3">
              {[['/', 'Home'], ['/rooms', 'Rooms & Suites'], ['/gallery', 'Gallery'], ['/blog', 'Journal'], ['/contact', 'Contact']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-sm text-gray-400 hover:text-resort-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold tracking-widest text-sm uppercase mb-6">Amenities</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {['Infinity Pool', 'Spa & Wellness', 'Fine Dining', 'Water Sports', 'Private Beach', 'Fitness Center'].map(a => (
                <li key={a} className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-resort-500 rounded-full"></span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold tracking-widest text-sm uppercase mb-6">Contact</h4>
            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex items-start space-x-3">
                <span className="text-resort-400 mt-0.5">📍</span>
                <p>next to VIMS hospital, Parnera Pardi, Valsad, Gujarat 396007</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={14} className="text-resort-400" />
                <a href="tel:+1800MANGOTREE" className="hover:text-resort-400 transition-colors">+91 9949948904</a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={14} className="text-resort-400" />
                <a href="mailto:mangotree9949@gmail.com" className="hover:text-resort-400 transition-colors">mangotree9949@gmail.com</a>
              </div>
            </div>
            <div className="mt-6 p-4 border border-gray-700">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Awards</p>
              <p className="text-xs text-gold-400">⭐ World's Best Resort 2024</p>
              <p className="text-xs text-gold-400">⭐ Forbes 5-Star Certified</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">

          <div className="flex space-x-6 mt-4 md:mt-0 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-resort-400">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-resort-400">Terms of Service</Link>
            <a href="https://maps.app.goo.gl/Ujj1Uqq1cd3j8suv5?g_st=aw" target="_blank" rel="noopener noreferrer" className="hover:text-resort-400"> Location</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
