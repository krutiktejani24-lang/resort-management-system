import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-resort-gradient relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900" alt="" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative z-10 text-white text-center p-12">
<div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-md">
  <img
    src="/logo/logo.png"
    alt="Mango Tree Resort"
    className="w-full h-full object-contain"
  />
</div>
          <h2 className="font-display text-4xl font-bold mb-4">Welcome Back</h2>
          <p className="text-resort-200 text-lg font-accent italic">Your paradise awaits</p>
          <div className="mt-12 text-left space-y-4">
            {['Manage your reservations', 'Access exclusive member rates', 'Track your stay history', 'Connect with our concierge'].map(item => (
              <div key={item} className="flex items-center space-x-3 text-sm text-resort-100">
                <div className="w-1.5 h-1.5 bg-resort-300 rounded-full" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-resort-600 text-sm mb-8 transition-colors">
            <ArrowLeft size={14} /> <span>Back to Resort</span>
          </Link>
          <div className="lg:hidden mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-md">
  <img
    src="/logo/logo.png"
    alt="Mango Tree Resort"
    className="w-full h-full object-contain"
  />
</div>
              <div>
                <div className="font-display font-bold text-xl text-gray-900">Mango Tree</div>
                <div className="text-xs text-resort-500 tracking-widest">destination wedding lawn and weekend stay</div>
              </div>
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-400 text-sm mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field" placeholder="your@email.com" required autoComplete="email" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label-field">Password</label>
                <button type="button" className="text-xs text-resort-600 hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pr-10" placeholder="Enter your password" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 disabled:opacity-50">
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            New to Mango Tree?{' '}
            <Link to="/register" className="text-resort-600 font-medium hover:underline">Create account</Link>
          </p>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Demo credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => setForm({ email: 'admin@mangotreeresort.com', password: 'Admin@123' })} className="border border-gray-200 p-2 hover:border-resort-300 text-gray-500 transition-colors text-left">
                <span className="block font-medium text-gray-700">Admin</span>
                admin@mangotreeresort.com
              </button>
              <button onClick={() => setForm({ email: 'guest@example.com', password: 'Admin@123' })} className="border border-gray-200 p-2 hover:border-resort-300 text-gray-500 transition-colors text-left">
                <span className="block font-medium text-gray-700">Guest</span>
                guest@example.com
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    const result = await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password });
    if (result.success) {
      toast.success('Account created! Welcome to Mango Tree.');
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-resort-600 text-sm mb-8 transition-colors">
          <ArrowLeft size={14} /> <span>Back to Resort</span>
        </Link>
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-md">
  <img
    src="/logo/logo.png"
    alt="Mango Tree Resort"
    className="w-full h-full object-contain"
  />
</div>
          <div>
            <div className="font-display font-bold text-xl text-gray-900">Mango Tree</div>
            <div className="text-xs text-resort-500 tracking-widest">destination wedding lawn and weekend stay</div>
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-400 text-sm mb-8">Join Mango Tree and unlock exclusive member benefits</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">First Name</label>
              <input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="label-field">Last Name</label>
              <input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="label-field">Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="label-field">Phone Number</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+1 (000) 000-0000" />
          </div>
          <div className="relative">
            <label className="label-field">Password</label>
            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-field pr-10" required minLength={8} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-7 text-gray-400">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div>
            <label className="label-field">Confirm Password</label>
            <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} className="input-field" required />
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 mt-2 disabled:opacity-50">
            {isLoading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-resort-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
