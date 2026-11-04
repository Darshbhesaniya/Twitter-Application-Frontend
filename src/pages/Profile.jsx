import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Calendar,
  Mail,
  RefreshCw,
  Feather,
  AlertCircle,
  MessageCircle,
  Heart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTweets, getMyReplies, getMyLikedTweets } from '../api/tweetApi';
import { formatRelativeTime } from '../utils/dateUtils';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import TweetCard from '../components/tweet/TweetCard';
import CreateTweetModal from '../components/tweet/CreateTweetModal';

const LIMIT = 10;

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');

  // ── Compose Post Modal State ───────────────────────────────────────────────
  const [isTweetModalOpen, setIsTweetModalOpen] = useState(false);

  // ── Posts state ────────────────────────────────────────────────────────────
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Replies state ──────────────────────────────────────────────────────────
  const [replies, setReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesError, setRepliesError] = useState('');
  const [repliesPage, setRepliesPage] = useState(1);
  const [repliesHasMore, setRepliesHasMore] = useState(true);
  const [repliesLoadingMore, setRepliesLoadingMore] = useState(false);

  // ── Liked tweets state ─────────────────────────────────────────────────────
  const [likedTweets, setLikedTweets] = useState([]);
  const [likesLoading, setLikesLoading] = useState(false);
  const [likesError, setLikesError] = useState('');
  const [likesPage, setLikesPage] = useState(1);
  const [likesHasMore, setLikesHasMore] = useState(true);
  const [likesLoadingMore, setLikesLoadingMore] = useState(false);

  const userId = user?._id || user?.id;

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recently';

  // ── Fetch user's own tweets ────────────────────────────────────────────────
  const fetchUserTweets = useCallback(
    async (pageNum = 1, isInitial = false) => {
      if (!userId) return;
      try {
        if (isInitial) {
          setLoading(true);
          setError('');
        } else {
          setLoadingMore(true);
        }

        const res = await getTweets(pageNum, LIMIT, userId);
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
        setError(err.message || 'Failed to load posts. Please try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [userId]
  );

  // ── Fetch user's replies ───────────────────────────────────────────────────
  const fetchUserReplies = useCallback(
    async (pageNum = 1, isInitial = false) => {
      try {
        if (isInitial) {
          setRepliesLoading(true);
          setRepliesError('');
        } else {
          setRepliesLoadingMore(true);
        }

        const res = await getMyReplies(pageNum, LIMIT);
        const fetched = Array.isArray(res?.data) ? res.data : [];

        if (pageNum === 1) {
          setReplies(fetched);
        } else {
          setReplies((prev) => {
            const ids = new Set(prev.map((r) => r._id || r.id));
            return [...prev, ...fetched.filter((r) => !ids.has(r._id || r.id))];
          });
        }

        setRepliesHasMore(fetched.length >= LIMIT);
        setRepliesPage(pageNum);
      } catch (err) {
        setRepliesError(err.message || 'Failed to load replies.');
      } finally {
        setRepliesLoading(false);
        setRepliesLoadingMore(false);
      }
    },
    []
  );

  // ── Fetch user's liked tweets ──────────────────────────────────────────────
  const fetchUserLikes = useCallback(
    async (pageNum = 1, isInitial = false) => {
      try {
        if (isInitial) {
          setLikesLoading(true);
          setLikesError('');
        } else {
          setLikesLoadingMore(true);
        }

        const res = await getMyLikedTweets(pageNum, LIMIT);
        const fetched = Array.isArray(res?.data) ? res.data : [];

        if (pageNum === 1) {
          setLikedTweets(fetched);
        } else {
          setLikedTweets((prev) => {
            const ids = new Set(prev.map((t) => t._id || t.id));
            return [...prev, ...fetched.filter((t) => !ids.has(t._id || t.id))];
          });
        }

        setLikesHasMore(fetched.length >= LIMIT);
        setLikesPage(pageNum);
      } catch (err) {
        setLikesError(err.message || 'Failed to load liked posts.');
      } finally {
        setLikesLoading(false);
        setLikesLoadingMore(false);
      }
    },
    []
  );

  // Fetch when activeTab changes
  useEffect(() => {
    if (activeTab === 'posts') {
      fetchUserTweets(1, true);
    } else if (activeTab === 'replies') {
      fetchUserReplies(1, true);
    } else if (activeTab === 'likes') {
      fetchUserLikes(1, true);
    }
  }, [activeTab, fetchUserTweets, fetchUserReplies, fetchUserLikes]);

  // Listen for global open tweet modal events (e.g. from Sidebar Post button)
  useEffect(() => {
    const handleOpenModal = () => setIsTweetModalOpen(true);
    window.addEventListener('twitter:open-tweet-modal', handleOpenModal);
    return () => window.removeEventListener('twitter:open-tweet-modal', handleOpenModal);
  }, []);

  // Handle post successfully created from modal
  const handleTweetCreated = (newTweet) => {
    setIsTweetModalOpen(false);
    if (newTweet) {
      setTweets((prev) => {
        const id = newTweet._id || newTweet.id;
        const exists = prev.some((t) => (t._id || t.id) === id);
        return exists ? prev : [newTweet, ...prev];
      });
    }
    // Re-fetch posts to guarantee sync with database
    fetchUserTweets(1, false);
  };

  // Remove deleted tweet from local posts list
  const handleTweetDeleted = (deletedId) => {
    // Remove from local posts list immediately
    setTweets((prev) => prev.filter((t) => (t._id || t.id) !== deletedId));
    // Re-fetch replies and likes so orphaned entries disappear
    fetchUserReplies(1, true);
    fetchUserLikes(1, true);
  };

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

  // ── Posts tab content ──────────────────────────────────────────────────────
  const renderPostsContent = () => {
    if (loading) return <Skeleton />;

    if (error) {
      return (
        <div className="p-8 flex flex-col items-center text-center gap-3">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm text-gray-500">{error}</p>
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
            When you post something it will appear here on your profile.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsTweetModalOpen(true)}
            className="font-bold flex items-center gap-1.5"
          >
            <Feather className="w-4 h-4" />
            Write your first post
          </Button>
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

        {/* Load More Posts */}
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

  // ── Replies tab content ────────────────────────────────────────────────────
  const renderRepliesContent = () => {
    if (repliesLoading) return <Skeleton />;

    if (repliesError) {
      return (
        <div className="p-8 flex flex-col items-center text-center gap-3">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm text-gray-500">{repliesError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUserReplies(1, true)}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      );
    }

    if (replies.length === 0) {
      return (
        <div className="p-12 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-[#1D9BF0]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F1419]">No replies yet</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            When you reply to posts, your replies will show up here.
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-[#EFF3F4]">
        {replies.map((reply) => {
          // Identify reply author (the user who posted this comment)
          const replyAuthorName =
            (typeof reply.userId === 'object' && reply.userId?.name) ||
            user?.name ||
            'User';
          const replyAuthorUsername =
            (typeof reply.userId === 'object' && reply.userId?.username) ||
            user?.username ||
            (user?.email ? user.email.split('@')[0] : 'user');

          // Original tweet context
          const originalTweet =
            reply.commentable && typeof reply.commentable === 'object'
              ? reply.commentable
              : null;
          const targetTweetId = originalTweet?._id || originalTweet?.id;
          const origAuthorId = originalTweet?.user?._id || originalTweet?.user?.id;
          const origAuthorUsername =
            originalTweet?.user?.username ||
            (originalTweet?.user?.email
              ? originalTweet.user.email.split('@')[0]
              : originalTweet?.user?.name
              ? originalTweet.user.name.toLowerCase().replace(/\s+/g, '')
              : 'user');
          const hasOriginalContent = Boolean(originalTweet && originalTweet.content);

          // Card navigation: click anywhere to open original Tweet Details
          const handleCardClick = (e) => {
            if (e.target.closest('button, a, [role="button"]') || e.defaultPrevented) {
              return;
            }
            if (targetTweetId) {
              navigate(`/tweet/${targetTweetId}`);
            }
          };

          return (
            <article
              key={reply._id || reply.id}
              onClick={handleCardClick}
              className={`p-4 transition-colors ${
                targetTweetId ? 'cursor-pointer hover:bg-gray-50/70' : ''
              }`}
            >
              <div className="flex gap-3">
                {/* Reply Author Avatar */}
                <div
                  className="shrink-0 pt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar name={replyAuthorName} size="md" />
                </div>

                {/* Reply & Context Area */}
                <div className="flex-1 min-w-0">
                  {/* Reply Author Header */}
                  <div className="flex items-center gap-1.5 leading-none flex-wrap">
                    <span className="font-bold text-sm text-[#0F1419]">
                      {replyAuthorName}
                    </span>
                    <span className="text-xs text-gray-500">
                      @{replyAuthorUsername}
                    </span>
                    <span className="text-gray-400 text-xs">·</span>
                    <time className="text-xs text-gray-500 whitespace-nowrap">
                      {formatRelativeTime(reply.createdAt)}
                    </time>
                  </div>

                  {/* Replying to label */}
                  {hasOriginalContent && (
                    <p className="text-xs text-gray-500 mt-1">
                      Replying to{' '}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (origAuthorId) {
                            navigate(`/profile/${origAuthorId}`);
                          }
                        }}
                        className="text-[#1D9BF0] hover:underline cursor-pointer font-medium"
                      >
                        @{origAuthorUsername}
                      </span>
                    </p>
                  )}

                  {/* Original Tweet context with subtle visual separation */}
                  {hasOriginalContent ? (
                    <>
                      <div className="mt-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100 border-l-2 border-l-gray-300">
                        <span className="text-[11px] font-medium text-gray-400 block mb-0.5">
                          Original tweet:
                        </span>
                        <p className="text-xs text-gray-500 line-clamp-3 whitespace-pre-wrap break-words leading-relaxed italic">
                          "{originalTweet.content}"
                        </p>
                        {originalTweet.image && (
                          <div className="mt-2 max-w-xs max-h-36 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={originalTweet.image}
                              alt="Original tweet attachment"
                              className="w-full h-auto max-h-36 object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* User's reply content */}
                      <div className="mt-2">
                        <span className="text-[11px] font-medium text-gray-400 block mb-0.5">
                          My reply:
                        </span>
                        <p className="text-sm text-[#0F1419] whitespace-pre-wrap leading-relaxed break-words font-normal">
                          {reply.content}
                        </p>
                      </div>
                    </>
                  ) : (
                    /* Fallback: if original tweet info is unavailable, display reply content directly */
                    <p className="mt-1.5 text-sm text-[#0F1419] whitespace-pre-wrap leading-relaxed break-words">
                      {reply.content}
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {/* Load More Replies */}
        <div className="p-4 flex justify-center">
          {repliesHasMore ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUserReplies(repliesPage + 1)}
              loading={repliesLoadingMore}
              disabled={repliesLoadingMore}
              className="w-full max-w-xs text-[#1D9BF0] hover:bg-sky-50 font-bold"
            >
              Load more replies
            </Button>
          ) : (
            <span className="text-xs text-gray-400">All replies loaded</span>
          )}
        </div>
      </div>
    );
  };

  // ── Likes tab content ──────────────────────────────────────────────────────
  const renderLikesContent = () => {
    if (likesLoading) return <Skeleton />;

    if (likesError) {
      return (
        <div className="p-8 flex flex-col items-center text-center gap-3">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm text-gray-500">{likesError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUserLikes(1, true)}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      );
    }

    if (likedTweets.length === 0) {
      return (
        <div className="p-12 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center">
            <Heart className="w-7 h-7 text-pink-500" />
          </div>
          <h3 className="text-lg font-bold text-[#0F1419]">
            You haven’t liked any posts yet
          </h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Tap the heart on any post to show it some love. When you do, it’ll show up here.
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-[#EFF3F4]">
        {likedTweets.map((tweet) => (
          <TweetCard
            key={tweet._id || tweet.id}
            tweet={tweet}
            onDeleteTweet={(deletedId) => {
              setLikedTweets((prev) =>
                prev.filter((t) => (t._id || t.id) !== deletedId)
              );
            }}
          />
        ))}

        {/* Load More Likes */}
        <div className="p-4 flex justify-center">
          {likesHasMore ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUserLikes(likesPage + 1)}
              loading={likesLoadingMore}
              disabled={likesLoadingMore}
              className="w-full max-w-xs text-[#1D9BF0] hover:bg-sky-50 font-bold"
            >
              Load more likes
            </Button>
          ) : (
            <span className="text-xs text-gray-400">All liked posts loaded</span>
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
            {user?.name || 'Profile'}
          </h2>
          <span className="text-xs text-gray-500">
            {activeTab === 'posts' && tweets.length > 0 && `${tweets.length} post${tweets.length !== 1 ? 's' : ''}`}
            {activeTab === 'replies' && replies.length > 0 && `${replies.length} repl${replies.length !== 1 ? 'ies' : 'y'}`}
            {activeTab === 'likes' && likedTweets.length > 0 && `${likedTweets.length} like${likedTweets.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </header>

      {/* ── Cover Banner ── */}
      <div className="h-28 sm:h-44 bg-gradient-to-r from-sky-400 via-[#1D9BF0] to-blue-600 w-full" />

      {/* ── Profile Info ── */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        {/* Avatar Row */}
        <div className="flex items-end justify-between -mt-10 sm:-mt-16 mb-2.5">
          <div className="ring-4 ring-white rounded-full shrink-0">
            <Avatar
              name={user?.name}
              size="xl"
              className="!w-20 !h-20 sm:!w-28 sm:!h-28 text-2xl sm:text-3xl shadow-sm"
            />
          </div>

          {/* Desktop & Tablet Action Buttons (inline with avatar) */}
          <div className="hidden sm:flex items-center gap-2 pb-1">
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-red-600 hover:bg-red-50 hover:border-red-300 font-bold text-xs px-3 py-1.5"
            >
              Log out
            </Button>
            <Button variant="dark" size="sm" className="font-bold text-xs px-3 py-1.5">
              Edit profile
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsTweetModalOpen(true)}
              className="font-bold text-xs flex items-center gap-1.5 shadow-sm px-3.5 py-1.5"
            >
              <Feather className="w-3.5 h-3.5" />
              Post
            </Button>
          </div>
        </div>

        {/* Mobile Action Buttons Bar (Clean separate row directly below avatar) */}
        <div className="flex sm:hidden items-center gap-2 mb-3 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex-1 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold text-xs py-1.5 px-2"
          >
            Log out
          </Button>
          <Button
            variant="dark"
            size="sm"
            className="flex-1 font-bold text-xs py-1.5 px-2"
          >
            Edit profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsTweetModalOpen(true)}
            className="font-bold text-xs flex items-center justify-center gap-1 shadow-sm py-1.5 px-3 shrink-0"
          >
            <Feather className="w-3.5 h-3.5" />
            Post
          </Button>
        </div>

        {/* Name & handle */}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-black text-[#0F1419] truncate leading-tight">
            {user?.name || 'Twitter User'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            @{user?.username || (user?.email ? user.email.split('@')[0] : 'user')}
          </p>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
          {user?.email && (
            <div className="flex items-center gap-1 min-w-0 max-w-full">
              <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
          {joinedDate && (
            <div className="flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              <span>Joined {joinedDate}</span>
            </div>
          )}
        </div>
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

      {/* ── Active Tab Content ── */}
      {activeTab === 'posts' && renderPostsContent()}
      {activeTab === 'replies' && renderRepliesContent()}
      {activeTab === 'likes' && renderLikesContent()}

      {/* ── Twitter-Style Compose Post Modal ── */}
      <CreateTweetModal
        isOpen={isTweetModalOpen}
        onClose={() => setIsTweetModalOpen(false)}
        onTweetCreated={handleTweetCreated}
        user={user}
      />
    </div>
  );
};

export default Profile;
