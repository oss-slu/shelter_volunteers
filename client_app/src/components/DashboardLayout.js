import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { getUser } from '../authentication/user';

function DashboardLayout() {
  const user = getUser();
  return (
    <>
      <div className="app">
        <Sidebar />
        <div className="content-with-header">
          <Header user={user} />
          <div className="home-container">
            <div className="content-wrapper">
              <main>
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardLayout;