import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons'; // This is the hamburger menu icon
import { useSidebar } from '../contexts/DashboardContext';

export const SidebarButton = () => {
  const {isSidebarOpen, setIsSidebarOpen} = useSidebar();
  return (
    <button
      type="button"
      onClick={() => {setIsSidebarOpen(!isSidebarOpen)}}
      className="icon-button"
      aria-label={isSidebarOpen ? "Collapse navigation" : "Expand navigation"}
      aria-expanded={isSidebarOpen}
    >
      <FontAwesomeIcon icon={faBars} />
    </button>
  );
};
