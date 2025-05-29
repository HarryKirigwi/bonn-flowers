'use client'
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Flower2 } from 'lucide-react';

export default function LoginPage() {
  const { login, register, loading, error, clearError, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(null);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);

  // Get redirect URL from query params (for when user tries to place order while logged out)
  const redirectTo = searchParams.get('redirect') || '/';
  const orderRedirect = searchParams.get('order');

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      // If user came from trying to place an order, redirect to that order flow
      if (orderRedirect) {
        router.push(`/order?${orderRedirect}`);
      } else {
        router.push(redirectTo);
      }
    }
  }, [user, router, redirectTo, orderRedirect]);

  // Initialize Three.js floating petals
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
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.45, 0.6, 0.7),
        transparent: true,
        opacity: 0.4
      });
      
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      petal.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      );
      petal.userData = {
        rotationSpeed: Math.random() * 0.015 + 0.005,
        floatSpeed: Math.random() * 0.008 + 0.003,
        initialY: petal.position.y
      };
      
      scene.add(petal);
      petals.push(petal);
    }

    camera.position.z = 5;
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError(null);
    if (error) clearError();
  };

  const validateForm = () => {
    if (!isLogin) {
      if (!formData.name || formData.name.trim().length < 2) {
        setFormError('Please enter your full name (minimum 2 characters).');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match.');
        return false;
      }
      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters long.');
        return false;
      }
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return false;
    }
    
    if (!formData.password) {
      setFormError('Please enter your password.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (isLogin) {
        // Login logic
        const result = await login(formData.email, formData.password);
        if (result.success) {
          // Success! The useEffect above will handle the redirect
          return;
        } else {
          setFormError(result.error || 'Invalid email or password. Please try again.');
        }
      } else {
        // Signup logic
        const result = await register(formData.name.trim(), formData.email, formData.password);
        if (result.success) {
          setRegisterSuccess('Account created successfully! You can now sign in.');
          setTimeout(() => {
            setIsLogin(true);
            setRegisterSuccess(null);
            setFormData({ 
              email: formData.email, // Keep email for easier login
              password: '', 
              confirmPassword: '', 
              name: '' 
            });
          }, 2000);
        } else {
          setFormError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setFormError(
        err?.message || 
        (isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeSwitch = (loginMode) => {
    setIsLogin(loginMode);
    setFormError(null);
    setRegisterSuccess(null);
    if (error) clearError();
    
    // Clear form when switching modes, but keep email if switching from register to login
    if (loginMode && !isLogin) {
      // Switching from register to login - keep email
      setFormData(prev => ({
        email: prev.email,
        password: '',
        confirmPassword: '',
        name: ''
      }));
    } else if (!loginMode && isLogin) {
      // Switching from login to register - clear all
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
      });
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: isLogin ? -50 : 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: isLogin ? 50 : -50,
      transition: { duration: 0.3 }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 }
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Decorative Elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 rounded-full backdrop-blur-sm"
        animate={{ 
          y: [0, -30, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-1/4 right-16 w-24 h-24 bg-gradient-to-br from-rose-400/10 to-pink-500/10 rounded-full backdrop-blur-sm"
        animate={{ 
          y: [0, 40, 0],
          x: [0, -20, 0],
          rotate: [0, -180, -360]
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-20 left-1/4 w-28 h-28 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full backdrop-blur-sm"
        animate={{ 
          y: [0, -35, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* 3D Background Element */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-30 hidden lg:block">
        <div ref={mountRef} className="w-72 h-72" />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl mb-4 shadow-xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Flower2 className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent mb-2">
            Kenya Flowers
          </h1>
          <p className="text-emerald-200 text-sm">
            {isLogin ? 'Welcome back to premium flower delivery' : 'Join Kenya\'s premier flower boutique'}
          </p>
          
          {/* Show context if redirected from order attempt */}
          {orderRedirect && (
            <motion.p
              className="text-amber-200 text-xs mt-2 bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-500/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Please sign in to complete your order
            </motion.p>
          )}
        </motion.div>

        {/* Form Container */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Toggle Buttons */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
            <motion.button
              onClick={() => handleModeSwitch(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                isLogin 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                  : 'text-emerald-200 hover:text-white'
              }`}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              Sign In
            </motion.button>
            <motion.button
              onClick={() => handleModeSwitch(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                !isLogin 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                  : 'text-emerald-200 hover:text-white'
              }`}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              Sign Up
            </motion.button>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Name Field (Signup only) */}
              {!isLogin && (
                <motion.div
                  custom={0}
                  variants={inputVariants}
                  className="relative"
                >
                  <label className="block text-emerald-200 text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <motion.input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                    required={!isLogin}
                    disabled={isSubmitting}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </motion.div>
              )}

              {/* Email Field */}
              <motion.div
                custom={isLogin ? 0 : 1}
                variants={inputVariants}
                className="relative"
              >
                <label className="block text-emerald-200 text-sm font-medium mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300/70" />
                  <motion.input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                    required
                    disabled={isSubmitting}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                custom={isLogin ? 1 : 2}
                variants={inputVariants}
                className="relative"
              >
                <label className="block text-emerald-200 text-sm font-medium mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300/70" />
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
                    placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                    required
                    disabled={isSubmitting}
                    minLength={isLogin ? undefined : 6}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-300/70 hover:text-white transition-colors"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password (Signup only) */}
              {!isLogin && (
                <motion.div
                  custom={3}
                  variants={inputVariants}
                  className="relative"
                >
                  <label className="block text-emerald-200 text-sm font-medium mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300/70" />
                    <motion.input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
                      placeholder="Confirm your password"
                      required={!isLogin}
                      disabled={isSubmitting}
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Remember Me / Forgot Password */}
              {isLogin && (
                <motion.div
                  custom={2}
                  variants={inputVariants}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 bg-white/10 border border-white/30 rounded focus:ring-emerald-400 focus:ring-2"
                      disabled={isSubmitting}
                    />
                    <span className="text-emerald-200 text-sm">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-emerald-300 hover:text-white text-sm font-medium transition-colors"
                    disabled={isSubmitting}
                  >
                    Forgot password?
                  </button>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || loading}
                className="group relative w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-lg rounded-xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                whileHover={!isSubmitting && !loading ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting && !loading ? { scale: 0.98 } : {}}
                custom={isLogin ? 3 : 4}
                variants={inputVariants}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting || loading ? (
                    <motion.div
                      className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>

              {/* Error Message */}
              {(formError || error) && (
                <motion.div
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {formError || error}
                </motion.div>
              )}

              {/* Success Message (Register) */}
              {registerSuccess && (
                <motion.div
                  className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {registerSuccess}
                </motion.div>
              )}

              {/* Additional Links */}
              <motion.div
                custom={isLogin ? 4 : 5}
                variants={inputVariants}
                className="text-center space-y-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 text-emerald-200">
                      or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
                    whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                    disabled={isSubmitting}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
                    whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                    disabled={isSubmitting}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            </motion.form>
          </AnimatePresence>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="flex items-center justify-center gap-6 mt-8 text-emerald-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Secure Login</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Trusted by 10K+ Customers</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}