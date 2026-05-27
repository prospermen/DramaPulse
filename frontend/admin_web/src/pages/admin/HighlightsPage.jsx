import { getAdminModuleById } from '../../adminModules.jsx';
import AdminPlaceholderPage from './AdminPlaceholderPage.jsx';

export default function HighlightsPage() {
  return <AdminPlaceholderPage module={getAdminModuleById('highlights')} />;
}
