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
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Carica il prodotto dall'indice e aggiorna lo stato
  const loadProductAtIndex = async (index: number) => {
    if (isNavigating || index < 0 || index >= rotationList.length) {
      return;
    }

    setIsNavigating(true);
    setIsLoading(true);

    try {
      const uid = rotationList[index];
      console.log(`Loading product at index ${index} with UID ${uid}`);
      
      const product = await fetchProduct(uid);
      
      if (product) {
        setCurrentProduct(product);
        setCurrentIndex(index);
        updateUrlSilently(uid);
        console.log(`Product loaded: ${product.title}`);
      } else {
        console.error(`Failed to load product at index ${index}`);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setIsLoading(false);
      setIsNavigating(false);
    }
  };

  // Gestisce il click su "prossimo"
  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < rotationList.length) {
      loadProductAtIndex(nextIndex);
    }
  };

  // Gestisce il click su "precedente"
  const handlePrevious = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      loadProductAtIndex(prevIndex);
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

  // Gestisce lo scroll wheel
  const handleWheel = (e: WheelEvent) => {
    if (scrollLocked) return;
    
    // Blocca lo scroll per evitare multiple navigazioni
    setScrollLocked(true);
    
    // Determina la direzione dello scroll
    if (e.deltaY < 0) {
      // Scroll verso l'alto, vai al prodotto precedente
      handlePrevious();
    } else if (e.deltaY > 0) {
      // Scroll verso il basso, vai al prodotto successivo
      handleNext();
    }
    
    // Sblocca lo scroll dopo un breve ritardo
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    
    scrollTimerRef.current = setTimeout(() => {
      setScrollLocked(false);
    }, 1000); // Debounce di 1 secondo
  };

  // Gestisce lo swipe sugli schermi touch
  const handleTouchStart = (e: TouchEvent) => {
    const touchStartY = e.touches[0].clientY;
    const touchThreshold = 50; // Minima distanza per considerare uno swipe
    
    const handleTouchMove = (e: TouchEvent) => {
      if (scrollLocked) return;
      
      const touchMoveY = e.touches[0].clientY;
      const deltaY = touchStartY - touchMoveY;
      
      if (Math.abs(deltaY) > touchThreshold) {
        setScrollLocked(true);
        
        if (deltaY > 0) {
          // Swipe verso l'alto, vai al prodotto successivo
          handleNext();
        } else {
          // Swipe verso il basso, vai al prodotto precedente
          handlePrevious();
        }
        
        // Rimuovi listener touch dopo la navigazione
        if (containerRef.current) {
          containerRef.current.removeEventListener('touchmove', handleTouchMove);
        }
        
        // Sblocca lo scroll dopo un breve ritardo
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
        
        scrollTimerRef.current = setTimeout(() => {
          setScrollLocked(false);
        }, 1000);
      }
    };
    
    if (containerRef.current) {
      containerRef.current.addEventListener('touchmove', handleTouchMove, { passive: true });
      
      // Cleanup
      const cleanup = () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener('touchmove', handleTouchMove);
          containerRef.current.removeEventListener('touchend', cleanup);
        }
      };
      
      containerRef.current.addEventListener('touchend', cleanup, { passive: true });
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
    
    // Aggiungi event listener per la rotella del mouse
    container.addEventListener('wheel', handleWheel, { passive: true });
    // Aggiungi event listener per touch (mobile)
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    return () => {
      // Cleanup
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [currentIndex, rotationList.length, isNavigating, scrollLocked]);

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
      <div className="relative w-full h-full max-w-[400px] max-h-[100vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-transparent" />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-30">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-center text-white px-8 z-10">
          {currentProduct.title}
        </h1>
        
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
        
        <button
          onClick={handleNext}
          disabled={currentIndex === rotationList.length - 1 || isNavigating}
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 p-3 rounded-full backdrop-blur-sm transition-colors z-20 ${
            currentIndex === rotationList.length - 1 || isNavigating
              ? 'bg-white/5 cursor-not-allowed opacity-30' 
              : 'bg-white/10 hover:bg-white/20 opacity-30 hover:opacity-100'
          }`}
        >
          <ArrowDown className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
} 