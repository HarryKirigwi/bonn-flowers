'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

const heroSlides = [
  {
    id: 1,
    title: "Nairobi's Premier Flower Boutique",
    subtitle: "Hand-picked fresh flowers delivered across Kenya • Same-day delivery available",
    cta: "Shop Premium Flowers",
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&h=600&fit=crop",
    overlay: "from-black/60 via-black/40 to-transparent",
    accent: "Kenyan Grown • Ethically Sourced"
  },
  {
    id: 2,
    title: "Express Your Love with Kenyan Roses",
    subtitle: "Premium roses from the highlands of Kenya • Perfect for anniversaries and special moments",
    cta: "Discover Rose Collection",
    image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200&h=600&fit=crop",
    overlay: "from-rose-900/60 via-rose-700/40 to-transparent",
    accent: "Grown in Nakuru • Fresh Daily"
  },
  {
    id: 3,
    title: "Brighten Kenya, One Bouquet at a Time",
    subtitle: "Vibrant sunflowers and seasonal arrangements • Supporting local flower farmers",
    cta: "Browse Seasonal Collection",
    image: "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=1200&h=600&fit=crop",
    overlay: "from-amber-900/60 via-orange-700/40 to-transparent",
    accent: "Farm-to-Door • 100% Fresh"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating flower petals
    const petals = [];
    const petalGeometry = new THREE.RingGeometry(0.1, 0.2, 6);
    
    for (let i = 0; i < 15; i++) {
      const petalMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.9, 0.7, 0.8),
        transparent: true,
        opacity: 0.6
      });
      
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      petal.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      petal.userData = {
        rotationSpeed: Math.random() * 0.02 + 0.01,
        floatSpeed: Math.random() * 0.01 + 0.005,
        initialY: petal.position.y
      };
      
      scene.add(petal);
      petals.push(petal);
    }

    camera.position.z = 8;
    sceneRef.current = { scene, camera, renderer, petals };

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      petals.forEach(petal => {
        petal.rotation.z += petal.userData.rotationSpeed;
        petal.position.y = petal.userData.initialY + Math.sin(Date.now() * petal.userData.floatSpeed) * 0.5;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    setIsLoaded(true);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Slide auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Handle window resize for 3D scene
  useEffect(() => {
    const handleResize = () => {
      if (sceneRef.current) {
        const { camera, renderer } = sceneRef.current;
        camera.aspect = 400 / 400;
        camera.updateProjectionMatrix();
        renderer.setSize(400, 400);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9
    })
  };

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section className="relative h-screen overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900">
      {/* SEO-optimized structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Kenya Premium Flowers",
            "description": "Premium flower delivery service in Kenya. Fresh flowers, roses, and bouquets delivered same-day across Nairobi and Kenya.",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "KE",
              "addressLocality": "Nairobi"
            },
            "priceRange": "$$",
            "telephone": "+254",
            "url": "https://kenyaflowers.com",
            "serviceArea": "Kenya"
          })
        }}
      />

      {/* Background Images with Enhanced Animations */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            custom={currentSlide}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].overlay}`} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3D Floating Elements */}
      <div className="absolute top-1/2 right-10 transform -translate-y-1/2 z-20 opacity-70">
        <div ref={mountRef} className="w-96 h-96" />
      </div>

      {/* Enhanced Content */}
      <div className="relative z-30 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            key={currentSlide}
            initial="hidden"
            animate="visible"
            className="text-white space-y-8"
          >
            <motion.div
              variants={textVariants}
              className="space-y-2"
            >
              <motion.p 
                className="text-emerald-300 font-medium text-lg tracking-wide uppercase"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {heroSlides[currentSlide].accent}
              </motion.p>
              
              <motion.h1 
                className="text-5xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent"
                variants={textVariants}
              >
                {heroSlides[currentSlide].title}
              </motion.h1>
            </motion.div>

            <motion.p 
              className="text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-2xl"
              variants={textVariants}
              transition={{ delay: 0.4 }}
            >
              {heroSlides[currentSlide].subtitle}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.a
                href="/shop/available-products"
                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-lg rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">{heroSlides[currentSlide].cta}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.a>

              <motion.a
                href="/shop/available-products"
                className="px-8 py-4 border-2 border-white/30 text-white font-semibold text-lg rounded-full backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Gallery
              </motion.a>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="flex items-center gap-6 text-emerald-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Same-Day Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">100% Fresh Guarantee</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="hidden lg:block space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            {[
              { icon: "🌹", title: "Premium Roses", desc: "Grown in Kenya's highlands" },
              { icon: "🚚", title: "Fast Delivery", desc: "Same-day across Nairobi" },
              { icon: "💝", title: "Gift Wrapping", desc: "Beautiful presentation included" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{feature.icon}</div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{feature.title}</h3>
                    <p className="text-gray-300">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Enhanced Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex gap-3">
          {heroSlides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`relative w-12 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-emerald-400' : 'bg-white/30'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {index === currentSlide && (
                <motion.div
                  className="absolute inset-0 bg-emerald-400 rounded-full"
                  layoutId="activeSlide"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Floating Decorative Elements */}
      <motion.div
        className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full backdrop-blur-sm"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-rose-400/20 to-pink-500/20 rounded-full backdrop-blur-sm"
        animate={{ 
          y: [0, 30, 0],
          x: [0, -15, 0],
          rotate: [0, -180, -360]
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-32 left-1/3 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full backdrop-blur-sm"
        animate={{ 
          y: [0, -25, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </section>
  );
}