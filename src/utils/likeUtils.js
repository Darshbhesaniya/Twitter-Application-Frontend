/**
 * Utility functions for tweet like status and persistence
 */

export const checkIsLiked = (currentUser, tweet) => {
  if (!currentUser || !tweet) return false;
  const myId = String(currentUser._id || currentUser.id || '');
  if (!myId) return false;

  const tweetId = String(tweet._id || tweet.id || '');

  // 1. Check if tweet.likes (when populated by backend) contains currentUser's like
  if (Array.isArray(tweet.likes)) {
    const validLikes = tweet.likes.filter(Boolean);
    const hasPopulatedLikes = validLikes.some(
      (item) => item && typeof item === 'object' && item.user !== undefined
    );

    const isLikedInBackend = validLikes.some((like) => {
      if (!like) return false;
      if (typeof like === 'object') {
        const likeUserId = String(like.user?._id || like.user || '');
        return likeUserId === myId;
      }
      return String(like) === myId;
    });

    if (isLikedInBackend) {
      // Sync to localStorage
      saveUserLike(myId, tweetId, true);
      return true;
    }

    // If tweet.likes is populated and currentUser is NOT in it,
    // the backend is authoritative: user has unliked it
    if (hasPopulatedLikes) {
      saveUserLike(myId, tweetId, false);
      return false;
    }
  }

  // 2. Check localStorage fallback (e.g. if likes array is unpopulated ObjectIds or offline)
  if (tweetId) {
    try {
      const key = `twitter_user_likes_${myId}`;
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(saved) && saved.includes(tweetId)) {
        return true;
      }
    } catch {
      /* ignore */
    }
  }

  return false;
};

export const saveUserLike = (userId, tweetId, isLiked) => {
  if (!userId || !tweetId) return;
  try {
    const key = `twitter_user_likes_${userId}`;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const set = new Set(Array.isArray(list) ? list : []);
    const tid = String(tweetId);
    if (isLiked) {
      set.add(tid);
    } else {
      set.delete(tid);
    }
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
};

