import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const expired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') navigate('/admin/dashboard');
        else if (res.user.role === 'warden') navigate('/warden/dashboard');
        else navigate('/student/dashboard');
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Building2 className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Sign in to Hostel Connect</h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter your institutional credentials to access your portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-3xl border border-slate-100 space-y-6">
          {expired && (
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs border border-amber-200">
              Your session has expired. Please sign in again.
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Demo Accounts Selector */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3 h-3 text-indigo-600 mr-1" />
                Demo Credentials (1-Click Fill)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@hostelconnect.com', 'Admin@123')}
                className="py-1.5 px-2 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-200 transition-all shadow-sm"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('warden@hostelconnect.com', 'Warden@123')}
                className="py-1.5 px-2 bg-white hover:bg-purple-600 hover:text-white text-purple-700 font-semibold text-xs rounded-xl border border-purple-200 transition-all shadow-sm"
              >
                Warden
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('student@hostelconnect.com', 'Student@123')}
                className="py-1.5 px-2 bg-white hover:bg-cyan-600 hover:text-white text-cyan-700 font-semibold text-xs rounded-xl border border-cyan-200 transition-all shadow-sm"
              >
                Student
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hostelconnect.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              New student?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Register for Hostel Accommodation
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
