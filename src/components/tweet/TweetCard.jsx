import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Repeat2, Share, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deleteTweet, toggleLike } from '../../api/tweetApi';
import Avatar from '../common/Avatar';
import { formatRelativeTime } from '../../utils/dateUtils';
import { checkIsLiked, saveUserLike } from '../../utils/likeUtils';

// ─── Ownership helper ─────────────────────────────────────────────────────────
// Returns true only when the currently logged-in user created this tweet.
const isTweetOwner = (currentUser, tweet) => {
  if (!currentUser || !tweet) return false;

  const myId = String(currentUser._id || currentUser.id || '');
  if (!myId) return false;

  // 1. Backend populated field: tweet.user is { _id, name, email, username }
  if (tweet.user && typeof tweet.user === 'object' && tweet.user._id) {
    return String(tweet.user._id) === myId;
  }

  // 2. tweet.user is a raw ObjectId string (not populated)
  if (tweet.user && typeof tweet.user === 'string') {
    return tweet.user === myId;
  }

  // 3. Fallback: localStorage registry (TweetComposer saves tweet IDs here)
  const tweetId = String(tweet._id || tweet.id || '');
  if (tweetId) {
    try {
      const saved = JSON.parse(
        localStorage.getItem(`twitter_user_tweets_${myId}`) || '[]'
      );
      if (Array.isArray(saved) && saved.includes(tweetId)) return true;
    } catch { /* ignore */ }
  }

  return false;
};

