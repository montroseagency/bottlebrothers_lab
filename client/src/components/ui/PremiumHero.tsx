// client/src/components/ui/PremiumHero.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MagneticButton } from './MagneticButton';
import { ParticleField } from './ParticleField';

interface PremiumHeroProps {
  title: string;
  subtitle?: string;
  description: string;
  primaryButton: {
    text: string;
    link: string;
  };
  secondaryButton?: {
    text: string;
    link: string;
  };
  backgroundVideo?: string;
  backgroundImage?: string;
  overlay?: 'dark' | 'green' | 'gradient';
  style?: 'split' | 'center' | 'full';
}

export const PremiumHero: React.FC<PremiumHeroProps> = ({
  title,
  subtitle,
  description,
  primaryButton,
  secondaryButton,
  backgroundVideo,
  backgroundImage,
  overlay = 'gradient',
  style = 'center'
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [typedText, setTypedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const morphingWords = ['Excellence', 'Sophistication', 'Elegance', 'Luxury'];

  // Scroll parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse movement tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Morphing text effect
  useEffect(() => {
    const interval = setInterval(() => {
      const word = morphingWords[currentWordIndex];
      if (typedText.length < word.length) {
        setTypedText(word.slice(0, typedText.length + 1));
      } else {
        setTimeout(() => {
          setTypedText('');
          setCurrentWordIndex((prev) => (prev + 1) % morphingWords.length);
        }, 2000);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [typedText, currentWordIndex]);

  const MorphingBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute w-96 h-96 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full blur-3xl"
        style={{
          left: `${20 + mousePosition.x * 0.1}%`,
          top: `${10 + mousePosition.y * 0.1}%`,
          transform: `scale(${1 + mousePosition.x * 0.001}) rotate(${scrollY * 0.1}deg)`,
          transition: 'all 1s ease-out'
        }}
      />
      <div 
        className="absolute w-64 h-64 bg-gradient-to-br from-amber-400/15 to-orange-500/15 rounded-full blur-2xl"
        style={{
          right: `${15 + mousePosition.y * 0.05}%`,
          bottom: `${20 + mousePosition.x * 0.05}%`,
          transform: `scale(${1.2 - mousePosition.y * 0.001}) rotate(${-scrollY * 0.05}deg)`,
          transition: 'all 0.8s ease-out'
        }}
      />
      <div 
        className="absolute w-48 h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl"
        style={{
          left: `${60 + mousePosition.x * 0.03}%`,
          top: `${70 + mousePosition.y * 0.03}%`,
          transform: `scale(${0.8 + mousePosition.x * 0.0005}) rotate(${scrollY * 0.15}deg)`,
          transition: 'all 1.2s ease-out'
        }}
      />
    </div>
  );

  const getOverlayClass = () => {
    switch (overlay) {
      case 'dark':
        return 'bg-black/60';
      case 'green':
        return 'bg-gradient-to-r from-green-900/80 to-green-800/60';
      default:
        return 'bg-gradient-to-br from-black/70 via-green-900/50 to-black/70';
    }
  };

  const renderContent = () => (
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className={`${style === 'split' ? 'text-left max-w-2xl' : 'text-center'}`}>
        {subtitle && (
          <div className="mb-6">
            <span 
              className="inline-block bg-green-400/20 text-green-300 px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wide backdrop-blur-sm border border-green-400/30"
              style={{ transform: `translateY(${scrollY * -0.05}px)` }}
            >
              {subtitle}
            </span>
          </div>
        )}
        
        <div className="mb-8 space-y-4">
          <div className="overflow-hidden">
            <h1 
              className="text-6xl md:text-8xl font-bold text-white leading-tight"
              style={{ 
                transform: `translateY(${scrollY * -0.1}px)`,
                filter: `blur(${Math.max(0, scrollY * 0.005)}px)`
              }}
            >
              {title}
            </h1>
          </div>
          
          {morphingWords && (
            <div className="overflow-hidden">
              <h2 
                className="text-4xl md:text-6xl font-light text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 min-h-[4rem]"
                style={{ 
                  transform: `translateY(${scrollY * -0.15}px)`,
                  textShadow: '0 0 30px rgba(34, 197, 94, 0.3)'
                }}
              >
                {typedText}
                <span className="animate-pulse">|</span>
              </h2>
            </div>
          )}
        </div>
        
        <div 
          className="mb-8"
          style={{ transform: `translateY(${scrollY * -0.08}px)` }}
        >
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
            {description}
          </p>
        </div>
        
        <div 
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          style={{ transform: `translateY(${scrollY * -0.05}px)` }}
        >
          <MagneticButton className="group relative px-10 py-5 bg-transparent border-2 border-green-400 rounded-full overflow-hidden hover:shadow-2xl hover:shadow-green-400/25 transition-all duration-500">
            <Link to={primaryButton.link} className="relative z-10 font-semibold text-green-400 group-hover:text-black transition-colors duration-500 text-lg">
              {primaryButton.text}
            </Link>
            <div className="absolute inset-0 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="absolute inset-0 bg-green-400 blur opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-pulse" />
          </MagneticButton>
          
          {secondaryButton && (
            <MagneticButton className="group relative px-10 py-5 bg-gradient-to-r from-green-600 to-green-700 rounded-full font-semibold text-white hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg overflow-hidden">
              <Link to={secondaryButton.link} className="relative z-10">
                {secondaryButton.text}
              </Link>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            </MagneticButton>
          )}
        </div>
      </div>
    </div>
  );

  const ScrollIndicator = () => (
    <div 
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
      style={{ opacity: Math.max(0, 1 - scrollY * 0.01) }}
    >
      <div className="w-6 h-12 border-2 border-green-400 rounded-full flex justify-center cursor-pointer hover:border-green-300 transition-colors">
        <div className="w-1 h-4 bg-green-400 rounded-full mt-2 animate-pulse" />
      </div>
      <p className="text-green-300 text-sm mt-2 font-medium">Scroll</p>
    </div>
  );

  if (style === 'split') {
    return (
      <section ref={heroRef} className="relative h-screen flex overflow-hidden">
        {/* Left Side - Video/Image */}
        <div className="w-1/2 relative">
          {backgroundVideo ? (
            <video 
              ref={videoRef}
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: `scale(${1 + scrollY * 0.0005})` }}
            >
              <source src={backgroundVideo} type="video/mp4" />
            </video>
          ) : backgroundImage ? (
            <img 
              src={backgroundImage} 
              alt="Hero background"
              className="w-full h-full object-cover"
              style={{ transform: `scale(${1 + scrollY * 0.0005})` }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-800 to-green-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
        </div>
        
        {/* Right Side - Content */}
        <div className="w-1/2 bg-black relative flex items-center justify-center">
          <MorphingBackground />
          <ParticleField particleCount={25} color="bg-green-400" />
          {renderContent()}
        </div>
        
        <ScrollIndicator />
      </section>
    );
  }

  return (
    <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      {backgroundVideo ? (
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: `scale(${1 + scrollY * 0.0005})` }}
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      ) : backgroundImage ? (
        <img 
          src={backgroundImage} 
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: `scale(${1 + scrollY * 0.0005})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-stone-900 to-green-900" />
      )}
      
      {/* Overlay */}
      <div className={`absolute inset-0 ${getOverlayClass()}`} />
      
      {/* Effects */}
      <MorphingBackground />
      <ParticleField particleCount={30} color="bg-green-300" />
      
      {/* Content */}
      {renderContent()}
      
      {/* Scroll Indicator */}
      <ScrollIndicator />
    </section>
  );
};