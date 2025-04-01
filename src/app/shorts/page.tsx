'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface Experience {
  id: string;
  uid: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  checkoutUrl: string;
  producerId: string;
}

const BATCH_SIZE = 5; // Number of items to load at once

export default function ShortsPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
  });

  const scrollToShort = (direction: 'up' | 'down') => {
    const container = containerRef.current;
    if (!container) return;

    const itemHeight = window.innerHeight;
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    // If trying to go up and we're at the first item, do nothing
    if (direction === 'up' && currentIndex === 0) return;

    // If trying to go down and we're at the last item, fetch more
    if (direction === 'down' && currentIndex === experiences.length - 1) {
      const loadedIds = experiences.map(exp => exp.id);
      fetchExperiences(loadedIds);
      return;
    }

    // Smooth scroll to the target position
    container.scrollTo({
      top: newIndex * itemHeight,
      behavior: 'smooth'
    });
  };

  const fetchExperiences = async (loadedIds: string[] = []) => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/products?limit=${BATCH_SIZE}&loadedIds=${loadedIds.join(',')}`);
      const data = await response.json();
      
      if (data.experiences) {
        setExperiences(prev => [...prev, ...data.experiences]);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchExperiences();
  }, []);

  // Load more when reaching the end
  useEffect(() => {
    if (inView && hasMore) {
      const loadedIds = experiences.map(exp => exp.id);
      fetchExperiences(loadedIds);
    }
  }, [inView]);

  // Handle scroll events to update current index
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const itemHeight = window.innerHeight;
      const newIndex = Math.round(scrollPosition / itemHeight);
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        
        // If we're near the end, load more
        if (newIndex >= experiences.length - 2) {
          const loadedIds = experiences.map(exp => exp.id);
          fetchExperiences(loadedIds);
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, experiences.length]);

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative">
      {/* Navigation Buttons */}
      <button
        onClick={() => scrollToShort('up')}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
        disabled={currentIndex === 0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      
      <button
        onClick={() => scrollToShort('down')}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
        disabled={currentIndex === experiences.length - 1}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory"
      >
        {experiences.map((experience, index) => (
          <div
            key={experience.id}
            ref={index === experiences.length - 1 ? loadMoreRef : undefined}
            className="h-screen w-full snap-start snap-always flex items-center justify-center bg-gradient-to-b from-gray-900 to-black"
          >
            <div className="text-center p-4">
              <h2 className="text-4xl font-bold text-white mb-4">{experience.title}</h2>
              <p className="text-xl text-gray-300">{experience.description}</p>
              <div className="mt-4 text-sm text-gray-400">
                {index + 1} / {experiences.length}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="h-screen w-full flex items-center justify-center">
            <div className="text-white text-xl">Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
} 