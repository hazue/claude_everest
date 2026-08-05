import AppShell from '../../components/AppShell.jsx';

const NAV_ITEMS = [
  { to: '/passenger/profile', label: 'Profile' },
  { to: '/passenger/resources', label: 'Resources' },
  { to: '/passenger/history', label: 'History' },
];

export default function PassengerLayout() {
  return (
    <AppShell
      brandTitle="Passenger Resources"
      brandSubtitle="Deck access terminal"
      navItems={NAV_ITEMS}
      loginPath="/login/passenger"
    />
  );
}
