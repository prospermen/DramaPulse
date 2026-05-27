import { getAdminModuleById } from '../../adminModules.jsx';
import AdminPlaceholderPage from './AdminPlaceholderPage.jsx';

export default function DashboardPage() {
  return <AdminPlaceholderPage module={getAdminModuleById('dashboard')} />;
}
