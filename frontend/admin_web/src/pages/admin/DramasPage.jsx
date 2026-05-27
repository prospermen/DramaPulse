import { getAdminModuleById } from '../../adminModules.jsx';
import AdminPlaceholderPage from './AdminPlaceholderPage.jsx';

export default function DramasPage() {
  return <AdminPlaceholderPage module={getAdminModuleById('dramas')} />;
}
