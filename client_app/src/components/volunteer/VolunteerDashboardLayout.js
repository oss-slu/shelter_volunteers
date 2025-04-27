import { Outlet } from 'react-router-dom';
import NavBarVolunteerDashboard from './NavBarVolunteerDashboard';

function VolunteerDashboardLayout() {
  return (
    <div>
      <NavBarVolunteerDashboard />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default VolunteerDashboardLayout;