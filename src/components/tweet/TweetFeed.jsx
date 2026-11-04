import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw, Feather } from 'lucide-react';
import { getTweets } from '../../api/tweetApi';
import TweetCard from './TweetCard';
import Button from '../common/Button';

const TweetFeed = ({ refreshTrigger }) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 10;

  // Fetch tweets from backend
  const fetchTweets = useCallback(async (pageNum = 1, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      // Existing API method: getTweets(page, limit)
      const response = await getTweets(pageNum, LIMIT);

      // Backend returns: { success: true, message: '...', data: [...] }
      const newTweets = Array.isArray(response?.data) ? response.data : [];

      if (pageNum === 1) {
        setTweets(newTweets);
      } else {
        // Append unique tweets by _id
        setTweets((prev) => {
          const existingIds = new Set(prev.map((t) => t._id || t.id));
          const filtered = newTweets.filter((t) => !existingIds.has(t._id || t.id));
          return [...prev, ...filtered];
        });
      }

      // If backend returns fewer items than limit, we reached the end
      if (newTweets.length < LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setPage(pageNum);
    } catch (err) {
      setError(err.message || 'Unable to load timeline. Please check your connection.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial fetch and on refresh trigger
  useEffect(() => {
    fetchTweets(1, true);
  }, [fetchTweets, refreshTrigger]);

  // Load next page
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTweets(page + 1, false);
    }
  };

  // Remove tweet from local state when deleted
  const handleTweetDeleted = (deletedTweetId) => {
    setTweets((prev) => prev.filter((t) => (t._id || t.id) !== deletedTweetId));
  };

  // Loading skeleton placeholder components
  const renderSkeletons = () => (
    <div className="divide-y divide-[#EFF3F4]">
      {[1, 2, 3].map((n) => (
        <div key={n} className="p-4 flex gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3.5 bg-gray-200 rounded w-5/6" />
            <div className="h-3.5 bg-gray-200 rounded w-2/3" />
            <div className="h-36 bg-gray-100 rounded-2xl w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );

  // 1. Initial Loading State
  if (loading) {
    return renderSkeletons();
  }

  // 2. Error State
  if (error && tweets.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0F1419] mb-1">
          Something went wrong
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mb-4">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchTweets(1, true)}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  // 3. Empty State (no tweets exist yet)
  if (tweets.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center select-none">
        <div className="w-14 h-14 bg-sky-50 text-[#1D9BF0] rounded-full flex items-center justify-center mb-3">
          <Feather className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-extrabold text-[#0F1419] mb-1">
          No tweets yet
        </h3>
        <p className="text-sm text-gray-500 max-w-xs mb-4">
          When people post tweets, they'll show up here. Use the composer above to share what's on your mind!
        </p>
      </div>
    );
  }

  // 4. Tweets Timeline List
  return (
    <div className="divide-y divide-[#EFF3F4]">
      {tweets.map((tweet) => (
        <TweetCard
          key={tweet._id || tweet.id}
          tweet={tweet}
          onDeleteTweet={handleTweetDeleted}
        />
      ))}

      {/* Pagination: Load More */}
      <div className="p-4 flex justify-center">
        {hasMore ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={loadingMore}
            loading={loadingMore}
            className="w-full max-w-xs py-2 text-sm text-[#1D9BF0] hover:bg-sky-50 border-[#EFF3F4]"
          >
            Load more posts
          </Button>
        ) : (
          <span className="text-xs text-gray-400 py-2">
            You're all caught up!
          </span>
        )}
      </div>
    </div>
  );
};

export default TweetFeed;

