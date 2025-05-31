import { faHome, faShield, faGear, faCalendar, faHeart, faClock } from '@fortawesome/free-solid-svg-icons';
const navigationConfig = {
  volunteer: [
    { icon: faHome, label: 'Volunteer Dashboard', path: '/volunteer-dashboard' },
    { icon: faHeart, label: 'Sign Up to Help', path: '/volunteer-dashboard/shelters' },
    { icon: faCalendar, label: 'Upcoming Shifts', path: '/volunteer-dashboard/upcoming-shifts' },
    { icon: faShield, label: 'Past Shifts', path: '/volunteer-dashboard/past-shifts' }
  ],
  shelter: [
    { icon: faHome, label: 'Shelter Dashboard', path: '/shelter-dashboard/:ID' },
    { icon: faGear, label: 'Settings', path: '/shelter-dashboard/:ID/settings' },
    { icon: faCalendar, label: 'Schedule Shifts', path: '/shelter-dashboard/:ID/schedule' },
    { icon: faClock, label: 'Upcoming Shifts', path: '/shelter-dashboard/:ID/upcoming-shifts' }
  ],
  admin: [
    { icon: faHome, label: 'System Admin Dashboard', path: '/admin-dashboard' },
  ]
};

export default navigationConfig;
