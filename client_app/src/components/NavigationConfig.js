import { faHome, faShield, faGear, faCalendar, faHeart, faClock, faUser } from '@fortawesome/free-solid-svg-icons';
const navigationConfig = {
  volunteer: [
    { icon: faHome, label: 'Your Impact', path: '/volunteer-dashboard/impact', description: 'View the impact you made by volunteering.' },
    { icon: faHeart, label: 'Sign Up to Help', path: '/volunteer-dashboard/shelters', description: 'Find shelters in need of volunteers and sign up to help.' },
    { icon: faClock, label: 'Upcoming Shifts', path: '/volunteer-dashboard/upcoming-shifts', description: 'View and manage your upcoming volunteering shifts.' },
    { icon: faShield, label: 'Past Shifts', path: '/volunteer-dashboard/past-shifts', description: 'Review your past volunteering activities and contributions.' },
    { icon: faUser, label: 'Account', path: '/volunteer-dashboard/profile', description: 'View and edit your profile information.' }
  ],
  shelter: [
    { icon: faGear, label: 'Users', path: '/shelter-dashboard/:ID/users', description: 'View, add, or remove other shelter admins.' },
    { icon: faCalendar, label: 'Daily Schedule', path: '/shelter-dashboard/:ID/repeatable-shifts', description: 'Create and manage a schedule that will be used when you open a shelter.' },
    { icon: faCalendar, label: 'Open Shelter', path: '/shelter-dashboard/:ID/schedule', description: 'Select days when the shelter will be open and define volunteering shifts.' },
    { icon: faClock, label: 'Upcoming Shifts', path: '/shelter-dashboard/:ID/upcoming-shifts' }
  ],
  admin: [
    { icon: faHome, label: 'Shelters', path: '/admin-dashboard/shelters' },
    { icon: faGear, label: 'Users', path: '/admin-dashboard/users', description: 'View, add, or remove other shelter admins.' },
  ]
};

export default navigationConfig;
