import axiosClient from './axiosClient';

/**
 * Tweet, Like, and Comment API service methods
 * Connected to actual backend routes at /api/v1/...
 */

// Fetch paginated tweets — optionally filter by userId for profile pages
export const getTweets = async (page = 1, limit = 10, userId = null) => {
  const params = new URLSearchParams({ page, limit });
  if (userId) params.append('userId', userId);
  return await axiosClient.get(`/tweets?${params.toString()}`);
};

// Fetch single tweet with populated comments
export const getTweetById = async (id) => {
  return await axiosClient.get(`/tweets/${id}`);
};

// Create a new tweet (supports multipart form-data for content + image)
export const createTweet = async (formData) => {
  return await axiosClient.post('/tweets', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Delete a tweet by ID
export const deleteTweet = async (id) => {
  return await axiosClient.delete(`/tweets/${id}`);
};

// Toggle like for Tweet or Comment
export const toggleLike = async (modelId, modelType = 'Tweet') => {
  return await axiosClient.post(`/likes/toggle?modelId=${modelId}&modelType=${modelType}`);
};

// Create a comment on a Tweet or Comment
export const createComment = async (modelId, content, modelType = 'Tweet') => {
  return await axiosClient.post(
    `/comments?modelId=${modelId}&modelType=${modelType}`,
    { content }
  );
};

// Fetch authenticated user's replies/comments with original post info
export const getMyReplies = async (page = 1, limit = 10) => {
  return await axiosClient.get(`/comments/me?page=${page}&limit=${limit}`);
};

// Fetch authenticated user's liked tweets
export const getMyLikedTweets = async (page = 1, limit = 10) => {
  return await axiosClient.get(`/likes/me?page=${page}&limit=${limit}`);
};
