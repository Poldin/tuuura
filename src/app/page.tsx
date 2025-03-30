'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Experience, UserInteraction } from './types';
import { ThumbsUp, ThumbsDown, Share, X, ShoppingBasket, Maximize2 } from 'lucide-react';
import HamburgerMenu from './components/hamburgermenu/hamburgermenucomponent';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showBuyLabel, setShowBuyLabel] = useState(false);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [seenProductIds, setSeenProductIds] = useState<string[]>([]);
  
  // Get the current experience or show a placeholder
  const currentExperience = experiences.length > 0 
    ? experiences[currentIndex] 
    : {
        id: '',
        uid: '',
        title: 'Loading...',
        description: 'Loading experience details...',
        price: 0,
        currency: '€',
        imageUrl: '/placeholder.jpg',
        producerId: '',
      };

  // Update current index based on scroll position
  useEffect(() => {
    if (!cardsContainerRef.current) return;

    const container = cardsContainerRef.current;
    const handleScrollUpdate = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / viewportHeight);
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        setShowBuyLabel(false); // Reset the label visibility when changing cards
        // Load more content if we're near the end
        if (newIndex >= experiences.length - 1 && hasMore && !isLoadingMore) {
          loadNextExperience();
        }
      }
    };

    container.addEventListener('scroll', handleScrollUpdate);
    return () => container.removeEventListener('scroll', handleScrollUpdate);
  }, [currentIndex, experiences.length, hasMore, isLoadingMore]);

  // Add effect to show buy label after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBuyLabel(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex]); // Reset timer when currentIndex changes

  // Initial data fetch - fetch multiple products
  useEffect(() => {
    const fetchInitialExperiences = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?limit=5');
        
        if (!response.ok) {
          throw new Error('Failed to fetch experiences');
        }
        
        const data = await response.json();
        
        if (data.experiences && data.experiences.length > 0) {
          setExperiences(data.experiences);
          setSeenProductIds(data.experiences.map((exp: Experience) => exp.id));
          setHasMore(true);
        } else {
          setExperiences([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error fetching initial experiences:', err);
        setError('Error loading experiences. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialExperiences();
  }, []);

  // Load next experience
  const loadNextExperience = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/products?limit=1&exclude=${seenProductIds.join(',')}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch experience');
      }
      
      const data = await response.json();
      
      if (data.experiences && data.experiences.length > 0) {
        const newExperience = data.experiences[0];
        setExperiences(prev => [...prev, newExperience]);
        setSeenProductIds(prevIds => [...prevIds, newExperience.id]);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading next experience:', err);
      setError('Error loading next experience. Please try again later.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Check for user authentication
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Record user interaction
  const recordInteraction = async (interaction: UserInteraction & { action: string }) => {
    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...interaction,
          userId: userId
        }),
      });
    } catch (err) {
      console.error('Error recording interaction:', err);
    }
  };

  // Remove the handleButtonClick function since we don't need it anymore
  const handleInteraction = (type: 'like' | 'dislike' | 'share' | 'buy') => {
    if (experiences.length === 0) return;
    
    // Record the interaction
    recordInteraction({
      productId: currentExperience.id,
      ...(type === 'like' && { liked: true }),
      ...(type === 'dislike' && { disliked: true }),
      ...(type === 'share' && { clickedShare: true }),
      ...(type === 'buy' && { clickedBuy: true }),
      action: `User ${type}d the product`
    });

    // Handle buy action
    if (type === 'buy' && currentExperience.checkoutUrl) {
      window.open(currentExperience.checkoutUrl, '_blank');
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Record the share interaction
    recordInteraction({
      productId: currentExperience.id,
      clickedShare: true,
      action: 'User shared the product'
    });
    
    if (navigator.share) {
      navigator.share({
        title: currentExperience.title,
        text: currentExperience.description,
        url: window.location.href,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      alert('Web Share API not supported on this browser.');
    }
  };

  const handleBuyClick = () => {
    // Record the buy interaction
    recordInteraction({
      productId: currentExperience.id,
      clickedBuy: true,
      action: 'User clicked buy button'
    });
    
    // Redirect to checkout URL if available
    if (currentExperience.checkoutUrl) {
      window.open(currentExperience.checkoutUrl, '_blank');
    }
  };

  // SVG pattern with small semi-transparent gray T's
  const TPattern = () => (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" className="opacity-40">
        <pattern id="t-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <text x="10" y="30" fontSize="20" fill="currentColor" className="text-gray-400">
            T
          </text>
        </pattern>
        <rect width="100%" height="100%" fill="url(#t-pattern)" />
      </svg>
    </div>
  );

  // Show loading state
  if (loading && experiences.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gray-100">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="h-8 w-32 bg-gray-300 rounded mx-auto"></div>
          </div>
          <p className="text-gray-600">Loading experiences...</p>
        </div>
      </main>
    );
  }

  // Show error state
  if (error && experiences.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              loadNextExperience();
            }}
            className="mt-4 bg-amber-800 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-100 overflow-hidden">
      <TPattern />
      <header className="fixed top-0 left-0 right-6 z-50 bg-transparent w-full max-w-md mx-auto px-4 py-4 flex justify-end items-center">
        <HamburgerMenu />
      </header>

      <div 
        ref={cardsContainerRef}
        className="relative w-full max-w-md h-screen overflow-y-auto snap-y snap-mandatory pt-16"
      >
        <AnimatePresence mode="wait">
          {experiences.map((experience) => (
            <div 
              key={experience.id}
              className="h-screen snap-start relative flex flex-col"
            >
              <div className="relative h-full w-full">
                <Image
                  src={experience.imageUrl}
                  alt={experience.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="select-none" 
                />
                
                {/* Vertical buttons on the right */}
                <div className="absolute right-4 bottom-4 flex flex-col gap-4 items-end justify-center z-10">
                  <motion.button 
                    onClick={() => handleInteraction('share')}
                    className="bg-white backdrop-blur-sm text-gray-700 rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                    aria-label="Condividi"
                    whileHover={{ 
                      scale: 1.1,
                      backgroundColor: "rgba(255, 255, 255, 0.9)"
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Share className="w-5 h-5" />
                  </motion.button>

                  <motion.button 
                    onClick={() => handleInteraction('dislike')}
                    className="bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                    aria-label="Non mi interessa"
                    whileHover={{ 
                      scale: 1.1,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    whileTap={{ scale: 0.85 }}
                  >
                    <ThumbsDown className="w-5 h-5" />
                  </motion.button>

                  <motion.button 
                    onClick={() => handleInteraction('like')}
                    className="bg-white text-green-500 hover:bg-green-500 hover:text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                    aria-label="Interessante"
                    whileHover={{ 
                      scale: 1.1,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    whileTap={{ scale: 0.85 }}
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </motion.button>

                  <motion.button 
                    onClick={() => handleInteraction('buy')}
                    className="bg-amber-800 text-white hover:bg-amber-900 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2"
                    aria-label="Acquista"
                    whileHover={{ 
                      scale: 1.1,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    whileTap={{ scale: 0.85 }}
                  >
                    {showBuyLabel && <span className="font-medium">acquista</span>}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <ShoppingBasket className="w-6 h-6" />
                    </motion.div>
                  </motion.button>
                </div>
              </div>

              {/* Bottom content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-white">
                <button className="bg-white text-gray-800 hover:bg-gray-200 rounded-lg px-3 py-1 flex items-center mb-2">
                      <Maximize2 className='w-4 h-4 mr-2 text-gray-800/60'/> <span className="font-bold text-2xl">{experience.title}</span>
                    </button>  
                    <span className="text-lg bg-white text-gray-800 rounded-lg px-3 py-1">{experience.currency}{experience.price}</span>
                </div>
              </div>
            </div>
          ))}
        </AnimatePresence>
        
        {/* Loading indicator */}
        {(isLoadingMore || loading) && (
          <div className="h-screen snap-start flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        )}
      </div>

      {/* Full-screen popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-full max-w-md mx-auto px-4 py-6 flex-1">
              {/* Close button in the top right */}
              <motion.button
                className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-10"
                onClick={closePopup}
                whileHover={{ scale: 1.1, backgroundColor: "#ef4444" }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
              
              <div className="mb-24">
                <div className="relative h-64 w-full mb-6">
                  <Image
                    src={currentExperience.imageUrl}
                    alt={currentExperience.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg select-none" 
                  />
                </div>
                
                <div className='flex items-start gap-3 mb-3'>
                  <h2 className="text-3xl text-gray-800">{currentExperience.currency}{currentExperience.price} <b>{currentExperience.title}</b></h2>
                </div>
                
                <p className="text-gray-600 text-base mb-6">
                  {currentExperience.description}
                </p>
                
                {/* Full-width Share button after the description */}
                <motion.button 
                  onClick={handleShare}
                  className="w-full text-gray-700 bg-white py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 relative overflow-hidden mb-6"
                  aria-label="Condividi"
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: "#d97706",
                    color: "white",
                    borderColor: "#d97706"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share className="relative z-10 w-5 h-5" />
                  <span className="relative z-10 font-medium">condividi</span>
                </motion.button>
              </div>
            </div>
            
            {/* Buttons at the bottom of the popup with same width as the image */}
            <div className="sticky bottom-0 left-0 right-0 bg-white py-4 border-t border-gray-200">
              <div className="w-full max-w-md mx-auto px-4 flex justify-between space-x-2 items-center">
                <motion.button 
                  onClick={() => {
                    closePopup();
                    setTimeout(() => handleInteraction('dislike'), 300);
                  }}
                  className="bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-full shadow-lg transition-all flex items-center justify-center w-16 h-16 relative overflow-hidden"
                  aria-label="Non mi interessa"
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  whileTap={{ scale: 0.85 }}
                >
                  <motion.div 
                    className="absolute inset-0 bg-red-100" 
                    initial={{ y: "100%" }}
                    whileHover={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  />
                  <ThumbsDown className="relative z-10" />
                </motion.button>
                
                <motion.button 
                  className="flex-1 text-white bg-amber-800 hover:bg-amber-900 py-3 rounded-full shadow-lg transition-all items-center justify-center font-bold relative overflow-hidden h-16 flex w-full"
                  aria-label="Acquista"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBuyClick}
                >
                  <motion.div 
                    className="absolute inset-0 bg-amber-800" 
                    initial={{ y: "100%" }}
                    whileHover={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  />
                  <span className="relative z-10 text-lg">acquista</span>
                </motion.button>
                
                <motion.button 
                  onClick={() => {
                    closePopup();
                    setTimeout(() => handleInteraction('like'), 300);
                  }}
                  className="bg-white text-green-500 hover:bg-green-500 hover:text-white rounded-full shadow-lg transition-all flex items-center justify-center w-16 h-16 relative overflow-hidden"
                  aria-label="Interessante"
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  whileTap={{ scale: 0.85 }}
                >
                  <motion.div 
                    className="absolute inset-0 bg-green-100" 
                    initial={{ y: "100%" }}
                    whileHover={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  />
                  <ThumbsUp className="relative z-10" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}