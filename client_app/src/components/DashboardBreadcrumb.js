import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faArrowLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import navigationConfig from './NavigationConfig';
import { useCurrentDashboard } from '../contexts/DashboardContext';

// Labels for dashboard sub-pages that are not listed in NavigationConfig.
const EXTRA_PAGE_LABELS = {
  '/volunteer-dashboard/profile': 'Profile',
  '/shelter-dashboard/:ID/settings': 'Settings',
};

const findPageLabel = (pathname, dashboard) => {
  const resolve = (path) => path.replace(':ID', dashboard.id || '');
  const items = navigationConfig[dashboard.type] || [];
  const match = items.find((item) => {
    const resolved = resolve(item.path);
    return pathname === resolved || pathname.startsWith(`${resolved}/`);
  });
  if (match) return match.label;
  const extra = Object.keys(EXTRA_PAGE_LABELS).find((path) => pathname === resolve(path));
  return extra ? EXTRA_PAGE_LABELS[extra] : null;
};

// Breadcrumb trail shown above every dashboard page:
//   Home › <Dashboard name> › <Current page>
// plus a "Back to dashboard" shortcut when on a sub-page.
export const DashboardBreadcrumb = () => {
  const location = useLocation();
  const { currentDashboard } = useCurrentDashboard();

  if (!currentDashboard) return null;

  const basePath = currentDashboard.path;
  const pathname = location.pathname.replace(/\/+$/, '');
  const isOnDashboardRoot = pathname === basePath;
  const pageLabel = isOnDashboardRoot ? null : findPageLabel(pathname, currentDashboard);

  return (
    <nav className="breadcrumb-bar" aria-label="Breadcrumb">
      <ol className="breadcrumb">
        <li>
          <Link to="/home" className="breadcrumb-link">
            <FontAwesomeIcon icon={faHouse} /> Home
          </Link>
        </li>
        <li aria-hidden="true" className="breadcrumb-separator">
          <FontAwesomeIcon icon={faChevronRight} />
        </li>
        <li>
          {isOnDashboardRoot ? (
            <span className="breadcrumb-current" aria-current="page">
              {currentDashboard.name}
            </span>
          ) : (
            <Link to={basePath} className="breadcrumb-link">
              {currentDashboard.name}
            </Link>
          )}
        </li>
        {pageLabel && (
          <>
            <li aria-hidden="true" className="breadcrumb-separator">
              <FontAwesomeIcon icon={faChevronRight} />
            </li>
            <li>
              <span className="breadcrumb-current" aria-current="page">
                {pageLabel}
              </span>
            </li>
          </>
        )}
      </ol>
      {!isOnDashboardRoot && (
        <Link to={basePath} className="breadcrumb-back">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to dashboard
        </Link>
      )}
    </nav>
  );
};

export default DashboardBreadcrumb;
