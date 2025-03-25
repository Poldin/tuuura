'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Experience, UserInteraction } from './types';
import { ThumbsUp, ThumbsDown, User, Share2, X, Telescope, ChevronRight } from 'lucide-react';
import HamburgerMenu from './components/hamburgermenu/hamburgermenucomponent';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeButton, setActiveButton] = useState<'left' | 'right' | 'next' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.clientWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScrollUpdate);
    return () => container.removeEventListener('scroll', handleScrollUpdate);
  }, [currentIndex]);

  // Initial data fetch - fetch only one product
  useEffect(() => {
    const fetchInitialExperience = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?limit=1');
        
        if (!response.ok) {
          throw new Error('Failed to fetch experience');
        }
        
        const data = await response.json();
        
        if (data.experiences && data.experiences.length > 0) {
          const newExperience = data.experiences[0];
          setExperiences([newExperience]);
          setSeenProductIds([newExperience.id]);
          setHasMore(true);
        } else {
          setExperiences([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error fetching initial experience:', err);
        setError('Error loading experience. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialExperience();
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
        setExperiences([newExperience]); // Replace current experience with new one
        setSeenProductIds(prevIds => [...prevIds, newExperience.id]);
        setHasMore(true);
        setCurrentIndex(0); // Reset to first position
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

  const handleButtonClick = (buttonType: 'left' | 'right' | 'next') => {
    if (isTransitioning || experiences.length === 0) return;
    
    setIsTransitioning(true);
    setActiveButton(buttonType);
    
    // Record the interaction with appropriate action description
    if (buttonType === 'left') {
      recordInteraction({
        productId: currentExperience.id,
        disliked: true,
        action: 'User disliked the product'
      });
    } else if (buttonType === 'right') {
      recordInteraction({
        productId: currentExperience.id,
        liked: true,
        action: 'User liked the product'
      });
    }
    
    // Load next experience if available
    if (hasMore) {
      loadNextExperience().then(() => {
        setActiveButton(null);
        setIsTransitioning(false);
      });
    } else {
      setCurrentIndex(0);
      setActiveButton(null);
      setIsTransitioning(false);
    }
  };

  const openPopup = () => {
    // Record the click for details
    recordInteraction({
      productId: currentExperience.id,
      clickedDetails: true,
      action: 'User viewed product details'
    });
    
    setShowPopup(true);
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

  // Card component to avoid repetition
  const ExperienceCard = ({ experience, onClick }: { experience: Experience, onClick: () => void }) => {
    // Function to truncate text to a specific number of characters
    const truncateText = (text: string, maxLength: number = 120) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength).trim();
    };

    const truncatedDescription = truncateText(experience.description);
    const needsTruncation = experience.description.length > truncatedDescription.length;

    return (
      <motion.div 
        className="relative bg-white rounded-xl overflow-hidden shadow-xl h-[60vh] w-full cursor-pointer"
        onClick={onClick}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: { duration: 0.2 }
        }}
        exit={{ 
          opacity: 0,
          transition: { duration: 0.2 }
        }}
      >
        {/* Overlay for interaction feedback */}
        <AnimatePresence>
          {activeButton && (
            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`w-full h-full flex items-center justify-center ${
                activeButton === 'left' ? 'bg-red-500' :
                activeButton === 'right' ? 'bg-green-500' :
                'bg-gray-500'
              }`}>
                {activeButton === 'left' && <ThumbsDown className="w-24 h-24 text-white" />}
                {activeButton === 'right' && <ThumbsUp className="w-24 h-24 text-white" />}
                {activeButton === 'next' && <ChevronRight className="w-24 h-24 text-white" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative h-3/5 w-full">
          <Image
            src={experience.imageUrl}
            alt={experience.title}
            fill
            style={{ objectFit: 'cover' }}
            className="select-none" 
          />
        </div>

        <div className="p-5 pb-10">
          <div className='flex items-start gap-3 mb-3'>
            <h2 className="text-2xl text-gray-800">{experience.currency}{experience.price} <b>{experience.title}</b></h2>
          </div>

          <p className="text-gray-600 mb-3 text-sm">
            {truncatedDescription}
            {needsTruncation && (
              <span className="text-gray-700 font-medium"> ...<u>clicca per scoprire di più</u></span>
            )}
          </p>
        </div>
      </motion.div>
    );
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
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gray-100 overflow-hidden">
      <TPattern />
      <header className="w-full max-w-md mb-4 flex justify-between items-center">
        <motion.button
          className="p-2 rounded-full bg-white shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Login"
        >
          <User className="w-6 h-6 text-gray-700" />
        </motion.button>
        
        <h1 className="text-3xl font-bold text-center text-amber-800">Tuuura</h1>
        
        <HamburgerMenu />
      </header>

      <div className="relative w-full max-w-md">
        {/* Cards container with horizontal scroll */}
        <div 
          ref={cardsContainerRef}
          className="flex overflow-x-hidden gap-4 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <AnimatePresence mode="wait">
            {experiences.map((experience) => (
              <div 
                key={experience.id}
                className="flex-none w-full snap-center"
              >
                <ExperienceCard experience={experience} onClick={openPopup} />
                
                <div className="mt-4 w-full flex gap-2">
                  <motion.button
                    onClick={openPopup}
                    className="text-amber-700 bg-white py-3 px-6 rounded-lg shadow-md text-center hover:text-white flex items-center justify-center gap-2 relative overflow-hidden w-full"
                    whileHover={{ scale: 1.02, backgroundColor: "#d97706" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Telescope className="relative w-4 h-4" />
                    <span className="relative">scopri di più</span>
                  </motion.button>
                  
                  <motion.button 
                    onClick={handleShare}
                    className="bg-white text-gray-700 hover:bg-gray-700 hover:text-white rounded-lg shadow-md transition-all flex items-center justify-center px-4 py-3 gap-2 relative overflow-hidden w-full"
                    aria-label="Condividi"
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 10px 15px -5px rgba(0, 0, 0, 0.1), 0 5px 5px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 className="relative w-4 h-4" />
                    <span className="relative">condividi</span>
                  </motion.button>
                </div>
              </div>
            ))}
          </AnimatePresence>
          
          {/* Loading indicator */}
          {(isLoadingMore || loading) && (
            <div className="flex-none w-full snap-center flex items-center justify-center">
              <div className="animate-pulse">
                <div className="h-8 w-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buttons at the bottom of the main page */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center w-full px-4">
        <div className="w-full max-w-md flex justify-between space-x-2 items-center">
          <motion.button 
            onClick={() => !isTransitioning && handleButtonClick('left')}
            className="bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-full shadow-lg transition-all flex items-center justify-center w-16 h-16 relative overflow-hidden"
            aria-label="Non mi interessa"
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            whileTap={{ scale: 0.85 }}
            disabled={isTransitioning}
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
            className="flex-1 text-white bg-amber-800 hover:bg-amber-900 py-3 rounded-full shadow-lg transition-all items-center justify-center font-bold relative overflow-hidden h-16 flex"
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
            onClick={() => !isTransitioning && handleButtonClick('right')}
            className="bg-white text-green-500 hover:bg-green-500 hover:text-white rounded-full shadow-lg transition-all flex items-center justify-center w-16 h-16 relative overflow-hidden"
            aria-label="Interessante"
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            whileTap={{ scale: 0.85 }}
            disabled={isTransitioning}
          >
            <motion.div 
              className="absolute inset-0 bg-green-100" 
              initial={{ y: "100%" }}
              whileHover={{ y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
            <ThumbsUp className="relative z-10" />
          </motion.button>

          <motion.button 
            onClick={() => !isTransitioning && handleButtonClick('next')}
            className="bg-white text-gray-700 hover:bg-gray-700 hover:text-white rounded-full shadow-lg transition-all flex items-center justify-center w-16 h-16 relative overflow-hidden"
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            whileTap={{ scale: 0.85 }}
            disabled={isLoadingMore || loading}
          >
            <motion.div 
              className="absolute inset-0 bg-gray-100" 
              initial={{ y: "100%" }}
              whileHover={{ y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
            <ChevronRight className="relative z-10" />
          </motion.button>
        </div>
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
                  className="w-full text-gray-700 bg-white border border-gray-700 py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 relative overflow-hidden mb-6"
                  aria-label="Condividi"
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: "#d97706",
                    color: "white",
                    borderColor: "#d97706"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 className="relative z-10 w-5 h-5" />
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
                    setTimeout(() => handleButtonClick('left'), 300);
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
                    setTimeout(() => handleButtonClick('right'), 300);
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