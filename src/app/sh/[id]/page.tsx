'use client';

import { useEffect, useState, use, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ArrowUp, ArrowDown } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: string;
  uid: string;
  title: string;
}

export default function ShortPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: pathId } = use(params);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [rotationList, setRotationList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Funzione per ottenere tutti gli UID dei prodotti
  const fetchAllProductUids = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('uid')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(p => p.uid) || [];
    } catch (error) {
      console.error('Error fetching product UIDs:', error);
      return [];
    }
  };

  // Funzione per randomizzare un array (algoritmo Fisher-Yates shuffle)
  const shuffleArray = (array: string[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Funzione per caricare un prodotto specifico
  const fetchProduct = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, uid, title')
        .eq('uid', uid)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  };

  // Funzione per verificare se un UID esiste nel database
  const uidExists = async (uid: string): Promise<boolean> => {
    if (!uid) return false;
    
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('uid', uid);
      
      if (error) throw error;
      return (count || 0) > 0;
    } catch (error) {
      console.error('Error checking if UID exists:', error);
      return false;
    }
  };

  // Funzione per verificare se una pagina è stata refreshata
  const isPageRefreshed = () => {
    // Se è la prima visita, non c'è performance entry
    if (window.performance) {
      const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        // Check se il tipo di navigazione è "reload"
        return navigationEntries[0].type === "reload";
      }
    }
    // Fallback se l'API non è supportata
    return false;
  };

  // Aggiorna l'URL senza refreshare la pagina
  const updateUrlSilently = (uid: string) => {
    window.history.replaceState({}, '', `/sh/${uid}`);
  };

  // Gestisce lo scroll wheel
  const handleWheel = (e: WheelEvent) => {
    if (scrollLocked || isNavigating) {
      return;
    }
    
    // Verifica se possiamo prevenire lo scroll predefinito
    if (e.cancelable) {
      e.preventDefault();
    }
    
    // Impostazioni per lo scroll
    const scrollSpeed = 1.2; // Velocità dello scroll
    const maxScroll = 300; // Distanza massima di scroll prima del cambio prodotto
    const scrollDecay = 0.92; // Valore per il decadimento naturale dello scroll
    
    // Applica lo scroll
    const newScrollY = scrollY + e.deltaY * scrollSpeed;
    
    // Se lo scroll supera la soglia, naviga al prossimo/precedente prodotto
    if (newScrollY < -maxScroll && currentIndex > 0) {
      setScrollLocked(true);
      
      
      // Aggiungi un po' di ritardo per rendere l'animazione più naturale
      setTimeout(() => {
        handlePrevious();
      }, 100);
      return;
    } else if (newScrollY > maxScroll && currentIndex < rotationList.length - 1) {
      setScrollLocked(true);
      
      
      setTimeout(() => {
        handleNext();
      }, 100);
      return;
    }
    
    // Limita lo scroll se siamo al primo o all'ultimo prodotto
    // per creare un effetto "elastico"
    let finalScrollY = newScrollY;
    if ((currentIndex === 0 && newScrollY < 0) || 
        (currentIndex === rotationList.length - 1 && newScrollY > 0)) {
      finalScrollY = newScrollY * 0.3; // Resistenza allo scroll ai limiti
    }
    
    // Aggiorna lo stato
    setScrollY(finalScrollY);
    
    
    // Gestisce il "momentum" dello scroll - torna gradualmente a zero
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    
    // Funzione per simulare l'inerzia dello scroll
    const applyScrollMomentum = () => {
      if (Math.abs(finalScrollY) < 2) {
        // Se quasi fermo, torna a zero
        setScrollY(0);
        
        return;
      }
      
      // Applica decadimento graduale
      const newY = finalScrollY * scrollDecay;
      setScrollY(newY);
      
      // Continua l'animazione se c'è ancora movimento
      scrollTimerRef.current = setTimeout(applyScrollMomentum, 16);
    };
    
    // Avvia l'animazione di inerzia dello scroll
    scrollTimerRef.current = setTimeout(applyScrollMomentum, 100);
  };

  // Gestisce lo swipe sugli schermi touch
  const handleTouchStart = (e: TouchEvent) => {
    if (isNavigating || scrollLocked) return;
    
    const touchStartY = e.touches[0].clientY;
    let lastTouchY = touchStartY;
    const startScrollY = scrollY;
    let velocity = 0;
    let lastTimestamp = Date.now();
    
    const handleTouchMove = (e: TouchEvent) => {
      if (scrollLocked || isNavigating) return;
      
      const touchMoveY = e.touches[0].clientY;
      const deltaY = lastTouchY - touchMoveY;
      const timestamp = Date.now();
      const timeDelta = timestamp - lastTimestamp;
      
      // Calcola velocità per l'inerzia
      if (timeDelta > 0) {
        velocity = deltaY / timeDelta * 15; // Fattore di scala per la velocità
      }
      
      lastTouchY = touchMoveY;
      lastTimestamp = timestamp;
      
      // Calcola la nuova posizione di scroll
      const newScrollY = startScrollY + (touchStartY - touchMoveY);
      
      // Limita lo scroll se siamo al primo o all'ultimo prodotto
      let finalScrollY = newScrollY;
      if ((currentIndex === 0 && newScrollY < 0) || 
          (currentIndex === rotationList.length - 1 && newScrollY > 0)) {
        finalScrollY = newScrollY * 0.3; // Resistenza allo scroll ai limiti
      }
      
      // Aggiorna lo stato
      setScrollY(finalScrollY);
      
      
      // Soglia per cambiare prodotto
      const maxScroll = 250;
      
      if (finalScrollY < -maxScroll && currentIndex > 0) {
        setScrollLocked(true);
        
        
        if (containerRef.current) {
          containerRef.current.removeEventListener('touchmove', handleTouchMove);
        }
        
        setTimeout(() => {
          handlePrevious();
        }, 100);
      } else if (finalScrollY > maxScroll && currentIndex < rotationList.length - 1) {
        setScrollLocked(true);
        
        
        if (containerRef.current) {
          containerRef.current.removeEventListener('touchmove', handleTouchMove);
        }
        
        setTimeout(() => {
          handleNext();
        }, 100);
      }
    };
    
    const handleTouchEnd = () => {
      // Applica inerzia dopo il rilascio
      const applyInertia = () => {
        if (Math.abs(velocity) < 0.5 || Math.abs(scrollY) < 2) {
          // Se la velocità è bassa o lo scroll è quasi a zero, torna a zero
          setScrollY(0);
          
          return;
        }
        
        // Calcola la nuova posizione con inerzia
        const newY = scrollY + velocity;
        
        // Verifica se abbiamo superato il limite per cambiare prodotto
        const maxScroll = 250;
        if (newY < -maxScroll && currentIndex > 0) {
          setScrollLocked(true);
          handlePrevious();
          return;
        } else if (newY > maxScroll && currentIndex < rotationList.length - 1) {
          setScrollLocked(true);
          handleNext();
          return;
        }
        
        // Aggiorna con decadimento
        setScrollY(newY);
        velocity *= 0.95; // Decadimento dell'inerzia
        
        // Continua l'animazione
        scrollTimerRef.current = setTimeout(applyInertia, 16);
      };
      
      // Avvia l'animazione di inerzia
      if (Math.abs(velocity) > 0.5) {
        scrollTimerRef.current = setTimeout(applyInertia, 16);
      } else {
        // Se non c'è abbastanza velocità, torna a zero gradualmente
        const returnToZero = () => {
          if (Math.abs(scrollY) < 5) {
            setScrollY(0);
            
            return;
          }
          
          setScrollY(scrollY * 0.9);
          scrollTimerRef.current = setTimeout(returnToZero, 16);
        };
        
        scrollTimerRef.current = setTimeout(returnToZero, 16);
      }
      
      // Cleanup
      if (containerRef.current) {
        containerRef.current.removeEventListener('touchmove', handleTouchMove);
        containerRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
    
    if (containerRef.current) {
      containerRef.current.addEventListener('touchmove', handleTouchMove, { passive: true });
      containerRef.current.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  };

  // Funzione per resettare lo stato dello scroll
  const resetScrollState = () => {
    setScrollY(0);
    
    setScrollLocked(false);
    
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  };

  // Aggiorniamo la funzione di caricamento prodotto
  const loadProductAtIndex = async (index: number) => {
    if (isNavigating || index < 0 || index >= rotationList.length) {
      resetScrollState();
      return;
    }

    setIsNavigating(true);
    setIsLoading(true);

    try {
      const uid = rotationList[index];
      const product = await fetchProduct(uid);
      
      if (product) {
        setCurrentProduct(product);
        setCurrentIndex(index);
        updateUrlSilently(uid);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setIsLoading(false);
      setIsNavigating(false);
      resetScrollState();
    }
  };

  // Gestisce il click su "prossimo"
  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < rotationList.length) {
      loadProductAtIndex(nextIndex);
    } else {
      // Sblocca lo scroll anche se non c'è un prodotto successivo
      setTimeout(() => {
        resetScrollState();
      }, 300);
    }
  };

  // Gestisce il click su "precedente"
  const handlePrevious = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      loadProductAtIndex(prevIndex);
    } else {
      // Sblocca lo scroll anche se non c'è un prodotto precedente
      setTimeout(() => {
        resetScrollState();
      }, 300);
    }
  };

  // Gestisce la pressione dei tasti freccia
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      handlePrevious();
    } else if (e.key === 'ArrowDown') {
      handleNext();
    }
  };

  // Effetto per caricare tutti i prodotti all'avvio e quando cambia l'URL
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      // Verifica se è un refresh o una nuova visita
      const wasRefreshed = isPageRefreshed();
      console.log("Page was refreshed:", wasRefreshed);
      
      let uids: string[] = [];
      
      // Se non è un refresh, controlliamo in sessionStorage
      if (!wasRefreshed) {
        const storedList = sessionStorage.getItem('productRotationList');
        if (storedList) {
          uids = JSON.parse(storedList);
          console.log("Using stored rotation list, length:", uids.length);
        }
      }
      
      // Se stiamo facendo refresh o non abbiamo lista in storage, carichiamo dal DB
      if (wasRefreshed || uids.length === 0) {
        console.log("Fetching fresh product list from database");
        uids = await fetchAllProductUids();
        
        // Randomizza l'ordine degli UID
        uids = shuffleArray(uids);
        console.log("Randomized product list");
        
        // Salva in sessionStorage per future navigazioni
        sessionStorage.setItem('productRotationList', JSON.stringify(uids));
      }
      
      if (uids.length === 0) {
        setIsLoading(false);
        return;
      }
      
      // Se c'è un ID nel path, verifichiamo prima che esista realmente
      let targetIndex = 0;
      let shouldUpdateUrl = false;
      
      if (pathId) {
        // Verifica se l'UID esiste
        const exists = await uidExists(pathId);
        
        if (exists) {
          // L'UID esiste, trova la sua posizione nella lista
          targetIndex = uids.indexOf(pathId);
          if (targetIndex === -1) {
            // Se non è nella lista, usa il primo
            targetIndex = 0;
            shouldUpdateUrl = true;
          }
        } else {
          // L'UID non esiste, usa il primo elemento
          console.log(`UID ${pathId} not found in database, using first product`);
          targetIndex = 0;
          shouldUpdateUrl = true;
        }
      }
      
      // Carica il prodotto all'indice target
      const productData = await fetchProduct(uids[targetIndex]);
      
      // Aggiorna lo stato
      setRotationList(uids);
      setCurrentProduct(productData);
      setCurrentIndex(targetIndex);
      
      // Se l'UID non esiste o non è nella lista, aggiorna l'URL per il primo prodotto
      if (shouldUpdateUrl && productData) {
        console.log(`Updating URL to first product: ${productData.uid}`);
        updateUrlSilently(productData.uid);
      }
      
      setIsLoading(false);
    };
    
    loadInitialData();
    
    // Aggiunge listener per i tasti freccia
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathId]);

  // Effetto per aggiungere event listener di wheel e touch
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Funzione wheel con opzione passive:false per permettere preventDefault
    const wheelHandler = (e: WheelEvent) => handleWheel(e);
    
    // Aggiungi event listener per la rotella del mouse
    container.addEventListener('wheel', wheelHandler, { passive: false });
    // Aggiungi event listener per touch (mobile) - ma impostando passive: true per evitare errori
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    return () => {
      // Cleanup
      container.removeEventListener('wheel', wheelHandler);
      container.removeEventListener('touchstart', handleTouchStart);
      
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [currentIndex, rotationList.length, isNavigating, scrollLocked]);

  // Effetto per il controllo di sicurezza dello scroll lock
  useEffect(() => {
    // Forza lo sblocco dopo un timeout di sicurezza
    const securityTimeout = setTimeout(() => {
      if (scrollLocked) {
        resetScrollState();
      }
    }, 2000); // Sicurezza: dopo 2 secondi, forza lo sblocco
    
    return () => clearTimeout(securityTimeout);
  }, [scrollLocked, isNavigating]);

  // Mostra loader se sta caricando inizialmente
  if (isLoading && !currentProduct) {
    return (
      <div className="h-[100vh] w-full flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Mostra messaggio se non ci sono prodotti
  if (!currentProduct || rotationList.length === 0) {
    return (
      <div className="h-[100vh] w-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Nessun prodotto trovato</h1>
          <p className="text-gray-400">Non ci sono prodotti disponibili al momento.</p>
        </div>
      </div>
    );
  }

  // Render principale
  return (
    <div 
      ref={containerRef}
      className="h-[100vh] w-full flex items-center justify-center bg-black overflow-hidden"
    >
      <div className="relative w-full h-full max-w-[400px] max-h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-transparent pointer-events-none" />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-30">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        
        <div 
          ref={contentRef}
          className="absolute inset-0 transition-transform duration-100 ease-out" 
          style={{ 
            transform: `translateY(${-scrollY}px)`,
          }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Blocco di contenuto con margine per dare spazio allo scroll */}
            <div className="w-full min-h-[100vh] flex items-center justify-center px-8">
              <h1 className="text-3xl font-bold text-center text-white">
                {currentProduct?.title}
              </h1>
            </div>
            
            {/* Contenuto aggiuntivo per dare la sensazione di scroll */}
            <div className="w-full min-h-[50vh] flex flex-col items-center justify-start pt-20 px-8">
              {currentIndex < rotationList.length - 1 && (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 mb-10 flex items-center justify-center">
                    <ArrowDown className="w-8 h-8 text-white/70" />
                  </div>
                  <div className="w-1 h-16 bg-white/10 animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="absolute top-2 left-2 z-20 text-white/50 text-xs">
          {currentIndex + 1}/{rotationList.length}
        </div>
        
        <div className="absolute top-2 right-2 z-20 text-white/50 text-xs">
          Scroll ▲▼
        </div>
        
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0 || isNavigating}
          className={`absolute top-8 left-1/2 -translate-x-1/2 p-3 rounded-full backdrop-blur-sm transition-colors z-20 ${
            currentIndex === 0 || isNavigating
              ? 'bg-white/5 cursor-not-allowed opacity-30' 
              : 'bg-white/10 hover:bg-white/20 opacity-30 hover:opacity-100'
          }`}
        >
          <ArrowUp className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
} 