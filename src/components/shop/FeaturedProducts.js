'use client';
import React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Star, ArrowRight, Sparkles, Plus, Minus } from 'lucide-react';
import * as THREE from 'three';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

// Debounce hook for performance
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Throttle function for resize events
const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

// Device detection hook
const useDeviceCapability = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      const lowEnd = navigator.hardwareConcurrency <= 2 || mobile;
      setIsMobile(mobile);
      setIsLowEnd(lowEnd);
    };
    
    checkDevice();
    const throttledCheck = throttle(checkDevice, 250);
    window.addEventListener('resize', throttledCheck);
    
    return () => window.removeEventListener('resize', throttledCheck);
  }, []);
  
  return { isMobile, isLowEnd };
};

// Intersection Observer hook
const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold }
    );
    
    if (ref.current) observer.observe(ref.current);
    
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [threshold]);
  
  return [ref, isInView];
};

// Optimized 3D Background Component
const FloatingPetals3D = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);
  const [containerRef, isInView] = useInView();
  const { isMobile, isLowEnd } = useDeviceCapability();
  
  // Disable 3D on very low-end devices
  const shouldRender3D = !isLowEnd || !isMobile;
  
  const config = useMemo(() => ({
    petalCount: isLowEnd ? 8 : isMobile ? 12 : 20,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    animationSpeed: isLowEnd ? 0.5 : 1
  }), [isLowEnd, isMobile]);

  useEffect(() => {
    if (!mountRef.current || !shouldRender3D) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: !isLowEnd,
      powerPreference: 'high-performance'
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(config.pixelRatio);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Simplified petal creation for better performance
    const petals = [];
    const colors = [
      new THREE.Color(0x4ade80), // Green
      new THREE.Color(0x06b6d4), // Cyan
      new THREE.Color(0xf97316), // Orange
      new THREE.Color(0xec4899), // Pink
    ];
    
    // Use simpler geometry for better performance
    const petalGeometry = new THREE.PlaneGeometry(0.2, 0.2);
    
    for (let i = 0; i < config.petalCount; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      
      const petal = new THREE.Mesh(petalGeometry, material);
      petal.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10
      );
      
      petal.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.01 * config.animationSpeed,
        floatSpeed: Math.random() * 0.005 + 0.003,
        initialY: petal.position.y,
        initialX: petal.position.x,
        phase: Math.random() * Math.PI * 2
      };
      
      scene.add(petal);
      petals.push(petal);
    }

    camera.position.z = 8;
    camera.position.y = 2;
    sceneRef.current = { scene, camera, renderer, petals };

    const animate = () => {
      if (!isInView) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      animationRef.current = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      petals.forEach((petal, index) => {
        // Simplified animation calculations
        petal.rotation.z += petal.userData.rotationSpeed;
        petal.position.y = petal.userData.initialY + Math.sin(time + petal.userData.phase) * 0.8;
        petal.position.x = petal.userData.initialX + Math.sin(time * 0.7 + petal.userData.phase) * 0.5;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();

    const handleResize = throttle(() => {
      if (sceneRef.current) {
        const { camera, renderer } = sceneRef.current;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    }, 100);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Proper cleanup
      petals.forEach(petal => {
        scene.remove(petal);
        petal.geometry.dispose();
        petal.material.dispose();
      });
      renderer.dispose();
    };
  }, [shouldRender3D, isInView, config]);

  if (!shouldRender3D) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 via-teal-100/20 to-green-100/20 pointer-events-none" />
    );
  }

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />;
};

// ProductCard should be a function, then memoized after definition
function ProductCard({ product, index }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  
  // Debounce hover state to reduce re-renders
  const debouncedHover = useDebounce(isHovered, 50);

  const handleAddToCart = useCallback(() => {
    addToCart(product, 1);
  }, [addToCart, product]);

  const toggleWishlist = useCallback(() => {
    setIsWishlisted(prev => !prev);
  }, []);

  const cardVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.4, 
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  }), [index]);

  // Find the quantity of this product in the cart
  const cartQuantity = cartItems.find(item => item.id === product.id)?.quantity || 0;

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/50">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
          <Image
            src={product.imageUrl && product.imageUrl !== '' ? product.imageUrl : '/images/products/placeholder.jpg'}
            alt={product.name}
            width={400}
            height={300}
            className={`w-full h-full object-cover transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            priority={index < 4}
            {...(index >= 4 ? { loading: 'lazy' } : {})}
            unoptimized={false}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {product.description || 'Beautiful fresh flowers delivered daily'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-emerald-600">
                Kes {product.price || Math.floor(Math.random() * 100) + 50}
              </span>
              <span className="text-xs text-gray-500">per stem</span>
            </div>
            {cartQuantity > 0 ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (cartQuantity <= 1) {
                      removeFromCart(product.id);
                    } else {
                      updateQuantity(product.id, cartQuantity - 1);
                    }
                  }}
                  className="p-2 bg-red-500 text-white rounded-lg cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="font-medium">{cartQuantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, cartQuantity + 1)}
                  className="p-2 bg-green-500 text-white rounded-lg cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
                <span className="ml-2 text-emerald-600 font-semibold">Added</span>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-sm font-semibold hover:shadow-lg transition-all cursor-pointer"
                aria-label="Add to Cart"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

const MemoizedProductCard = React.memo(ProductCard);

// Main Component with caching
export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch 8 featured products from the new API endpoint
        const res = await fetch('/api/products/featured');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }), []);

  if (loading) {
    return (
      <section className="relative py-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-12 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl mb-6 animate-pulse max-w-md mx-auto" />
            <div className="h-6 bg-gray-200 rounded-xl max-w-2xl mx-auto animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/95 rounded-2xl overflow-hidden animate-pulse shadow-lg">
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded-lg" />
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-16 bg-gray-200 rounded-lg" />
                    <div className="h-8 w-24 bg-gray-200 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to load products</h2>
          <button
            onClick={fetchWithCache}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 overflow-hidden">
      {/* Optimized 3D Background */}
      <FloatingPetals3D />
      
      {/* Simplified Background Decorations */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-300/10 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-teal-300/10 rounded-full blur-2xl" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.header
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-emerald-500" />
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 bg-clip-text text-transparent">
              Featured Flowers
            </h1>
            <Sparkles className="w-8 h-8 text-teal-500" />
          </div>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Hand-picked premium flowers from Kenya's finest gardens, delivered fresh to your doorstep
          </p>

          {/* Simplified Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {[
              { icon: "🌱", text: "Farm Fresh" },
              { icon: "⭐", text: "Premium Quality" },
              { icon: "🚚", text: "Fast Delivery" }
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-full shadow-sm"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-gray-700 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.header>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {products.map((product, index) => (
            <MemoizedProductCard key={product.id} product={product} index={index} />
          ))}
        </motion.div>

        {/* Simplified Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Ready to Create Something Beautiful?
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Browse our complete collection of premium flowers
            </p>
            
            <button className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all">
              Shop All Flowers
            </button>
          </div>
        </motion.div>
      </div>

      {/* Simplified Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <button
          className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          aria-label="Quick shop"
        >
          <ShoppingCart className="w-6 h-6" />
        </button>
      </motion.div>
    </section>
  );
}