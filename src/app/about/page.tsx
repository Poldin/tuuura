'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Telescope, ShoppingBag, Users, Star, Shield, Coffee } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function AboutPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  const faqItems: FAQItem[] = [
    {
      question: "Cos'è Tuuura?",
      answer: "Tuuura è una piattaforma innovativa che connette chi vende prodotti e servizi online con piccoli commercianti locali che possono diventare punti di rivendita. Questo crea un network di fiducia dove i clienti possono acquistare prodotti consigliati direttamente da persone che vedono ogni giorno."
    },
    {
      question: "Come funziona per chi vende prodotti online?",
      answer: "Se hai un e-commerce e vuoi espandere la tua rete di distribuzione, Tuuura ti permette di rendere disponibile il tuo catalogo a piccoli commercianti che diventeranno i tuoi ambasciatori. Tu gestisci le spedizioni e loro ti portano nuovi clienti, ricevendo una commissione per ogni vendita."
    },
    {
      question: "Come funziona per i piccoli commercianti?",
      answer: "Come parrucchiere, barista, estetista o altro piccolo commerciante, puoi selezionare prodotti di qualità da un catalogo curato e proporli ai tuoi clienti abituali. Riceverai una commissione su ogni vendita, senza preoccuparti di gestire scorte o spedizioni."
    },
    {
      question: "Quali tipi di prodotti possono essere venduti su Tuuura?",
      answer: "Tuuura è ideale per prodotti e servizi di qualità in vari settori: bellezza, benessere, gastronomia, artigianato, esperienze locali e altro ancora. L'importante è che siano prodotti che possano trarre vantaggio dal passaparola e dalla raccomandazione personale."
    },
    {
      question: "Come vengono gestite le spedizioni?",
      answer: "Le spedizioni sono gestite direttamente dai venditori online. Il piccolo commerciante fa da intermediario facilitando la vendita, ma non deve preoccuparsi della logistica, che rimane a carico del venditore originale."
    },
    {
      question: "Quali sono i costi per partecipare a Tuuura?",
      answer: "Tuuura opera con un modello basato sulle commissioni. I piccoli commercianti guadagnano una percentuale su ogni vendita, mentre i venditori online beneficiano di un canale di distribuzione aggiuntivo pagando una commissione solo sulle vendite effettivamente realizzate."
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-amber-800 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <pattern id="t-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <text x="10" y="30" fontSize="20" fill="currentColor">
                T
              </text>
            </pattern>
            <rect width="100%" height="100%" fill="url(#t-pattern)" />
          </svg>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-5xl md:text-6xl font-bold">Tuuura</h1>
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-3/5">
              <motion.h2 
                className="text-3xl md:text-4xl font-semibold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Dove i prodotti eccellenti incontrano chi li sa vendere
              </motion.h2>
              
              <motion.p 
                className="text-lg mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Tuuura è la piattaforma che mette in relazione chi vende online prodotti di qualità con chi ha un contatto quotidiano con i clienti finali. Creiamo un network di fiducia che premia la qualità e la relazione personale.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link 
                  href="/collab" 
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-white text-amber-800 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
                >
                  <Users className="w-5 h-5" />
                  Collabora con noi
                </Link>
                
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 border border-white text-white px-6 py-3 rounded-full font-medium hover:bg-white hover:text-amber-800 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Scopri i prodotti
                </Link>
              </motion.div>
            </div>
            
            <div className="w-full md:w-2/5">
              <motion.div 
                className="relative h-64 w-full md:h-80"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <div className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl bg-white">
                  <Image
                    src="/api/placeholder/600/480"
                    alt="Tuuura platform"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Telescope className="w-12 h-12 text-amber-800 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Come funziona Tuuura</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un sistema semplice che crea valore per tutti: venditori online, piccoli commercianti e clienti finali.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={fadeInUp}
            >
              <ShoppingBag className="w-12 h-12 text-amber-800 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Per i venditori online</h3>
              <p className="text-gray-600">
                Carichi il tuo catalogo di prodotti. Gestisci i tuoi prezzi, la disponibilità e le spedizioni. Acquisisci nuovi clienti attraverso una rete di fiducia.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={fadeInUp}
            >
              <Coffee className="w-12 h-12 text-amber-800 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Per i piccoli commercianti</h3>
              <p className="text-gray-600">
                Scegli quali prodotti proporre dai cataloghi disponibili. Condividi il tuo link o QR code personalizzato. Guadagna una commissione su ogni vendita.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={fadeInUp}
            >
              <Star className="w-12 h-12 text-amber-800 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Per i clienti finali</h3>
              <p className="text-gray-600">
                Scopri prodotti di qualità consigliati da persone di fiducia. Acquista comodamente online con la sicurezza di una raccomandazione personale.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Shield className="w-12 h-12 text-amber-800 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">I vantaggi di Tuuura</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un ecosistema che premia la qualità e la relazione personale
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="flex gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-800 font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Nessun investimento iniziale</h3>
                <p className="text-gray-600">
                  Sia per i venditori che per i rivenditori, non è necessario alcun investimento iniziale. Paghi o guadagni solo quando si realizza una vendita.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-800 font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Marketing di prossimità</h3>
                <p className="text-gray-600">
                  Sfrutta la potenza delle raccomandazioni personali. I prodotti vengono consigliati da persone che i clienti vedono quotidianamente.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-800 font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Nessuna gestione di magazzino</h3>
                <p className="text-gray-600">
                  I rivenditori non devono gestire scorte o spedizioni. Tutto è gestito direttamente dai venditori originali.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-800 font-bold text-lg">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Controllo completo</h3>
                <p className="text-gray-600">
                  I venditori mantengono il controllo sui prezzi e sulla disponibilità. I rivenditori decidono quali prodotti proporre nel loro network.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">FAQ</h2>
            <p className="text-lg text-gray-600">
              Domande frequenti su Tuuura
            </p>
          </motion.div>
          
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <motion.div 
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <button
                  className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium text-lg">{item.question}</span>
                  {openFaqIndex === index ? 
                    <ChevronUp className="w-5 h-5 text-amber-800" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  }
                </button>
                
                {openFaqIndex === index && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-amber-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Pronto a far parte di Tuuura?
          </motion.h2>
          
          <motion.p 
            className="text-lg mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Che tu sia un venditore online o un piccolo commerciante, Tuuura può aiutarti a crescere.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link 
              href="/collab" 
              target="_blank"
              className="inline-flex items-center gap-2 bg-white text-amber-800 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              <Users className="w-5 h-5" />
              Inizia a collaborare
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-800 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Link href="/" className="text-2xl font-bold">
              Tuuura
            </Link>
            
            <div className="flex gap-6">
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
              <Link href="/about" className="hover:text-amber-400 transition-colors">
                Chi Siamo
              </Link>
              <Link href="/collab" className="hover:text-amber-400 transition-colors">
                Collabora
              </Link>
            </div>
            
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Tuuura. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}