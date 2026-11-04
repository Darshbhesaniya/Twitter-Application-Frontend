import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createComment } from '../../api/tweetApi';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { formatRelativeTime } from '../../utils/dateUtils';

// ── Single Comment Item Component (Supports Nested Comments) ─────────────────
const CommentItem = ({ comment, depth = 0 }) => {
  const navigate = useNavigate();
  if (!comment) return null;

  const authorId =
    typeof comment.userId === 'object'
      ? comment.userId?._id
      : typeof comment.userId === 'string'
      ? comment.userId
      : '';

  const authorName =
    typeof comment.userId === 'object' && comment.userId?.name
      ? comment.userId.name
      : 'User';

  const authorHandle =
    typeof comment.userId === 'object'
      ? (comment.userId?.username ? `@${comment.userId.username}` : (comment.userId?.email ? `@${comment.userId.email.split('@')[0]}` : ''))
      : '';

  const handleAuthorClick = () => {
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  const createdAt = comment.createdAt;
  const nestedComments = Array.isArray(comment.comments) ? comment.comments : [];

  return (
    <div className={`py-3 ${depth > 0 ? 'ml-3 sm:ml-8 border-l-2 border-[#EFF3F4] pl-2 sm:pl-3 mt-1' : 'border-b border-[#EFF3F4]'}`}>
      <div className="flex gap-3">
        <div
          className="shrink-0 pt-0.5 cursor-pointer"
          onClick={handleAuthorClick}
          role="button"
          tabIndex={0}
        >
          <Avatar name={authorName} size={depth > 0 ? 'sm' : 'md'} className="hover:opacity-90 transition-opacity" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 leading-none flex-wrap">
            <span
              onClick={handleAuthorClick}
              className="font-bold text-sm text-[#0F1419] max-w-[130px] sm:max-w-[200px] truncate hover:underline cursor-pointer"
            >
              {authorName}
            </span>
            {authorHandle && (
              <span
                onClick={handleAuthorClick}
                className="text-xs text-gray-500 max-w-[110px] sm:max-w-[160px] truncate hover:underline cursor-pointer"
              >
                {authorHandle}
              </span>
            )}
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatRelativeTime(createdAt)}
            </span>
          </div>

          <p className="mt-1 text-sm text-[#0F1419] whitespace-pre-wrap leading-relaxed break-words">
            {comment.content}
          </p>
        </div>
      </div>

      {/* Render nested replies if present */}
      {nestedComments.length > 0 && (
        <div className="mt-2 space-y-2">
          {nestedComments.map((nested) => {
            const nestedId = nested._id || nested.id || Math.random().toString();
            return <CommentItem key={nestedId} comment={nested} depth={depth + 1} />;
          })}
        </div>
      )}
    </div>
  );
};

// ── Main CommentSection Component ────────────────────────────────────────────
const CommentSection = ({ tweetId, comments = [], onCommentAdded }) => {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const commentList = Array.isArray(comments) ? comments : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrorMessage('Please log in to reply.');
      return;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      setErrorMessage('Comment cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessToast('');

      // Existing API: POST /api/v1/comments?modelId=&modelType=
      await createComment(tweetId, trimmed, 'Tweet');

      // Clear input & notify parent
      setContent('');
      setSuccessToast('Reply posted successfully!');
      setTimeout(() => setSuccessToast(''), 4000);

      if (onCommentAdded && typeof onCommentAdded === 'function') {
        onCommentAdded();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to post reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      {/* ── Reply Input Box (Authenticated Users Only) ── */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="px-4 py-3 border-b border-[#EFF3F4]">
          {/* Success Toast */}
          {successToast && (
            <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex gap-3">
            <div className="shrink-0 pt-1">
              <Avatar name={user?.name} size="md" />
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Post your reply"
                rows={2}
                className="w-full resize-none border-none focus:outline-none text-base text-[#0F1419] placeholder-gray-500"
              />
              <div className="flex items-center justify-between pt-2 border-t border-[#EFF3F4]">
                <span className="text-xs text-gray-400">
                  Replying to post
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={loading}
                  disabled={loading || !content.trim()}
                  className="font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Reply
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-gray-50 border-b border-[#EFF3F4] text-center text-sm text-gray-500">
          Please log in to view and post replies.
        </div>
      )}

      {/* ── Comments List ── */}
      <div className="px-4">
        <h3 className="text-base font-bold text-[#0F1419] py-3 border-b border-[#EFF3F4] flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-gray-500" />
          <span>Replies ({commentList.length})</span>
        </h3>

        {commentList.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            No replies yet. Be the first to reply!
          </div>
        ) : (
          <div className="divide-y divide-[#EFF3F4]">
            {commentList.map((comm) => {
              const commId = comm._id || comm.id || Math.random().toString();
              return <CommentItem key={commId} comment={comm} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

