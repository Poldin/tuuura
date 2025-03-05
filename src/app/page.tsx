'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, PanInfo, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { experiences } from './data/experiences';
import { Experience } from './types';
import { ThumbsUp, ThumbsDown, Heart, Menu, User } from 'lucide-react';

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  // const [likedExperiences, setLikedExperiences] = useState<string[]>([]);
  // const [exitX, setExitX] = useState<number>(0);
  // const [exitY, setExitY] = useState<number>(0);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for dragging
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Calculate rotation based on x position
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  
  // Calculate opacity for directional indicators
  const leftIndicatorOpacity = useTransform(x, [-50, 0], [1, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 50], [0, 1]);
  const upIndicatorOpacity = useTransform(y, [-50, 0], [1, 0]);
  
  const currentExperience = experiences[currentIndex];
  const nextIndex = (currentIndex + 1) % experiences.length;
  const nextExperience = experiences[nextIndex];

  // Reset motion values when currentIndex changes
  useEffect(() => {
    x.set(0);
    y.set(0);
  }, [currentIndex, x, y]);

  const handleSwipe = (swipeDirection: 'left' | 'right' | 'up') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Usiamo animation.start di Framer Motion per animare la carta prima dell'uscita
    if (swipeDirection === 'right') {
      // Animazione controllata verso destra
      const controls = animate(x, [0, 100, 300], {
        duration: 0.5, // Mezzo secondo per l'animazione
        onComplete: () => {
          setDirection(swipeDirection);
          //setExitX(1000);
          //setExitY(0);
          //setLikedExperiences(prev => [...prev, currentExperience.id]);
        }
      });
      
      return () => controls.stop();
    } else if (swipeDirection === 'left') {
      // Animazione controllata verso sinistra
      const controls = animate(x, [0, -100, -300], {
        duration: 0.5,
        onComplete: () => {
          setDirection(swipeDirection);
          //setExitX(-1000);
          //setExitY(0);
        }
      });
      
      return () => controls.stop();
    } else if (swipeDirection === 'up') {
      // Animazione controllata verso l'alto
      const controls = animate(y, [0, -100, -300], {
        duration: 0.5,
        onComplete: () => {
          setDirection(swipeDirection);
          //setExitX(0);
          //setExitY(-1000);
          //setLikedExperiences(prev => [...prev, currentExperience.id]);
        }
      });
      
      return () => controls.stop();
    }
  };

  const handleExitComplete = () => {
    if (currentIndex < experiences.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else {
      setCurrentIndex(0); // Ricomincia da capo quando finiscono le esperienze
    }
    
    // Reset states after card change
    setDirection(null);
    //setExitX(0);
    //setExitY(0);
    setIsAnimating(false);
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isAnimating) return;
    
    // Determine the swipe threshold (punto di rottura)
    const SWIPE_THRESHOLD = 80;
    
    // Calculate which direction has the largest offset
    const isHorizontal = Math.abs(info.offset.x) > Math.abs(info.offset.y);
    
    if (isHorizontal) {
      if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
        const direction = info.offset.x > 0 ? 'right' : 'left';
        handleSwipe(direction);
      }
    } else {
      if (info.offset.y < -SWIPE_THRESHOLD) {
        handleSwipe('up');
      }
    }
  };

  const getCategoryColor = (category: Experience['category']) => {
    const colors = {
      travel: 'bg-blue-500',
      sport: 'bg-green-500',
      event: 'bg-purple-500',
      food: 'bg-yellow-500',
      culture: 'bg-red-500',
    };
    return colors[category];
  };

  // Aggiunta funzione per gestire il click sul CTA
  const handleCtaClick = (e: React.MouseEvent, url: string) => {
    // Ferma la propagazione dell'evento per evitare lo swipe
    e.stopPropagation();
    
    // Apri l'URL in una nuova finestra/tab
    window.open(url, '_blank');
  };

  // Card component to avoid repetition
  const ExperienceCard = ({ experience, isTop = false }: { experience: Experience, isTop?: boolean }) => (
    <div 
      className={`relative bg-white rounded-xl overflow-hidden shadow-xl h-[60vh] max-h-[500px] w-full ${!isTop && 'scale-95 -z-10'}`}
    >
      <div className="relative h-3/5 w-full">
        <Image
          src={experience.imageUrl}
          alt={experience.title}
          fill
          style={{ objectFit: 'cover' }}
          className="select-none" // Prevent image selection during drag
        />
        <div className="absolute top-4 left-4">
          <span className={`${getCategoryColor(experience.category)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
            {experience.category}
          </span>
        </div>
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-xl">
          <span className="font-bold text-gray-800">{experience.price}€</span>
        </div>
      </div>

      <div className="p-5">
        <h2 className="text-xl text-gray-700 font-bold mb-2">{experience.title}</h2>
        <p className="text-gray-600 mb-3 text-sm">{experience.description}</p>
        
        <div className="flex justify-between mt-2">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span className="ml-1 text-sm text-gray-600">{experience.location}</span>
          </div>
          {experience.date && (
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="ml-1 text-sm text-gray-600">{experience.date}</span>
            </div>
          )}
        </div>
        
        {/* CTA Button */}
        <div className="mt-4">
          <button 
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              handleCtaClick(e, 'https://www.youtube.com/')}}
          >
            Scopri di più!
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gray-100">
      <header className="w-full max-w-md mb-4 flex justify-between items-center">
        {/* Login Button (left) */}
        <motion.button
          className="p-2 rounded-full bg-white shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Login"
        >
          <User className="w-6 h-6 text-gray-700" />
        </motion.button>
        
        <h1 className="text-3xl font-extrabold text-center text-gray-800">Tuuura</h1>
        
        {/* Menu Button (right) */}
        <motion.button
          className="p-2 rounded-full bg-white shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </motion.button>
      </header>

      <div className="relative flex justify-center w-full max-w-md h-[70vh] max-h-[70vh]">
        {/* Background card (next experience) */}
        <div className="absolute w-full">
          <ExperienceCard experience={nextExperience} />
        </div>

        {/* Top card (current experience) - draggable */}
        <AnimatePresence onExitComplete={handleExitComplete}>
          {!isAnimating || direction === null ? (
            <motion.div
              key={currentExperience.id}
              ref={cardRef}
              className="absolute w-full cursor-grab active:cursor-grabbing"
              drag={!isAnimating}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragEnd={handleDragEnd}
              dragElastic={0.7}
              style={{ x, y, rotate }}
              transition={{ type: "spring", stiffness: 600, damping: 30 }}
              whileTap={{ scale: 0.98 }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={
                direction === 'left' ? { 
                  x: -1000, 
                  opacity: 0,
                  transition: { duration: 0.6 } 
                } : 
                direction === 'right' ? { 
                  x: 1000, 
                  opacity: 0,
                  transition: { duration: 0.6 } 
                } : 
                direction === 'up' ? { 
                  y: -1000, 
                  opacity: 0,
                  transition: { duration: 0.6 } 
                } : { 
                  opacity: 0 
                }
              }
            >
              <ExperienceCard experience={currentExperience} isTop={true} />
              
              {/* Directional indicators that appear during drag */}
              <motion.div 
                className="absolute top-0 left-0 right-0 bottom-0 bg-red-500 bg-opacity-30 rounded-xl flex items-center justify-center"
                style={{ opacity: leftIndicatorOpacity }}
                initial={{ opacity: 0 }}
              >
                <ThumbsDown className="text-white w-32 h-32" />
              </motion.div>
              
              <motion.div 
                className="absolute top-0 left-0 right-0 bottom-0 bg-green-500 bg-opacity-30 rounded-xl flex items-center justify-center"
                style={{ opacity: rightIndicatorOpacity }}
                initial={{ opacity: 0 }}
              >
                <ThumbsUp className="text-white w-32 h-32" />
              </motion.div>
              
              <motion.div 
                className="absolute top-0 left-0 right-0 bottom-0 bg-red-800 bg-opacity-30 rounded-xl flex items-center justify-center"
                style={{ opacity: upIndicatorOpacity }}
                initial={{ opacity: 0 }}
              >
                <Heart className="text-white w-32 h-32" />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex justify-center space-x-10 w-full max-w-md mt-8">
        <motion.button 
          onClick={() => !isAnimating && handleSwipe('left')}
          className="bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-full shadow-lg transition-all flex items-center justify-center w-20 h-20 relative overflow-hidden"
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
          onClick={() => !isAnimating && handleSwipe('up')}
          className="bg-white text-red-800 hover:bg-red-800 hover:text-white rounded-full shadow-lg transition-all flex items-center justify-center w-20 h-20 relative overflow-hidden"
          aria-label="Adoro!"
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          whileTap={{ scale: 0.85 }}
        >
          <motion.div 
            className="absolute inset-0 bg-red-700" 
            initial={{ y: "100%" }}
            whileHover={{ y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          />
          <Heart className="relative z-10" />
        </motion.button>
        
        <motion.button 
          onClick={() => !isAnimating && handleSwipe('right')}
          className="bg-white text-green-500 hover:bg-green-500 hover:text-white p-5 rounded-full shadow-lg transition-all flex items-center justify-center w-20 h-20 relative overflow-hidden"
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
    </main>
  );
}