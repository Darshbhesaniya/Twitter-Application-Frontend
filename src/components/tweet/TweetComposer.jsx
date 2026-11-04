import React, { useState, useRef } from 'react';
import { Image, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createTweet } from '../../api/tweetApi';
import { registerCreatedTweet } from '../../utils/tweetOwnership';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

const TweetComposer = ({ onTweetCreated }) => {
  const { user } = useAuth();

  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef(null);
  const MAX_CHAR_COUNT = 250;

  // Handle image selection
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

  // Remove selected image
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

  // Handle Tweet submission
  const handleSubmit = async (e) => {
    e.preventDefault();
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

      // Register ownership of this tweet for the current user
      const newTweetId = response?.data?._id || response?.data?.id;
      if (newTweetId) {
        registerCreatedTweet(user?._id || user?.id, newTweetId);
      }

      // Reset form on success
      setContent('');
      handleRemoveImage();
      setSuccessMessage('Your Tweet was sent!');

      // Notify parent to refresh feed
      if (onTweetCreated && typeof onTweetCreated === 'function') {
        onTweetCreated(response?.data);
      }

      // Clear success toast after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to post tweet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const charsLeft = MAX_CHAR_COUNT - content.length;
  const isOverLimit = charsLeft < 0;
  const isNearLimit = charsLeft <= 20 && !isOverLimit;

  return (
    <div className="p-3 sm:p-4 border-b border-[#EFF3F4] select-none">
      {/* Toast notifications */}
      {successMessage && (
        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            className="text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2.5 sm:gap-3">
        <Avatar name={user?.name} size="md" />

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="What is happening?!"
            rows={content.length > 80 ? 3 : 2}
            className="w-full text-lg placeholder:text-gray-500 text-[#0F1419] outline-none resize-none bg-transparent"
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mt-2 mb-3 rounded-2xl overflow-hidden border border-[#EFF3F4] max-h-80 bg-gray-50">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="w-full h-auto max-h-80 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                aria-label="Remove image"
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-3 border-t border-[#EFF3F4] mt-2">
            <div className="flex items-center gap-1 text-[#1D9BF0]">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="tweet-image-upload"
              />
              <label
                htmlFor="tweet-image-upload"
                className="p-2 hover:bg-sky-50 rounded-full transition-colors cursor-pointer text-[#1D9BF0] flex items-center justify-center"
                title="Add photo"
              >
                <Image className="w-5 h-5" />
              </label>
            </div>

            <div className="flex items-center gap-3">
              {/* Character limit counter */}
              {content.length > 0 && (
                <span
                  className={`text-xs font-semibold ${
                    isOverLimit
                      ? 'text-red-500'
                      : isNearLimit
                      ? 'text-amber-500'
                      : 'text-gray-400'
                  }`}
                >
                  {charsLeft}
                </span>
              )}

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!content.trim() || isOverLimit || loading}
                loading={loading}
                className="px-5 py-1.5 text-sm font-bold"
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

export default TweetComposer;

