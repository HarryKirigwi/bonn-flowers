'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X, Search, Heart, MapPin, Phone, Package, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const { cartItems, getCartItemCount, checkAuthForOrder } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Dynamic navigation based on auth status
  const getNavigation = () => {
    const baseNavigation = [
      { name: 'Fresh Flowers', href: '/shop/available-products' },
      { name: 'Occasions', href: '/shop/occassions' },
      { name: 'Corporate Orders', href: '/shop/bulk-orders' },
      { name: 'Our Story', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ];

    if (user) {
      // For logged-in users, replace Home with Orders and add it at the beginning
      return [
        { name: 'My Orders', href: '/orders', icon: Package },
        ...baseNavigation
      ];
    } else {
      // For non-logged-in users, keep Home
      return [
        { name: 'Home', href: '/' },
        ...baseNavigation
      ];
    }
  };

  const navigation = getNavigation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);

  const handleCartClick = () => {
    if (!checkAuthForOrder(user)) return;
    // setIsCartOpen(true);
  };

  const handleCheckout = () => {
    if (!checkAuthForOrder(user)) return;
    // Proceed to checkout
    window.location.href = '/checkout';
  };

  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const logoVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const navItemVariants = {
    hover: { 
      y: -2,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  const iconButtonVariants = {
    hover: { 
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: { scale: 0.95 }
  };

  if (loading) {
    // Show loading state
    return (
      <div className="h-20 bg-white shadow-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <motion.div 
        className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs sm:text-sm py-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-6">
              <div className="flex items-center gap-1 sm:gap-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">Serving Nairobi & Kenya</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+254 759 405 973</span>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm gap-2">
              {user && (
                <span className="hidden sm:inline text-emerald-100">
                  Welcome back, {user.name.split(' ')[0]}!
                </span>
              )}
              <span className="animate-pulse hidden sm:inline">🚚 Same-Day Delivery Available</span>
              <span className="animate-pulse sm:hidden">🚚 Same-Day</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Header */}
      <motion.header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-emerald-100' 
            : 'bg-white/90 backdrop-blur-md shadow-lg'
        }`}
        variants={headerVariants}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            {/* Logo */}
            <motion.div
              variants={logoVariants}
              whileHover="hover"
              className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0 flex-shrink-0"
              onClick={() => window.location.href = '/'}
            >
              <div className="relative flex-shrink-0">
                <img
                  src="/images/icons/bonnflowers.svg"
                  alt="House of Bonn Logo"
                  className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain"
                  draggable="false"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 bg-clip-text text-transparent leading-tight">
                  House of Bonn
                </span>
                <span className="text-xs sm:text-sm text-emerald-600 font-medium -mt-0.5 hidden sm:block">
                  Premium Kenyan Flowers
                </span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navigation.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="relative text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2 group whitespace-nowrap flex items-center gap-2"
                  variants={navItemVariants}
                  whileHover="hover"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.name}
                  <motion.div
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300"
                  />
                </motion.a>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Search - Hidden on small screens */}
              <motion.button 
                className="hidden sm:flex p-2 lg:p-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200"
                variants={iconButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Search className="w-4 h-4 lg:w-5 lg:h-5" />
              </motion.button>

              {/* Wishlist - Hidden on small screens */}
              <motion.button 
                className="hidden sm:flex relative p-2 lg:p-3 text-gray-700 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-200"
                variants={iconButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Heart className="w-4 h-4 lg:w-5 lg:h-5" />
                <motion.div
                  className="absolute top-1 right-1 w-2 h-2 bg-rose-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>

              {/* Enhanced User Menu */}
              <motion.div 
                className="relative hidden sm:flex user-dropdown-container"
                variants={iconButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center gap-2 p-2 lg:p-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200 cursor-pointer"
                      title="Click for more options"
                    >
                      <div className="w-4 h-4 lg:w-5 lg:h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:block font-medium text-sm lg:text-base max-w-24 truncate group relative">
                        {user.name.split(' ')[0]}
                        <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                          Click for more options
                        </span>
                      </span>
                    </button>

                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {showUserDropdown && (
                        <motion.div
                          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50"
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          <a
                            href="/shop/orders"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <Package className="w-4 h-4" />
                            My Orders
                          </a>
                          <a
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <User className="w-4 h-4" />
                            Profile Settings
                          </a>
                          <hr className="my-1" />
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              logout();
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <a
                    href="/auth/login"
                    className="flex items-center gap-2 p-2 lg:p-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200 cursor-pointer"
                  >
                    <User className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="hidden md:block font-medium text-sm lg:text-base">Sign In</span>
                  </a>
                )}
              </motion.div>

              {/* Enhanced Cart */}
              <Link
                href="/shop/cart"
                className="relative p-2 lg:p-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200 cursor-pointer"
                title="View Cart"
              >
                <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                <AnimatePresence>
                  {getCartItemCount() > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs rounded-full w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center font-semibold shadow-lg"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {getCartItemCount()}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 ml-1 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200 border border-gray-200"
                variants={iconButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="lg:hidden border-t border-emerald-100"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="py-4 sm:py-6 bg-gradient-to-br from-emerald-50 to-teal-50">
                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-1 sm:gap-2">
                    {navigation.map((item, index) => (
                      <motion.a
                        key={item.name}
                        href={item.href}
                        className="text-gray-700 hover:text-emerald-600 hover:bg-white/60 transition-all duration-200 font-medium py-3 px-4 rounded-lg mx-2 flex items-center gap-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        {item.name}
                      </motion.a>
                    ))}
                  </nav>
                  
                  {/* Mobile Quick Actions */}
                  <motion.div
                    className="flex flex-col items-center justify-center gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-emerald-200 px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {/* Mobile Action Buttons Row */}
                    <div className="flex items-center gap-4 w-full justify-center">
                      {/* Mobile Search */}
                      <motion.button 
                        className="flex items-center gap-2 px-3 py-2 text-emerald-600 hover:bg-white/60 rounded-full transition-all duration-200"
                        variants={iconButtonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Search className="w-4 h-4" />
                        <span className="text-sm font-medium">Search</span>
                      </motion.button>

                      {/* Mobile User Action */}
                      {user ? (
                        <motion.button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                          variants={iconButtonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Sign Out</span>
                        </motion.button>
                      ) : (
                        <motion.a
                          href="/auth/login"
                          className="flex items-center gap-2 px-3 py-2 text-emerald-600 hover:bg-white/60 rounded-full transition-all duration-200"
                          variants={iconButtonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm font-medium">Sign In</span>
                        </motion.a>
                      )}

                      {/* Mobile Wishlist */}
                      <motion.button 
                        className="flex items-center gap-2 px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-200 relative"
                        variants={iconButtonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">Wishlist</span>
                        <motion.div
                          className="absolute top-1 right-1 w-2 h-2 bg-rose-400 rounded-full"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.button>
                    </div>

                    {/* Contact Info & User Info */}
                    <div className="flex flex-col items-center gap-2 text-emerald-600 mt-2">
                      {user && (
                        <div className="text-sm font-medium text-center">
                          Welcome, {user.name.split(' ')[0]}!
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">Call: +254 759 405 973</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Decorative Elements */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </motion.header>
    </>
  );
}