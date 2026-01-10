'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SnapScrollWrapperProps {
  children: React.ReactNode[];
}

export function SnapScrollWrapper({ children }: SnapScrollWrapperProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [isInView, setIsInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingRef = useRef(false);
  const totalSections = children.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = sectionsRef.current.findIndex((ref) => ref === entry.target);
          if (entry.isIntersecting && index !== -1) {
            setCurrentSection(index);
            setIsInView(true);
          }
        });
      },
      { threshold: 0.6 }
    );

    sectionsRef.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Handle wheel events for snap scrolling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const container = containerRef.current;
      if (!container || isScrollingRef.current) return;

      // Check if we're within the snap scroll area
      const containerRect = container.getBoundingClientRect();
      const isInSnapArea = containerRect.top <= 0 && containerRect.bottom >= window.innerHeight;

      if (!isInSnapArea) return;

      const threshold = 50;
      if (Math.abs(e.deltaY) < threshold) return;

      e.preventDefault();
      isScrollingRef.current = true;

      let targetSection = currentSection;
      if (e.deltaY > 0 && currentSection < totalSections - 1) {
        targetSection = currentSection + 1;
      } else if (e.deltaY < 0 && currentSection > 0) {
        targetSection = currentSection - 1;
      } else if (e.deltaY > 0 && currentSection === totalSections - 1) {
        // Allow scrolling past the snap sections
        isScrollingRef.current = false;
        return;
      } else if (e.deltaY < 0 && currentSection === 0) {
        // At top, allow normal behavior
        isScrollingRef.current = false;
        return;
      }

      const targetRef = sectionsRef.current[targetSection];
      if (targetRef) {
        targetRef.scrollIntoView({ behavior: 'smooth' });
        setCurrentSection(targetSection);
      }

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSection, totalSections]);

  // Touch handling for mobile
  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const container = containerRef.current;
      if (!container || isScrollingRef.current) return;

      const containerRect = container.getBoundingClientRect();
      const isInSnapArea = containerRect.top <= 100 && containerRect.bottom >= window.innerHeight - 100;

      if (!isInSnapArea) return;

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      const threshold = 50;

      if (Math.abs(diff) < threshold) return;

      isScrollingRef.current = true;
      let targetSection = currentSection;

      if (diff > 0 && currentSection < totalSections - 1) {
        targetSection = currentSection + 1;
      } else if (diff < 0 && currentSection > 0) {
        targetSection = currentSection - 1;
      }

      const targetRef = sectionsRef.current[targetSection];
      if (targetRef) {
        targetRef.scrollIntoView({ behavior: 'smooth' });
        setCurrentSection(targetSection);
      }

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentSection, totalSections]);

  return (
    <div ref={containerRef} className="relative">
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          ref={(el) => { sectionsRef.current[index] = el; }}
          className="min-h-screen w-full relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full w-full"
          >
            {child}
          </motion.div>
        </div>
      ))}

      {/* Section indicators - only show when in snap area */}
      <AnimatePresence>
        {isInView && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
          >
            {React.Children.map(children, (_, index) => (
              <button
                key={index}
                onClick={() => {
                  const targetRef = sectionsRef.current[index];
                  if (targetRef) {
                    targetRef.scrollIntoView({ behavior: 'smooth' });
                    setCurrentSection(index);
                  }
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentSection === index
                    ? 'bg-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to section ${index + 1}`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
