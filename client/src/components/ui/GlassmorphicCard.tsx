// client/src/components/ui/GlassmorphicCard.tsx
import React from 'react';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({ 
  children, 
  className = "", 
  hover = true 
}) => {
  return (
    <div 
      className={`
        relative backdrop-blur-md bg-white/10 rounded-3xl 
        border border-white/20 shadow-xl
        ${hover ? 'hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500' : ''}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};