import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const MobileHeader = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 md:hidden flex items-center justify-between px-4 py-2.5 bg-white/90 backdrop-blur-md border-b border-[#EFF3F4]">
      {/* User profile avatar link */}
      <NavLink to="/profile" className="shrink-0">
        <Avatar name={user?.name} size="sm" />
      </NavLink>

      {/* Twitter Logo */}
      <NavLink to="/" className="text-[#1D9BF0] flex items-center justify-center">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </NavLink>

      {/* Spacer to balance layout */}
      <div className="w-8" />
    </header>
  );
};

export default MobileHeader;

