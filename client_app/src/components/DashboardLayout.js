import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

function DashboardLayout({currentDashboard}) {  
  return (
    <div className="home-container">
      <div className="content-wrapper">
        <Sidebar dashboard={currentDashboard} isOpen={true} />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;