import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Feather } from 'lucide-react';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileHeader from './MobileHeader';
import MobileNav from './MobileNav';
import CreateTweetModal from '../tweet/CreateTweetModal';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);

  const isProfilePage = location.pathname === '/profile';

  // Open compose modal when clicking Post button from any page (Home, Profile, etc.)
  const handleOpenTweetModal = () => {
    if (isProfilePage) {
      // Profile page has its own dedicated handler to refresh profile timeline
      window.dispatchEvent(new CustomEvent('twitter:open-tweet-modal'));
    } else {
      // Open modal on Home page and all other pages
      setIsGlobalModalOpen(true);
    }
  };

  const handleGlobalTweetCreated = (createdTweet) => {
    setIsGlobalModalOpen(false);
    // Notify Home page feed to refresh immediately
    window.dispatchEvent(new CustomEvent('twitter:tweet-created', { detail: createdTweet }));
    // If not on Home or Profile, navigate to Home feed so user sees their new post
    if (location.pathname !== '/' && location.pathname !== '/profile') {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0F1419] flex justify-center">
      {/* Container limited to standard Twitter width */}
      <div className="w-full max-w-7xl flex">
        {/* Left Sidebar (Desktop & Tablet) */}
        <div className="hidden md:block w-16 xl:w-64 shrink-0">
          <Sidebar onOpenTweetModal={handleOpenTweetModal} />
        </div>

        {/* Center Main Content Area */}
        <main className="flex-1 min-h-screen w-full max-w-[600px] md:border-r border-[#EFF3F4] flex flex-col pb-28 md:pb-0">
          {/* Mobile Top Header */}
          <MobileHeader />

          {/* Child Route Pages (Home, Profile, etc.) */}
          <div className="flex-1">
            <Outlet />
          </div>
        </main>

        {/* Right Sidebar (Desktop only) */}
        <div className="hidden lg:block w-72 xl:w-80 shrink-0">
          <RightSidebar />
        </div>
      </div>

      {/* Floating Action Button for mobile screens */}
      <button
        onClick={handleOpenTweetModal}
        aria-label="Create Post"
        className="md:hidden fixed bottom-[68px] right-3.5 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform"
      >
        <Feather className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Compose Modal (available across Home and all non-profile routes) */}
      {!isProfilePage && (
        <CreateTweetModal
          isOpen={isGlobalModalOpen}
          onClose={() => setIsGlobalModalOpen(false)}
          onTweetCreated={handleGlobalTweetCreated}
        />
      )}
    </div>
  );
};

export default MainLayout;
