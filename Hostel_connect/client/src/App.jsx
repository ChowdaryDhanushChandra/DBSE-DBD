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
import ExploreRoomsPage from './pages/public/ExploreRoomsPage';
import FeaturesPage from './pages/public/FeaturesPage';
import DiningPage from './pages/public/DiningPage';

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

// Smart Mess & Hostel Hygiene Modules
import MealFeedbackPage from './pages/mess/MealFeedbackPage';
import MessAnalyticsPage from './pages/mess/MessAnalyticsPage';
import WeeklyMessReportPage from './pages/mess/WeeklyMessReportPage';
import CleanlinessScorePage from './pages/hygiene/CleanlinessScorePage';
import WeeklyInspectionPage from './pages/hygiene/WeeklyInspectionPage';
import HygieneComplaintsPage from './pages/hygiene/HygieneComplaintsPage';
import HygieneAnalyticsPage from './pages/hygiene/HygieneAnalyticsPage';

// Parcel & Visitor Management Modules
import ParcelManagementPage from './pages/parcels/ParcelManagementPage';
import VisitorManagementPage from './pages/visitors/VisitorManagementPage';

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
      <Route path="/explore-rooms" element={<ExploreRoomsPage />} />
      <Route path="/rooms-showcase" element={<Navigate to="/explore-rooms" replace />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/dining-info" element={<DiningPage />} />
      <Route path="/dining" element={<Navigate to="/dining-info" replace />} />
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
        <Route path="mess-feedback" element={<MealFeedbackPage />} />
        <Route path="mess-analytics" element={<MessAnalyticsPage />} />
        <Route path="mess-report" element={<WeeklyMessReportPage />} />
        <Route path="hygiene-cleanliness" element={<CleanlinessScorePage />} />
        <Route path="hygiene-inspections" element={<WeeklyInspectionPage />} />
        <Route path="hygiene-complaints" element={<HygieneComplaintsPage />} />
        <Route path="hygiene-analytics" element={<HygieneAnalyticsPage />} />
        <Route path="fees" element={<FeeManagement />} />
        <Route path="parcels" element={<ParcelManagementPage />} />
        <Route path="visitors" element={<VisitorManagementPage />} />
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
        <Route path="parcels" element={<ParcelManagementPage />} />
        <Route path="visitors" element={<VisitorManagementPage />} />
        <Route path="mess" element={<MealAttendancePage />} />
        <Route path="mess-feedback" element={<MealFeedbackPage />} />
        <Route path="mess-analytics" element={<MessAnalyticsPage />} />
        <Route path="mess-report" element={<WeeklyMessReportPage />} />
        <Route path="hygiene-cleanliness" element={<CleanlinessScorePage />} />
        <Route path="hygiene-inspections" element={<WeeklyInspectionPage />} />
        <Route path="hygiene-complaints" element={<HygieneComplaintsPage />} />
        <Route path="hygiene-analytics" element={<HygieneAnalyticsPage />} />
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
        <Route path="parcels" element={<ParcelManagementPage />} />
        <Route path="visitors" element={<VisitorManagementPage />} />
        <Route path="mess-menu" element={<MessMenuPage />} />
        <Route path="meal-feedback" element={<MealFeedbackPage />} />
        <Route path="attendance" element={<MealAttendancePage />} />
        <Route path="hygiene-cleanliness" element={<CleanlinessScorePage />} />
        <Route path="hygiene-complaints" element={<HygieneComplaintsPage />} />
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
