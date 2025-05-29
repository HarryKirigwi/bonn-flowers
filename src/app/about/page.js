'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// 3D Background Component (from the provided code)
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
    
    for (let i = 0; i < 25; i++) {
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

const farmImages = [
  {
    src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop",
    alt: "Thuo Farm flower cultivation fields in Nakuru",
    caption: "Our expansive flower fields at Thuo Farm"
  },
  {
    src: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
    alt: "Fresh carnations growing at Thuo Farm",
    caption: "Premium carnations ready for harvest"
  },
  {
    src: "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=800&h=600&fit=crop",
    alt: "Delphinium flowers at House of Bonn farm",
    caption: "Beautiful delphiniums in full bloom"
  },
  {
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    alt: "Greenhouse operations at Thuo Farm Nakuru",
    caption: "Climate-controlled greenhouse facilities"
  }
];

const services = [
  {
    icon: "🛍️",
    title: "Retail Orders",
    description: "Individual flower arrangements for personal occasions and gifts"
  },
  {
    icon: "📦",
    title: "Bulk Orders",
    description: "Large quantity orders for events, businesses, and commercial needs"
  },
  {
    icon: "🚚",
    title: "Delivery Service",
    description: "Same-day delivery across Nairobi and surrounding areas"
  },
  {
    icon: "🌐",
    title: "Online Ordering",
    description: "Convenient website ordering system with secure payment options"
  }
];

export default function AboutPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
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

  const cardHover = {
    hover: { 
      scale: 1.05,
      y: -10,
      transition: { duration: 0.3 }
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
            "@type": "LocalBusiness",
            "name": "House of Bonn",
            "description": "Premium flower shop in Nairobi Kenya offering fresh flowers for all occasions. From our farm in Nakuru to your doorstep.",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Cianda House Koinange Street Shop No B19",
              "addressLocality": "Nairobi",
              "addressCountry": "Kenya"
            },
            "telephone": "+254-759-405-973",
            "email": "bonifacechege838@gmail.com",
            "url": "https://houseofbonn.co.ke",
            "priceRange": "KSh 1,000 - KSh 10,000",
            "servedCuisine": ["Flowers", "Arrangements", "Bouquets"],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Flower Collections",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Wedding Flowers"
                  }
                },
                {
                  "@type": "Offer", 
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Birthday Arrangements"
                  }
                }
              ]
            }
          })
        }}
      />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <FloatingPetals3D />
        
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="pt-20 pb-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <motion.div
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={fadeInUp}
                className="text-center mb-16"
              >
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  About House of Bonn
                </motion.h1>
                
                <motion.p 
                  className="text-xl lg:text-2xl text-emerald-800 mb-8 max-w-4xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  From our farm in Nakuru to your doorstep in Nairobi, we bring you the freshest, most beautiful flowers Kenya has to offer
                </motion.p>

                <motion.div
                  className="flex flex-wrap items-center justify-center gap-8 text-emerald-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Farm-to-Door Freshness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Retail & Bulk Orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Same-Day Delivery</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Our Story Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer}
                className="grid lg:grid-cols-2 gap-16 items-center"
              >
                <motion.div variants={fadeInUp} className="space-y-6">
                  <h2 className="text-4xl lg:text-5xl font-bold text-emerald-900 mb-6">
                    Our Story
                  </h2>
                  <p className="text-lg text-emerald-800 leading-relaxed">
                    House of Bonn began with a simple vision: to bring the beauty and freshness of Kenya's finest flowers directly to our customers. What started as a passion for cultivating beautiful blooms has grown into a trusted name in Nairobi's flower industry.
                  </p>
                  <p className="text-lg text-emerald-800 leading-relaxed">
                    Located in the heart of Nairobi at Cianda House on Koinange Street, we've been serving our community with premium flower arrangements for weddings, birthdays, anniversaries, and all of life's special moments.
                  </p>
                  <p className="text-lg text-emerald-800 leading-relaxed">
                    Our commitment goes beyond just selling flowers – we're dedicated to creating memorable experiences and helping our customers express their emotions through the timeless beauty of fresh blooms.
                  </p>
                </motion.div>

                <motion.div 
                  variants={fadeInUp}
                  className="relative"
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop"
                      alt="House of Bonn flower shop interior"
                      className="w-full h-96 lg:h-[500px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  
                  {/* Floating badge */}
                  <motion.div
                    className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl border border-emerald-100"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">5+</div>
                      <div className="text-sm text-emerald-800">Years Serving</div>
                      <div className="text-sm text-emerald-800">Nairobi</div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Farm Section */}
          <section className="py-16 bg-white/60 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
                className="text-center mb-16"
              >
                <h2 className="text-4xl lg:text-5xl font-bold text-emerald-900 mb-6">
                  Thuo Farm - Our Source of Excellence
                </h2>
                <p className="text-xl text-emerald-800 max-w-3xl mx-auto leading-relaxed">
                  Located in the fertile highlands of Flyover Nakuru, Thuo Farm is where our journey begins. Our dedicated team cultivates the finest flowers using sustainable farming practices and modern techniques.
                </p>
              </motion.div>

              {/* Farm Images Grid */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerContainer}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
              >
                {farmImages.map((image, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    whileHover="hover"
                    className="group cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <motion.div
                      variants={cardHover}
                      className="relative rounded-2xl overflow-hidden shadow-lg"
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                        <p className="text-white font-medium text-sm">{image.caption}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Farm Details */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer}
                className="grid lg:grid-cols-3 gap-8"
              >
                <motion.div variants={fadeInUp} className="text-center p-6">
                  <div className="text-4xl mb-4">🌾</div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-3">Sustainable Farming</h3>
                  <p className="text-emerald-700">Eco-friendly practices that protect our environment while producing the highest quality flowers</p>
                </motion.div>
                
                <motion.div variants={fadeInUp} className="text-center p-6">
                  <div className="text-4xl mb-4">🏔️</div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-3">Perfect Climate</h3>
                  <p className="text-emerald-700">Nakuru's ideal altitude and climate conditions create the perfect environment for flower cultivation</p>
                </motion.div>
                
                <motion.div variants={fadeInUp} className="text-center p-6">
                  <div className="text-4xl mb-4">👨‍🌾</div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-3">Expert Care</h3>
                  <p className="text-emerald-700">Our experienced farmers ensure each flower meets our strict quality standards</p>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Services Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
                className="text-center mb-16"
              >
                <h2 className="text-4xl lg:text-5xl font-bold text-emerald-900 mb-6">
                  How We Serve You
                </h2>
                <p className="text-xl text-emerald-800 max-w-3xl mx-auto">
                  Whether you need a single bouquet or flowers for a large event, we're here to meet your needs with excellence and reliability.
                </p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerContainer}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    whileHover="hover"
                    className="group"
                  >
                    <motion.div
                      variants={cardHover}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-emerald-100 text-center h-full"
                    >
                      <div className="text-5xl mb-6">{service.icon}</div>
                      <h3 className="text-xl font-bold text-emerald-900 mb-4">{service.title}</h3>
                      <p className="text-emerald-700 leading-relaxed">{service.description}</p>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="py-16 bg-gradient-to-r from-emerald-900 via-teal-800 to-green-900">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer}
                className="grid lg:grid-cols-2 gap-16 items-center"
              >
                <motion.div variants={fadeInUp} className="text-white">
                  <h2 className="text-4xl lg:text-5xl font-bold mb-8">
                    Get in Touch
                  </h2>
                  <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
                    Ready to brighten someone's day or plan your special event? Contact us today for personalized service and expert advice.
                  </p>

                  <div className="space-y-6">
                    <motion.div 
                      variants={fadeInUp}
                      className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                    >
                      <div className="text-2xl">🏪</div>
                      <div>
                        <h3 className="font-semibold text-emerald-100">Retail Store</h3>
                        <p className="text-emerald-200">Cianda House, Koinange Street</p>
                        <p className="text-emerald-200">Shop No B19, Nairobi</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      variants={fadeInUp}
                      className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                    >
                      <div className="text-2xl">🚜</div>
                      <div>
                        <h3 className="font-semibold text-emerald-100">Our Farm</h3>
                        <p className="text-emerald-200">Thuo Farm</p>
                        <p className="text-emerald-200">Flyover, Nakuru</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      variants={fadeInUp}
                      className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                    >
                      <div className="text-2xl">📞</div>
                      <div>
                        <h3 className="font-semibold text-emerald-100">Contact</h3>
                        <p className="text-emerald-200">Phone:  +254-759-405-973</p>
                        <p className="text-emerald-200">Email: bonifacechege838@gmail.com</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-6">Order Options</h3>
                    
                    <div className="space-y-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 bg-white text-emerald-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        🛒 Order Online Through Website
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:bg-emerald-500 transition-all duration-300"
                      >
                        📞 Call for Bulk Orders
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-emerald-900 transition-all duration-300"
                      >
                        📧 Email for Custom Arrangements
                      </motion.button>
                    </div>
                  </div>

                  <motion.div
                    variants={fadeInUp}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
                  >
                    <h4 className="text-lg font-semibold text-white mb-3">Business Hours</h4>
                    <p className="text-emerald-100">Monday - Saturday: 8:00 AM - 7:00 PM</p>
                    <p className="text-emerald-100">Sunday: 9:00 AM - 5:00 PM</p>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </section>

         {/* Image Modal */}
         <AnimatePresence>
            {selectedImage && (
              <motion.div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
              >
                <motion.div
                  className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative">
                    <img
                      src={selectedImage.src}
                      alt={selectedImage.alt}
                      className="w-full h-auto"
                    />
                    <motion.button
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors duration-200"
                      onClick={() => setSelectedImage(null)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">{selectedImage.caption}</h3>
                    <p className="text-emerald-700">{selectedImage.alt}</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Call to Action Section */}
          <section className="py-20 bg-gradient-to-br from-white/90 via-emerald-50/80 to-teal-50/90 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
              >
                <h2 className="text-4xl lg:text-5xl font-bold text-emerald-900 mb-6">
                  Ready to Bloom with Us?
                </h2>
                <p className="text-xl text-emerald-800 mb-12 leading-relaxed">
                  Experience the difference of farm-fresh flowers delivered with care. 
                  Let us help make your special moments even more beautiful.
                </p>
                
                <motion.div
                  className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                  variants={staggerContainer}
                >
                  <motion.button
                    variants={fadeInUp}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform"
                  >
                    🌸 Browse Our Collection
                  </motion.button>
                  
                  <motion.button
                    variants={fadeInUp}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-emerald-600 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-600 hover:text-white transition-all duration-300 transform"
                  >
                    📞 Contact Us Today
                  </motion.button>
                </motion.div>

                <motion.div
                  className="mt-12 p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-emerald-100 inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-emerald-800 font-medium">
                    🚚 <strong>Free Same-Day Delivery</strong> within Nairobi CBD
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </div>

        {/* Floating Action Buttons */}
        <motion.div
          className="fixed bottom-8 right-8 flex flex-col gap-4 z-40"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.button
            className="bg-green-500 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="WhatsApp Us"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
            </svg>
          </motion.button>

          <motion.button
            className="bg-blue-500 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Call Us"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}