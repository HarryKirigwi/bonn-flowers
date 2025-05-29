'use client';
import { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

// Kenya Counties List
const kenyaCounties = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa',
  'Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi',
  'Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos',
  'Makueni','Mandera','Marsabit','Meru','Migori','Mombasa','Murang\'a',
  'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri',
  'Samburu','Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia',
  'Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot'
];

// Delivery fee calculation based on location
const calculateDeliveryFee = (county, city) => {
  const location = `${city}, ${county}`.toLowerCase();
  
  // Free delivery within Nairobi CBD
  if (county === 'Nairobi' && city.toLowerCase().includes('cbd')) {
    return 0;
  }
  
  // Nairobi County rates
  if (county === 'Nairobi') {
    return 300;
  }
  
  // Neighboring counties
  const neighboringCounties = ['Kiambu', 'Machakos', 'Kajiado', 'Murang\'a'];
  if (neighboringCounties.includes(county)) {
    return 500;
  }
  
  // Coastal counties
  const coastalCounties = ['Mombasa', 'Kilifi', 'Kwale', 'Taita-Taveta', 'Tana River', 'Lamu'];
  if (coastalCounties.includes(county)) {
    return 800;
  }
  
  // Central Kenya
  const centralCounties = ['Nakuru', 'Nyeri', 'Kirinyaga', 'Nyandarua', 'Laikipia'];
  if (centralCounties.includes(county)) {
    return 600;
  }
  
  // Western Kenya
  const westernCounties = ['Kisumu', 'Kakamega', 'Bungoma', 'Busia', 'Vihiga', 'Siaya', 'Kisii', 'Nyamira', 'Homa Bay', 'Migori'];
  if (westernCounties.includes(county)) {
    return 700;
  }
  
  // Northern Kenya (higher cost due to distance)
  const northernCounties = ['Turkana', 'Marsabit', 'Samburu', 'Isiolo', 'Mandera', 'Wajir', 'Garissa'];
  if (northernCounties.includes(county)) {
    return 1200;
  }
  
  // Default for other counties
  return 800;
};

