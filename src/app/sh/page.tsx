'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { ShoppingCart, Heart, ThumbsDown, Share, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface Product {
  id: string;
  uid: string;
  title: string;
  body: {
    price: number;
    currency: string;
    images: string[];  // Array di URL immagini invece di un singolo imageUrl
    checkoutUrl: string;
    description: string;
  };
}

// Componente per il carosello di immagini
function ImageCarousel({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Cambio automatico immagine ogni 4 secondi se isPlaying è true
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && images.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 4000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [images.length, isPlaying]);
  
  // Funzioni per la navigazione
  const goToNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);
  
  const goToPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);
  
  // Funzione per gestire play/pause
  const togglePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(prev => !prev);
  }, []);
  
  // Se non ci sono immagini o ne esiste solo una, mostriamo un fallback o l'unica immagine
  if (!images || images.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white/5">
        <span className="text-6xl font-bold text-white/40">{title.charAt(0).toUpperCase()}</span>
      </div>
    );
  }
  
  if (images.length === 1) {
    return (
      <div className="h-full relative">
        <Image 
          src={images[0]} 
          alt={title}
          width={500}
          height={800}
          priority
          className="object-cover w-full h-full"
          sizes="(max-width: 768px) 100vw, 448px"
        />
      </div>
    );
  }
  
  return (
    <div className="h-full relative">
      {/* Immagine corrente */}
      <Image 
        src={images[currentIndex]} 
        alt={`${title} - immagine ${currentIndex + 1} di ${images.length}`}
        width={500}
        height={800}
        priority
        className="object-cover w-full h-full"
        sizes="(max-width: 768px) 100vw, 448px"
      />
      
      {/* Indicatori in stile Instagram */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-1">
        {images.map((_, index) => (
          <div 
            key={index} 
            className={`h-1 rounded-full transition-all ${
              index === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
      
      {/* Controlli del carousel */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        {/* Pulsante sinistro (indietro) */}
        <button 
          className="absolute left-2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          onClick={goToPrev}
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        
        {/* Pulsante play/pause */}
        <button 
          className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          onClick={togglePlayPause}
        >
          {isPlaying ? 
            <Pause size={20} className="text-white" /> : 
            <Play size={20} className="text-white" />
          }
        </button>
        
        {/* Pulsante destro (avanti) */}
        <button 
          className="absolute right-2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          onClick={goToNext}
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch all products 
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, uid, title, body')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Adattiamo i dati esistenti al nuovo formato con array di immagini
      const adaptedData = data?.map(product => {
        // Se body.imageUrl esiste ma body.images non esiste, creiamo l'array images
        if (product.body?.imageUrl && !product.body.images) {
          product.body.images = [product.body.imageUrl];
        }
        return product;
      }) || [];
      
      return adaptedData;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Fetch all products
      const allProducts = await fetchProducts();
      setProducts(allProducts);
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Nessun prodotto trovato</h1>
          <p className="text-gray-400">Non ci sono prodotti disponibili al momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black">
      {/* Mobile-like container even on desktop */}
      <div className="max-w-md mx-auto px-4">
        
        {/* Products in vertical column */}
        <div className="flex flex-col gap-6 pb-20">
          {products.map((product) => (
            <div 
              key={product.id}
              className="rounded-lg bg-white/10 overflow-hidden transition-all hover:shadow-lg flex flex-col"
            >
              {/* Product Card - Clickable part opens modal */}
              <div 
                className="cursor-pointer flex-grow" 
                onClick={() => openModal(product)}
              >
                <div className="h-[70vh] relative">
                  <ImageCarousel 
                    images={product.body?.images || []} 
                    title={product.title} 
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-2xl font-medium text-white">{product.title}</h3>
                  {product.body?.price && (
                    <p className="text-white/80 mt-1 text-lg">
                      {product.body.price}{product.body.currency || '€'}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-4 pb-4 mt-auto">
                <div className="flex justify-between items-center">
                  <a 
                    href={product.body?.checkoutUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 px-5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ShoppingCart size={22} className="text-white animate-[spin_6s_linear_infinite]" />
                    <span className="text-white">Acquista</span>
                  </a>
                  <div className="flex gap-2">
                    <button 
                      className="flex items-center justify-center p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Like functionality
                      }}
                    >
                      <Heart size={22} className="text-white" />
                    </button>
                    <button 
                      className="flex items-center justify-center p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Dislike functionality
                      }}
                    >
                      <ThumbsDown size={22} className="text-white" />
                    </button>
                    <button 
                      className="flex items-center justify-center p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Share functionality
                        navigator.share?.({
                          title: product.title,
                          text: product.body?.description,
                          url: `/product/${product.uid}`
                        }).catch(console.error);
                      }}
                    >
                      <Share size={22} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product detail modal */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <div 
            className="bg-gray-900 rounded-lg max-w-md w-full overflow-hidden shadow-xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-[60vh] relative">
              <ImageCarousel 
                images={selectedProduct.body?.images || []} 
                title={selectedProduct.title} 
              />
            </div>
            <div className="p-6">
              <h2 className="text-3xl font-bold text-white mb-2">{selectedProduct.title}</h2>
              {selectedProduct.body?.price && (
                <p className="text-xl text-white/90 mb-4">
                  {selectedProduct.body.price}{selectedProduct.body.currency || '€'}
                </p>
              )}
              {selectedProduct.body?.description && (
                <p className="text-white/80 mb-6">{selectedProduct.body.description}</p>
              )}
              <div className="flex justify-between items-center mt-4">
                <a 
                  href={selectedProduct.body?.checkoutUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 transition-colors px-6 py-3 rounded-lg"
                >
                  <ShoppingCart size={18} className="text-white animate-[spin_6s_linear_infinite]" />
                  <span className="text-white">Acquista</span>
                </a>
                <div className="flex space-x-2">
                  <button className="flex items-center justify-center p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                    <Heart size={18} className="text-white" />
                  </button>
                  <button className="flex items-center justify-center p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                    <ThumbsDown size={18} className="text-white" />
                  </button>
                  <button className="flex items-center justify-center p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                    <Share size={18} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 