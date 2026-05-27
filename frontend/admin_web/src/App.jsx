import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import AdminWorkspace from './pages/AdminWorkspace.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AnalyzePage from './pages/admin/AnalyzePage.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import DramasPage from './pages/admin/DramasPage.jsx';
import EpisodesPage from './pages/admin/EpisodesPage.jsx';
import HighlightsPage from './pages/admin/HighlightsPage.jsx';
import { hasAdminAccessToken } from './auth.js';

function RequireAdminAuth({ children }) {
  const location = useLocation();

  if (!hasAdminAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAdminAuth>
            <AdminWorkspace />
          </RequireAdminAuth>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dramas" element={<DramasPage />} />
        <Route path="episodes" element={<EpisodesPage />} />
        <Route path="analyze" element={<AnalyzePage />} />
        <Route path="highlights" element={<HighlightsPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
