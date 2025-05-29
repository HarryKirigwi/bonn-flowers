'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// 3D Background Component - Floating Petals
const FloatingPetals3D = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const petals = [];
    const colors = [
      { h: 0.65, s: 0.8, l: 0.7 },
      { h: 0.55, s: 0.6, l: 0.8 },
      { h: 0.0, s: 0.8, l: 0.6 },
      { h: 0.9, s: 0.7, l: 0.8 },
      { h: 0.0, s: 0.0, l: 0.95 },
      { h: 0.08, s: 0.9, l: 0.7 },
      { h: 0.75, s: 0.6, l: 0.7 },
      { h: 0.15, s: 0.8, l: 0.7 }
    ];
    
    const createPetalGeometry = (type) => {
      switch(type) {
        case 'ring':
          return new THREE.RingGeometry(0.08, 0.15, 8);
        case 'circle':
          return new THREE.CircleGeometry(0.12, 6);
        case 'heart':
          const heartShape = new THREE.Shape();
          const x = 0, y = 0;
          heartShape.moveTo(x + 0.05, y + 0.05);
          heartShape.bezierCurveTo(x + 0.05, y + 0.05, x + 0.04, y, x, y);
          heartShape.bezierCurveTo(x - 0.06, y, x - 0.06, y + 0.035, x - 0.06, y + 0.035);
          heartShape.bezierCurveTo(x - 0.06, y + 0.055, x - 0.04, y + 0.077, x + 0.025, y + 0.1);
          heartShape.bezierCurveTo(x + 0.06, y + 0.077, x + 0.08, y + 0.055, x + 0.08, y + 0.035);
          heartShape.bezierCurveTo(x + 0.08, y + 0.035, x + 0.08, y, x + 0.05, y);
          heartShape.bezierCurveTo(x + 0.035, y, x + 0.025, y + 0.05, x + 0.05, y + 0.05);
          return new THREE.ShapeGeometry(heartShape);
        default:
          return new THREE.RingGeometry(0.08, 0.15, 6);
      }
    };
    
    for (let i = 0; i < 30; i++) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex];
      const petalType = ['ring', 'circle', 'heart'][Math.floor(Math.random() * 3)];
      const petalGeometry = createPetalGeometry(petalType);
      const petalMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(color.h, color.s, color.l),
        transparent: true,
        opacity: Math.random() * 0.4 + 0.3,
        side: THREE.DoubleSide
      });
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      petal.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10
      );
      petal.userData = {
        rotationSpeedX: (Math.random() - 0.5) * 0.02,
        rotationSpeedY: (Math.random() - 0.5) * 0.02,
        rotationSpeedZ: (Math.random() - 0.5) * 0.02,
        floatSpeedY: Math.random() * 0.008 + 0.005,
        floatSpeedX: Math.random() * 0.006 + 0.003,
        initialY: petal.position.y,
        initialX: petal.position.x,
        colorIndex: colorIndex
      };
      scene.add(petal);
      petals.push(petal);
    }
    
    camera.position.z = 8;
    camera.position.y = 2;
    sceneRef.current = { scene, camera, renderer, petals, colors };
    
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      petals.forEach((petal, index) => {
        petal.rotation.x += petal.userData.rotationSpeedX;
        petal.rotation.y += petal.userData.rotationSpeedY;
        petal.rotation.z += petal.userData.rotationSpeedZ;
        petal.position.y = petal.userData.initialY + Math.sin(time + index * 0.5) * 0.8;
        petal.position.x = petal.userData.initialX + Math.sin(time * 0.7 + index * 0.3) * 0.5;
        const colorCycleSpeed = 0.3;
        const colorOffset = Math.sin(time * colorCycleSpeed + index * 0.8) * 0.5 + 0.5;
        const nextColorIndex = (petal.userData.colorIndex + 1) % colors.length;
        const currentColor = colors[petal.userData.colorIndex];
        const nextColor = colors[nextColorIndex];
        const mixedColor = new THREE.Color().setHSL(
          currentColor.h + (nextColor.h - currentColor.h) * colorOffset,
          currentColor.s + (nextColor.s - currentColor.s) * colorOffset,
          currentColor.l + (nextColor.l - currentColor.l) * colorOffset
        );
        petal.material.color = mixedColor;
        petal.material.opacity = 0.3 + Math.sin(time * 0.5 + index) * 0.2;
      });
      renderer.render(scene, camera);
    };
    
    animate();
    
    const handleResize = () => {
      if (sceneRef.current) {
        const { camera, renderer } = sceneRef.current;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />;
};

// Wilted Flower Animation Component
const WiltedFlower = () => {
  return (
    <motion.div
      className="relative w-32 h-32 mx-auto mb-8"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ 
          rotate: [0, -5, 5, -3, 0],
          y: [0, -2, 0, -1, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="text-8xl">🥀</div>
      </motion.div>
      
      {/* Falling petals around the wilted flower */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ 
            x: 64, 
            y: 64, 
            opacity: 1,
            rotate: 0
          }}
          animate={{ 
            x: 64 + (Math.random() - 0.5) * 200,
            y: 200 + Math.random() * 100,
            opacity: 0,
            rotate: Math.random() * 720
          }}
          transition={{ 
            delay: 1 + i * 0.3,
            duration: 2 + Math.random(),
            ease: "easeOut"
          }}
        >
          🌸
        </motion.div>
      ))}
    </motion.div>
  );
};

