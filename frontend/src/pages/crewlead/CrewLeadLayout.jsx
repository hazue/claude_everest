import AppShell from '../../components/AppShell.jsx';

const NAV_ITEMS = [
  { to: '/crewlead/reports', label: 'Usage Reports' },
  { to: '/crewlead/passengers', label: 'Passengers' },
  { to: '/crewlead/resources', label: 'Resources' },
  { to: '/crewlead/tiers', label: 'Passenger Tiers' },
  { to: '/crewlead/audits', label: 'Audit Logs' },
];

export default function CrewLeadLayout() {
  return (
    <AppShell
      brandTitle="Crew Lead Console"
      brandSubtitle="Deck access terminal"
      navItems={NAV_ITEMS}
      loginPath="/login/crewlead"
    />
  );
}
