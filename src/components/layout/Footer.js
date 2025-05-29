'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin, Heart, Flower2 } from 'lucide-react';

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 overflow-hidden">
      {/* Floating Background Elements */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 rounded-full backdrop-blur-sm"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-1/2 right-20 w-24 h-24 bg-gradient-to-br from-rose-400/10 to-pink-500/10 rounded-full backdrop-blur-sm"
        animate={{ 
          y: [0, 25, 0],
          x: [0, -10, 0]
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full backdrop-blur-sm"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, -90, 0]
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10">
        {/* Main Footer Content */}
        <motion.div
          className="py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {/* Company Info */}
              <motion.div variants={itemVariants} className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                    <Flower2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                    House of Bonn Flowers
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Kenya's premier destination for exquisite flowers. We bring nature's finest blooms to your doorstep with same-day delivery across Nairobi.
                </p>
                
                {/* Social Media */}
                <div className="flex gap-4">
                  {[
                    { icon: Facebook, href: "#", color: "hover:text-blue-400" },
                    { icon: Instagram, href: "#", color: "hover:text-pink-400" },
                    { icon: Twitter, href: "#", color: "hover:text-sky-400" }
                  ].map(({ icon: Icon, href, color }, idx) => (
                    <motion.a
                      key={idx}
                      href={href}
                      className={`w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-gray-300 ${color} transition-all duration-300 hover:bg-white/20`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div variants={itemVariants}>
                <h4 className="text-xl font-semibold text-white mb-6">Quick Links</h4>
                <ul className="space-y-4">
                  {['Home', 'Shop', 'About Us', 'Contact', 'Delivery Info', 'Care Guide'].map((link, idx) => (
                    <li key={idx}>
                      <Link 
                        href={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-gray-300 hover:text-emerald-300 transition-colors duration-300 flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Categories */}
              <motion.div variants={itemVariants}>
                <h4 className="text-xl font-semibold text-white mb-6">Flower Categories</h4>
                <ul className="space-y-4">
                  {['Premium Roses', 'Wedding Bouquets', 'Corporate Arrangements', 'Seasonal Flowers', 'Indoor Plants', 'Gift Hampers'].map((category, idx) => (
                    <li key={idx}>
                      <Link 
                        href={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-gray-300 hover:text-emerald-300 transition-colors duration-300 flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {category}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Contact Info */}
              <motion.div variants={itemVariants}>
                <h4 className="text-xl font-semibold text-white mb-6">Get In Touch</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                    <div className="text-gray-300">
                      <p>Cianda House Koinange Street Shop B19, Nairobi</p>
                      <p>Kenya</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <a 
                      href="mailto:bonifacechege838@gmail.com"
                      className="text-gray-300 hover:text-emerald-300 transition-colors duration-300"
                    >
                      bonifacechege838@gmail.com
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <a 
                      href="tel:+254759405973"
                      className="text-gray-300 hover:text-emerald-300 transition-colors duration-300"
                    >
                      +254-759-405-973
                    </a>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 text-emerald-300 mb-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Same-Day Delivery</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Order before 2 PM for same-day delivery in Nairobi
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-white/10 py-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-gray-300">
                <Heart className="w-4 h-4 text-red-400" />
                <span>© {new Date().getFullYear()} House of Bonn Flowers. All rights reserved.</span>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <Link href="/privacy" className="text-gray-300 hover:text-emerald-300 transition-colors duration-300">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-300 hover:text-emerald-300 transition-colors duration-300">
                  Terms of Service
                </Link>
                <a 
                  href="https://synapssesolutions.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-emerald-300 transition-colors duration-300 flex items-center gap-1 text-xs"
                >
                  <span>Crafted by</span>
                  <span className="font-medium">Synapsse Solutions</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}