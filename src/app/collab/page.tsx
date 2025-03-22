'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, CheckCircle, Coffee, Scissors, Utensils, PenTool, DollarSign, Send } from 'lucide-react';

interface CollaborationOption {
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
}

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  imageUrl: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, name, role, imageUrl }) => (
  <motion.div 
    className="bg-white p-6 rounded-xl shadow-md"
    whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
  >
    <div className="flex items-start gap-4">
      <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
        <Image 
          src={imageUrl} 
          alt={name} 
          fill 
          style={{ objectFit: 'cover' }} 
        />
      </div>
      
      <div>
        <p className="text-gray-600 italic mb-4">&quot;{quote}&quot;</p>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
  </motion.div>
);

export default function CollabPage() {
  const [activeTab, setActiveTab] = useState<'seller' | 'merchant'>('seller');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    business: '',
    message: '',
    type: 'seller'
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    alert('Grazie per il tuo interesse! Ti contatteremo presto.');
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      business: '',
      message: '',
      type: 'seller'
    });
  };
  
  const sellerOptions: CollaborationOption = {
    title: "Per chi vende online",
    description: "Sei un e-commerce o un brand che vende prodotti o servizi di qualità? Unisciti a Tuuura e amplifica la tua rete di distribuzione attraverso piccoli commercianti locali che diventeranno i tuoi ambasciatori.",
    icon: <ShoppingBag className="w-12 h-12 text-amber-800" />,
    benefits: [
      "Accedi a un nuovo canale di vendita senza costi fissi",
      "Fai conoscere i tuoi prodotti attraverso raccomandazioni personali",
      "Gestisci il tuo catalogo e i prezzi in totale autonomia",
      "Incrementa le vendite senza investimenti in marketing tradizionale",
      "Crea un network di ambasciatori del tuo brand"
    ]
  };
  
  const merchantOptions: CollaborationOption = {
    title: "Per piccoli commercianti",
    description: "Sei un parrucchiere, un'estetista, un barista o hai un'attività che ti permette di vedere clienti ogni giorno? Con Tuuura puoi guadagnare offrendo prodotti e servizi selezionati ai tuoi clienti, senza gestire magazzino o spedizioni.",
    icon: <Coffee className="w-12 h-12 text-amber-800" />,
    benefits: [
      "Guadagna commissioni su ogni vendita senza gestire inventario",
      "Offri ai tuoi clienti prodotti di qualità già testati",
      "Aumenta la soddisfazione dei clienti con raccomandazioni personalizzate",
      "Crea un flusso di entrate aggiuntivo senza investimenti",
      "Rafforza la relazione con i tuoi clienti abituali"
    ]
  };

  const testimonials = [
    {
      quote: "Da quando collaboro con Tuuura, ho aumentato il fatturato del 15% senza alcun investimento iniziale. I miei clienti apprezzano i prodotti che consiglio.",
      name: "Marco Bianchi",
      role: "Proprietario Salone di Bellezza",
      imageUrl: "/api/placeholder/150/150"
    },
    {
      quote: "Come brand di prodotti artigianali, Tuuura ci ha permesso di raggiungere clienti che non avremmo mai incontrato. La rete di piccoli commercianti è incredibile.",
      name: "Laura Rossi",
      role: "Fondatrice di 'Sapori Locali'",
      imageUrl: "/api/placeholder/150/150"
    },
    {
      quote: "I miei clienti sono felici di poter acquistare prodotti che uso nel bar. E io guadagno su ogni vendita senza dovermi preoccupare delle spedizioni!",
      name: "Giovanni Verdi",
      role: "Barista e Caffetteria",
      imageUrl: "/api/placeholder/150/150"
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
                Collabora con noi e cresci con Tuuura
              </motion.h2>
              
              <motion.p 
                className="text-lg mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Che tu sia un venditore online alla ricerca di nuovi canali di distribuzione o un piccolo commerciante che vuole ampliare la propria offerta, Tuuura è la piattaforma che fa per te.
              </motion.p>
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
                    alt="Collaborazione Tuuura"
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

      {/* Options Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Users className="w-12 h-12 text-amber-800 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Chi può collaborare con Tuuura?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Due modi per partecipare e crescere insieme
            </p>
          </motion.div>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-full p-1 bg-gray-200">
              <button
                className={`py-2 px-6 rounded-full text-lg font-medium transition-all ${
                  activeTab === 'seller' 
                    ? 'bg-amber-800 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab('seller')}
              >
                Venditori Online
              </button>
              
              <button
                className={`py-2 px-6 rounded-full text-lg font-medium transition-all ${
                  activeTab === 'merchant' 
                    ? 'bg-amber-800 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab('merchant')}
              >
                Piccoli Commercianti
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="mb-20">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                  <div className="bg-amber-100 p-6 rounded-full">
                    {activeTab === 'seller' ? sellerOptions.icon : merchantOptions.icon}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                      {activeTab === 'seller' ? sellerOptions.title : merchantOptions.title}
                    </h3>
                    <p className="text-lg text-gray-600">
                      {activeTab === 'seller' ? sellerOptions.description : merchantOptions.description}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-8">
                  <h4 className="text-xl font-semibold mb-6">Vantaggi:</h4>
                  <motion.ul
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {(activeTab === 'seller' ? sellerOptions.benefits : merchantOptions.benefits).map((benefit, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-start gap-3"
                        variants={fadeInUp}
                      >
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-20 px-4 bg-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Chi collabora già con Tuuura</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ecco alcuni esempi di attività che stanno crescendo con noi
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-md text-center"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-amber-800" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Parrucchieri</h3>
              <p className="text-gray-600 text-sm">
                Offrono prodotti per capelli ai propri clienti guadagnando commissioni su ogni vendita.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-white p-6 rounded-lg shadow-md text-center"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-amber-800" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Bar e Caffetterie</h3>
              <p className="text-gray-600 text-sm">
                Propongono miscele di caffè e prodotti gourmet da acquistare a casa.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-white p-6 rounded-lg shadow-md text-center"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-amber-800" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ristoranti</h3>
              <p className="text-gray-600 text-sm">
                Vendono prodotti gourmet, condimenti speciali o esperienze culinarie.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-white p-6 rounded-lg shadow-md text-center"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PenTool className="w-8 h-8 text-amber-800" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Artigiani</h3>
              <p className="text-gray-600 text-sm">
                Espandono il loro mercato con prodotti artigianali di nicchia e personalizzati.
              </p>
            </motion.div>
          </div>
          
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8">Testimonianze</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Testimonial {...testimonial} />
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white p-6 rounded-lg shadow-md inline-block">
              <div className="flex items-center gap-3 text-amber-800 font-semibold">
                <DollarSign className="w-6 h-6" />
                <span>Guadagni fino al 25% di commissione su ogni vendita!</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Inizia a collaborare</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Compila il modulo e ti contatteremo per darti tutte le informazioni necessarie
              </p>
            </motion.div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome e Cognome *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Il tuo nome"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="La tua email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefono
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Il tuo numero di telefono"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="business" className="block text-sm font-medium text-gray-700 mb-2">
                    Attività *
                  </label>
                  <input
                    id="business"
                    name="business"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Nome della tua attività"
                    value={formData.business}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo di collaborazione *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="seller">Venditore Online</option>
                  <option value="merchant">Piccolo Commerciante</option>
                </select>
              </div>
              
              <div className="mb-8">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Messaggio
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="Descrivi brevemente la tua attività e come vorresti collaborare con noi"
                  value={formData.message}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div className="text-center">
                <motion.button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-amber-800 text-white px-8 py-4 rounded-full font-semibold hover:bg-amber-900 transition-colors text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5" />
                  Invia Richiesta
                </motion.button>
              </div>
            </form>
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
            Entra a far parte di Tuuura oggi stesso!
          </motion.h2>
          
          <motion.p 
            className="text-lg mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Unisciti al network di venditori e piccoli commercianti che stanno crescendo insieme. Tuuura è la piattaforma che premia la qualità e la relazione personale.
          </motion.p>
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