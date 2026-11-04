import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-[#1D9BF0] mb-2">404</h1>
      <h2 className="text-2xl font-bold text-[#0F1419] mb-3">
        Hmm... this page doesn't exist.
      </h2>
      <p className="text-gray-500 max-w-sm mb-6 text-sm">
        Try searching for something else, or head back to your home timeline.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          Go back to Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;

