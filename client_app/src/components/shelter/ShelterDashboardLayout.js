import { Outlet } from 'react-router-dom';
import NavBarShelterDashboard from './NavBarShelterDashboard';

function ShelterDashboardLayout() {
  return (
    <div>
      <NavBarShelterDashboard />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default ShelterDashboardLayout;