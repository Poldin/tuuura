'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Experience, UserInteraction } from './types';
import { ThumbsUp, ThumbsDown, User, Share2, X, Telescope } from 'lucide-react';
import HamburgerMenu from './components/hamburgermenu/hamburgermenucomponent';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeButton, setActiveButton] = useState<'left' | 'right' | 'up' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
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

  // Fetch experiences
  const fetchExperiences = async (pageNum: number = 0, limit: number = 4) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?page=${pageNum}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch experiences');
      }
      
      const data = await response.json();
      
      if (data.experiences && data.experiences.length > 0) {
        if (pageNum === 0) {
          setExperiences(data.experiences);
        } else {
          setExperiences(prevExperiences => [...prevExperiences, ...data.experiences]);
        }
        
        setUserId(data.userId);
        setHasMore(data.experiences.length === limit);
      } else if (pageNum === 0) {
        setExperiences([]);
        setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError('Error loading experiences. Please try again later.');
      console.error('Error fetching experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load more experiences when running low
  useEffect(() => {
    if (experiences.length > 0 && currentIndex >= experiences.length - 2 && hasMore) {
      fetchExperiences(page + 1);
      setPage(prevPage => prevPage + 1);
    }
  }, [currentIndex, experiences.length, hasMore, page]);

  // Initial fetch
  useEffect(() => {
    fetchExperiences();
  }, []);

  // Get current user ID
  const [userId, setUserId] = useState<string | null>(null);

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
  const recordInteraction = async (interaction: UserInteraction) => {
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

  const handleButtonClick = (buttonType: 'left' | 'right' | 'up') => {
    if (isTransitioning || experiences.length === 0) return;
    
    setIsTransitioning(true);
    setActiveButton(buttonType);
    
    // Record the interaction
    if (buttonType === 'left') {
      recordInteraction({
        productId: currentExperience.id,
        disliked: true,
      });
    } else if (buttonType === 'right') {
      recordInteraction({
        productId: currentExperience.id,
        liked: true,
      });
    }
    
    // Prepare the next card while the overlay is visible
    setTimeout(() => {
      // Change the index while the overlay is still visible
      if (currentIndex < experiences.length - 1) {
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else if (hasMore) {
        // We're waiting for more experiences to load
        // Keep the current one until more are loaded
      } else {
        // Cycle back to the beginning if there are no more to load
        setCurrentIndex(0);
      }
      
      // Wait a moment and then remove the overlay
      setTimeout(() => {
        setActiveButton(null);
        
        // Allow new transitions after the new card is fully visible
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 300);
    }, 200);
  };

  const openPopup = () => {
    // Record the click for details
    recordInteraction({
      productId: currentExperience.id,
      clickedDetails: true,
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
      <div 
        className="relative bg-white rounded-xl overflow-hidden shadow-xl h-[60vh] w-full cursor-pointer"
        onClick={onClick}
      >
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
      </div>
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
              fetchExperiences();
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
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gray-100">
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

      <div className="relative flex flex-col justify-center items-center w-full max-w-md overflow-hidden">
        {/* Main card (currentExperience) */}
        <div className="w-full">
          <ExperienceCard experience={currentExperience} onClick={openPopup} />
          
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
            
            {/* Share button next to Discover more */}
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

        {/* Color overlays */}
        <AnimatePresence>
          {activeButton === 'left' && (
            <motion.div 
              className="absolute top-0 left-0 right-0 bottom-0 bg-red-500 bg-opacity-30 rounded-xl flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ThumbsDown className="text-white w-32 h-32" />
              <span className="text-white text-3xl font-bold mt-4">😒 bleah.</span>
            </motion.div>
          )}
          
          {activeButton === 'right' && (
            <motion.div 
              className="absolute top-0 left-0 right-0 bottom-0 bg-green-500 bg-opacity-30 rounded-xl flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ThumbsUp className="text-white w-32 h-32" />
              <span className="text-white text-3xl font-bold mt-4">🙂 uhuuuh!</span>
            </motion.div>
          )}
        </AnimatePresence>
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