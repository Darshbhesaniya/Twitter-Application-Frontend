import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import TweetComposer from '../components/tweet/TweetComposer';
import TweetFeed from '../components/tweet/TweetFeed';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('forYou');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTweetCreated = () => {
    // Increment trigger to cause TweetFeed to re-fetch newest tweets from page 1
    setRefreshTrigger((prev) => prev + 1);
  };

  // Re-fetch tweets when a post is created via the compose modal
  useEffect(() => {
    const handleGlobalTweetCreated = () => {
      setRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener('twitter:tweet-created', handleGlobalTweetCreated);
    return () => window.removeEventListener('twitter:tweet-created', handleGlobalTweetCreated);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Sticky Header with Twitter Tabs */}
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#EFF3F4]">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-xl font-bold text-[#0F1419]">Home</h2>
          <Sparkles className="w-5 h-5 text-gray-500 cursor-pointer hover:text-black transition-colors" />
        </div>

        {/* Tab Navigation: For you / Following */}
        <div className="flex border-t border-[#EFF3F4]">
          <button
            onClick={() => setActiveTab('forYou')}
            className="flex-1 py-3 hover:bg-gray-50 text-center font-bold text-sm relative transition-colors"
          >
            <span
              className={`${
                activeTab === 'forYou' ? 'text-[#0F1419]' : 'text-gray-500'
              }`}
            >
              For you
            </span>
            {activeTab === 'forYou' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1D9BF0] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className="flex-1 py-3 hover:bg-gray-50 text-center font-bold text-sm relative transition-colors"
          >
            <span
              className={`${
                activeTab === 'following' ? 'text-[#0F1419]' : 'text-gray-500'
              }`}
            >
              Following
            </span>
            {activeTab === 'following' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#1D9BF0] rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Tweet Composer at the top of the Home Timeline */}
      <TweetComposer onTweetCreated={handleTweetCreated} />

      {/* Real Tweet Feed from Backend */}
      <TweetFeed refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default HomePage;
