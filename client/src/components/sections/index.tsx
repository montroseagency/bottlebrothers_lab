// client/src/components/sections/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { GlassmorphicCard } from '../ui/GlassmorphicCard';
import { MagneticButton } from '../ui/MagneticButton';
import { ParticleField } from '../ui/ParticleField';

// Split Screen Section
interface SplitScreenSectionProps {
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  imagePosition?: 'left' | 'right';
  button?: {
    text: string;
    link: string;
  };
  background?: 'dark' | 'light' | 'gradient';
  children?: React.ReactNode;
}

export const SplitScreenSection: React.FC<SplitScreenSectionProps> = ({
  title,
  subtitle,
  description,
  image,
  imagePosition = 'left',
  button,
  background = 'dark',
  children
}) => {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const backgroundClass = {
    dark: 'bg-gradient-to-br from-black via-stone-900 to-green-900/20',
    light: 'bg-gradient-to-br from-stone-50 to-stone-100',
    gradient: 'bg-gradient-to-br from-green-900 via-black to-stone-900'
  }[background];

  const textColor = background === 'light' ? 'text-gray-800' : 'text-white';
  const subtitleColor = background === 'light' ? 'text-gray-600' : 'text-green-300';

  return (
    <section ref={sectionRef} className={`relative py-20 overflow-hidden ${backgroundClass}`}>
      {background !== 'light' && <ParticleField particleCount={15} color="bg-green-400" />}
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${
          imagePosition === 'right' ? 'lg:grid-flow-col-dense' : ''
        }`}>
          {/* Content */}
          <div className={imagePosition === 'right' ? 'lg:col-start-1' : ''}>
            {subtitle && (
              <div className="mb-6">
                <span className={`inline-block ${background === 'light' ? 'bg-green-100 text-green-800' : 'bg-green-400/20 text-green-300 backdrop-blur-sm border border-green-400/30'} px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide`}>
                  {subtitle}
                </span>
              </div>
            )}
            
            <h2 
              className={`text-4xl font-bold ${textColor} mb-6`}
              style={{ transform: `translateY(${scrollY * -0.05}px)` }}
            >
              {title}
            </h2>
            
            <p 
              className={`text-lg ${subtitleColor} mb-8 leading-relaxed`}
              style={{ transform: `translateY(${scrollY * -0.03}px)` }}
            >
              {description}
            </p>
            
            {button && (
              <div style={{ transform: `translateY(${scrollY * -0.02}px)` }}>
                <MagneticButton className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-500 transition-all duration-300 shadow-lg">
                  <a href={button.link}>{button.text}</a>
                </MagneticButton>
              </div>
            )}
            
            {children && (
              <div 
                className="mt-8"
                style={{ transform: `translateY(${scrollY * -0.02}px)` }}
              >
                {children}
              </div>
            )}
          </div>
          
          {/* Image */}
          <div className={`relative ${imagePosition === 'right' ? 'lg:col-start-2' : ''}`}>
            <GlassmorphicCard className="overflow-hidden">
              <img 
                src={image} 
                alt={title}
                className="w-full h-96 lg:h-[500px] object-cover transform hover:scale-105 transition-transform duration-700"
                style={{ transform: `scale(${1 + scrollY * 0.0001})` }}
              />
            </GlassmorphicCard>
            
            {/* Floating element */}
            <div 
              className="absolute -bottom-6 -right-6 bg-green-600/90 text-white p-6 rounded-2xl backdrop-blur-sm border border-green-500/30"
              style={{ transform: `translateY(${scrollY * -0.1}px)` }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold">5+</div>
                <div className="text-sm opacity-90">Years Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Diagonal Section
interface DiagonalSectionProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  background?: 'green' | 'black' | 'gradient';
  className?: string;
}

export const DiagonalSection: React.FC<DiagonalSectionProps> = ({ 
  children, 
  direction = 'left',
  background = 'gradient',
  className = "" 
}) => {
  const getBgClass = () => {
    switch (background) {
      case 'green':
        return 'from-green-900 to-green-800';
      case 'black':
        return 'from-black to-stone-900';
      default:
        return 'from-green-900/90 via-black/80 to-stone-900/90';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${getBgClass()}`}
        style={{
          clipPath: direction === 'left' 
            ? 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'
            : 'polygon(0 15%, 100% 0, 100% 100%, 0 100%)'
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Feature Grid Section
interface FeatureGridSectionProps {
  title: string;
  subtitle?: string;
  description: string;
  features: {
    icon: string | React.ReactNode;
    title: string;
    description: string;
    link?: string;
  }[];
  columns?: 2 | 3 | 4;
  background?: 'dark' | 'light';
}

export const FeatureGridSection: React.FC<FeatureGridSectionProps> = ({
  title,
  subtitle,
  description,
  features,
  columns = 3,
  background = 'dark'
}) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.1 }
    );

    const items = document.querySelectorAll('[data-feature-item]');
    items.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  const gridColumns = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  }[columns];

  const bgClass = background === 'light' ? 'bg-stone-50' : 'bg-gradient-to-br from-black via-stone-900 to-green-900/20';
  const textColor = background === 'light' ? 'text-gray-800' : 'text-white';
  const subtitleTextColor = background === 'light' ? 'text-gray-600' : 'text-gray-300';

  return (
    <section className={`py-20 ${bgClass} relative overflow-hidden`}>
      {background === 'dark' && <ParticleField particleCount={25} color="bg-green-400" />}
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {subtitle && (
            <span className={`inline-block ${background === 'light' ? 'bg-green-100 text-green-800' : 'bg-green-400/20 text-green-300 backdrop-blur-sm border border-green-400/30'} px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4`}>
              {subtitle}
            </span>
          )}
          <h2 className={`text-4xl font-bold ${textColor} mb-4`}>
            {title}
          </h2>
          <p className={`text-xl ${subtitleTextColor} max-w-3xl mx-auto`}>
            {description}
          </p>
        </div>
        
        <div className={`grid grid-cols-1 ${gridColumns} gap-8`}>
          {features.map((feature, index) => (
            <div
              key={index}
              data-index={index}
              data-feature-item
              className={`transform transition-all duration-1000 ${
                visibleItems.has(index) ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <GlassmorphicCard className={`p-8 text-center h-full ${background === 'light' ? 'bg-white/80 backdrop-blur-sm hover:bg-white/90' : 'bg-white/10 hover:bg-white/20'} group`}>
                <div className="mb-6">
                  {typeof feature.icon === 'string' ? (
                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      {feature.icon}
                    </div>
                  )}
                </div>
                <h3 className={`text-xl font-bold ${textColor} mb-4`}>
                  {feature.title}
                </h3>
                <p className={`${subtitleTextColor} leading-relaxed mb-6`}>
                  {feature.description}
                </p>
                {feature.link && (
                  <MagneticButton className="text-green-400 hover:text-green-300 font-medium flex items-center justify-center space-x-1 group">
                    <a href={feature.link} className="flex items-center space-x-1">
                      <span>Learn More</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </MagneticButton>
                )}
              </GlassmorphicCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Floating Testimonials Section
interface TestimonialsCarouselProps {
  testimonials: {
    text: string;
    author: string;
    role: string;
    avatar?: string;
    image?: string;
  }[];
  background?: 'dark' | 'light';
  autoPlay?: boolean;
}

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  testimonials,
  background = 'dark',
  autoPlay = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length, isAutoPlaying]);

  const bgClass = background === 'light' ? 'bg-stone-50' : 'bg-gradient-to-br from-green-900 via-black to-stone-900';
  const textColor = background === 'light' ? 'text-gray-800' : 'text-white';

  return (
    <section 
      className={`py-20 ${bgClass} relative overflow-hidden`}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(autoPlay)}
    >
      {background === 'dark' && <ParticleField particleCount={20} color="bg-green-400" />}
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className={`text-4xl font-bold ${textColor} mb-16`}>
          Voices of <span className="text-green-400">Experience</span>
        </h2>
        
        <div className="relative h-80 flex items-center justify-center">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex flex-col justify-center items-center transition-all duration-1000 transform ${
                index === currentIndex 
                  ? 'opacity-100 scale-100 z-10' 
                  : index === (currentIndex + 1) % testimonials.length 
                    ? 'opacity-30 scale-95 translate-x-20' 
                    : index === (currentIndex - 1 + testimonials.length) % testimonials.length 
                      ? 'opacity-30 scale-95 -translate-x-20' 
                      : 'opacity-0 scale-90'
              }`}
            >
              <GlassmorphicCard className="p-8 max-w-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <blockquote className={`text-2xl font-light ${textColor} mb-8 italic leading-relaxed`}>
                  "{testimonial.text}"
                </blockquote>
                
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-black font-bold text-sm">
                      {testimonial.avatar || testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className={`${textColor} font-semibold`}>{testimonial.author}</div>
                    <div className="text-green-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </GlassmorphicCard>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center space-x-3 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-green-400 shadow-lg shadow-green-400/50' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};