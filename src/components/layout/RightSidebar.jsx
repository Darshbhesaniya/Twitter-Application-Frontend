import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

const RightSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample trending topics matching Twitter feel
  const trendingTopics = [
    { category: 'Technology · Trending', topic: '#NodeJS', tweets: '42.5K' },
    { category: 'Web Development · Trending', topic: '#ReactJS', tweets: '128.2K' },
    { category: 'Coding · Trending', topic: '#FullStackDeveloper', tweets: '18.9K' },
    { category: 'Trending in Tech', topic: '#TailwindCSS', tweets: '9.4K' },
  ];

  // Sample suggested accounts
  const whoToFollow = [
    { name: 'JavaScript Daily', handle: 'JavaScriptDaily', initial: 'JS' },
    { name: 'React', handle: 'reactjs', initial: 'R' },
    { name: 'Vite', handle: 'vitejs', initial: 'V' },
  ];

  return (
    <aside className="sticky top-0 h-screen overflow-y-auto hidden lg:flex flex-col gap-4 py-3 px-4 xl:px-6 select-none">
      {/* Search Bar */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md pt-1 pb-2 z-10">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-[#EFF3F4] text-sm text-[#0F1419] rounded-full pl-11 pr-4 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-[#1D9BF0] border border-transparent transition-all"
          />
        </div>
      </div>

      {/* Subscribe to Premium Banner */}
      <div className="bg-[#F7F9F9] rounded-2xl p-4 border border-[#EFF3F4]">
        <h3 className="font-extrabold text-[#0F1419] text-base leading-snug">
          Subscribe to Premium
        </h3>
        <p className="text-xs text-gray-500 mt-1 mb-3 leading-relaxed">
          Subscribe to unlock new features and if eligible, receive a share of ads revenue.
        </p>
        <Button variant="dark" size="sm" className="font-bold">
          Subscribe
        </Button>
      </div>

      {/* What's Happening Card */}
      <div className="bg-[#F7F9F9] rounded-2xl p-4 border border-[#EFF3F4]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-[#0F1419] text-lg">What's happening</h3>
          <Sparkles className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex flex-col divide-y divide-[#EFF3F4]">
          {trendingTopics.map((item, idx) => (
            <div
              key={idx}
              className="py-2.5 hover:bg-gray-100/70 -mx-4 px-4 transition-colors cursor-pointer"
            >
              <span className="text-xs text-gray-500">{item.category}</span>
              <p className="font-bold text-sm text-[#0F1419]">{item.topic}</p>
              <span className="text-xs text-gray-500">{item.tweets} posts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Who To Follow Card */}
      <div className="bg-[#F7F9F9] rounded-2xl p-4 border border-[#EFF3F4]">
        <h3 className="font-extrabold text-[#0F1419] text-lg mb-3">Who to follow</h3>
        <div className="flex flex-col gap-3">
          {whoToFollow.map((account, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar name={account.name} size="sm" />
                <div className="min-w-0 flex flex-col">
                  <span className="font-bold text-sm text-[#0F1419] truncate leading-tight hover:underline cursor-pointer">
                    {account.name}
                  </span>
                  <span className="text-xs text-gray-500 truncate leading-tight">
                    @{account.handle}
                  </span>
                </div>
              </div>
              <Button variant="dark" size="sm" className="text-xs px-3 py-1 shrink-0">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info Links */}
      <div className="text-[11px] text-gray-400 flex flex-wrap gap-x-2 gap-y-1 px-2 pt-2">
        <a href="#terms" className="hover:underline">Terms of Service</a>
        <span>·</span>
        <a href="#privacy" className="hover:underline">Privacy Policy</a>
        <span>·</span>
        <a href="#cookies" className="hover:underline">Cookie Policy</a>
        <span>·</span>
        <a href="#accessibility" className="hover:underline">Accessibility</a>
        <span>·</span>
        <span>© 2026 Twitter / X Clone</span>
      </div>
    </aside>
  );
};

export default RightSidebar;

