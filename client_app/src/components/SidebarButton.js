import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons'; // This is the hamburger menu icon
import { useSidebar } from '../contexts/DashboardContext';

export const SidebarButton = () => {
  const {isSidebarOpen, setIsSidebarOpen} = useSidebar();
  return (
    <button
      onClick={() => {setIsSidebarOpen(!isSidebarOpen)}}
      className='button button-transparent'
    >
      <FontAwesomeIcon icon={faBars} />
    </button>
  );
};
