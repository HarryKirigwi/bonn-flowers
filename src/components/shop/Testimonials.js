'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import * as THREE from 'three';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Kimani',
    role: 'Wedding Planner, Nairobi',
    content: 'The flowers for my client\'s wedding were absolutely stunning! The arrangements were fresh, beautiful, and exactly what we envisioned. The team was professional and delivered on time. Every bride deserves flowers this perfect!',
    rating: 5,
    location: 'Karen, Nairobi',
    event: 'Wedding Arrangements'
  },
  {
    id: 2,
    name: 'David Ochieng',
    role: 'Regular Customer',
    content: 'I\'ve been ordering flowers from here for over a year now, and they never disappoint. The quality is consistently excellent, and the delivery is always prompt. My wife loves the monthly surprise bouquets!',
    rating: 5,
    location: 'Westlands, Nairobi',
    event: 'Monthly Subscriptions'
  },
  {
    id: 3,
    name: 'Amina Hassan',
    role: 'Corporate Event Manager',
    content: 'We use these services for all our corporate events. Their bulk ordering process is seamless, and they always accommodate our specific requirements. The presentation is always world-class. Highly recommended!',
    rating: 5,
    location: 'Upper Hill, Nairobi',
    event: 'Corporate Events'
  },
  {
    id: 4,
    name: 'Grace Wanjiku',
    role: 'Anniversary Celebrations',
    content: 'The surprise arrangement for our 10th anniversary was beyond our dreams. The roses were fresh from Nakuru farms, and the presentation was magical. Our family will treasure this memory forever.',
    rating: 5,
    location: 'Kileleshwa, Nairobi',
    event: 'Anniversary Surprise'
  },
  {
    id: 5,
    name: 'James Muturi',
    role: 'Business Owner',
    content: 'The weekly office arrangements have transformed our workspace. Our clients always comment on how beautiful and fresh our reception area looks. The investment in ambiance has paid off tremendously.',
    rating: 5,
    location: 'CBD, Nairobi',
    event: 'Office Arrangements'
  },
  {
    id: 6,
    name: 'Mercy Akinyi',
    role: 'Mother & Teacher',
    content: 'The funeral arrangements during our difficult time were handled with such care and respect. The white lilies and roses provided comfort to our family. Professional, compassionate service when we needed it most.',
    rating: 5,
    location: 'Kibera, Nairobi',
    event: 'Sympathy Arrangements'
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);
  const sectionRef = useRef(null);

  // Initialize Three.js scene with floating elements
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 300 / 300, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating quote symbols and stars
    const floatingElements = [];
    
    // Quote symbols
    const quoteGeometry = new THREE.RingGeometry(0.1, 0.15, 8);
    for (let i = 0; i < 8; i++) {
      const quoteMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.8, 0.7),
        transparent: true,
        opacity: 0.4
      });
      
      const quote = new THREE.Mesh(quoteGeometry, quoteMaterial);
      quote.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6
      );
      quote.userData = {
        rotationSpeed: Math.random() * 0.03 + 0.01,
        floatSpeed: Math.random() * 0.008 + 0.004,
        initialY: quote.position.y,
        initialX: quote.position.x,
        amplitude: Math.random() * 0.8 + 0.3
      };
      
      scene.add(quote);
      floatingElements.push(quote);
    }

    // Star-like particles
    const starGeometry = new THREE.SphereGeometry(0.05, 8, 6);
    for (let i = 0; i < 12; i++) {
      const starMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.15, 0.9, 0.8),
        transparent: true,
        opacity: 0.6
      });
      
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8
      );
      star.userData = {
        rotationSpeed: Math.random() * 0.04 + 0.02,
        floatSpeed: Math.random() * 0.01 + 0.005,
        initialY: star.position.y,
        pulseSpeed: Math.random() * 0.02 + 0.01
      };
      
      scene.add(star);
      floatingElements.push(star);
    }

    camera.position.z = 6;
    sceneRef.current = { scene, camera, renderer, floatingElements };

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      floatingElements.forEach((element, index) => {
        const time = Date.now() * 0.001;
        
        if (index < 8) { // Quote symbols
          element.rotation.z += element.userData.rotationSpeed;
          element.position.y = element.userData.initialY + 
            Math.sin(time * element.userData.floatSpeed) * element.userData.amplitude;
          element.position.x = element.userData.initialX + 
            Math.cos(time * element.userData.floatSpeed * 0.7) * 0.3;
        } else { // Stars
          element.rotation.x += element.userData.rotationSpeed;
          element.rotation.y += element.userData.rotationSpeed * 0.7;
          element.position.y = element.userData.initialY + 
            Math.sin(time * element.userData.floatSpeed) * 0.5;
          
          // Pulsing effect
          const pulse = (Math.sin(time * element.userData.pulseSpeed) + 1) * 0.5;
          element.scale.setScalar(0.8 + pulse * 0.4);
        }
      });
      
      renderer.render(scene, camera);
    };
    
    animate();

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

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 animate-pulse" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.03) 1px, transparent 1px),
                             radial-gradient(circle at 80% 70%, rgba(255,255,255,0.03) 1px, transparent 1px),
                             radial-gradient(circle at 40% 80%, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '60px 60px, 45px 45px, 30px 30px'
          }} />
        </div>
        
        {/* Gradient Overlays */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-teal-500/20 to-green-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-emerald-500/10 to-teal-600/10 rounded-full blur-3xl" />
      </div>

      {/* 3D Floating Elements */}
      <div className="absolute top-10 right-10 z-10 opacity-60">
        <div ref={mountRef} className="w-72 h-72" />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <motion.p 
              className="text-emerald-400 font-medium text-lg tracking-wide uppercase"
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              Customer Stories • Real Experiences
            </motion.p>
            
            <motion.h2 
              className="text-5xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent"
              variants={itemVariants}
            >
              Love Stories in House of Bonn Flowers
            </motion.h2>
            
            <motion.p 
              className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
              variants={itemVariants}
            >
              Discover why thousands of Kenyans trust us with their most precious moments. 
              From weddings to sympathy, every arrangement tells a story of love and care.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Main Testimonial Showcase */}
        <div className="relative mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="max-w-4xl mx-auto"
            >
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-white/20 shadow-2xl">
                {/* Quote Icon */}
                <div className="absolute -top-6 left-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <Quote className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Avatar with Initials */}
                  <motion.div 
                    className="flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="relative">
                      <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 border-4 border-white/20 shadow-xl flex items-center justify-center">
                        <span className="text-2xl lg:text-3xl font-bold text-white">
                          {testimonials[activeTestimonial].name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      {/* Floating ring */}
                      <motion.div
                        className="absolute inset-0 border-2 border-emerald-400/50 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 text-center lg:text-left">
                    {/* Stars */}
                    <div className="flex justify-center lg:justify-start mb-4">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 mx-1" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <blockquote className="text-xl lg:text-2xl text-white leading-relaxed mb-6 font-light italic">
                      "{testimonials[activeTestimonial].content}"
                    </blockquote>

                    {/* Author Info */}
                    <div className="space-y-2">
                      <h4 className="text-2xl font-bold text-white">
                        {testimonials[activeTestimonial].name}
                      </h4>
                      <p className="text-emerald-300 font-medium">
                        {testimonials[activeTestimonial].role}
                      </p>
                      <div className="flex flex-col lg:flex-row lg:items-center gap-2 text-gray-300 text-sm">
                        <span className="flex items-center gap-2">
                          📍 {testimonials[activeTestimonial].location}
                        </span>
                        <span className="hidden lg:block">•</span>
                        <span className="flex items-center gap-2">
                          🌸 {testimonials[activeTestimonial].event}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <motion.button
              onClick={prevTestimonial}
              className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            
            <motion.button
              onClick={nextTestimonial}
              className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Testimonial Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.02, 
                rotateY: 5,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              }}
              className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 cursor-pointer transition-all duration-300 ${
                index === activeTestimonial ? 'ring-2 ring-emerald-400/50' : ''
              }`}
              onClick={() => setActiveTestimonial(index)}
            >
              {/* Active indicator */}
              {index === activeTestimonial && (
                <motion.div
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}

              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-emerald-400/30 mr-4 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{testimonial.name}</h3>
                  <p className="text-emerald-300 text-sm">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-yellow-400 fill-yellow-400 mr-1"
                  />
                ))}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                "{testimonial.content}"
              </p>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>📍 {testimonial.location}</span>
                  <span>🌸 {testimonial.event}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
        >
          {[
            { number: "5,000+", label: "Happy Customers" },
            { number: "10,000+", label: "Flowers Delivered" },
            { number: "4.9/5", label: "Average Rating" },
            { number: "50+", label: "Locations Served" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="space-y-2"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 1.4 + index * 0.1 }}
              >
                {stat.number}
              </motion.div>
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.6 }}
          className="text-center mt-16"
        >
          <motion.button
            className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-lg rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Join Our Happy Customers</span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </motion.div>
      </div>

      {/* Floating Decorative Elements */}
      <motion.div
        className="absolute top-32 left-20 w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full backdrop-blur-sm"
        animate={{ 
          y: [0, -30, 0],
          rotate: [0, 180, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-40 right-32 w-20 h-20 bg-gradient-to-br from-teal-400/20 to-green-500/20 rounded-full backdrop-blur-sm"
        animate={{ 
          y: [0, 25, 0],
          x: [0, -20, 0],
          rotate: [0, -180, -360]
        }}
        transition={{ 
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-2/3 left-10 w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full backdrop-blur-sm"
        animate={{ 
          y: [0, -20, 0],
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </section>
  );
}