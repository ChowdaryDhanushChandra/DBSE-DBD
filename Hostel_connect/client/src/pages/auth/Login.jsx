import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Shield, Building2, Key, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SpaceBackground from '../../components/common/SpaceBackground';
import api from '../../services/api';

const Login = () => {
  const { login, setUserFromToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP 2FA State
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otpRole, setOtpRole] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const expired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.requireOtp) {
        setOtpStep(true);
        setDevOtp(res.devOtp || '');
        setOtpRole(res.role || 'Staff');
        setError('');
      } else if (res.success) {
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
      });

      if (res.data?.success) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // If setUserFromToken exists or window reload
        if (setUserFromToken) {
          setUserFromToken(user);
        }

        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'warden') navigate('/warden/dashboard');
        else navigate('/student/dashboard');
      } else {
        setError(res.data?.message || 'Invalid verification code');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setResendMsg('');
    setError('');
    try {
      const res = await api.post('/auth/resend-otp', { email: email.toLowerCase().trim() });
      if (res.data?.success) {
        setDevOtp(res.data.devOtp || '');
        setResendMsg('New security code generated!');
      }
    } catch (err) {
      setError('Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const setDemoCredentials = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError('');
    setOtpStep(false);
  };

  return (
    <div className="relative min-h-screen bg-[#070b19] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <SpaceBackground />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6 text-white" />
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          Sign In to <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">Hostel Connect</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Access your hostel, PG resident, or staff management portal
        </p>
      </div>

      <div className="relative z-10 mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#0b1029]/90 backdrop-blur-2xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/10 space-y-6 relative overflow-hidden">
          {expired && (
            <div className="p-3 bg-amber-500/15 text-amber-300 rounded-xl text-xs border border-amber-500/30">
              Your session has expired. Please sign in again.
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {resendMsg && (
            <div className="p-3 bg-emerald-500/15 text-emerald-300 rounded-xl text-xs border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{resendMsg}</span>
            </div>
          )}

          {/* STEP 1: CREDENTIALS FORM */}
          {!otpStep ? (
            <>
              {/* 1-Click Demo Accounts Selector */}
              <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Demo Credentials (1-Click Fill)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoCredentials('admin@hostelconnect.com', 'Admin@123')}
                    className="py-1.5 px-2 bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 font-semibold text-xs rounded-xl border border-pink-500/30 transition-all cursor-pointer text-center"
                  >
                    Admin (2FA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoCredentials('warden@hostelconnect.com', 'Warden@123')}
                    className="py-1.5 px-2 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-semibold text-xs rounded-xl border border-purple-500/30 transition-all cursor-pointer text-center"
                  >
                    Warden (2FA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoCredentials('student@hostelconnect.com', 'Student@123')}
                    className="py-1.5 px-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-semibold text-xs rounded-xl border border-cyan-500/30 transition-all cursor-pointer text-center"
                  >
                    Student
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@hostelconnect.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:border-cyan-400 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:border-cyan-400 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          ) : (
            /* STEP 2: 2FA OTP VERIFICATION FORM */
            <div className="space-y-5 animate-fade-in">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-lg mb-3">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">Two-Factor OTP Verification</h3>
                <p className="text-xs text-zinc-300 mt-1">
                  Security verification required for <strong className="text-cyan-400 uppercase">{otpRole}</strong>
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">{email}</p>
              </div>

              {/* Dev Helper Pill */}
              {devOtp && (
                <div
                  onClick={() => setOtp(devOtp)}
                  className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center cursor-pointer hover:bg-cyan-500/20 transition-all group"
                  title="Click to auto-fill OTP"
                >
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold mb-0.5">
                    🔑 Security Code Generated:
                  </span>
                  <span className="text-xl font-mono font-black text-cyan-400 tracking-widest group-hover:scale-105 inline-block transition-transform">
                    {devOtp}
                  </span>
                  <span className="text-[10px] text-cyan-300/80 block mt-0.5">
                    (Click to Auto-fill)
                  </span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center text-2xl font-mono tracking-[0.4em] py-3 bg-white/[0.05] border border-cyan-500/30 rounded-xl text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{loading ? 'Verifying Code...' : 'Verify OTP & Enter Portal'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  ← Back to Login
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  <span>Resend Code</span>
                </button>
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
