import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      <div className="h-6 bg-[#FCE7EF] rounded-xl w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-[#FFF5F7] border border-[#F0DFE5] rounded-xl w-full" />
      ))}
    </div>
  );
};
