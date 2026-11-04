import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  User,
  LogOut,
  Feather,
  MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

const Sidebar = ({ onOpenTweetModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sticky top-0 h-screen flex flex-col justify-between py-3 px-2 sm:px-4 md:px-6 border-r border-[#EFF3F4] select-none">
      {/* Top Section: Logo & Nav items */}
      <div className="flex flex-col items-center xl:items-start gap-1">
        {/* Twitter Logo */}
        <NavLink
          to="/"
          className="p-3 hover:bg-sky-50 rounded-full transition-colors duration-200 text-[#1D9BF0] flex items-center justify-center mb-2"
          aria-label="Twitter Home"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-8 h-8 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </NavLink>

        {/* Navigation Links */}
        <nav className="w-full flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-4 p-3 rounded-full transition-colors duration-200
                  ${isActive ? 'font-bold text-[#0F1419]' : 'text-gray-700 hover:bg-gray-100 font-normal'}
                  justify-center xl:justify-start
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-6 h-6 shrink-0 ${isActive ? 'stroke-[2.5px] text-[#0F1419]' : 'stroke-2'}`}
                    />
                    <span className="hidden xl:inline text-xl leading-none">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Post Button */}
        <div className="w-full mt-4 flex justify-center xl:justify-start">
          <Button
            variant="primary"
            size="lg"
            onClick={onOpenTweetModal || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
            className="hidden xl:flex w-full py-3.5 text-base shadow-sm font-bold"
          >
            Post
          </Button>

          {/* Compact round Post button for tablets */}
          <button
            onClick={onOpenTweetModal || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
            aria-label="Create Post"
            className="xl:hidden w-12 h-12 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white flex items-center justify-center shadow-md transition-colors"
          >
            <Feather className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Section: User Profile Pill & Logout Dropdown */}
      <div className="relative w-full">
        {showLogoutMenu && (
          <div className="absolute bottom-full left-0 mb-3 w-64 bg-white rounded-2xl shadow-xl border border-[#EFF3F4] p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-semibold text-sm transition-colors text-left"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log out @{user?.username || (user?.email ? user.email.split('@')[0] : 'user')}</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowLogoutMenu(!showLogoutMenu)}
          className="w-full flex items-center justify-between p-2.5 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar name={user?.name} size="md" />
            <div className="hidden xl:flex flex-col text-left truncate">
              <span className="font-bold text-sm text-[#0F1419] truncate leading-tight">
                {user?.name || 'Twitter User'}
              </span>
              <span className="text-xs text-gray-500 truncate leading-tight">
                @{user?.username || (user?.email ? user.email.split('@')[0] : 'user')}
              </span>
            </div>
          </div>
          <MoreHorizontal className="hidden xl:block w-5 h-5 text-gray-500 shrink-0 ml-1" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
