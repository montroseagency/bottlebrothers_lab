// client/src/components/ui/MagneticButton.tsx
import React, { useState, useRef } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number; // How strong the magnetic effect is (0-1)
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  className = "", 
  onClick,
  strength = 0.3 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * strength, y: y * strength });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={buttonRef}
      className={`relative transition-transform duration-300 ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </button>
  );
};