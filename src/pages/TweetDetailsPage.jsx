import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTweetById, deleteTweet, toggleLike } from '../api/tweetApi';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import CommentSection from '../components/tweet/CommentSection';
import { checkIsLiked, saveUserLike } from '../utils/likeUtils';

// Helper to determine if current user is owner of the tweet
const isTweetOwner = (currentUser, tweet) => {
  if (!currentUser || !tweet) return false;
  const myId = String(currentUser._id || currentUser.id || '');
  if (!myId) return false;

  if (tweet.user && typeof tweet.user === 'object' && tweet.user._id) {
    return String(tweet.user._id) === myId;
  }
  if (tweet.user && typeof tweet.user === 'string') {
    return tweet.user === myId;
  }
  const tweetId = String(tweet._id || tweet.id || '');
  if (tweetId) {
    try {
      const saved = JSON.parse(
        localStorage.getItem(`twitter_user_tweets_${myId}`) || '[]'
      );
      if (Array.isArray(saved) && saved.includes(tweetId)) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
};

const TweetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tweet, setTweet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Likes state
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Delete state
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // ── Fetch Tweet by ID ──────────────────────────────────────────────────────
  const fetchTweet = useCallback(async () => {
    if (!id) return;
    try {
      setError('');
      const res = await getTweetById(id);
      const data = res?.data;
      if (!data) {
        setError('Post not found.');
        setTweet(null);
      } else {
        setTweet(data);
        const validLikes = Array.isArray(data.likes) ? data.likes.filter(Boolean) : [];
        setLikesCount(validLikes.length);
        setIsLiked(checkIsLiked(user, data));
      }
    } catch (err) {
      setError(err.message || 'Failed to load post.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    setLoading(true);
    fetchTweet();
  }, [fetchTweet]);

  // ── Like toggle ────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (isLiking || !id) return;
    setIsLiking(true);
    const next = !isLiked;
    setIsLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));

    const myId = String(user?._id || user?.id || '');
    saveUserLike(myId, id, next);

    try {
      const res = await toggleLike(id, 'Tweet');
      if (typeof res?.data === 'boolean') {
        setIsLiked(res.data);
        saveUserLike(myId, id, res.data);
      }
    } catch {
      // Revert on failure
      setIsLiked(!next);
      setLikesCount((prev) => (!next ? prev + 1 : Math.max(0, prev - 1)));
      saveUserLike(myId, id, !next);
    } finally {
      setIsLiking(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!id || isDeleting) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteTweet(id);
      // Remove from localStorage registry
      const myId = String(user?._id || user?.id || '');
      if (myId) {
        try {
          const key = `twitter_user_tweets_${myId}`;
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify(list.filter((tid) => tid !== String(id))));
        } catch {
          /* ignore */
        }
      }
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete post.');
      setIsDeleting(false);
    }
  };

  // ── Render hashtags in content ─────────────────────────────────────────────
  const renderContent = (text) => {
    if (!text) return null;
    return text.split(/(#[a-zA-Z0-9_]+)/g).map((part, i) =>
      part.startsWith('#') ? (
        <span key={i} className="text-[#1D9BF0] font-medium hover:underline">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Format date: e.g. "11:42 AM · Nov 2, 2026"
  const formatFullDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const full = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    return `${time} · ${full}`;
  };

  // ── Loading Skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#EFF3F4] px-4 py-3 flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F1419]" />
          </button>
          <h2 className="text-xl font-bold text-[#0F1419]">Post</h2>
        </header>

        <div className="p-4 space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/6" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  // ── Error / Not Found State ────────────────────────────────────────────────
  if (error || !tweet) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#EFF3F4] px-4 py-3 flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F1419]" />
          </button>
          <h2 className="text-xl font-bold text-[#0F1419]">Post</h2>
        </header>

        <div className="p-12 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-[#0F1419]">
            {error || 'Post not found'}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            This post may have been deleted, or the link may be broken.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTweet}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const authorId       = tweet?.user?._id || (typeof tweet?.user === 'string' ? tweet.user : '');
  const authorName     = tweet?.user?.name || 'Twitter User';
  const authorUsername = tweet?.user?.username || (tweet?.user?.email ? tweet.user.email.split('@')[0] : 'user');
  const authorHandle   = `@${authorUsername}`;
  const isOwner = isTweetOwner(user, tweet);
  const commentsCount = Array.isArray(tweet?.comments) ? tweet.comments.length : 0;

  const handleAuthorClick = () => {
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#EFF3F4] px-4 py-3 flex items-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-[#0F1419]" />
        </button>
        <h2 className="text-xl font-bold text-[#0F1419]">Post</h2>
      </header>

      {/* ── Main Tweet Details ── */}
      <article className="px-4 pt-4 pb-2 border-b border-[#EFF3F4]">
        {/* Author Header */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex items-center gap-3 cursor-pointer group min-w-0"
            onClick={handleAuthorClick}
            role="button"
            tabIndex={0}
          >
            <Avatar name={authorName} size="lg" className="group-hover:opacity-90 transition-opacity shrink-0" />
            <div className="leading-tight min-w-0">
              <h1 className="font-bold text-base text-[#0F1419] group-hover:underline truncate max-w-[150px] sm:max-w-none">
                {authorName}
              </h1>
              <p className="text-sm text-gray-500 truncate max-w-[150px] sm:max-w-none">{authorHandle}</p>
            </div>
          </div>

          {/* Delete Option for Owner */}
          {isOwner && (
            <div className="flex flex-col items-end gap-1">
              {!showConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5">
                  <span className="text-xs text-red-700 font-semibold">Delete?</span>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isDeleting}
                    className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {deleteError && (
                <p className="text-xs text-red-500">{deleteError}</p>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-4 text-[17px] sm:text-xl text-[#0F1419] whitespace-pre-wrap leading-relaxed break-words">
          {renderContent(tweet.content)}
        </div>

        {/* Media Image */}
        {tweet.image && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-[#EFF3F4] bg-gray-100">
            <img
              src={tweet.image}
              alt="Post media"
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-4 py-3 border-b border-[#EFF3F4] text-sm text-gray-500">
          <time>{formatFullDate(tweet.createdAt)}</time>
        </div>

        {/* Stats Row */}
        <div className="py-3 border-b border-[#EFF3F4] flex items-center gap-6 text-sm text-gray-500">
          <div>
            <span className="font-bold text-[#0F1419]">{likesCount}</span>{' '}
            <span>{likesCount === 1 ? 'Like' : 'Likes'}</span>
          </div>
          <div>
            <span className="font-bold text-[#0F1419]">{commentsCount}</span>{' '}
            <span>{commentsCount === 1 ? 'Reply' : 'Replies'}</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="py-2 flex items-center justify-around text-gray-500 border-b border-[#EFF3F4]">
          <button
            type="button"
            className="p-2.5 hover:text-[#1D9BF0] hover:bg-sky-50 rounded-full transition-colors"
            aria-label="Reply"
            title="Reply"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="p-2.5 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors"
            aria-label="Repost"
            title="Repost"
          >
            <Repeat2 className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleLike}
            disabled={isLiking}
            className={`p-2.5 rounded-full transition-colors flex items-center gap-1.5 ${
              isLiked ? 'text-pink-600 bg-pink-50' : 'hover:text-pink-600 hover:bg-pink-50'
            }`}
            aria-label="Like"
            title="Like"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            className="p-2.5 hover:text-[#1D9BF0] hover:bg-sky-50 rounded-full transition-colors"
            aria-label="Share"
            title="Share"
          >
            <Share className="w-5 h-5" />
          </button>
        </div>
      </article>

      {/* ── Comments / Replies Section ── */}
      <CommentSection
        tweetId={id}
        comments={tweet.comments}
        onCommentAdded={fetchTweet}
      />
    </div>
  );
};

export default TweetDetailsPage;
