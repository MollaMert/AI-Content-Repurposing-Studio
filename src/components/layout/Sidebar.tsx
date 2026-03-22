import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/archive', icon: Archive, label: 'Archive' },
];

export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-glass border-r border-glass-border backdrop-blur-md p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">AI Content Studio</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-accent text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
