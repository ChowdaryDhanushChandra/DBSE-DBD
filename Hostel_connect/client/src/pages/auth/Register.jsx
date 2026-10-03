import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, AlertCircle, ArrowRight, ShieldCheck, UserCheck, Key, Users, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SpaceBackground from '../../components/common/SpaceBackground';
import api from '../../services/api';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student'); // 'student', 'warden', 'admin'
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    securityKey: '',
    // Warden specific
    staffId: '',
    hostelId: '',
    officeRoom: '',
    // Student specific
    studentId: '',
    course: 'B.Tech Computer Science',
    department: 'Computer Science',
    year: '1st Year',
    gender: 'Male',
    guardianName: '',
    guardianPhone: '',
    address: '',
  });

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await api.get('/hostels');
        if (res.data?.success && res.data.data) {
          setHostels(res.data.data);
          if (res.data.data.length > 0 && !formData.hostelId) {
            setFormData((prev) => ({ ...prev, hostelId: res.data.data[0]._id || res.data.data[0].id }));
          }
        }
      } catch (err) {
        console.log('Error fetching hostels');
      }
    };
    fetchHostels();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        role,
      };

      const res = await register(payload);
      if (res.success) {
        setSuccessMsg('Account registered successfully! Redirecting...');
        setTimeout(() => {
          if (role === 'admin') navigate('/admin/dashboard');
          else if (role === 'warden') navigate('/warden/dashboard');
          else navigate('/student/dashboard');
        }, 1200);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070b19] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-slate-100 overflow-hidden">
      <SpaceBackground />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <Link to="/" className="inline-flex items-center space-x-3 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6 text-white" />
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          Create <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">Hostel Connect Account</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Select your institutional role to register your verified account
        </p>

        {/* Role Selector Tabs */}
        <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-[#0d132a]/90 border border-white/10 backdrop-blur-xl shadow-xl">
          <button
            type="button"
            onClick={() => { setRole('student'); setError(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              role === 'student'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Student / PG Resident</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole('warden'); setError(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              role === 'warden'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Warden / Staff</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole('admin'); setError(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              role === 'admin'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-[#0b1029]/90 backdrop-blur-2xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/10 relative overflow-hidden">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common Credentials Section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 border-b pb-1 border-white/10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                1. Login Credentials & Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:border-cyan-400 text-white placeholder-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@hostelconnect.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:border-cyan-400 text-white placeholder-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:border-cyan-400 text-white placeholder-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:border-cyan-400 text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ROLE SPECIFIC: ADMIN */}
            {role === 'admin' && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-3 border-b pb-1 border-white/10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  2. Administrator Verification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Master Security Passkey *</label>
                    <input
                      type="text"
                      required
                      name="securityKey"
                      value={formData.securityKey}
                      onChange={handleChange}
                      placeholder="Use: ADMIN2024"
                      className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-pink-500/30 rounded-xl focus:border-pink-400 text-white placeholder-slate-500 outline-none"
                    />
                    <span className="text-[10px] text-pink-400/80 mt-1 block">
                      Default authorization code: <strong>ADMIN2024</strong>
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Employee / Admin ID</label>
                    <input
                      type="text"
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleChange}
                      placeholder="e.g. ADM-HQ-01"
                      className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:border-cyan-400 text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ROLE SPECIFIC: WARDEN */}
            {role === 'warden' && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 border-b pb-1 border-white/10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  2. Warden Station Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Warden Passkey *</label>
                    <input
                      type="text"
                      required
                      name="securityKey"
                      value={formData.securityKey}
                      onChange={handleChange}
                      placeholder="Use: WARDEN2024"
                      className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-purple-500/30 rounded-xl focus:border-purple-400 text-white placeholder-slate-500 outline-none"
                    />
                    <span className="text-[10px] text-purple-400/80 mt-1 block">
                      Default authorization code: <strong>WARDEN2024</strong>
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Staff / Warden ID *</label>
                    <input
                      type="text"
                      required
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleChange}
                      placeholder="e.g. WRD-2024-05"
                      className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:border-cyan-400 text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Hostel / PG *</label>
                    <select
                      name="hostelId"
                      value={formData.hostelId}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#070b19] border border-white/10 rounded-xl focus:border-purple-400 text-white outline-none"
                    >
                      {hostels.map((h) => (
                        <option key={h._id || h.id} value={h._id || h.id}>
                          {h.name} ({h.gender})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Office Room Number</label>
                    <input
                      type="text"
                      name="officeRoom"
                      value={formData.officeRoom}
                      onChange={handleChange}
                      placeholder="e.g. Ground Floor Office 101"
                      className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:border-cyan-400 text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ROLE SPECIFIC: STUDENT / RESIDENT */}
            {role === 'student' && (
              <>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 border-b pb-1 border-white/10 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    2. Academic & Residential Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Course / Work Affiliation *</label>
                      <input
                        type="text"
                        required
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        placeholder="e.g. B.Tech / Software Eng"
                        className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:border-cyan-400 text-white placeholder-slate-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Organization *</label>
                      <input
                        type="text"
                        required
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g. Engineering / TechCorp"
                        className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:border-cyan-400 text-white placeholder-slate-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Year / Tenure *</label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#070b19] border border-white/10 rounded-xl focus:border-cyan-400 text-white outline-none"
                      >
                        <option value="1st Year">1st Year / Fresh Move-in</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Professional">Working Professional</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#070b19] border border-white/10 rounded-xl focus:border-cyan-400 text-white outline-none"
                      >
                        <option value="Male">Male (Boys Hostel / Men's PG)</option>
                        <option value="Female">Female (Girls Hostel / Women's PG)</option>
                        <option value="Other">Other / Co-ed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Student / Resident ID</label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="Leave blank to auto-generate"
                        className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:border-cyan-400 text-white placeholder-slate-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency & Address */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-3 border-b pb-1 border-white/10 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    3. Emergency Contact & Permanent Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian / Contact Person *</label>
                      <input
                        type="text"
                        required
                        name="guardianName"
                        value={formData.guardianName}
                        onChange={handleChange}
                        placeholder="Guardian / Emergency Contact"
                        className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:border-cyan-400 text-white placeholder-slate-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian Phone *</label>
                      <input
                        type="tel"
                        required
                        name="guardianPhone"
                        value={formData.guardianPhone}
                        onChange={handleChange}
                        placeholder="+91 98888 77777"
                        className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:border-cyan-400 text-white placeholder-slate-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Permanent Residential Address *</label>
                    <textarea
                      required
                      rows="2"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street, City, State, PIN Code"
                      className="w-full px-3.5 py-2 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:border-cyan-400 text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                role === 'admin'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-500 hover:to-purple-500'
                  : role === 'warden'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white hover:from-purple-500 hover:to-cyan-400'
              }`}
            >
              <span>
                {loading
                  ? 'Creating Account...'
                  : role === 'admin'
                  ? 'Complete Administrator Registration'
                  : role === 'warden'
                  ? 'Complete Warden Registration'
                  : 'Complete Resident Registration'}
              </span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-white/10 mt-6">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
