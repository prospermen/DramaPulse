import AdminWorkspace from './pages/AdminWorkspace.jsx';
import LandingPage from './pages/LandingPage.jsx';

function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  return isAdminRoute ? <AdminWorkspace /> : <LandingPage />;
}

export default App;
