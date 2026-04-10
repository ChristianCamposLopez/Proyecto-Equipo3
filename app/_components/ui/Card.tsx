// components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, description, className = '' }) => {
  return (
    <div className={`w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900 ${className}`}>
      {title && (
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h1>
          {description && <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
