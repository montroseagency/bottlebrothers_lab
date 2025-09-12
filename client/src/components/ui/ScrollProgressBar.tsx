// client/src/components/ui/ScrollProgressBar.tsx
import React, { useState, useEffect } from 'react';

interface ScrollProgressBarProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  color?: 'green' | 'gold' | 'blue' | 'gradient';
  thickness?: 'thin' | 'medium' | 'thick';
  showPercentage?: boolean;
  style?: 'line' | 'dots' | 'glow' | 'animated';
  sections?: string[]; // For section-based progress
}

export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({
  position = 'top',
  color = 'gradient',
  thickness = 'medium',
  showPercentage = false,
  style = 'glow',
  sections = []
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const calculateScrollProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      setScrollProgress(Math.min(progress, 100));
      setIsVisible(scrollTop > 50);

      // Calculate current section if sections are provided
      if (sections.length > 0) {
        const sectionProgress = progress / 100;
        const currentSectionIndex = Math.floor(sectionProgress * sections.length);
        setCurrentSection(Math.min(currentSectionIndex, sections.length - 1));
      }
    };

    window.addEventListener('scroll', calculateScrollProgress);
    calculateScrollProgress(); // Initial calculation

    return () => window.removeEventListener('scroll', calculateScrollProgress);
  }, [sections.length]);

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'from-green-400 to-green-600';
      case 'gold':
        return 'from-yellow-400 to-amber-500';
      case 'blue':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-green-400 via-emerald-500 to-green-600';
    }
  };

  const getThickness = () => {
    switch (thickness) {
      case 'thin':
        return position === 'left' || position === 'right' ? 'w-1' : 'h-1';
      case 'thick':
        return position === 'left' || position === 'right' ? 'w-2' : 'h-2';
      default:
        return position === 'left' || position === 'right' ? 'w-1.5' : 'h-1.5';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-0 left-0 w-full';
      case 'left':
        return 'left-0 top-0 h-full';
      case 'right':
        return 'right-0 top-0 h-full';
      default:
        return 'top-0 left-0 w-full';
    }
  };

  const LineProgress = () => (
    <div className={`fixed ${getPositionClasses()} z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-black/20 ${position === 'left' || position === 'right' ? 'h-full w-2' : 'w-full h-2'}`}>
        <div 
          className={`bg-gradient-to-r ${getColorClasses()} ${getThickness()} transition-all duration-100 ease-out`}
          style={{
            [position === 'left' || position === 'right' ? 'height' : 'width']: `${scrollProgress}%`
          }}
        />
      </div>
    </div>
  );

  const DotsProgress = () => (
    <div className={`fixed ${getPositionClasses()} z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex justify-center items-center space-x-2 p-4">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= (scrollProgress / 10) 
                ? `bg-green-400 animate-pulse shadow-lg shadow-green-400/50` 
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );

  const GlowProgress = () => (
    <div className={`fixed ${getPositionClasses()} z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-black/10 backdrop-blur-sm ${position === 'left' || position === 'right' ? 'h-full w-3' : 'w-full h-3'}`}>
        <div 
          className={`bg-gradient-to-r ${getColorClasses()} ${getThickness()} transition-all duration-100 ease-out relative overflow-hidden`}
          style={{
            [position === 'left' || position === 'right' ? 'height' : 'width']: `${scrollProgress}%`,
            boxShadow: `0 0 20px rgba(34, 197, 94, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2)`
          }}
        >
          {/* Animated shine effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse"
            style={{
              animation: 'shine 2s infinite',
            }}
          />
        </div>
      </div>
      
      {showPercentage && (
        <div className={`fixed ${position === 'top' ? 'top-4 right-4' : 'bottom-4 right-4'} bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium`}>
          {Math.round(scrollProgress)}%
        </div>
      )}
    </div>
  );

  const AnimatedProgress = () => (
    <div className={`fixed ${getPositionClasses()} z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative overflow-hidden">
        <div className={`bg-gradient-to-r from-black/20 to-black/10 ${position === 'left' || position === 'right' ? 'h-full w-4' : 'w-full h-4'}`}>
          <div 
            className={`bg-gradient-to-r ${getColorClasses()} ${getThickness()} transition-all duration-300 ease-out relative`}
            style={{
              [position === 'left' || position === 'right' ? 'height' : 'width']: `${scrollProgress}%`
            }}
          >
            {/* Multiple layered gradients for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-300/50 to-green-500/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {/* Floating particles */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                style={{
                  top: '50%',
                  left: `${Math.random() * 100}%`,
                  transform: 'translateY(-50%)',
                  animation: `float ${2 + i}s infinite ease-in-out`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Section indicators */}
        {sections.length > 0 && (
          <div className="absolute bottom-full mb-2 left-0 right-0">
            <div className="flex justify-between px-4">
              {sections.map((section, i) => (
                <div 
                  key={i} 
                  className={`text-xs font-medium transition-colors duration-300 ${
                    i === currentSection ? 'text-green-400' : 'text-white/50'
                  }`}
                >
                  {section}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const SectionProgress = () => (
    <div className={`fixed ${getPositionClasses()} z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-black/20 backdrop-blur-sm p-2">
        <div className="flex space-x-2">
          {sections.map((section, i) => (
            <div 
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                i <= currentSection 
                  ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg shadow-green-400/30' 
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 px-1">
          {sections.map((section, i) => (
            <span 
              key={i} 
              className={`text-xs transition-colors duration-300 ${
                i === currentSection ? 'text-green-400 font-medium' : 'text-white/40'
              }`}
            >
              {section}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // Return appropriate style component
  switch (style) {
    case 'dots':
      return <DotsProgress />;
    case 'animated':
      return <AnimatedProgress />;
    case 'glow':
      return <GlowProgress />;
    default:
      return sections.length > 0 ? <SectionProgress /> : <LineProgress />;
  }
};