// ─── Component ────────────────────────────────────────────────────────────────
const TweetCard = ({ tweet, onDeleteTweet }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tweetId   = tweet?._id || tweet?.id || '';
  const content   = tweet?.content  || '';
  const imageUrl  = tweet?.image    || null;
  const createdAt = tweet?.createdAt || null;

  // Author info from populated tweet.user
  const authorId       = tweet?.user?._id || (typeof tweet?.user === 'string' ? tweet.user : '');
  const authorName     = tweet?.user?.name || 'Twitter User';
  const authorUsername = tweet?.user?.username || (tweet?.user?.email ? tweet.user.email.split('@')[0] : 'user');
  const authorHandle   = `@${authorUsername}`;

  // Ownership check — controls whether the delete icon is shown
  const isOwner = isTweetOwner(user, tweet);

  // Likes
  const validLikes = Array.isArray(tweet?.likes) ? tweet.likes.filter(Boolean) : [];
  const [likesCount, setLikesCount] = useState(validLikes.length);
  const [isLiked,    setIsLiked]    = useState(() => checkIsLiked(user, tweet));
  const [isLiking,   setIsLiking]   = useState(false);

  // Sync likes state whenever tweet or user changes (e.g. feed refresh)
  useEffect(() => {
    const list = Array.isArray(tweet?.likes) ? tweet.likes.filter(Boolean) : [];
    setLikesCount(list.length);
    setIsLiked(checkIsLiked(user, tweet));
  }, [tweet, user]);

  // Delete
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting,  setIsDeleting]  = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Comments count
  const commentsCount = Array.isArray(tweet?.comments) ? tweet.comments.length : null;

  // ─── Author Profile Navigation ────────────────────────────────────────────
  const handleAuthorClick = (e) => {
    e.stopPropagation();
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  // ─── Open Tweet Details ───────────────────────────────────────────────────
  const handleOpenDetails = (e) => {
    // If the click is inside buttons, links, or inputs, do not navigate
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    if (tweetId) {
      navigate(`/tweet/${tweetId}`);
    }
  };

  // ─── Like ─────────────────────────────────────────────────────────────────
  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking || !tweetId) return;

    setIsLiking(true);
    const next = !isLiked;
    setIsLiked(next);
    setLikesCount(prev => next ? prev + 1 : Math.max(0, prev - 1));

    const myId = String(user?._id || user?.id || '');
    saveUserLike(myId, tweetId, next);

    try {
      const res = await toggleLike(tweetId, 'Tweet');
      if (typeof res?.data === 'boolean') {
        setIsLiked(res.data);
        saveUserLike(myId, tweetId, res.data);
      }
    } catch {
      // Revert on error
      setIsLiked(!next);
      setLikesCount(prev => (!next ? prev + 1 : Math.max(0, prev - 1)));
      saveUserLike(myId, tweetId, !next);
    } finally {
      setIsLiking(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!tweetId || isDeleting) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteTweet(tweetId);

      // Remove from localStorage ownership registry
      const myId = String(user?._id || user?.id || '');
      if (myId) {
        try {
          const key  = `twitter_user_tweets_${myId}`;
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify(list.filter(id => id !== String(tweetId))));
        } catch { /* ignore */ }
      }

      if (typeof onDeleteTweet === 'function') onDeleteTweet(tweetId);
    } catch (err) {
      setDeleteError(err.message || 'Delete failed. Please try again.');
      setIsDeleting(false);
    }
  };

  // ─── Hashtag renderer ─────────────────────────────────────────────────────
  const renderContent = (text) => {
    if (!text) return null;
    return text.split(/(#[a-zA-Z0-9_]+)/g).map((part, i) =>
      part.startsWith('#')
        ? (
            <span
              key={i}
              onClick={(e) => e.stopPropagation()}
              className="text-[#1D9BF0] hover:underline cursor-pointer"
            >
              {part}
            </span>
          )
        : part
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <article
      onClick={handleOpenDetails}
      className="px-3 sm:px-4 py-3 border-b border-[#EFF3F4] hover:bg-gray-50/60 transition-colors flex gap-2.5 sm:gap-3 cursor-pointer"
    >
      {/* Avatar */}
      <div
        className="shrink-0 pt-0.5"
        onClick={handleAuthorClick}
        role="button"
        tabIndex={0}
      >
        <Avatar name={authorName} size="md" className="hover:opacity-90 transition-opacity" />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-2">
          {/* Author Name + Username + timestamp */}
          <div className="flex flex-wrap items-center gap-x-1.5 min-w-0 leading-tight">
            <span
              onClick={handleAuthorClick}
              className="font-bold text-sm text-[#0F1419] hover:underline max-w-[130px] sm:max-w-[220px] truncate cursor-pointer"
            >
              {authorName}
            </span>
            <span
              onClick={handleAuthorClick}
              className="text-xs text-gray-500 hover:underline max-w-[110px] sm:max-w-[180px] truncate cursor-pointer"
            >
              {authorHandle}
            </span>
            <span className="text-gray-400 text-xs">·</span>
            <time className="text-xs text-gray-500 whitespace-nowrap">
              {formatRelativeTime(createdAt)}
            </time>
          </div>

          {/* ── Delete button — visible ONLY to the tweet owner ── */}
          {isOwner && (
            <div
              className="shrink-0 flex flex-col items-end gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {!showConfirm ? (
                /* Step 1: trash icon */
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteError('');
                    setShowConfirm(true);
                  }}
                  aria-label="Delete tweet"
                  title="Delete this post"
                  className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                /* Step 2: confirmation row */
                <div
                  className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs text-red-700 font-semibold">Delete post?</span>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirm(false);
                      setDeleteError('');
                    }}
                    disabled={isDeleting}
                    className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Error message below the button */}
              {deleteError && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Tweet text ── */}
        <p className="mt-1 text-sm text-[#0F1419] whitespace-pre-wrap leading-relaxed break-words">
          {renderContent(content)}
        </p>

        {/* ── Tweet image ── */}
        {imageUrl && (
          <div className="mt-3 rounded-2xl overflow-hidden border border-[#EFF3F4] bg-gray-100">
            <img
              src={imageUrl}
              alt="Tweet media"
              loading="lazy"
              className="w-full h-auto max-h-96 object-cover hover:opacity-95 transition-opacity"
            />
          </div>
        )}

        {/* ── Interaction bar ── */}
        <div className="flex items-center justify-between max-w-sm mt-3 text-gray-500">

          {/* Reply — Clicking reply also navigates to tweet details */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (tweetId) navigate(`/tweet/${tweetId}`);
            }}
            className="group flex items-center gap-1 hover:text-[#1D9BF0] transition-colors"
            aria-label="Reply"
            title="Reply"
          >
            <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-sky-50 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </div>
            {commentsCount !== null && <span className="text-xs">{commentsCount}</span>}
          </button>

          {/* Repost */}
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="group flex items-center gap-1 hover:text-emerald-500 transition-colors"
            aria-label="Repost"
          >
            <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-emerald-50 transition-colors">
              <Repeat2 className="w-4 h-4" />
            </div>
          </button>

          {/* Like */}
          <button
            type="button"
            onClick={handleLike}
            disabled={isLiking}
            aria-label="Like"
            className={`group flex items-center gap-1 transition-colors ${isLiked ? 'text-pink-600' : 'hover:text-pink-600'}`}
          >
            <div className={`p-1.5 sm:p-2 rounded-full group-hover:bg-pink-50 transition-colors ${isLiked ? 'bg-pink-50' : ''}`}>
              <Heart className={`w-4 h-4 transition-all ${isLiked ? 'fill-current scale-110' : ''}`} />
            </div>
            {likesCount !== null && (
              <span className={`text-xs ${isLiked ? 'font-bold text-pink-600' : ''}`}>{likesCount}</span>
            )}
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="group flex items-center gap-1 hover:text-[#1D9BF0] transition-colors"
            aria-label="Share"
          >
            <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-sky-50 transition-colors">
              <Share className="w-4 h-4" />
            </div>
          </button>

        </div>
      </div>
    </article>
  );
};

export default TweetCard;
