import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = false,
  size = 'md',
  className = '',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="font-medium text-[#77717A]">Completion</span>
          <span className="font-semibold text-[#D96C94]">{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-[#FCE7EF] rounded-full overflow-hidden ${heightStyles[size]}`}>
        <div
          className="bg-gradient-to-r from-[#E98EAD] to-[#D96C94] h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
