import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PasswordResetPage } from './pages/PasswordResetPage';

// Student Pages
import { StudentDashboard } from './pages/StudentDashboard';
import { CourseCatalogPage } from './pages/CourseCatalogPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LearningViewPage } from './pages/LearningViewPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { QuizTakePage } from './pages/QuizTakePage';
import { QuizResultPage } from './pages/QuizResultPage';
import { SkillsGapPage } from './pages/SkillsGapPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { JobTrackerPage } from './pages/JobTrackerPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

// Mentor Pages
import { MentorDashboard } from './pages/MentorDashboard';
import { MentorCoursesPage } from './pages/MentorCoursesPage';
import { MentorGradingPage } from './pages/MentorGradingPage';
import { MentorAssessmentsPage } from './pages/MentorAssessmentsPage';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUserManagementPage } from './pages/AdminUserManagementPage';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: Array<'STUDENT' | 'MENTOR' | 'ADMIN'>;
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#E98EAD] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If unauthorized for this specific role, route to appropriate dashboard
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'MENTOR') return <Navigate to="/mentor/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/password-reset" element={<PasswordResetPage />} />

          {/* Protected Application Workspace */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Student Endpoints */}
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/courses" element={<CourseCatalogPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/learn/:courseId" element={<LearningViewPage />} />
            <Route path="/my-learning" element={<StudentDashboard />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/assessments/take/:id" element={<QuizTakePage />} />
            <Route path="/assessments/result/:id" element={<QuizResultPage />} />
            <Route path="/skill-gap" element={<SkillsGapPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/job-tracker" element={<JobTrackerPage />} />
            <Route path="/profile" element={<ProfileSettingsPage />} />

            {/* Mentor Endpoints */}
            <Route
              path="/mentor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/courses"
              element={
                <ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']}>
                  <MentorCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/grading"
              element={
                <ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']}>
                  <MentorGradingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/assessments"
              element={
                <ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']}>
                  <MentorAssessmentsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Endpoints */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUserManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <CourseCatalogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
