import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, RefreshCw, Feather, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserById } from '../api/authApi';
import { getTweets } from '../api/tweetApi';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import TweetCard from '../components/tweet/TweetCard';

const LIMIT = 10;

const PublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('posts');

  // ── User state ─────────────────────────────────────────────────────────────
  const [profileUser, setProfileUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState('');

  // ── User tweets state ──────────────────────────────────────────────────────
  const [tweets, setTweets] = useState([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [tweetsError, setTweetsError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const isCurrentUser =
    Boolean(currentUser && id && (currentUser._id === id || currentUser.id === id));

  // ── Fetch User Details ─────────────────────────────────────────────────────
  const fetchUserDetails = useCallback(async () => {
    if (!id) return;
    try {
      setUserLoading(true);
      setUserError('');
      const res = await getUserById(id);
      const data = res?.data;
      if (!data) {
        setUserError('User not found.');
        setProfileUser(null);
      } else {
        setProfileUser(data);
      }
    } catch (err) {
      setUserError(err.message || 'Failed to load user profile.');
      setProfileUser(null);
    } finally {
      setUserLoading(false);
    }
  }, [id]);

  // ── Fetch this user's tweets ───────────────────────────────────────────────
  const fetchUserTweets = useCallback(
    async (pageNum = 1, isInitial = false) => {
      if (!id) return;
      try {
        if (isInitial) {
          setTweetsLoading(true);
          setTweetsError('');
        } else {
          setLoadingMore(true);
        }

        // Pass id as userId to filter tweets for this specific user
        const res = await getTweets(pageNum, LIMIT, id);
        const fetched = Array.isArray(res?.data) ? res.data : [];

        if (pageNum === 1) {
          setTweets(fetched);
        } else {
          setTweets((prev) => {
            const ids = new Set(prev.map((t) => t._id || t.id));
            return [...prev, ...fetched.filter((t) => !ids.has(t._id || t.id))];
          });
        }

        setHasMore(fetched.length >= LIMIT);
        setPage(pageNum);
      } catch (err) {
        setTweetsError(err.message || 'Failed to load posts. Please try again.');
      } finally {
        setTweetsLoading(false);
        setLoadingMore(false);
      }
    },
    [id]
  );

  // Initial load
  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchUserTweets(1, true);
    }
  }, [activeTab, fetchUserTweets]);

  // Remove deleted tweet from local list
  const handleTweetDeleted = (deletedId) => {
    setTweets((prev) => prev.filter((t) => (t._id || t.id) !== deletedId));
  };

  const authorName = profileUser?.name || 'Twitter User';
  const authorUsername =
    profileUser?.username ||
    (profileUser?.email ? profileUser.email.split('@')[0] : 'user');
  const authorHandle = `@${authorUsername}`;

  const joinedDate = profileUser?.createdAt
    ? new Date(profileUser.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  // ── Skeleton placeholder ───────────────────────────────────────────────────
  const Skeleton = () => (
    <div className="divide-y divide-[#EFF3F4]">
      {[1, 2, 3].map((n) => (
        <div key={n} className="p-4 flex gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="h-3.5 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  // ── Loading state for entire profile ───────────────────────────────────────
  if (userLoading) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#EFF3F4] px-4 py-3 flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F1419]" />
          </button>
          <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
        </header>

        <div className="h-36 sm:h-48 bg-gray-200 animate-pulse w-full" />

        <div className="px-4 pb-4 animate-pulse">
          <div className="-mt-14 sm:-mt-16 mb-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-300 ring-4 ring-white" />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-40" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
        </div>

        <Skeleton />
      </div>
    );
  }

  // ── User Not Found or Error state ──────────────────────────────────────────
  if (userError || !profileUser) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#EFF3F4] px-4 py-3 flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F1419]" />
          </button>
          <h2 className="text-xl font-bold text-[#0F1419]">Profile</h2>
        </header>

        <div className="p-12 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-[#0F1419]">
            This account doesn’t exist
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Try searching for another user or return home.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUserDetails}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Posts tab content ──────────────────────────────────────────────────────
  const renderPostsContent = () => {
    if (tweetsLoading) return <Skeleton />;

    if (tweetsError) {
      return (
        <div className="p-8 flex flex-col items-center text-center gap-3">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm text-gray-500">{tweetsError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUserTweets(1, true)}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      );
    }

    if (tweets.length === 0) {
      return (
        <div className="p-12 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center">
            <Feather className="w-7 h-7 text-[#1D9BF0]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F1419]">No posts yet</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            When {authorHandle} posts something, it will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-[#EFF3F4]">
        {tweets.map((tweet) => (
          <TweetCard
            key={tweet._id || tweet.id}
            tweet={tweet}
            onDeleteTweet={handleTweetDeleted}
          />
        ))}

        {/* Load More Pagination */}
        <div className="p-4 flex justify-center">
          {hasMore ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUserTweets(page + 1)}
              loading={loadingMore}
              disabled={loadingMore}
              className="w-full max-w-xs text-[#1D9BF0] hover:bg-sky-50 font-bold"
            >
              Load more posts
            </Button>
          ) : (
            <span className="text-xs text-gray-400">All posts loaded</span>
          )}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'replies', label: 'Replies' },
    { id: 'likes', label: 'Likes' },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Sticky Top Bar ── */}
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#EFF3F4] px-4 py-2 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-[#0F1419]" />
        </button>
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-[#0F1419] leading-tight truncate">
            {authorName}
          </h2>
          <span className="text-xs text-gray-500">
            {tweets.length > 0
              ? `${tweets.length} post${tweets.length !== 1 ? 's' : ''}`
              : ''}
          </span>
        </div>
      </header>

      {/* ── Cover Banner ── */}
      <div className="h-28 sm:h-44 bg-gradient-to-r from-sky-400 via-[#1D9BF0] to-blue-600 w-full" />

      {/* ── Profile Info ── */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        {/* Avatar + Action Button */}
        <div className="flex items-end justify-between -mt-10 sm:-mt-16 mb-2.5">
          <div className="ring-4 ring-white rounded-full shrink-0">
            <Avatar
              name={authorName}
              size="xl"
              className="!w-20 !h-20 sm:!w-28 sm:!h-28 text-2xl sm:text-3xl shadow-sm"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pb-1">
            {isCurrentUser ? (
              <Button
                variant="dark"
                size="sm"
                onClick={() => navigate('/profile')}
                className="font-bold text-xs px-3 py-1.5"
              >
                Go to my profile
              </Button>
            ) : null}
          </div>
        </div>

        {/* Name & Username */}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-black text-[#0F1419] truncate leading-tight">
            {authorName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 truncate">{authorHandle}</p>
        </div>

        {/* Meta (Joined Date only if available - NO EMAIL) */}
        {joinedDate && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Joined {joinedDate}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex border-b border-[#EFF3F4] w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 text-center relative transition-colors min-w-0"
          >
            <span className={`truncate block ${activeTab === tab.id ? 'text-[#0F1419]' : ''}`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-12 max-w-[50%] bg-[#1D9BF0] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'posts' ? (
        renderPostsContent()
      ) : (
        <div className="py-12 px-6 text-center">
          <h4 className="text-lg font-bold text-[#0F1419]">No {activeTab} yet</h4>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            When {authorHandle} shares {activeTab}, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;

