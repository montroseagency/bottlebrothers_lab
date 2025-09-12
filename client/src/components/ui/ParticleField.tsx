// client/src/components/ui/ParticleField.tsx
import React, { useState, useEffect } from 'react';

interface ParticleFieldProps {
  particleCount?: number;
  color?: string;
  className?: string;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ 
  particleCount = 20, 
  color = "bg-green-400",
  className = ""
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {[...Array(particleCount)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-1 h-1 ${color} rounded-full opacity-30`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.5s ease-out',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};