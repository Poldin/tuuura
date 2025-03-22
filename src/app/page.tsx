'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { experiences } from './data/experiences';
import { Experience } from './types';
import { ThumbsUp, ThumbsDown, User, Share2, X, Telescope } from 'lucide-react';
import HamburgerMenu from './components/hamburgermenu/hamburgermenucomponent';

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeButton, setActiveButton] = useState<'left' | 'right' | 'up' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  
  const currentExperience = experiences[currentIndex];

  const handleButtonClick = (buttonType: 'left' | 'right' | 'up') => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveButton(buttonType);
    
    // Durante l'overlay, prepariamo già l'indice per la prossima carta (invisibile all'utente)
    setTimeout(() => {
      // Cambiamo l'indice mentre l'overlay è ancora visibile
      if (currentIndex < experiences.length - 1) {
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else {
        setCurrentIndex(0);
      }
      
      // Aspettiamo ancora un momento e poi rimuoviamo l'overlay
      setTimeout(() => {
        setActiveButton(null);
        
        // Permettiamo nuove transizioni dopo che la nuova carta è completamente visibile
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 300);
    }, 200);
  };

  const openPopup = () => {
    setShowPopup(true);
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

  // Card component to avoid repetition
  const ExperienceCard = ({ experience, onClick }: { experience: Experience, onClick: () => void }) => {
    // Funzione per troncare il testo a un numero specifico di caratteri
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
            <h2 className="text-2xl text-gray-800">€{experience.price} <b>{experience.title}</b></h2>
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

  // SVG pattern con piccole T grigie semitrasparenti
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
        {/* Carta principale (currentExperience) */}
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
            
            {/* Pulsante Condividi accanto a Scopri di più */}
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

        {/* Overlay colorati */}
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

      {/* Pulsanti in fondo alla pagina principale */}
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

      {/* Pop-up a schermo intero */}
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
              {/* Pulsante di chiusura in alto a destra */}
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
                  <h2 className="text-3xl text-gray-800">€{currentExperience.price} <b>{currentExperience.title}</b></h2>
                </div>
                
                <p className="text-gray-600 text-base mb-6">
                  {currentExperience.description}
                </p>
                
                {/* Pulsante Condividi a tutta larghezza dopo la descrizione */}
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
            
            {/* Pulsanti in fondo al popup con larghezza uguale all'immagine */}
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