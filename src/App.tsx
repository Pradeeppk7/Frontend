import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CoachChat from './components/CoachChat';
import './App.css';

const AppHeader = () => {
  const { user, isReady, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="text-xl font-semibold text-slate-900">
          LiftLog
        </Link>
        <nav className="flex items-center gap-4 text-slate-600">
          {user ? (
            <>
              <Link to="/dashboard" className="transition hover:text-slate-900">
                Dashboard
              </Link>
              <Link to="/coach" className="transition hover:text-slate-900">
                AI Coach
              </Link>
              <button
                type="button"
                onClick={logout}
                className="transition hover:text-slate-900"
              >
                Logout
              </button>
            </>
          ) : isReady ? (
            <Link to="/login" className="transition hover:text-slate-900">
              Login
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-lg">Checking session...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <AppHeader />

          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coach"
                element={
                  <ProtectedRoute>
                    <CoachChat />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
