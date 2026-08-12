import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ProjectsList } from './pages/ProjectsList';
import { ProjectDetail } from './pages/ProjectDetail';
import { MyTasks } from './pages/MyTasks';
import { CalendarView } from './pages/CalendarView';
import { UsersList } from './pages/UsersList';
import { PositionsList } from './pages/PositionsList';
import { ReportsView } from './pages/ReportsView';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs font-semibold">
        Memuat ProjectFlow...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role_name)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs font-semibold">
        Memuat ProjectFlow...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="projects" element={<ProjectsList />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route
                  path="tasks"
                  element={
                    <ProtectedRoute allowedRoles={['Project Manager', 'Member']}>
                      <MyTasks />
                    </ProtectedRoute>
                  }
                />
                <Route path="calendar" element={<CalendarView />} />
                <Route path="profile" element={<Profile />} />

                {/* Role specific routes */}
                <Route
                  path="users"
                  element={
                    <ProtectedRoute allowedRoles={['Administrator', 'Project Manager']}>
                      <UsersList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="positions"
                  element={
                    <ProtectedRoute allowedRoles={['Administrator']}>
                      <PositionsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="activities"
                  element={
                    <ProtectedRoute allowedRoles={['Administrator', 'Project Manager', 'Member']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="notifications"
                  element={
                    <ProtectedRoute allowedRoles={['Administrator', 'Project Manager', 'Member']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute allowedRoles={['Administrator', 'Project Manager']}>
                      <ReportsView />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
