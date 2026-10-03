import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Compass } from 'lucide-react';
import api from '../../services/api';
import SpaceBackground from '../../components/common/SpaceBackground';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccess(true);
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050816] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Starfield */}
      <SpaceBackground />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_25px_rgba(0,229,255,0.4)] group-hover:scale-105 transition-transform">
            <Compass className="w-7 h-7 text-cyan-200" />
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          Reset <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">Password</span>
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your registered email to receive a password reset key
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#070D22]/85 backdrop-blur-xl py-8 px-6 shadow-[0_0_40px_rgba(0,0,0,0.6)] rounded-3xl border border-cyan-500/20 shadow-glass relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {error && (
            <div className="mb-4 p-3 bg-rose-500/15 text-rose-300 text-xs rounded-xl flex items-center space-x-2 border border-rose-500/30">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Password Reset Key Generated</h3>
              <p className="text-xs text-slate-400">
                For demo testing, use the reset key below:
              </p>
              <div className="p-3 bg-black/50 font-mono text-xs text-cyan-400 border border-cyan-500/30 break-all rounded-xl select-all shadow-inner">
                {resetToken}
              </div>
              <Link
                to={`/reset-password?token=${resetToken}`}
                className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] cursor-pointer"
              >
                Proceed to Reset Password
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Registered Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400/60">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@hostelconnect.com"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-white/[0.04] border border-cyan-500/20 rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Submitting...' : 'Generate Reset Key'}
              </button>
            </form>
          )}

          <div className="text-center pt-4 border-t border-white/10 mt-6">
            <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors">
              ← Return to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResetPassword = () => {
  const [token, setToken] = useState(new URLSearchParams(window.location.search).get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/reset-password', { resetToken: token, newPassword });
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050816] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <SpaceBackground />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_25px_rgba(0,229,255,0.4)] group-hover:scale-105 transition-transform">
            <Compass className="w-7 h-7 text-cyan-200" />
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          Set New <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">Password</span>
        </h2>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#070D22]/85 backdrop-blur-xl py-8 px-6 shadow-[0_0_40px_rgba(0,0,0,0.6)] rounded-3xl border border-cyan-500/20 shadow-glass relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {error && (
            <div className="mb-4 p-3 bg-rose-500/15 text-rose-300 text-xs rounded-xl flex items-center space-x-2 border border-rose-500/30">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Password Changed Successfully!</h3>
              <p className="text-xs text-slate-400">
                You can now log in with your updated credentials.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] cursor-pointer"
              >
                Sign In to Dashboard
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reset Key / Token</label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste reset token"
                  className="block w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-cyan-500/20 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="block w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-cyan-500/20 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Saving...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