export default function CheckoutPage() {
  const { user, createOrder } = useAuth();
  const { cartItems, getCartTotal, getCartItemCount } = useCart();
  const router = useRouter();

  // Protect route: redirect to login if not signed in
  useEffect(() => {
    if (!user) {
      router.replace(`/auth/login?redirect=/shop/checkout`);
    }
  }, [user, router]);

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phone: '', // Only field not from AuthContext
    shippingAddress: user?.address || '',
    city: user?.city || '',
    county: user?.county || '',
    postalCode: '',
    specialInstructions: '',
    preferredDeliveryTime: 'anytime'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [deliveryFee, setDeliveryFee] = useState(0);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Update delivery fee when location changes
  useEffect(() => {
    if (formData.county && formData.city) {
      const fee = calculateDeliveryFee(formData.county, formData.city);
      setDeliveryFee(fee);
    }
  }, [formData.county, formData.city]);
  
  const total = subtotal + deliveryFee;

  // Initialize Three.js scene for floating elements
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating flower petals
    const petals = [];
    const petalGeometry = new THREE.RingGeometry(0.05, 0.15, 6);
    
    for (let i = 0; i < 8; i++) {
      const petalMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.9, 0.6, 0.7),
        transparent: true,
        opacity: 0.4
      });
      
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      petal.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      );
      petal.userData = {
        rotationSpeed: Math.random() * 0.015 + 0.008,
        floatSpeed: Math.random() * 0.008 + 0.003,
        initialY: petal.position.y
      };
      
      scene.add(petal);
      petals.push(petal);
    }

    camera.position.z = 6;
    sceneRef.current = { scene, camera, renderer, petals };

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      petals.forEach(petal => {
        petal.rotation.z += petal.userData.rotationSpeed;
        petal.position.y = petal.userData.initialY + Math.sin(Date.now() * petal.userData.floatSpeed) * 0.3;
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
    
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Kenyan phone number';
    }
    if (!formData.shippingAddress.trim()) newErrors.shippingAddress = 'Shipping address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.county.trim()) newErrors.county = 'County is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // Generate order number
      const orderNum = `KF${Date.now().toString().slice(-6)}`;
      // Build shipping address object
      const shippingAddress = {
        name: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        address: formData.shippingAddress,
        city: formData.city,
        county: formData.county,
        postalCode: formData.postalCode,
        specialInstructions: formData.specialInstructions,
        preferredDeliveryTime: formData.preferredDeliveryTime
      };
      // Build items array
      const items = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      // Build order payload
      const orderData = {
        orderNumber: orderNum,
        shippingAddress,
        items,
        deliveryFee
      };
      // Use AuthContext's createOrder to ensure auth header is sent
      const result = await createOrder(orderData);
      if (!result.success) throw new Error(result.error || 'Failed to place order');
      setOrderNumber(result.order?.orderNumber || orderNum);
      setOrderPlaced(true);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('There was an error placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full text-center border border-white/20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-3xl">✓</span>
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-4">Order Placed Successfully!</h2>
          <div className="space-y-3 text-emerald-100">
            <p className="text-lg">Order Number: <span className="font-mono font-bold text-emerald-300">{orderNumber}</span></p>
            <p>Total: <span className="font-bold">KES {total.toLocaleString()}</span></p>
            <p className="text-sm">Payment on delivery • We'll contact you to confirm delivery details</p>
          </div>
          
          <motion.a
            href="/"
            className="mt-6 inline-block px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue Shopping
          </motion.a>
        </motion.div>
      </div>
    );
  }

  if (!user) return null; // Prevent flicker before redirect

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white">
      {/* Floating 3D Elements */}
      <div className="fixed top-20 right-10 z-10 opacity-30">
        <div ref={mountRef} className="w-72 h-72" />
      </div>

      {/* Floating Decorative Elements */}
      <motion.div
        className="fixed top-32 left-10 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full backdrop-blur-sm"
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-20 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-pink-700 mb-4">
              Complete Your Order
            </h1>
            <p className="text-xl text-gray-800">Pay on delivery • Fresh flowers guaranteed</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-sm">1</span>
                  Delivery Information
                </h2>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-pink-800 font-medium mb-2">Customer Name *</label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your full name"
                        readOnly={!!user?.name}
                      />
                      {user?.name && (
                        <p className="text-pink-700 text-xs mt-1">✓ From your account</p>
                      )}
                      {errors.customerName && <p className="text-red-600 text-sm mt-1">{errors.customerName}</p>}
                    </div>

                    <div>
                      <label className="block text-pink-800 font-medium mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                        placeholder="your.email@example.com"
                        readOnly={!!user?.email}
                      />
                      {user?.email && (
                        <p className="text-pink-700 text-xs mt-1">✓ From your account</p>
                      )}
                      {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-pink-800 font-medium mb-2">Phone Number * <span className="text-emerald-300 text-sm">(Required for delivery)</span></label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                        placeholder="+254 7XX XXX XXX"
                      />
                      {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-pink-800 font-medium mb-2">Shipping Address *</label>
                    <textarea
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Enter your complete delivery address including building name, floor, etc."
                    />
                    {user?.address && (
                      <p className="text-pink-700 text-xs mt-1">✓ Pre-filled from your account - you can modify if needed</p>
                    )}
                    {errors.shippingAddress && <p className="text-red-600 text-sm mt-1">{errors.shippingAddress}</p>}
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-pink-800 font-medium mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                        placeholder="e.g., Nairobi CBD, Westlands, etc."
                      />
                      {user?.city && (
                        <p className="text-pink-700 text-xs mt-1">✓ From your account</p>
                      )}
                      {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-pink-800 font-medium mb-2">County *</label>
                      <select
                        name="county"
                        value={formData.county}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Select County</option>
                        {kenyaCounties.map(county => (
                          <option key={county} value={county} className="bg-white text-gray-900">
                            {county}
                          </option>
                        ))}
                      </select>
                      {user?.county && (
                        <p className="text-pink-700 text-xs mt-1">✓ From your account</p>
                      )}
                      {errors.county && <p className="text-red-600 text-sm mt-1">{errors.county}</p>}
                    </div>

                    <div>
                      <label className="block text-pink-800 font-medium mb-2">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                        placeholder="00100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-pink-800 font-medium mb-2">Preferred Delivery Time</label>
                    <select
                      name="preferredDeliveryTime"
                      value={formData.preferredDeliveryTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                    >
                      <option value="anytime">Anytime (9 AM - 6 PM)</option>
                      <option value="morning">Morning (9 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                      <option value="evening">Evening (4 PM - 6 PM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-pink-800 font-medium mb-2">Special Instructions (Optional)</label>
                    <textarea
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Any special delivery instructions, gift message, etc."
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Cart Items */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl">
                <h3 className="text-xl font-bold text-pink-700 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-sm text-white">2</span>
                  Your Order
                </h3>
                
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="text-gray-900 font-semibold text-sm">{item.name}</h4>
                        <p className="text-gray-700 text-xs">{item.variant}</p>
                        <p className="text-gray-800 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-pink-700 font-bold">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl">
                <h3 className="text-xl font-bold text-pink-700 mb-4">Order Summary</h3>
                
                <div className="space-y-3 text-pink-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>KES {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee.toLocaleString()}`}</span>
                  </div>
                  {deliveryFee === 0 && formData.county === 'Nairobi' && formData.city.toLowerCase().includes('cbd') && (
                    <p className="text-xs text-emerald-700">🎉 Free delivery within Nairobi CBD!</p>
                  )}
                  {deliveryFee > 0 && (
                    <p className="text-xs text-emerald-700">📍 Delivery to {formData.city}, {formData.county}</p>
                  )}
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-pink-800 font-bold text-lg">
                    <span>Total</span>
                    <span>KES {total.toLocaleString()}</span>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg p-3 mt-4">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <span>💳</span>
                      <span className="text-sm font-medium">Pay on Delivery</span>
                    </div>
                    <p className="text-xs text-emerald-800 mt-1">Cash payment upon delivery</p>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 btn-primary text-lg rounded-2xl shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Placing Order...
                  </div>
                ) : (
                  `Place Order - KES ${total.toLocaleString()}`
                )}
              </motion.button>

              {/* Trust Indicators */}
              <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 text-sm">
                  <span>✓</span>
                  <span>100% Fresh Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800 text-sm">
                  <span>✓</span>
                  <span>Same-day delivery available</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800 text-sm">
                  <span>✓</span>
                  <span>Pay safely on delivery</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}