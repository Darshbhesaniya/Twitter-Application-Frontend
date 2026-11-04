/**
 * Tweet ownership utility.
 *
 * The backend now stores `user` as an ObjectId on every Tweet document
 * (populated as { _id, name, email } in GET /api/v1/tweets).
 *
 * Two-layer ownership check:
 *  1. Backend data  – compare tweet.user._id vs logged-in user._id
 *  2. localStorage  – compare newly-created tweet IDs stored after createTweet()
 */

const STORAGE_PREFIX = 'twitter_user_tweets_';

/** Register a newly created tweet ID so the creator can delete it immediately */
export const registerCreatedTweet = (userId, tweetId) => {
  if (!userId || !tweetId) return;
  try {
    const key = `${STORAGE_PREFIX}${String(userId)}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const id = String(tweetId);
    if (!existing.includes(id)) {
      existing.unshift(id);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 200)));
    }
  } catch {
    // silently ignore storage errors
  }
};

/** Remove a deleted tweet ID from the local registry */
export const unregisterDeletedTweet = (userId, tweetId) => {
  if (!userId || !tweetId) return;
  try {
    const key = `${STORAGE_PREFIX}${String(userId)}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const id = String(tweetId);
    localStorage.setItem(key, JSON.stringify(existing.filter((v) => v !== id)));
  } catch {
    // silently ignore storage errors
  }
};

/**
 * Returns true if `user` is the owner of `tweet`.
 *
 * Checks in order:
 *  1. tweet.user._id  (populated ObjectId object from backend)
 *  2. tweet.user      (raw ObjectId string, if not populated)
 *  3. tweet.userId    (fallback field name)
 *  4. localStorage registry (for tweets created in this session)
 */
export const checkIsTweetOwner = (user, tweet) => {
  if (!user || !tweet) return false;

  const currentUserId = String(user._id || user.id || '');
  if (!currentUserId) return false;

  // --- Backend ownership via populated user field ---
  const tweetUser = tweet.user;
  if (tweetUser) {
    const backendOwnerId =
      typeof tweetUser === 'object'
        ? String(tweetUser._id || tweetUser.id || '')
        : String(tweetUser);

    if (backendOwnerId && backendOwnerId === currentUserId) return true;
  }

  // --- Fallback: tweet.userId field ---
  const tweetUserId = tweet.userId;
  if (tweetUserId) {
    const fallbackOwnerId =
      typeof tweetUserId === 'object'
        ? String(tweetUserId._id || tweetUserId.id || '')
        : String(tweetUserId);

    if (fallbackOwnerId && fallbackOwnerId === currentUserId) return true;
  }

  // --- localStorage registry (same browser session) ---
  const tweetId = String(tweet._id || tweet.id || '');
  if (tweetId) {
    try {
      const key = `${STORAGE_PREFIX}${currentUserId}`;
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(saved) && saved.includes(tweetId)) return true;
    } catch {
      // ignore
    }
  }

  return false;
};
