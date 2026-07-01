import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  BuildingIcon,
  ChatIcon,
  EuroIcon,
  HeartIcon,
  UserIcon,
} from '@/components/common/icons';

interface Tab {
  to: string;
  label: string;
  icon: ReactNode;
}

// Solo 5 pestañas principales (según especificación).
const TABS: Tab[] = [
  { to: '/discover', label: 'Descubrir', icon: <HeartIcon width={22} height={22} /> },
  { to: '/matches', label: 'Matches', icon: <ChatIcon width={22} height={22} /> },
  { to: '/my-flat', label: 'Mi piso', icon: <BuildingIcon width={22} height={22} /> },
  { to: '/my-flat/payments', label: 'Pagos', icon: <EuroIcon width={22} height={22} /> },
  { to: '/profile', label: 'Perfil', icon: <UserIcon width={22} height={22} /> },
];

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/my-flat'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                isActive ? 'text-brand-500' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {tab.icon}
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
