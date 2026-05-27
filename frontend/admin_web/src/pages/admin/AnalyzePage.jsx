import { getAdminModuleById } from '../../adminModules.jsx';
import AdminPlaceholderPage from './AdminPlaceholderPage.jsx';

export default function AnalyzePage() {
  return <AdminPlaceholderPage module={getAdminModuleById('analyze')} />;
}