export default function NotFoundPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setIsVisible(true);
    
    // Update time every second
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const quickLinks = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Shop Flowers', path: '/shop', icon: '🌸' },
    { name: 'About Us', path: '/about', icon: '📖' },
    { name: 'Contact', path: '/contact', icon: '📞' },
    { name: 'Wedding Flowers', path: '/weddings', icon: '💒' },
    { name: 'Birthday Arrangements', path: '/birthdays', icon: '🎂' }
  ];

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Page Not Found - House of Bonn",
            "description": "The page you're looking for doesn't exist. Browse our beautiful flower collections or contact us for assistance.",
            "url": "https://houseofbonn.co.ke/404",
            "mainEntity": {
              "@type": "LocalBusiness",
              "name": "House of Bonn",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Cianda House Koinange Street Shop No B19",
                "addressLocality": "Nairobi",
                "addressCountry": "Kenya"
              }
            }
          })
        }}
      />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <FloatingPetals3D />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Main 404 Content */}
            <motion.div
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              variants={staggerContainer}
              className="space-y-8"
            >
              
              {/* Wilted Flower Animation */}
              <motion.div variants={fadeInUp}>
                <WiltedFlower />
              </motion.div>

              {/* 404 Title */}
              <motion.div variants={fadeInUp}>
                <motion.h1 
                  className="text-8xl lg:text-9xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4"
                  animate={{ 
                    textShadow: [
                      "0 0 0px rgba(16, 185, 129, 0)",
                      "0 0 20px rgba(16, 185, 129, 0.3)",
                      "0 0 0px rgba(16, 185, 129, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  404
                </motion.h1>
                <h2 className="text-3xl lg:text-4xl font-bold text-emerald-900 mb-2">
                  Oops! This Page Has Wilted Away
                </h2>
                <p className="text-xl text-emerald-700 mb-8">
                  Like a flower that's lost its bloom, the page you're looking for seems to have disappeared
                </p>
              </motion.div>

              {/* Error Details Card */}
              <motion.div 
                variants={fadeInUp}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-emerald-100 max-w-2xl mx-auto"
              >
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-2">🌐 What Happened?</h3>
                    <p className="text-emerald-700 text-sm">The page you requested doesn't exist or may have been moved to a new location.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-2">⏰ Current Time</h3>
                    <p className="text-emerald-700 text-sm font-mono">{currentTime}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-2">🔍 What You Can Do</h3>
                    <p className="text-emerald-700 text-sm">Check the URL for typos, use our navigation below, or contact us for help.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-2">🌸 Still Need Flowers?</h3>
                    <p className="text-emerald-700 text-sm">Browse our collection or call us directly for assistance.</p>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.button
                  onClick={handleGoBack}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ← Go Back
                </motion.button>
                
                <motion.button
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-4 bg-white/90 text-emerald-700 font-bold rounded-2xl shadow-lg border-2 border-emerald-200 hover:bg-emerald-50 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🏠 Go Home
                </motion.button>
                
                <motion.button
                  onClick={() => window.location.href = '/shop'}
                  className="px-8 py-4 border-2 border-emerald-600 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-600 hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🌸 Shop Flowers
                </motion.button>
              </motion.div>

              {/* Quick Links */}
              <motion.div variants={fadeInUp} className="pt-8">
                <h3 className="text-2xl font-bold text-emerald-900 mb-6">
                  Or Visit These Popular Pages
                </h3>
                
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
                  variants={staggerContainer}
                >
                  {quickLinks.map((link, index) => (
                    <motion.a
                      key={index}
                      href={link.path}
                      variants={fadeInUp}
                      className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100 hover:bg-white hover:shadow-xl transition-all duration-300 text-center"
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                        {link.icon}
                      </div>
                      <div className="font-semibold text-emerald-900 text-sm">
                        {link.name}
                      </div>
                    </motion.a>
                  ))}
                </motion.div>
              </motion.div>

              {/* Contact Information */}
              <motion.div 
                variants={fadeInUp}
                className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-3xl p-8 text-white max-w-2xl mx-auto mt-12"
              >
                <h3 className="text-2xl font-bold mb-4">Still Can't Find What You Need?</h3>
                <p className="text-emerald-100 mb-6">
                  Our friendly team is here to help you find the perfect flowers for any occasion.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <motion.a
                    href="tel:+254-XXX-XXXXXX"
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-2xl">📞</div>
                    <div>
                      <div className="font-semibold">Call Us</div>
                      <div className="text-sm text-emerald-200">+254 XXX XXXXXX</div>
                    </div>
                  </motion.a>
                  
                  <motion.a
                    href="mailto:orders@houseofbonn.co.ke"
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-2xl">📧</div>
                    <div>
                      <div className="font-semibold">Email Us</div>
                      <div className="text-sm text-emerald-200">orders@houseofbonn.co.ke</div>
                    </div>
                  </motion.a>
                </div>
              </motion.div>

              {/* Fun Quote */}
              <motion.div 
                variants={fadeInUp}
                className="text-center py-8"
              >
                <motion.blockquote 
                  className="text-xl italic text-emerald-800 max-w-2xl mx-auto"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  "Even when pages go missing, beautiful flowers are always just a click away at House of Bonn" 🌺
                </motion.blockquote>
              </motion.div>
              
            </motion.div>
          </div>
        </div>

        {/* Floating Help Button */}
        <motion.div
          className="fixed bottom-8 right-8 z-40"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <motion.button
            className="bg-emerald-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.location.href = '/contact'}
            title="Need Help?"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}