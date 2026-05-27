import { getAdminModuleById } from '../../adminModules.jsx';
import AdminPlaceholderPage from './AdminPlaceholderPage.jsx';

export default function EpisodesPage() {
  return <AdminPlaceholderPage module={getAdminModuleById('episodes')} />;
}
