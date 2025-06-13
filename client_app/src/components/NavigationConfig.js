import { faHome, faShield, faGear, faCalendar, faHeart, faClock } from '@fortawesome/free-solid-svg-icons';
const navigationConfig = {
  volunteer: [
    { icon: faHome, label: 'Your Impact', path: '/volunteer-dashboard/impact', description: 'View the impact you made by volunteering.' },
    { icon: faHeart, label: 'Sign Up to Help', path: '/volunteer-dashboard/shelters', description: 'Find shelters in need of volunteers and sign up to help.' },
    { icon: faClock, label: 'Upcoming Commitments', path: '/volunteer-dashboard/upcoming-shifts', description: 'View and manage your upcoming volunteering commitments.' },
    { icon: faShield, label: 'Past Shifts', path: '/volunteer-dashboard/past-shifts', description: 'Review your past volunteering activities and contributions.' }
  ],
  shelter: [
    { icon: faGear, label: 'Users', path: '/shelter-dashboard/:ID/users', description: 'View, add, or remove other shelter admins.' },
    { icon: faCalendar, label: 'Repeatable Shifts', path: '/shelter-dashboard/:ID/repeatable-shifts', description: 'Create and manage repeatable volunteer shifts for your shelter.' },
    { icon: faCalendar, label: 'Manage Shifts', path: '/shelter-dashboard/:ID/schedule', description: 'View and manage the schedule of shifts for your shelter.' },
    { icon: faClock, label: 'Upcoming Shifts', path: '/shelter-dashboard/:ID/upcoming-shifts' }
  ],
  admin: [
    { icon: faHome, label: 'Shelters', path: '/admin-dashboard/shelters' },
  ]
};

export default navigationConfig;
