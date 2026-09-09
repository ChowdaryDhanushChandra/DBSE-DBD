import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { ForgotPassword, ResetPassword } from './pages/auth/ForgotPassword';

// Dashboards
import AdminDashboard from './pages/dashboard/AdminDashboard';
import WardenDashboard from './pages/dashboard/WardenDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';

// Modules
import StudentList from './pages/students/StudentList';
import StudentProfile from './pages/students/StudentProfile';
import RoomManagement from './pages/rooms/RoomManagement';
import RoomAllocation from './pages/rooms/RoomAllocation';
import MyRoom from './pages/rooms/MyRoom';
import MessMenuPage from './pages/mess/MessMenuPage';
import MealAttendancePage from './pages/mess/MealAttendancePage';
import FeeManagement from './pages/fees/FeeManagement';
import ComplaintList from './pages/complaints/ComplaintList';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import DocumentManagement from './pages/documents/DocumentManagement';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';

// Protected Route Wrapper with RBAC
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to user's assigned dashboard
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'warden') return <Navigate to="/warden/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

function App() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" message="Bootstrapping Hostel Connect..." />;
  }

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            user?.role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : user?.role === 'warden' ? (
              <Navigate to="/warden/dashboard" replace />
            ) : (
              <Navigate to="/student/dashboard" replace />
            )
          ) : (
            <Login />
          )
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="rooms" element={<RoomManagement />} />
        <Route path="allocations" element={<RoomAllocation />} />
        <Route path="mess" element={<MessMenuPage />} />
        <Route path="fees" element={<FeeManagement />} />
        <Route path="complaints" element={<ComplaintList />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Warden / Staff Portal */}
      <Route
        path="/warden"
        element={
          <ProtectedRoute allowedRoles={['admin', 'warden']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/warden/dashboard" replace />} />
        <Route path="dashboard" element={<WardenDashboard />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="rooms" element={<RoomManagement />} />
        <Route path="allocations" element={<RoomAllocation />} />
        <Route path="mess" element={<MealAttendancePage />} />
        <Route path="complaints" element={<ComplaintList />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Student Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="my-room" element={<MyRoom />} />
        <Route path="mess-menu" element={<MessMenuPage />} />
        <Route path="attendance" element={<MealAttendancePage />} />
        <Route path="fees" element={<FeeManagement />} />
        <Route path="complaints" element={<ComplaintList />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
