'use client';
import React from "react";
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Truck, Users, Flower, CheckCircle, Star, ArrowRight, Sparkles, Calendar, Shield, Award } from 'lucide-react';
import * as THREE from 'three';
import Head from 'next/head';

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

// Contact Card Component
const ContactCard = ({ icon: Icon, title, value, href, type }) => (
  <motion.div
    className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50"
    whileHover={{ scale: 1.02, y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full text-white">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
        <a
          href={href}
          className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          aria-label={`${type === 'phone' ? 'Call' : type === 'email' ? 'Email' : 'Visit'} ${title}`}
        >
          {value}
        </a>
      </div>
    </div>
  </motion.div>
);

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.02 }}
  >
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

// Farm Gallery Component
const FarmGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const farmImages = [
    {
      id: 1,
      src: "https://picsum.photos/400/300?random=1&blur=0",
      alt: "Rose plantation at Thuo Farm",
      title: "Premium Rose Plantation"
    },
    {
      id: 2,
      src: "https://picsum.photos/400/300?random=2&blur=0",
      alt: "Sunflower fields at Thuo Farm",
      title: "Vibrant Sunflower Fields"
    },
    {
      id: 3,
      src: "https://picsum.photos/400/300?random=3&blur=0",
      alt: "Carnation greenhouse at Thuo Farm",
      title: "Carnation Greenhouse"
    },
    {
      id: 4,
      src: "https://picsum.photos/400/300?random=4&blur=0",
      alt: "Lily cultivation at Thuo Farm",
      title: "Lily Cultivation Center"
    },
    {
      id: 5,
      src: "https://picsum.photos/400/300?random=5&blur=0",
      alt: "Chrysanthemum fields at Thuo Farm",
      title: "Chrysanthemum Fields"
    },
    {
      id: 6,
      src: "https://picsum.photos/400/300?random=6&blur=0",
      alt: "Tulip greenhouse at Thuo Farm",
      title: "Tulip Greenhouse"
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farmImages.map((image, index) => (
          <motion.div
            key={image.id}
            className="group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h4 className="font-semibold text-lg">{image.title}</h4>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="max-w-4xl max-h-[90vh] relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                onClick={() => setSelectedImage(null)}
                aria-label="Close image"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function BulkOrdersPage() {
  const features = [
    {
      icon: Users,
      title: "Corporate Events",
      description: "Perfect for weddings, corporate functions, and large celebrations with customized arrangements."
    },
    {
      icon: Truck,
      title: "Timely Delivery",
      description: "Reliable delivery service across Kenya with temperature-controlled transportation."
    },
    {
      icon: Shield,
      title: "Quality Guarantee",
      description: "100% fresh flowers guarantee with replacements for any quality issues."
    },
    {
      icon: Award,
      title: "Premium Sourcing",
      description: "Direct from our certified farm in Nakuru, ensuring the highest quality blooms."
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Advanced booking available with flexible delivery schedules to meet your timeline."
    },
    {
      icon: Star,
      title: "Custom Arrangements",
      description: "Bespoke floral designs tailored to your specific event needs and preferences."
    }
  ];

  return (
    <>
      <Head>
        <title>Bulk Flower Orders Kenya | House of Bonn - Wholesale Fresh Flowers</title>
        <meta 
          name="description" 
          content="Order fresh flowers in bulk from House of Bonn. Direct from Thuo Farm Nakuru. Perfect for weddings, corporate events & large celebrations. Wholesale prices, guaranteed quality delivery across Kenya." 
        />
        <meta 
          name="keywords" 
          content="bulk flower orders Kenya, wholesale flowers Nakuru, wedding flowers bulk, corporate event flowers, fresh flowers farm direct, Thuo Farm flowers, House of Bonn bulk orders" 
        />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://houseofbonn.com/bulk-orders" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://houseofbonn.com/bulk-orders" />
        <meta property="og:title" content="Bulk Flower Orders Kenya | House of Bonn - Wholesale Fresh Flowers" />
        <meta property="og:description" content="Order fresh flowers in bulk from House of Bonn. Direct from Thuo Farm Nakuru. Perfect for weddings, corporate events & large celebrations." />
        <meta property="og:image" content="https://houseofbonn.com/images/bulk-orders-og.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://houseofbonn.com/bulk-orders" />
        <meta property="twitter:title" content="Bulk Flower Orders Kenya | House of Bonn" />
        <meta property="twitter:description" content="Order fresh flowers in bulk from House of Bonn. Direct from Thuo Farm Nakuru." />
        <meta property="twitter:image" content="https://houseofbonn.com/images/bulk-orders-twitter.jpg" />

        {/* Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "House of Bonn",
            "description": "Premium fresh flower delivery service with bulk order capabilities",
            "url": "https://houseofbonn.com",
            "telephone": "+254-759-405-973",
            "email": "bonifacechege838@gmail.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Nairobi",
              "addressCountry": "Kenya"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-0.3031",
              "longitude": "36.0800"
            },
            "openingHours": "Mo-Su 08:00-18:00",
            "priceRange": "$$",
            "servedCuisine": "Fresh Flowers",
            "serviceArea": {
              "@type": "State",
              "name": "Kenya"
            }
          })}
        </script>
      </Head>

      <main className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 overflow-hidden">
        {/* 3D Background */}
        <FloatingPetals3D />
        
        {/* Background Decorations */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-300/10 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-teal-300/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-300/10 rounded-full blur-xl" />

        <div className="relative z-10">
          {/* Hero Section */}
          <section className="pt-20 pb-16 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Sparkles className="w-10 h-10 text-emerald-500" />
                  <h1 className="text-4xl lg:text-7xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 bg-clip-text text-transparent">
                    Bulk Flower Orders
                  </h1>
                  <Sparkles className="w-10 h-10 text-teal-500" />
                </div>
                
                <p className="text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8">
                  Transform your special events with premium fresh flowers sourced directly from our certified farm in Nakuru. 
                  Perfect for weddings, corporate events, and large celebrations.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-6">
                  {[
                    { icon: "🌾", text: "Farm Direct" },
                    { icon: "🚚", text: "Kenya-wide Delivery" },
                    { icon: "💎", text: "Premium Quality" },
                    { icon: "📞", text: "24/7 Support" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white/50"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium text-gray-700">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Contact Cards */}
              <motion.div
                className="grid md:grid-cols-3 gap-6 mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <ContactCard
                  icon={Phone}
                  title="Call Us"
                  value="+254-759-405-973"
                  href="tel:+254759405973"
                  type="phone"
                />
                <ContactCard
                  icon={Mail}
                  title="Email Us"
                  value="bonifacechege838@gmail.com"
                  href="mailto:bonifacechege838@gmail.com"
                  type="email"
                />
                <ContactCard
                  icon={MapPin}
                  title="Our Farm"
                  value="Thuo Farm, Flyover Nakuru"
                  href="https://maps.google.com/?q=Nakuru,Kenya"
                  type="location"
                />
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
                  Why Choose Our Bulk Service?
                </h2>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                  Experience the difference of working directly with Kenya's premier flower farm, 
                  offering unmatched quality and service for your bulk flower needs.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <FeatureCard key={index} {...feature} index={index} />
                ))}
              </div>
            </div>
          </section>

          {/* Farm Section */}
          <section className="py-16 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
                  Visit Thuo Farm, Nakuru
                </h2>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
                  Located in the heart of Kenya's flower country, our certified farm at Flyover Nakuru 
                  spans over 50 acres of premium flower cultivation. See where your beautiful blooms begin their journey.
                </p>
                
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-4xl mx-auto mb-12">
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold text-emerald-600 mb-2">50+</div>
                      <div className="text-gray-600">Acres of Cultivation</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-teal-600 mb-2">25+</div>
                      <div className="text-gray-600">Flower Varieties</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600 mb-2">10K+</div>
                      <div className="text-gray-600">Daily Production</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <FarmGallery />
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-3xl p-12 text-center border border-white/50 shadow-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Flower className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
                  Ready to Place Your Bulk Order?
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
                  Let's discuss your specific needs and create a customized solution for your event. 
                  Our team is ready to help make your vision bloom into reality.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.a
                    href="tel:+254759405973"
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Phone className="w-5 h-5" />
                    Call Now: +254-759-405-973
                  </motion.a>
                  
                  <motion.a
                    href="mailto:bonifacechege838@gmail.com"
                    className="px-8 py-4 bg-white/80 backdrop-blur-sm text-emerald-600 text-lg font-semibold rounded-full border-2 border-emerald-500 hover:bg-emerald-50 transition-all flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mail className="w-5 h-5" />
                    Email Us
                  </motion.a>
                </div>
                
                <div className="mt-8 text-sm text-gray-600">
                  <p>
                    <CheckCircle className="w-4 h-4 inline text-green-500 mr-2" />
                    Free consultation and quotation
                  </p>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}