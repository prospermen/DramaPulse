import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import AdminWorkspace from './pages/AdminWorkspace.jsx';
import AnalyzePage from './pages/admin/AnalyzePage.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import DramasPage from './pages/admin/DramasPage.jsx';
import EpisodesPage from './pages/admin/EpisodesPage.jsx';
import HighlightsPage from './pages/admin/HighlightsPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminWorkspace />}>
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
