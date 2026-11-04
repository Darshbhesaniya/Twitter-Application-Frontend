import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [usernameError, setUsernameError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateUsername = (val) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Username is required.';
    }
    if (trimmed.length < 3) {
      return 'Username must be at least 3 characters.';
    }
    if (trimmed.length > 30) {
      return 'Username cannot exceed 30 characters.';
    }
    const regex = /^[a-zA-Z0-9_.]+$/;
    if (!regex.test(trimmed)) {
      return 'Username can only contain letters, numbers, underscores (_), and dots (.).';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'username') {
      const err = validateUsername(value);
      setUsernameError(err);
    }

    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const uError = validateUsername(formData.username);
    if (uError) {
      setUsernameError(uError);
      setErrorMessage(uError);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please recheck.');
      return;
    }

    try {
      setLoading(true);
      await signup(
        formData.name.trim(),
        formData.username.trim().toLowerCase(),
        formData.email.trim().toLowerCase(),
        formData.password
      );
      // After successful signup & login, navigate to home feed
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white md:border md:border-[#EFF3F4] md:shadow-sm rounded-2xl p-5 sm:p-8">
        {/* Twitter Logo */}
        <div className="flex justify-center mb-6">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-10 h-10 text-[#1D9BF0] fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1419] tracking-tight mb-2 text-center">
          Join Twitter today
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Create an account to start sharing and reading tweets.
        </p>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <span className="flex-1 leading-snug">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Username"
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="johndoe_123"
            value={formData.username}
            onChange={handleChange}
            error={usernameError}
            helperText="Only letters, numbers, underscores, and dots (3-30 chars)."
            required
          />

          <Input
            label="Email address"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
                className="focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <Input
            label="Confirm password"
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            className="mt-2"
          >
            Create account
          </Button>
        </form>

        {/* Footer / Switch to Login */}
        <div className="mt-8 pt-6 border-t border-[#EFF3F4] text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1D9BF0] hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
