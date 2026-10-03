import React, { useState } from 'react';
import {
  User,
  Lock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Save,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SettingsPage = () => {
  const { user, student, updateUserData } = useAuth();

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    course: student?.course || '',
    department: student?.department || '',
    guardianName: student?.guardianName || '',
    guardianPhone: student?.guardianPhone || '',
    address: student?.address || '',
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const res = await api.put('/auth/profile', profileForm);
      if (res.data.success) {
        updateUserData(res.data.user);
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.data.success) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <User className="w-6 h-6" />
          </span>
          Account & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage your personal credentials, contact points, and security configurations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Profile Info Card */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-3xl p-6 border border-cyan-500/15 shadow-glass text-center space-y-4">
          <img
            src={
              user?.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || 'User'
              )}&background=7B61FF&color=fff&size=128`
            }
            alt=""
            className="w-24 h-24 rounded-3xl mx-auto object-cover ring-4 ring-cyan-500/20 shadow-neon-cyan"
          />
          <div>
            <h3 className="font-extrabold text-lg text-white">{user?.name}</h3>
            <p className="text-xs text-zinc-400">{user?.email}</p>
            <span className="mt-2 inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Role: {user?.role}
            </span>
          </div>

          <div className="border-t border-cyan-500/10 pt-4 text-left text-xs space-y-2 text-zinc-400">
            <p className="flex justify-between">
              <span className="text-zinc-500">Account Status:</span>
              <span className="font-bold text-emerald-400">Active</span>
            </p>
            {student && (
              <>
                <p className="flex justify-between">
                  <span className="text-zinc-500">Resident ID:</span>
                  <span className="font-bold text-white">{student.studentId || student.studentIdentifier}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-zinc-500">Academic Year:</span>
                  <span className="font-semibold text-zinc-300">{student.year}</span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Forms: Profile & Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-cyan-500/15 shadow-glass">
            <h3 className="text-base font-bold text-white border-b pb-3 border-cyan-500/10 mb-4 flex items-center">
              <User className="w-4 h-4 mr-2 text-cyan-400" />
              Profile Details
            </h3>

            {profileMsg.text && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {profileMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                  />
                </div>
              </div>

              {student && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-zinc-300 mb-1">Degree Course</label>
                      <input
                        type="text"
                        value={profileForm.course}
                        onChange={(e) => setProfileForm({ ...profileForm, course: e.target.value })}
                        className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-300 mb-1">Department</label>
                      <input
                        type="text"
                        value={profileForm.department}
                        onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                        className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-zinc-300 mb-1">Guardian Name</label>
                      <input
                        type="text"
                        value={profileForm.guardianName}
                        onChange={(e) => setProfileForm({ ...profileForm, guardianName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-300 mb-1">Guardian Phone</label>
                      <input
                        type="text"
                        value={profileForm.guardianPhone}
                        onChange={(e) => setProfileForm({ ...profileForm, guardianPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-300 mb-1">Residential Address</label>
                    <textarea
                      rows="2"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-neon-cyan disabled:opacity-50 inline-flex items-center transition-all"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Security Form */}
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-cyan-500/15 shadow-glass">
            <h3 className="text-base font-bold text-white border-b pb-3 border-cyan-500/10 mb-4 flex items-center">
              <Lock className="w-4 h-4 mr-2 text-cyan-400" />
              Security & Access Key
            </h3>

            {passwordMsg.text && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-neon-cyan disabled:opacity-50 inline-flex items-center transition-all"
                >
                  <Shield className="w-4 h-4 mr-1.5" />
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
