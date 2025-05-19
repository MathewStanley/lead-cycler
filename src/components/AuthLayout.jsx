// src/components/AuthLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ title, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>
        {children}
        {footer && (
          <div className="mt-6 text-sm text-center text-gray-600">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
