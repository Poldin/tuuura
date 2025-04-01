'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Experience } from './types';
import { ThumbsUp, ThumbsDown, Share, X, ShoppingBasket } from 'lucide-react';
import HamburgerMenu from './components/hamburgermenu/hamburgermenucomponent';
import { useSearchParams, useRouter } from 'next/navigation';

const BATCH_SIZE = 2; // Number of items to load at once

// Loading component to display while the main content is loading
function HomeLoading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}

// Home component that uses useSearchParams
function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showBuyLabel, setShowBuyLabel] = useState(false);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const loadedIdsRef = useRef<Set<string>>(new Set());
  
  // Function to update URL with product uid
  const updateUrlWithProduct = useCallback((uid: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('p', uid);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Load next experiences
  const loadNextExperiences = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const loadedIds = Array.from(loadedIdsRef.current);
      const productUid = searchParams.get('p');
      
      console.log('Fetching next experiences:', {
        currentlyLoaded: loadedIds,
        experiencesCount: experiences.length,
        productUid
      });
      
      const response = await fetch(
        `/api/products?limit=${BATCH_SIZE}${loadedIds.length > 0 ? `&loadedIds=${loadedIds.join(',')}` : ''}${productUid ? `&p=${productUid}` : ''}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch experiences');
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      if (data.experiences && data.experiences.length > 0) {
        // Add new experiences to state
        setExperiences(prev => [...prev, ...data.experiences]);
        
        // Add new IDs to our ref
        data.experiences.forEach((exp: Experience) => {
          loadedIdsRef.current.add(exp.id);
        });
        
        setHasMore(data.hasMore);
      } else {
        console.log('No more experiences available');
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading next experiences:', err);
      setError('Error loading next experiences. Please try again later.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [experiences.length, hasMore, isLoadingMore, searchParams]);

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
      
      // Determine scroll direction
      const isGoingUp = scrollTop < scrollPosition;
      
      setScrollPosition(scrollTop);
      
      if (newIndex !== currentIndex && experiences[newIndex]) {
        setCurrentIndex(newIndex);
        setShowBuyLabel(false); // Reset the label visibility when changing cards
        
        // Update URL with the current product's uid
        updateUrlWithProduct(experiences[newIndex].uid);
        
        // Check if we need to load more products
        const isNearEnd = newIndex >= experiences.length - 2;
        const isLastProduct = newIndex === experiences.length - 1;
        
        // Load more content only if:
        // 1. We're scrolling down
        // 2. We're at the last product or second-to-last product
        // 3. There are more products to load
        // 4. We're not already loading
        if (!isGoingUp && 
            (isNearEnd || isLastProduct) && 
            hasMore && 
            !isLoadingMore) {
          console.log('Scrolling down, loading more products. Current state:', {
            newIndex,
            experiencesLength: experiences.length,
            isLastProduct,
            isNearEnd,
            hasMore,
            isLoadingMore,
            loadedIds: Array.from(loadedIdsRef.current)
          });
          loadNextExperiences();
        }
      }
    };

    container.addEventListener('scroll', handleScrollUpdate);
    return () => container.removeEventListener('scroll', handleScrollUpdate);
  }, [currentIndex, experiences, hasMore, isLoadingMore, scrollPosition, loadNextExperiences, updateUrlWithProduct]);

  // Add effect to show buy label after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBuyLabel(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex]); // Reset timer when currentIndex changes

  // Initial data fetch - fetch first batch of products
  useEffect(() => {
    const fetchInitialExperiences = async () => {
      try {
        setLoading(true);
        const productUid = searchParams.get('p');
        const response = await fetch(`/api/products?limit=${BATCH_SIZE}${productUid ? `&p=${productUid}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch experiences');
        }
        
        const data = await response.json();
        console.log('Initial data received:', data);
        
        if (data.experiences && data.experiences.length > 0) {
          setExperiences(data.experiences);
          // Add initial IDs to our ref
          data.experiences.forEach((exp: Experience) => {
            loadedIdsRef.current.add(exp.id);
          });
          setHasMore(data.hasMore);
          
          // If we have a specific product uid and it's not in the first batch,
          // we need to find its index and scroll to it
          if (productUid) {
            const productIndex = data.experiences.findIndex((exp: Experience) => exp.uid === productUid);
            if (productIndex !== -1) {
              setCurrentIndex(productIndex);
              // Update URL with the found product's uid
              updateUrlWithProduct(data.experiences[productIndex].uid);
            }
          }
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
  }, [searchParams, updateUrlWithProduct]);

  const handleInteraction = (type: 'like' | 'dislike' | 'share' | 'buy') => {
    if (experiences.length === 0) return;
    
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

  // For debugging - log loaded IDs on every render
  console.log('Loaded IDs:', Array.from(loadedIdsRef.current));
  
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
              loadNextExperiences();
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
        className="relative w-full max-w-md h-screen overflow-y-auto snap-y snap-mandatory pt-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <AnimatePresence mode="wait">
          {experiences.map((experience, index) => (
            <div 
              key={`${experience.id}-${index}`}
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
                <div className="flex flex-col items-start gap-2">
                  <div 
                    onClick={() => setShowPopup(true)}
                    className="bg-white text-gray-800 rounded-lg px-2 font-bold text-2xl max-w-fit cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    {experience.title}
                  </div>  
                  <span 
                    onClick={() => setShowPopup(true)}
                    className="text-lg bg-white text-gray-800 rounded-lg px-3 py-1 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    {experience.currency}{experience.price}
                  </span>
                </div>
              </div>

              {/* Description Dialog */}
              <AnimatePresence>
                {showPopup && (
                  <>
                    <motion.div 
                      className="fixed inset-0 bg-black/50 z-40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowPopup(false)}
                    />
                    <motion.div 
                      className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl p-6 md:max-w-md md:mx-auto"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                      <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
                      <div className="flex items-start gap-3 mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800 mb-1">{experience.title}</h2>
                          <p className="text-xl text-amber-800 font-semibold">{experience.currency}{experience.price}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-base">
                        {experience.description}
                      </p>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
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

// Main component with Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}