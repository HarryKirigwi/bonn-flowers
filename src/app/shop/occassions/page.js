'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// 3D Background Component (copied from FeaturedProducts.js)
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

const flowerData = {
  wedding: {
    title: "Wedding Collection",
    subtitle: "Elegant blooms for your special day",
    flowers: [
      {
        name: "White Delphiniums",
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 2,500"
      },
      {
        name: "White Carnations",
        images: [
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 1,800"
      }
    ],
    color: "emerald",
    bgGradient: "from-emerald-900 via-teal-800 to-green-900"
  },
  birthdays: {
    title: "Birthday Collection",
    subtitle: "Vibrant flowers to celebrate life",
    flowers: [
      {
        name: "Pink Carnations",
        images: [
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 1,500"
      },
      {
        name: "Yellow Carnations",
        images: [
          "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 1,600"
      }
    ],
    color: "pink",
    bgGradient: "from-pink-900 via-rose-800 to-purple-900"
  },
  anniversaries: {
    title: "Anniversary Collection",
    subtitle: "Romantic blooms for love that lasts",
    flowers: [
      {
        name: "Red Carnations",
        images: [
          "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 2,200"
      },
      {
        name: "Pink Carnations",
        images: [
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 1,900"
      }
    ],
    color: "red",
    bgGradient: "from-red-900 via-rose-800 to-pink-900"
  },
  graduations: {
    title: "Graduation Collection",
    subtitle: "Celebrate achievements with beautiful blooms",
    flowers: [
      {
        name: "Blue Delphiniums",
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&sat=-100&hue=240",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&sat=-100&hue=240&auto=format&q=80",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&sat=-100&hue=240",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&sat=-100&hue=240&auto=format&q=80"
        ],
        price: "KSh 2,800"
      },
      {
        name: "Purple Carnations",
        images: [
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&sat=100&hue=270",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&sat=100&hue=270&auto=format&q=80",
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop&sat=100&hue=270",
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop&sat=100&hue=270&auto=format&q=80"
        ],
        price: "KSh 1,700"
      }
    ],
    color: "blue",
    bgGradient: "from-blue-900 via-indigo-800 to-purple-900"
  },
  baby_showers: {
    title: "Baby Shower Collection",
    subtitle: "Soft, gentle blooms for new beginnings",
    flowers: [
      {
        name: "Baby Blue Delphiniums",
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&sat=-50&bright=120",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&sat=-50&bright=120&auto=format&q=80",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&sat=-50&bright=120",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&sat=-50&bright=120&auto=format&q=80"
        ],
        price: "KSh 2,000"
      },
      {
        name: "Pink Carnations",
        images: [
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 1,500"
      }
    ],
    color: "sky",
    bgGradient: "from-sky-900 via-blue-800 to-cyan-900"
  },
  valentines: {
    title: "Valentine's Collection",
    subtitle: "Express your love with passionate blooms",
    flowers: [
      {
        name: "Red Carnations",
        images: [
          "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 2,500"
      },
      {
        name: "Pink Carnations",
        images: [
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 2,200"
      }
    ],
    color: "rose",
    bgGradient: "from-rose-900 via-red-800 to-pink-900"
  },
  proposals: {
    title: "Proposal Collection",
    subtitle: "Perfect blooms for life's most important question",
    flowers: [
      {
        name: "White Delphiniums",
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 3,500"
      },
      {
        name: "Red Carnations",
        images: [
          "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 3,200"
      }
    ],
    color: "amber",
    bgGradient: "from-amber-900 via-orange-800 to-red-900"
  },
  funerals: {
    title: "Funeral Collection",
    subtitle: "Dignified blooms to honor loved ones",
    flowers: [
      {
        name: "White Carnations",
        images: [
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 2,000"
      },
      {
        name: "White Delphiniums",
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 2,800"
      }
    ],
    color: "slate",
    bgGradient: "from-slate-900 via-gray-800 to-stone-900"
  },
  hospital_visits: {
    title: "Hospital Visit Collection",
    subtitle: "Cheerful blooms to brighten recovery",
    flowers: [
      {
        name: "Yellow Carnations",
        images: [
          "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 1,400"
      },
      {
        name: "Pink Carnations",
        images: [
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 1,300"
      }
    ],
    color: "yellow",
    bgGradient: "from-yellow-900 via-amber-800 to-orange-900"
  },
  condolence: {
    title: "Condolence Collection",
    subtitle: "Peaceful arrangements for sympathy",
    flowers: [
      {
        name: "White Carnations",
        images: [
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 1,800"
      },
      {
        name: "Purple Carnations",
        images: [
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&sat=100&hue=270",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&sat=100&hue=270&auto=format&q=80",
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop&sat=100&hue=270",
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop&sat=100&hue=270&auto=format&q=80"
        ],
        price: "KSh 1,600"
      }
    ],
    color: "violet",
    bgGradient: "from-violet-900 via-purple-800 to-indigo-900"
  },
  memorials: {
    title: "Memorial Collection",
    subtitle: "Beautiful tributes to cherished memories",
    flowers: [
      {
        name: "White Delphiniums",
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 2,500"
      },
      {
        name: "Proteas Safari Sunset",
        images: [
          "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 3,200"
      }
    ],
    color: "stone",
    bgGradient: "from-stone-900 via-neutral-800 to-gray-900"
  },
  church_services: {
    title: "Church Services Collection",
    subtitle: "Sacred blooms for worship and celebration",
    flowers: [
      {
        name: "White Carnations",
        images: [
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 2,000"
      },
      {
        name: "Purple Carnations",
        images: [
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&sat=100&hue=270",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&sat=100&hue=270&auto=format&q=80",
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop&sat=100&hue=270",
          "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=400&h=500&fit=crop&sat=100&hue=270&auto=format&q=80"
        ],
        price: "KSh 1,800"
      }
    ],
    color: "indigo",
    bgGradient: "from-indigo-900 via-blue-800 to-purple-900"
  },
  easter_christmas: {
    title: "Easter & Christmas Collection",
    subtitle: "Festive blooms for sacred celebrations",
    flowers: [
      {
        name: "White Delphiniums",
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 2,800"
      },
      {
        name: "Red Carnations",
        images: [
          "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 2,400"
      }
    ],
    color: "green",
    bgGradient: "from-green-900 via-emerald-800 to-teal-900"
  },
  home_decor: {
    title: "Home Decor Collection",
    subtitle: "Beautiful blooms to enhance your living space",
    flowers: [
      {
        name: "Proteas Safari Sunset",
        images: [
          "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 3,500"
      },
      {
        name: "Yellow Carnations",
        images: [
          "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 1,800"
      }
    ],
    color: "orange",
    bgGradient: "from-orange-900 via-amber-800 to-yellow-900"
  },
  office_spaces: {
    title: "Office Spaces Collection",
    subtitle: "Professional blooms for workplace elegance",
    flowers: [
      {
        name: "White Carnations",
        images: [
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400&h=500&fit=crop&auto=format&q=80",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&auto=format&q=80"
        ],
        price: "KSh 2,200"
      },
      {
        name: "Blue Delphiniums",
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&sat=-100&hue=240",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&sat=-100&hue=240&auto=format&q=80",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&sat=-100&hue=240",
          "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=500&fit=crop&sat=-100&hue=240&auto=format&q=80"
        ],
        price: "KSh 3,000"
      }
    ],
    color: "cyan",
    bgGradient: "from-cyan-900 via-blue-800 to-indigo-900"
  }
};

export default function FlowerGallery() {
  const [selectedCategory, setSelectedCategory] = useState('wedding');
  const [selectedFlower, setSelectedFlower] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 300 / 300, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating flower petals
    const petals = [];
    const petalGeometry = new THREE.RingGeometry(0.05, 0.15, 8);
    
    for (let i = 0; i < 20; i++) {
      const petalMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.8, 0.6, 0.7),
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
    setIsLoaded(true);

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

  const currentData = flowerData[selectedCategory];
  const categories = Object.keys(flowerData);

  const categoryVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: { 
      scale: 1.05,
      y: -10,
      transition: { duration: 0.3 }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingPetals3D />
      <div className="relative z-10">
        {/* SEO-optimized structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Premium Flower Collections",
              "description": "Premium flower arrangements for weddings, birthdays, anniversaries and special occasions in Kenya",
              "brand": "Kenya Premium Flowers",
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "KES",
                "lowPrice": "1300",
                "highPrice": "3500"
              }
            })
          }}
        />

        {/* Header with 3D Elements */}
        <div className="relative pt-20 pb-12">
          <div className="absolute top-10 right-10 z-10">
            <div ref={mountRef} className="w-72 h-72 opacity-60" />
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={categoryVariants}
              className="text-center mb-12"
            >
              <motion.h1 
                className="text-5xl lg:text-7xl font-bold mb-6 text-emerald-900"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                Flower Gallery
              </motion.h1>
              
              <motion.p 
                className="text-xl lg:text-2xl text-emerald-800 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Discover our premium collection of fresh flowers, carefully curated for every special occasion
              </motion.p>

              <motion.div
                className="flex items-center justify-center gap-6 text-emerald-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Same-Day Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Fresh from Kenya</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Premium Quality</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Category Navigation */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 backdrop-blur-sm border ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/25'
                      : 'bg-white/80 text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {flowerData[category].title}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Current Category Header */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12">
          <motion.div
            key={selectedCategory}
            initial="hidden"
            animate="visible"
            variants={categoryVariants}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-emerald-900">
              {currentData.title}
            </h2>
            <p className="text-xl text-emerald-800 max-w-2xl mx-auto">
              {currentData.subtitle}
            </p>
          </motion.div>
        </div>

        {/* Flower Grid */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
          <motion.div
            key={selectedCategory}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-12"
          >
            {currentData.flowers.map((flower, flowerIndex) => (
              <motion.div
                key={`${selectedCategory}-${flowerIndex}`}
                variants={categoryVariants}
                transition={{ delay: flowerIndex * 0.2 }}
                className="space-y-6"
              >
                {/* Flower Name Header */}
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {flower.name}
                  </h3>
                  <div className="flex items-center justify-center gap-4 text-gray-300">
                    <span className="text-2xl font-bold text-emerald-400">
                      {flower.price}
                    </span>
                    <span className="text-sm">per arrangement</span>
                  </div>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {flower.images.map((image, imageIndex) => (
                    <motion.div
                      key={imageIndex}
                      variants={cardVariants}
                      whileHover="hover"
                      className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-2xl"
                      onClick={() => {
                        setSelectedFlower({ ...flower, flowerIndex });
                        setSelectedImageIndex(imageIndex);
                      }}
                    >
                      <div className="aspect-[4/5] bg-gray-800">
                        <img
                          src={image}
                          alt={`${flower.name} arrangement ${imageIndex + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                        <div className="text-white">
                          <p className="font-semibold">View Details</p>
                          <p className="text-sm text-gray-300">Click to enlarge</p>
                        </div>
                      </div>

                      {/* Floating Badge */}
                      <div className={`absolute top-4 right-4 bg-${currentData.color}-500 text-white px-3 py-1 rounded-full text-xs font-medium`}>
                        #{imageIndex + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <motion.button
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-full shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add to Cart
                  </motion.button>
                  
                  <motion.button
                    className="px-8 py-3 border-2 border-emerald-500 text-emerald-700 font-semibold rounded-full backdrop-blur-sm hover:bg-emerald-50 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Quick Order
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Image Modal */}
        <AnimatePresence>
          {selectedFlower && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFlower(null)}
            >
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={selectedFlower.images[selectedImageIndex]}
                    alt={`${selectedFlower.name} arrangement`}
                    className="w-full h-96 object-cover"
                  />
                  
                  <button
                    onClick={() => setSelectedFlower(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-3xl font-bold text-emerald-900">
                        {selectedFlower.name}
                      </h3>
                      <p className="text-emerald-700">
                        Perfect for {currentData.title.toLowerCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-emerald-600">
                        {selectedFlower.price}
                      </div>
                      <p className="text-emerald-600">per arrangement</p>
                    </div>
                  </div>

                  {/* Image Thumbnails */}
                  <div className="flex gap-4 mb-8">
                    {selectedFlower.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? `border-${currentData.color}-500`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${selectedFlower.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🌱</div>
                      <h4 className="font-semibold">Fresh Daily</h4>
                      <p className="text-gray-600 text-sm">Picked fresh from our farms</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">🚚</div>
                      <h4 className="font-semibold">Same-Day Delivery</h4>
                      <p className="text-gray-600 text-sm">Delivered across Nairobi</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">💝</div>
                      <h4 className="font-semibold">Gift Wrapped</h4>
                      <p className="text-gray-600 text-sm">Beautiful presentation included</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <motion.button
                      className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-full shadow-lg transition-all duration-300"
                      whileTap={{ scale: 0.98 }}
                    >
                      Add to Cart - {selectedFlower.price}
                    </motion.button>
                    
                    <motion.button
                      className="px-8 py-4 border-2 border-emerald-500 text-emerald-700 font-semibold rounded-full hover:bg-emerald-50 transition-all duration-300"
                      whileTap={{ scale: 0.98 }}
                    >
                      Add to Wishlist
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Decorative Elements */}
        <motion.div
          className="fixed top-20 left-10 w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full backdrop-blur-sm pointer-events-none"
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
        
        <motion.div
          className="fixed top-1/2 right-10 w-12 h-12 bg-gradient-to-br from-rose-400/20 to-pink-500/20 rounded-full backdrop-blur-sm pointer-events-none"
          animate={{ 
            y: [0, 20, 0],
            x: [0, -10, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="fixed bottom-32 left-1/4 w-14 h-14 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full backdrop-blur-sm pointer-events-none"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
}