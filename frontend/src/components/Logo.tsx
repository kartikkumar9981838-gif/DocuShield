import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Inline Minimal Shield SVG with Document Fold Corner */}
      <svg
        className={iconSizes[size]}
        viewBox="0 0 32 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="DocuShield Logo Icon"
      >
        {/* Shield Outline Path with rounded top corners and pointed bottom */}
        <path
          d="M 16 33 C 24 28 29 20 29 10 L 29 6 L 20 6 C 20 6 20 3 16 3 L 6 3 C 4.5 3 3 4.5 3 6 L 3 10 C 3 20 8 28 16 33 Z"
          stroke="#12233F"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Document Fold Triangle in the top-right of inner area */}
        <path
          d="M 18 6 L 25 6 L 25 13 Z"
          stroke="#12233F"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <line
          x1="18"
          y1="6"
          x2="18"
          y2="13"
          stroke="#12233F"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <line
          x1="18"
          y1="13"
          x2="25"
          y2="13"
          stroke="#12233F"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      {/* Wordmark DocuShield */}
      <span className={`font-extrabold tracking-tight ${textSizes[size]}`}>
        <span className="text-[#1A202C]">Docu</span>
        <span className="text-[#00C2CB]">Shield</span>
      </span>
    </div>
  );
};
