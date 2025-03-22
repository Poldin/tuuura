'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, Telescope, Users } from 'lucide-react';

interface HamburgerMenuProps {
  className?: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('#menu-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  return (
    <div id="menu-container" className={`relative z-50 ${className}`}>
      {/* Menu Button */}
      <motion.button
        className="p-2 rounded-full bg-white shadow-md"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        aria-label="Menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </motion.button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial="closed"
              animate="open"
              exit="closed"
              variants={backdropVariants}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-white shadow-xl z-50 flex flex-col"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-lg text-amber-800">Menu</h2>
                <motion.button
                  className="p-2 rounded-full hover:bg-gray-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-6 h-6 text-gray-700" />
                </motion.button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto">
                <div className="py-2">
                  <motion.div variants={itemVariants} className="px-4 py-3">
                    <Link 
                      href="/" 
                      className="flex items-center text-lg text-gray-800 hover:text-amber-800 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-2xl font-bold text-amber-800">Tuuura</span>
                    </Link>
                  </motion.div>

                  <motion.div variants={itemVariants} className="px-4 py-3">
                    <Link 
                      href="/about" 
                      target="_blank"
                      className="flex items-center gap-3 text-lg text-gray-800 hover:text-amber-800 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Telescope className="w-5 h-5" />
                      <span>Scopri chi siamo</span>
                    </Link>
                  </motion.div>

                  <motion.div variants={itemVariants} className="px-4 py-3">
                    <Link 
                      href="/collab" 
                      target="_blank"
                      className="flex items-center gap-3 text-lg text-gray-800 hover:text-amber-800 border border-amber-800 rounded-lg p-3 transition-all hover:bg-amber-50"
                      onClick={() => setIsOpen(false)}
                    >
                      <Users className="w-5 h-5" />
                      <span>Collabora con noi!</span>
                    </Link>
                  </motion.div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 text-sm text-gray-500 text-center">
                © {new Date().getFullYear()} Tuuura. Tutti i diritti riservati.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HamburgerMenu;