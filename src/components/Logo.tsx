import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform`}>
        <svg 
          width={size === 'sm' ? 20 : size === 'md' ? 24 : size === 'lg' ? 28 : 32} 
          height={size === 'sm' ? 20 : size === 'md' ? 24 : size === 'lg' ? 28 : 32} 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#6366f1', stopOpacity: 1}} />
              <stop offset="50%" style={{stopColor: '#8b5cf6', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#ec4899', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          
          <circle cx="16" cy="16" r="15" fill="url(#logoGradient)"/>
          
          <path d="M10 6h8l4 4v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" 
                fill="white" opacity="0.9"/>
          
          <path d="M18 6v4h4l-4-4z" fill="white" opacity="0.7"/>
          
          <rect x="12" y="14" width="6" height="1" fill="white" opacity="0.6"/>
          <rect x="12" y="16" width="4" height="1" fill="white" opacity="0.6"/>
          <rect x="12" y="18" width="5" height="1" fill="white" opacity="0.6"/>
          
          <path d="M19 9l-1 4h2l-1.5 6 4-8h-2l1-2z" fill="#fbbf24" opacity="0.9"/>
        </svg>
      </div>
      
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ${textSizes[size]}`}>
          Invoice Manager
        </span>
      )}
    </div>
  );
};

export default Logo; 