import axiosClient from './axiosClient';

/**
 * Authentication & User API service methods
 * Connected to actual backend routes at /api/v1/...
 */

// User Signup - accepts name, username, email, password
export const signupUser = async ({ name, username, email, password }) => {
  return await axiosClient.post('/signup', { name, username, email, password });
};

// User Login - accepts identifier (username or email) and password
export const loginUser = async ({ identifier, email, password }) => {
  return await axiosClient.post('/login', {
    identifier: identifier || email,
    password,
  });
};

// Get current authenticated user profile (/api/v1/users/me)
export const getMyProfile = async () => {
  return await axiosClient.get('/users/me');
};

// Get user profile by ID (/api/v1/users/:id)
export const getUserById = async (id) => {
  return await axiosClient.get(`/users/${id}`);
};
