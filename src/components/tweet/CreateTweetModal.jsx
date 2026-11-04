import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createTweet } from '../../api/tweetApi';
import { registerCreatedTweet } from '../../utils/tweetOwnership';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

const MAX_CHAR_COUNT = 250;

const CreateTweetModal = ({ isOpen, onClose, onTweetCreated, user: propUser }) => {
  const { user: authUser } = useAuth();
  const currentUser = propUser || authUser;

  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // ── Lock body scrolling when modal is open ─────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      // Auto-focus textarea on modal open
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // ── Reset form state ───────────────────────────────────────────────────────
  const handleReset = () => {
    setContent('');
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrorMessage('');
    setSuccessMessage('');
  };

  // ── Close attempt (checks for unsaved changes) ─────────────────────────────
  const handleCloseAttempt = () => {
    if (loading) return;

    if (content.trim() || imageFile) {
      if (window.confirm('Discard unsaved post?')) {
        handleReset();
        onClose();
      }
    } else {
      handleReset();
      onClose();
    }
  };

  // ── Escape key closes the modal safely ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseAttempt();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, content, imageFile, loading]);

  // ── Handle image selection ─────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, JPEG, GIF, WEBP).');
      return;
    }

    // 5MB limit matching backend multer
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5MB.');
      return;
    }

    setErrorMessage('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── Remove image ───────────────────────────────────────────────────────────
  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ── Submit Post ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage('');
    setSuccessMessage('');

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setErrorMessage('Tweet content cannot be empty.');
      return;
    }

    if (trimmedContent.length > MAX_CHAR_COUNT) {
      setErrorMessage(`Tweet cannot exceed ${MAX_CHAR_COUNT} characters.`);
      return;
    }

    try {
      setLoading(true);

      // Create FormData matching backend multer and controller
      const formData = new FormData();
      formData.append('content', trimmedContent);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await createTweet(formData);
      const createdTweet = response?.data;

      // Register ownership in localStorage fallback
      const userId = currentUser?._id || currentUser?.id;
      const newTweetId = createdTweet?._id || createdTweet?.id;
      if (userId && newTweetId) {
        registerCreatedTweet(userId, newTweetId);
      }

      setSuccessMessage('Your post was sent!');

      // Notify parent to refresh timeline
      if (onTweetCreated && typeof onTweetCreated === 'function') {
        onTweetCreated(createdTweet);
      }

      // Close modal smoothly after brief feedback
      setTimeout(() => {
        handleReset();
        onClose();
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to post tweet. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const authorName = currentUser?.name || 'Twitter User';
  const authorUsername =
    currentUser?.username ||
    (currentUser?.email ? currentUser.email.split('@')[0] : 'user');
  const charsRemaining = MAX_CHAR_COUNT - content.length;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseAttempt();
        }
      }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-all animate-in fade-in duration-200 select-none overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compose-modal-title"
    >
      {/* ── Modal Card ── */}
      <div className="relative w-full max-w-xl max-h-[100dvh] sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#EFF3F4] sm:my-auto">
        
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EFF3F4] shrink-0">
          <button
            type="button"
            onClick={handleCloseAttempt}
            disabled={loading}
            aria-label="Close"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
          <span id="compose-modal-title" className="font-bold text-sm text-[#0F1419]">
            Create Post
          </span>
          <div className="w-9" /> {/* Spacer to balance header */}
        </div>

        {/* ── Alerts ── */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm shrink-0">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="flex-1 text-xs sm:text-sm">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-sm shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="flex-1 text-xs sm:text-sm font-medium">{successMessage}</span>
          </div>
        )}

        {/* ── Modal Body ── */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
          <div className="flex gap-3">
            {/* User Avatar */}
            <div className="shrink-0 pt-1">
              <Avatar name={authorName} size="md" />
            </div>

            {/* Content & Metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 leading-none mb-1">
                <span className="font-bold text-sm text-[#0F1419] truncate">
                  {authorName}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  @{authorUsername}
                </span>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="What is happening?!"
                rows={4}
                disabled={loading}
                className="w-full resize-none border-none focus:outline-none text-base sm:text-lg text-[#0F1419] placeholder-gray-500 pt-1 leading-relaxed"
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mt-2 rounded-2xl overflow-hidden border border-[#EFF3F4] max-h-72 bg-gray-50">
                  <img
                    src={imagePreview}
                    alt="Selected media"
                    className="w-full h-auto max-h-72 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={loading}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
                    title="Remove media"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Toolbar & Action Row ── */}
          <div className="flex items-center justify-between pt-3 border-t border-[#EFF3F4] mt-2">
            {/* Media Upload */}
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                onChange={handleImageChange}
                className="hidden"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-2 text-[#1D9BF0] hover:bg-sky-50 rounded-full transition-colors disabled:opacity-50"
                title="Add photo"
                aria-label="Add image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Counter + Post Button */}
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-semibold ${
                  charsRemaining < 0
                    ? 'text-red-500 font-bold'
                    : charsRemaining <= 20
                    ? 'text-amber-500'
                    : 'text-gray-400'
                }`}
              >
                {charsRemaining}
              </span>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={loading}
                disabled={loading || !content.trim() || charsRemaining < 0}
                className="font-bold px-4 py-1.5 rounded-full shadow-sm text-sm"
              >
                Post
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTweetModal;

