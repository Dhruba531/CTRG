import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './features/auth/AuthContext';
import ProtectedRoute from './features/auth/ProtectedRoute';

// Eagerly load auth and layout (needed immediately)
import Login from './features/auth/Login';
import DashboardLayout from './components/DashboardLayout';

// Lazy load feature components for code splitting
// PI Features
const PIDashboard = lazy(() => import('./features/proposals/PIDashboard'));
const ProposalForm = lazy(() => import('./features/proposals/ProposalForm'));
const RevisionForm = lazy(() => import('./features/proposals/RevisionForm'));

// Reviewer Features
const ReviewerDashboard = lazy(() => import('./features/reviews/ReviewerDashboard'));
const Stage1ReviewForm = lazy(() => import('./features/reviews/Stage1ReviewForm'));
const Stage2ReviewForm = lazy(() => import('./features/reviews/Stage2ReviewForm'));

// SRC Chair Features
const SRCChairDashboard = lazy(() => import('./features/admin/SRCChairDashboard'));
const GrantCycleManagement = lazy(() => import('./features/cycles/GrantCycleManagement'));
const ReviewerManagement = lazy(() => import('./features/admin/ReviewerManagement'));
const ProposalList = lazy(() => import('./features/admin/ProposalList'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

const GenericNotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <h1 className="text-6xl font-bold text-gray-300">404</h1>
    <p className="text-xl text-gray-500 mt-4">Page Not Found</p>
  </div>
);

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <h1 className="text-6xl font-bold text-red-300">403</h1>
    <p className="text-xl text-gray-500 mt-4">Unauthorized Access</p>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<DashboardLayout />}>
            {/* PI Routes - Lazy loaded */}
            <Route element={<ProtectedRoute allowedRoles={['PI']} />}>
              <Route path="/pi/dashboard" element={<Suspense fallback={<LoadingFallback />}><PIDashboard /></Suspense>} />
              <Route path="/pi/submit" element={<Suspense fallback={<LoadingFallback />}><ProposalForm /></Suspense>} />
              <Route path="/pi/proposals/:id" element={<Suspense fallback={<LoadingFallback />}><ProposalForm /></Suspense>} />
              <Route path="/pi/proposals/:id/revise" element={<Suspense fallback={<LoadingFallback />}><RevisionForm /></Suspense>} />
            </Route>

            {/* Reviewer Routes - Lazy loaded */}
            <Route element={<ProtectedRoute allowedRoles={['Reviewer']} />}>
              <Route path="/reviewer/dashboard" element={<Suspense fallback={<LoadingFallback />}><ReviewerDashboard /></Suspense>} />
              <Route path="/reviewer/reviews" element={<Suspense fallback={<LoadingFallback />}><ReviewerDashboard /></Suspense>} />
              <Route path="/reviewer/reviews/:id" element={<Suspense fallback={<LoadingFallback />}><Stage1ReviewForm /></Suspense>} />
              <Route path="/reviewer/reviews/:id/stage2" element={<Suspense fallback={<LoadingFallback />}><Stage2ReviewForm /></Suspense>} />
              <Route path="/reviewer/reviews/:id/view" element={<Suspense fallback={<LoadingFallback />}><Stage1ReviewForm /></Suspense>} />
            </Route>

            {/* SRC Chair (Admin) Routes - Lazy loaded */}
            <Route element={<ProtectedRoute allowedRoles={['SRC_Chair']} />}>
              <Route path="/admin/dashboard" element={<Suspense fallback={<LoadingFallback />}><SRCChairDashboard /></Suspense>} />
              <Route path="/admin/proposals" element={<Suspense fallback={<LoadingFallback />}><ProposalList /></Suspense>} />
              <Route path="/admin/proposals/:id" element={<Suspense fallback={<LoadingFallback />}><ProposalList /></Suspense>} />
              <Route path="/admin/cycles" element={<Suspense fallback={<LoadingFallback />}><GrantCycleManagement /></Suspense>} />
              <Route path="/admin/reviewers" element={<Suspense fallback={<LoadingFallback />}><ReviewerManagement /></Suspense>} />
              <Route path="/admin/reports" element={<div className="p-6 text-gray-500">Reports - Coming Soon</div>} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<GenericNotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
