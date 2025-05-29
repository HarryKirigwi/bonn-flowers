"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Star,
  Filter,
  Search,
  X,
  ChevronDown,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Palette,
  Tag,
  Info,
  Plus,
  Minus,
  ArrowLeft,
  Grid,
  List,
} from "lucide-react";
import * as THREE from "three";
import { useCart } from "@/context/CartContext";

const getFeaturedProducts = async () => {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Enhanced 3D Background Component
const FloatingFloralElements3D = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating floral elements
    const floralElements = [];
    const colors = [
      { h: 0.0, s: 0.8, l: 0.6 }, // Red
      { h: 0.9, s: 0.7, l: 0.8 }, // Pink
      { h: 0.65, s: 0.8, l: 0.7 }, // Blue
      { h: 0.55, s: 0.6, l: 0.8 }, // Baby Blue
      { h: 0.0, s: 0.0, l: 0.95 }, // White
      { h: 0.08, s: 0.9, l: 0.7 }, // Orange
      { h: 0.75, s: 0.6, l: 0.7 }, // Purple
      { h: 0.15, s: 0.8, l: 0.7 }, // Yellow
      { h: 0.3, s: 0.6, l: 0.5 }, // Green
    ];

    // Create different shapes representing different flower types
    const createFloralGeometry = (type) => {
      switch (type) {
        case "delphinium":
          // Tall spike shape
          return new THREE.ConeGeometry(0.05, 0.3, 6);
        case "rose":
          // Classic rose shape
          return new THREE.SphereGeometry(0.12, 8, 6);
        case "carnation":
          // Ruffled shape
          return new THREE.OctahedronGeometry(0.1);
        case "hydrangea":
          // Cluster shape
          return new THREE.IcosahedronGeometry(0.15);
        case "protea":
          // Exotic shape
          return new THREE.DodecahedronGeometry(0.13);
        default:
          return new THREE.TetrahedronGeometry(0.1);
      }
    };

    const flowerTypes = [
      "delphinium",
      "rose",
      "carnation",
      "hydrangea",
      "protea",
    ];

    for (let i = 0; i < 35; i++) {
      const flowerType =
        flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex];

      const geometry = createFloralGeometry(flowerType);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(color.h, color.s, color.l),
        transparent: true,
        opacity: Math.random() * 0.4 + 0.2,
        wireframe: Math.random() > 0.7,
      });

      const element = new THREE.Mesh(geometry, material);
      element.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15
      );

      element.userData = {
        rotationSpeedX: (Math.random() - 0.5) * 0.015,
        rotationSpeedY: (Math.random() - 0.5) * 0.015,
        rotationSpeedZ: (Math.random() - 0.5) * 0.015,
        floatSpeedY: Math.random() * 0.008 + 0.003,
        floatSpeedX: Math.random() * 0.006 + 0.002,
        initialY: element.position.y,
        initialX: element.position.x,
        initialZ: element.position.z,
        colorIndex: colorIndex,
        flowerType: flowerType,
      };

      scene.add(element);
      floralElements.push(element);
    }

    camera.position.z = 10;
    camera.position.y = 3;
    sceneRef.current = { scene, camera, renderer, floralElements, colors };

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      floralElements.forEach((element, index) => {
        // Rotation animation
        element.rotation.x += element.userData.rotationSpeedX;
        element.rotation.y += element.userData.rotationSpeedY;
        element.rotation.z += element.userData.rotationSpeedZ;

        // Floating animation
        element.position.y =
          element.userData.initialY + Math.sin(time + index * 0.5) * 1.2;
        element.position.x =
          element.userData.initialX + Math.sin(time * 0.6 + index * 0.4) * 0.8;
        element.position.z =
          element.userData.initialZ + Math.cos(time * 0.4 + index * 0.6) * 0.5;

        // Color shifting
        const colorCycleSpeed = 0.2;
        const colorOffset =
          Math.sin(time * colorCycleSpeed + index * 0.7) * 0.5 + 0.5;
        const nextColorIndex =
          (element.userData.colorIndex + 1) % colors.length;
        const currentColor = colors[element.userData.colorIndex];
        const nextColor = colors[nextColorIndex];

        const mixedColor = new THREE.Color().setHSL(
          currentColor.h + (nextColor.h - currentColor.h) * colorOffset,
          currentColor.s + (nextColor.s - currentColor.s) * colorOffset * 0.5,
          currentColor.l + (nextColor.l - currentColor.l) * colorOffset * 0.3
        );

        element.material.color = mixedColor;
        element.material.opacity = 0.2 + Math.sin(time * 0.3 + index) * 0.3;

        // Scale pulsing
        const scaleOffset = Math.sin(time * 0.8 + index * 0.5) * 0.3 + 1;
        element.scale.setScalar(scaleOffset);
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

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
};

// Main Flower Collection Component
const FlowerCollection = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState(new Set());
  const [error, setError] = useState(null);
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);
        const data = await getFeaturedProducts();
        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (error) {
        console.error("Error loading products:", error);
        setError("Failed to load products. Please try again.");
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter and search products
  useEffect(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description &&
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (product.tags &&
          Array.isArray(product.tags) &&
          product.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesColor =
        selectedColor === "All" || product.color === selectedColor;

      return matchesSearch && matchesCategory && matchesColor;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedColor, sortBy]);

  const categories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  const colors = [
    "All",
    ...new Set(products.map((p) => p.color).filter(Boolean)),
  ];

  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const ProductCard = ({ product }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
    >
      <div className="relative overflow-hidden">
        <img
          src={product.imageUrl || "/images/products/placeholder.jpg"}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.target.src = "/images/products/placeholder.jpg";
          }}
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleFavorite(product.id)}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              favorites.has(product.id)
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white"
            }`}
          >
            <Heart size={16} />
          </motion.button>
        </div>
        <div className="absolute top-3 left-3">
          {product.featured && (
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Sparkles size={12} />
              Featured
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.inStock
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {product.inStock ? "In stock" : "Out of stock"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
          <span className="text-lg font-bold text-purple-600">
            KES {product.price}{" "}
            <span className="text-xs font-normal text-gray-500">per stem</span>
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description || "No description available"}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating || 0}</span>
            <span className="text-sm text-gray-500">
              ({product.reviews || 0})
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {product.origin || "Unknown"}
          </span>
        </div>

        <div className="flex gap-2 mb-4">
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
            {product.category || "Uncategorized"}
          </span>
          {product.color && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
              {product.color}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedProduct(product)}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium transition-all hover:shadow-lg"
          >
            <Info size={16} className="inline mr-1" />
            Details
          </motion.button>
          {cartItems[product.id] ? (
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (cartItems[product.id] <= 1) {
                    removeFromCart(product.id);
                  } else {
                    updateQuantity(product.id, cartItems[product.id] - 1);
                  }
                }}
                className="p-2 bg-red-500 text-white rounded-lg cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </motion.button>
              <span className="font-medium">{cartItems[product.id]}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => updateQuantity(product.id, cartItems[product.id] + 1)}
                className="p-2 bg-green-500 text-white rounded-lg cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </motion.button>
              <span className="ml-2 text-emerald-600 font-semibold">Added</span>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(product, 1)}
              className="p-2 bg-green-500 text-white rounded-lg cursor-pointer"
              disabled={!product.inStock}
              aria-label="Add to Cart"
            >
              <ShoppingCart size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const ProductModal = ({ product, onClose }) => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all"
            >
              <X size={20} />
            </button>

            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img
                    src={product.imageUrl || "/images/products/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/images/products/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {product.gallery && product.gallery.length > 0 ? (
                    product.gallery.map((img, index) => (
                      <img
                        key={index}
                        src={img || "/images/products/placeholder.jpg"}
                        alt={`${product.name} ${index + 1}`}
                        className="aspect-square rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = "/images/products/placeholder.jpg";
                        }}
                      />
                    ))
                  ) : (
                    <img
                      src={
                        product.imageUrl || "/images/products/placeholder.jpg"
                      }
                      alt={`${product.name} additional view`}
                      className="aspect-square rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = "/images/products/placeholder.jpg";
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h2>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl font-bold text-purple-600">
                      KES {product.price}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{product.rating}</span>
                      <span className="text-gray-500">
                        ({product.reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Product Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={16} className="text-gray-500" />
                      <span className="font-medium text-sm">Origin</span>
                    </div>
                    <span className="text-gray-700">{product.origin}</span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="font-medium text-sm">Seasonality</span>
                    </div>
                    <span className="text-gray-700">{product.seasonality}</span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={16} className="text-gray-500" />
                      <span className="font-medium text-sm">Vase Life</span>
                    </div>
                    <span className="text-gray-700">{product.vaseLife}</span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Palette size={16} className="text-gray-500" />
                      <span className="font-medium text-sm">Color</span>
                    </div>
                    <span className="text-gray-700">{product.color}</span>
                  </div>
                </div>

                {/* Care Instructions */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Care Instructions
                  </h4>
                  <p className="text-blue-800 text-sm">{product.care}</p>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stock Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Availability</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.inStock
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.inStock
                        ? `${product.stockQuantity} in stock`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleFavorite(product.id)}
                    className={`p-3 rounded-xl transition-all ${
                      favorites.has(product.id)
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white"
                    }`}
                  >
                    <Heart size={20} />
                  </motion.button>

                  {cartItems[product.id] ? (
                    <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          updateQuantity(product.id, cartItems[product.id] - 1)
                        }
                        className="p-2 bg-red-500 text-white rounded-lg"
                        disabled={cartItems[product.id] <= 1}
                      >
                        <Minus size={16} />
                      </motion.button>
                      <span className="font-medium px-4">
                        {cartItems[product.id]}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          updateQuantity(product.id, cartItems[product.id] + 1)
                        }
                        className="p-2 bg-green-500 text-white rounded-lg"
                      >
                        <Plus size={16} />
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addToCart(product, 1)}
                      disabled={!product.inStock}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      Add to Cart
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading beautiful flowers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative">
      <FloatingFloralElements3D />

      {/* Header */}
      <div className="relative z-10 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Flower Collection
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover our premium selection of fresh flowers from around the
              world
            </p>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg"
          >
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search flowers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Color Filter */}
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {filteredProducts.length} flowers found
                </span>
                {Object.keys(cartItems).length > 0 && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    {Object.values(cartItems).reduce(
                      (sum, quantity) => sum + quantity,
                      0
                    )}{" "}
                    items in cart
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </motion.div>
          {/* Products Grid */}
          <motion.div
            layout
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
          {filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-500 text-lg">
                No flowers match your criteria
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default FlowerCollection;
