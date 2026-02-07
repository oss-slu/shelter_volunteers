import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { getUser } from '../authentication/user';
import { useCurrentDashboard } from '../contexts/DashboardContext';
import { getUserProfile } from '../api/volunteerApi';
import IncompleteProfileModal from './volunteer/IncompleteProfileModal';

// Session storage key to track if user has dismissed the modal this session
const PROFILE_MODAL_DISMISSED_KEY = 'incompleteProfileModalDismissed';

function DashboardLayout() {
  const user = getUser();
  const location = useLocation();
  const { currentDashboard } = useCurrentDashboard();
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  // Check if we're on a volunteer dashboard route
  const isVolunteerDashboard = location.pathname.startsWith('/volunteer-dashboard') || 
    currentDashboard?.type === 'volunteer';

  // When on profile page, always re-check so "Complete your profile" shows every time they click "View Profile"
  const isOnProfilePage = location.pathname === '/volunteer-dashboard/profile';

  // Check if profile is complete when volunteer dashboard loads or when visiting profile page
  useEffect(() => {
    const checkVolunteerProfile = async () => {
      // Only check for volunteer dashboard
      if (!isVolunteerDashboard) {
        return;
      }

      // If user clicked "View Profile" (on profile page), always check and show modal if incomplete.
      // Otherwise (first visit to dashboard), only show if they haven't dismissed this session.
      if (!isOnProfilePage) {
        const modalDismissed = sessionStorage.getItem(PROFILE_MODAL_DISMISSED_KEY);
        if (modalDismissed === 'true') {
          setProfileChecked(true);
          return;
        }
      }

      try {
        const profile = await getUserProfile();
        // Check if profile is incomplete (missing required fields)
        // Note: getUserProfile returns null on 404 (no profile exists yet)
        const isIncomplete = !profile || 
          !profile.firstName?.trim() || 
          !profile.lastName?.trim() || 
          !profile.phone?.trim();
        if (isIncomplete) {
          setShowIncompleteProfileModal(true);
        }
      } catch (error) {
        // If there's an error fetching profile, show the modal to be safe
        console.error('Error checking profile:', error);
        setShowIncompleteProfileModal(true);
      } finally {
        setProfileChecked(true);
      }
    };

    // Run check: when on profile page always run; otherwise only if not yet checked this session
    if (isVolunteerDashboard && (!profileChecked || isOnProfilePage)) {
      checkVolunteerProfile();
    }
  }, [isVolunteerDashboard, isOnProfilePage, profileChecked]);

  const handleCloseModal = () => {
    setShowIncompleteProfileModal(false);
    // Remember that user dismissed the modal for this session
    sessionStorage.setItem(PROFILE_MODAL_DISMISSED_KEY, 'true');
  };

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
      {/* Incomplete Profile Modal for Volunteers */}
      {isVolunteerDashboard && (
        <IncompleteProfileModal
          isOpen={showIncompleteProfileModal}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default DashboardLayout;