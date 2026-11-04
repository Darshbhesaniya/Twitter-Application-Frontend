import axios from 'axios';

// Create configured Axios instance
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('twitter_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardize error handling and handle 401 Unauthorized
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // If backend returns 401 Unauthorized (invalid or expired token)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('twitter_token');
      localStorage.removeItem('twitter_user');
      // Only redirect if not already on the login or signup page
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/signup')
      ) {
        window.location.href = '/login';
      }
    }

    // Extract human-friendly error message from backend response
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.err?.message ||
      error.response?.data?.error?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosClient;

