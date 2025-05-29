import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, Flower2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email'); // 'email', 'code', 'success'
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: ['', '', '', '', '', '']
  });
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);
  const codeInputsRef = useRef([]);

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

  // Countdown timer for resend code
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Reset email sent to:', formData.email);
    setStep('code');
    setCountdown(60);
    setIsLoading(false);
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...formData.verificationCode];
    newCode[index] = value;
    setFormData({ ...formData, verificationCode: newCode });

    // Auto-focus next input
    if (value && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.verificationCode[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    const code = formData.verificationCode.join('');
    if (code.length !== 6) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Verification code submitted:', code);
    setStep('success');
    setIsLoading(false);
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Code resent to:', formData.email);
    setCountdown(60);
    setIsLoading(false);
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -50,
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
          
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.div
                key="email-header"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent mb-2">
                  Reset Password
                </h1>
                <p className="text-emerald-200 text-sm">
                  Enter your email address and we'll send you a verification code
                </p>
              </motion.div>
            )}
            
            {step === 'code' && (
              <motion.div
                key="code-header"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent mb-2">
                  Enter Code
                </h1>
                <p className="text-emerald-200 text-sm">
                  We've sent a 6-digit code to <span className="font-medium">{formData.email}</span>
                </p>
              </motion.div>
            )}
            
            {step === 'success' && (
              <motion.div
                key="success-header"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl mb-4 shadow-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent mb-2">
                  Check Your Email
                </h1>
                <p className="text-emerald-200 text-sm">
                  Password reset link has been sent to your email address
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Form Container */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {/* Email Step */}
            {step === 'email' && (
              <motion.form
                key="email-form"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleEmailSubmit}
                className="space-y-6"
              >
                <motion.div
                  custom={0}
                  variants={inputVariants}
                  className="relative"
                >
                  <label className="block text-emerald-200 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300/70" />
                    <motion.input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your email address"
                      required
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  </div>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !formData.email}
                  className="group relative w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-lg rounded-xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  custom={1}
                  variants={inputVariants}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <motion.div
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        Send Reset Code
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => window.history.back()}
                  className="w-full py-3 text-emerald-300 hover:text-white font-medium transition-colors duration-300 flex items-center justify-center gap-2"
                  custom={2}
                  variants={inputVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </motion.button>
              </motion.form>
            )}

            {/* Verification Code Step */}
            {step === 'code' && (
              <motion.form
                key="code-form"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleCodeSubmit}
                className="space-y-6"
              >
                <motion.div
                  custom={0}
                  variants={inputVariants}
                  className="space-y-4"
                >
                  <label className="block text-emerald-200 text-sm font-medium text-center">
                    Enter the 6-digit verification code
                  </label>
                  <div className="flex justify-center gap-3">
                    {formData.verificationCode.map((digit, index) => (
                      <motion.input
                        key={index}
                        ref={el => codeInputsRef.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 bg-white/5 border border-white/20 rounded-xl text-white text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
                        whileFocus={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  custom={1}
                  variants={inputVariants}
                  className="text-center"
                >
                  {countdown > 0 ? (
                    <p className="text-emerald-200 text-sm">
                      Resend code in <span className="font-medium text-emerald-300">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="text-emerald-300 hover:text-white font-medium text-sm transition-colors duration-300 disabled:opacity-50"
                    >
                      {isLoading ? 'Sending...' : 'Resend Code'}
                    </button>
                  )}
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isLoading || formData.verificationCode.join('').length !== 6}
                  className="group relative w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-lg rounded-xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  custom={2}
                  variants={inputVariants}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <motion.div
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        Verify Code
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full py-3 text-emerald-300 hover:text-white font-medium transition-colors duration-300 flex items-center justify-center gap-2"
                  custom={3}
                  variants={inputVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change Email Address
                </motion.button>
              </motion.form>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <motion.div
                key="success-form"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6 text-center"
              >
                <motion.div
                  custom={0}
                  variants={inputVariants}
                  className="space-y-4"
                >
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full mx-auto flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </motion.div>
                  <div className="space-y-2">
                    <p className="text-emerald-200">
                      We've sent a password reset link to
                    </p>
                    <p className="text-white font-medium">
                      {formData.email}
                    </p>
                    <p className="text-emerald-300/70 text-sm">
                      Please check your email and follow the instructions to reset your password.
                    </p>
                  </div>
                </motion.div>

                <motion.button
                  type="button"
                  onClick={() => window.history.back()}
                  className="group relative w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-lg rounded-xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  custom={1}
                  variants={inputVariants}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Sign In
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>

                <motion.div
                  custom={2}
                  variants={inputVariants}
                  className="text-sm text-emerald-200/70"
                >
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setStep('email')}
                    className="text-emerald-300 hover:text-white underline transition-colors"
                  >
                    try again
                  </button>
                </motion.div>
              </motion.div>
            )}
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
            <span className="text-xs font-medium">Secure Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Protected by Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Quick Recovery</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}