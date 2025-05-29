"use client"
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle,
  Sparkles,
  Heart,
  Flower2,
  Navigation,
  MessageSquare
} from 'lucide-react';
import * as THREE from 'three';

// 3D Background Component (matching the featured products style)
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

    // Create floating flower petals
    const petals = [];
    const colors = [
      { h: 0.65, s: 0.8, l: 0.7 }, // Blue
      { h: 0.55, s: 0.6, l: 0.8 }, // Baby Blue
      { h: 0.0, s: 0.8, l: 0.6 },  // Red
      { h: 0.9, s: 0.7, l: 0.8 },  // Pink
      { h: 0.0, s: 0.0, l: 0.95 }, // White
      { h: 0.08, s: 0.9, l: 0.7 }, // Orange
      { h: 0.75, s: 0.6, l: 0.7 }, // Purple
      { h: 0.15, s: 0.8, l: 0.7 }  // Yellow
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

    for (let i = 0; i < 20; i++) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex];
      const petalType = ['ring', 'circle', 'heart'][Math.floor(Math.random() * 3)];
      
      const petalGeometry = createPetalGeometry(petalType);
      const petalMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(color.h, color.s, color.l),
        transparent: true,
        opacity: Math.random() * 0.4 + 0.2,
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
        colorIndex: colorIndex,
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
        petal.material.opacity = 0.2 + Math.sin(time * 0.5 + index) * 0.15;
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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically send the data to your backend
      console.log('Form submitted:', formData);
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Shop",
      details: ["Cianda House Koinange Street", "Nairobi, Kenya", "Shop No B19"],
      color: "emerald"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+254 759 405 973", "+254 716 473 581", "Mon-Sat: 8AM-6PM"],
      color: "teal"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["bonifacechege838@gmail.com"],
      color: "green"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Friday: 7AM - 7PM", "Saturday: 8AM - 6PM", "Sunday: 9AM - 4PM"],
      color: "blue"
    }
  ];

  return (
    <>
      {/* SEO Head */}
      <title>Contact Us - House of Bonn Flowers Shop | Premium Kenyan Flowers</title>
      <meta name="description" content="Contact House of Bonn Flower Shop in Nairobi, Kenya. Visit our farm at Flyover - Thuo farm, Nakuru County. Call +254 759405973 or email bonifacechege838@gmail.com" />
      <meta name="keywords" content="flower shop contact, Kenya flowers, Nakuru flower farm, contact florist, flower delivery Kenya" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Florist",
            "name": "House of Bonn Flowers Shop",
            "description": "Premium fresh flowers from Kenya's finest gardens",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Cianda House Koinange Street",
              "addressLocality": "Nairobi",
              "addressCountry": "Kenya",
              "postalCode": "00100"
            },
            "telephone": "+254 759 405 973",
            "email": "bonifacechege838@gmail.com",
            "url": "https://houseofbonn.co.ke",
            "openingHours": ["Mo-Fr 07:00-19:00", "Sa 08:00-18:00", "Su 09:00-16:00"],
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-0.2921",
              "longitude": "36.0578"
            },
            "sameAs": [
              "https://facebook.com/HouseofBonn",
              "https://instagram.com/HouseofBonn"
            ]
          })
        }}
      />

      <main className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 overflow-hidden">
        {/* 3D Background */}
        <FloatingPetals3D />
        
        {/* Enhanced Background Decorations */}
        <motion.div 
          className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-emerald-300/20 to-teal-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-32 right-32 w-56 h-56 bg-gradient-to-br from-rose-300/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10">
          {/* Header */}
          <motion.header
            className="text-center mb-20"
            variants={titleVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-10 h-10 text-emerald-500" />
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 bg-clip-text text-transparent">
                Get In Touch
              </h1>
              
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Heart className="w-10 h-10 text-rose-500" />
              </motion.div>
            </div>
            
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
              We'd love to hear from you! Contact us for custom arrangements, bulk orders, or visit our beautiful flower farm
            </p>
          </motion.header>

          {/* Contact Information Grid */}
          <motion.section
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-emerald-500/20 transition-all duration-500 group"
                variants={cardVariants}
                custom={index}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br from-${info.color}-400 to-${info.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-4">{info.title}</h3>
                
                <div className="space-y-2">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 text-sm leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.section>

          {/* Main Content: Form and Farm Visit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.section
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-8 h-8 text-emerald-600" />
                <h2 className="text-3xl font-bold text-gray-800">Send us a Message</h2>
              </div>

              <AnimatePresence>
                {submitSuccess && (
                  <motion.div
                    className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <p className="text-green-700 font-medium">Thank you! Your message has been sent successfully.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/70'
                      }`}
                      placeholder="Your full name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/70'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="+254 700 123 456"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/70'
                      }`}
                      placeholder="What can we help you with?"
                    />
                    {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none ${
                      errors.message ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/70'
                    }`}
                    placeholder="Tell us about your flower needs, special requests, or any questions you have..."
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </motion.section>

            {/* Farm Visit Information */}
            <motion.section
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Visit Our Farm */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
                <div className="flex items-center gap-3 mb-6">
                  <Navigation className="w-8 h-8 text-emerald-600" />
                  <h2 className="text-3xl font-bold text-gray-800">Visit Our Farm</h2>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                    <h3 className="text-xl font-bold text-emerald-800 mb-3 flex items-center gap-2">
                      <Flower2 className="w-6 h-6" />
                      Farm Location
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <p className="font-semibold">Flyover - Thuo Farm</p>
                      <p>Nakuru County, Kenya</p>
                      <p className="text-sm text-gray-600">Experience where our beautiful flowers grow in their natural environment</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-4 rounded-2xl border border-teal-100">
                      <h4 className="font-bold text-teal-800 mb-2">Farm Tours</h4>
                      <p className="text-sm text-gray-600">Available by appointment</p>
                      <p className="text-sm text-gray-600">Duration: 1-2 hours</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                      <h4 className="font-bold text-green-800 mb-2">Best Visit Times</h4>
                      <p className="text-sm text-gray-600">Morning: 8AM - 11AM</p>
                      <p className="text-sm text-gray-600">Evening: 4PM - 6PM</p>
                    </div>
                  </div>

                  <motion.div
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-xl"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h4 className="font-bold text-lg mb-2">🌸 Farm Experience Includes:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Guided tour of our flower fields</li>
                      <li>• Pick your own bouquet (seasonal)</li>
                      <li>• Photography opportunities</li>
                      <li>• Meet our expert horticulturists</li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Centered Quick Actions Card */}
          <div className="flex justify-center mt-12">
            <div className="w-full max-w-xl">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quick Actions</h3>
                <div className="space-y-4">
                  <motion.button
                    className="w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Phone className="w-5 h-5" />
                    Call for Immediate Assistance
                  </motion.button>
                  <motion.button
                    className="w-full p-4 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Mail className="w-5 h-5" />
                    Email Us Directly
                  </motion.button>
                  <motion.button
                    className="w-full p-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Navigation className="w-5 h-5" />
                    Get Directions to Farm
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <motion.section
            className="mt-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Find Us</h2>
                <p className="text-gray-600 text-lg">Located in the heart of Nairobi with easy access to our Nakuru farm</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Map Placeholder */}
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-8 flex items-center justify-center min-h-[300px] border border-emerald-200">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-emerald-800 mb-2">Interactive Map</h3>
                    <p className="text-emerald-700">Map integration coming soon</p>
                    <p className="text-sm text-emerald-600 mt-2">
                      Cianda House Koinange Street Shop B19, Nairobi, Kenya
                    </p>
                  </div>
                </div>

                {/* Location Details */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
                    <h3 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
                      <MapPin className="w-6 h-6" />
                      Shop Location
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <p className="font-semibold">Cianda House Koinange Street Shop B19</p>
                      <p>Nairobi, Kenya</p>
                      {/* <p>P.O. Box 12345 - 00100</p> */}
                      <p className="text-sm text-gray-600 mt-3">
                        🚗 Free parking available<br/>
                        🚌 Near public transport<br/>
                        ♿ Wheelchair accessible
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-100">
                    <h3 className="text-xl font-bold text-rose-800 mb-4 flex items-center gap-2">
                      <Flower2 className="w-6 h-6" />
                      Farm Location
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <p className="font-semibold">Flyover - Thuo Farm</p>
                      <p>Nakuru County, Kenya</p>
                      <p className="text-sm text-gray-600 mt-3">
                        🌱 Organic farming practices<br/>
                        📸 Photography tours available<br/>
                        🌸 Seasonal flower picking
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

        </div>
      </main>
    </>
  );
}