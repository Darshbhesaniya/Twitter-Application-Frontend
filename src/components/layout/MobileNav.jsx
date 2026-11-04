import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User } from 'lucide-react';

const MobileNav = () => {
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-[#EFF3F4] px-4 h-14 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `
              p-2.5 rounded-full transition-colors flex items-center justify-center min-w-[48px] min-h-[48px]
              ${isActive ? 'text-[#0F1419]' : 'text-gray-500 hover:text-gray-700'}
            `}
            aria-label={item.label}
          >
            {({ isActive }) => (
              <Icon
                className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`}
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileNav;
