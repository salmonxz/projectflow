import React from 'react';

export const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const getInitials = (str) => {
    if (!str) return 'U';
    return str
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  if (src) {
    const avatarUrl = src.startsWith('http') ? src : `http://localhost:5000${src}`;
    return (
      <img
        src={avatarUrl}
        alt={name || 'Avatar'}
        className={`${selectedSize} rounded-full object-cover border border-slate-200 shadow-sm ${className}`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=2563eb&color=ffffff`;
        }}
      />
    );
  }

  return (
    <div
      className={`${selectedSize} rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200 flex items-center justify-center shadow-sm ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
