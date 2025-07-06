'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sun, Moon, ArrowRight, Sparkles, Network, Globe, Briefcase, Zap } from 'lucide-react';

// THREE.JS IMPORTS
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Points, PointMaterial } from '@react-three/drei';

// Helper for cubic ease-in-out interpolation
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// 3D Animated Connection Flow Component
interface AnimatedConnectionFlow3DProps {
  darkMode: boolean;
}

function AnimatedConnectionFlow3D({ darkMode }: AnimatedConnectionFlow3DProps) {
  const pointsRef = useRef<any>();
  const { camera } = useThree();
  const mouse = useRef(new THREE.Vector2());

  const numParticles = 500; // Total number of particles
  const positions = useRef(new Float32Array(numParticles * 3));
  const colors = useRef(new Float32Array(numParticles * 4)); // R, G, B, A
  const startTimes = useRef(new Float32Array(numParticles)); // To stagger animation start
  const durations = useRef(new Float32Array(numParticles)); // Duration of each particle's life
  const startPositions = useRef(new Array(numParticles).fill(null).map(() => new THREE.Vector3()));
  const endPositions = useRef(new Array(numParticles).fill(null).map(() => new THREE.Vector3()));

  const generateRandomPosition = () => new THREE.Vector3(
    (Math.random() - 0.5) * 10, // Wider spread
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  );

  // Initialize particles once
  useEffect(() => {
    // Create a new BufferGeometry and set attributes
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions.current, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors.current, 4)); // RGBA

    if (pointsRef.current) {
      pointsRef.current.geometry = geometry; // Assign the new geometry
    }

    for (let i = 0; i < numParticles; i++) {
      startPositions.current[i].copy(generateRandomPosition());
      endPositions.current[i].copy(generateRandomPosition());
      startTimes.current[i] = Math.random() * 10; // Stagger initial start times
      durations.current[i] = 3 + Math.random() * 5; // Random duration for each particle's journey

      // Set initial position and alpha 0
      startPositions.current[i].toArray(positions.current, i * 3);
      colors.current[i * 4 + 3] = 0; // Alpha channel
    }
    // Mark attributes for update
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  }, []); // Empty dependency array means this runs once on mount

  const onMouseMove = useCallback((event: MouseEvent) => {
    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]);

  // Base color for particles, updated on dark mode change
  const particleBaseColor = useRef(new THREE.Color());
  useEffect(() => {
    particleBaseColor.current.set(darkMode ? '#FFD700' : '#8B4513'); // Gold in dark, Sienna in light
  }, [darkMode]);

  useFrame((state) => {
    // Subtle camera movement
    camera.position.x += (mouse.current.x * 0.2 - camera.position.x) * 0.02;
    camera.position.y += (mouse.current.y * 0.2 - camera.position.y) * 0.02;
    camera.position.z = 5 + Math.sin(state.clock.elapsedTime * 0.05) * 0.3;
    camera.lookAt(0, 0, 0);

    // Animate particles
    for (let i = 0; i < numParticles; i++) {
      const timeElapsed = state.clock.elapsedTime - startTimes.current[i];
      let progress = timeElapsed / durations.current[i];

      if (progress > 1) {
        // Reset particle if its journey is complete
        startPositions.current[i].copy(generateRandomPosition());
        endPositions.current[i].copy(generateRandomPosition());
        startTimes.current[i] = state.clock.elapsedTime;
        durations.current[i] = 3 + Math.random() * 5;
        progress = 0; // Reset progress
      }

      // Interpolate position using easeInOutCubic for smoother start/end
      const easedProgress = easeInOutCubic(progress);
      const currentPos = new THREE.Vector3().lerpVectors(startPositions.current[i], endPositions.current[i], easedProgress);
      currentPos.toArray(positions.current, i * 3);

      // Animate opacity: fade in, stay, fade out
      let alpha = 0;
      if (progress < 0.2) {
        alpha = progress / 0.2; // Fade in
      } else if (progress > 0.8) {
        alpha = 1 - (progress - 0.8) / 0.2; // Fade out
      } else {
        alpha = 1; // Stay opaque
      }
      alpha = Math.max(0, Math.min(1, alpha)); // Clamp between 0 and 1

      // Update color's alpha channel
      particleBaseColor.current.toArray(colors.current, i * 4); // Copy RGB
      colors.current[i * 4 + 3] = alpha; // Set alpha
    }

    if (pointsRef.current && pointsRef.current.geometry) { // Defensive check
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.color.needsUpdate = true; // Update color attribute
    }
  });

  return (
    <Points ref={pointsRef}>
      {/* Geometry and attributes are now set up in useEffect */}
      <PointMaterial
        transparent
        size={0.08} // Larger size for better visibility as flowing dots
        sizeAttenuation={true}
        depthWrite={false}
        vertexColors={true} // Crucial: tell material to use vertex colors
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}


function HomePage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [cursorX, setCursorX] = useState(0);
  const [cursorY, setCursorY] = useState(0);

  // The main headline text - NO TYPEWRITER ANIMATION
  const mainHeadlineText = "Gigs That Click. Work That Sticks.";


  useEffect(() => {
    const savedMode = localStorage.getItem('theme');
    if (savedMode === 'dark' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Custom cursor logic
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setCursorX(event.clientX);
      setCursorY(event.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);


  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden cursor-none
                    bg-quickgig-light-bg dark:bg-quickgig-dark-bg text-gray-800 dark:text-gray-100 transition-colors duration-500">

      {/* Custom Circular Cursor */}
      <motion.div
        className="fixed w-8 h-8 rounded-full border-2 pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: cursorX,
          top: cursorY,
          borderColor: '#FFFFFF', // Always white
          backgroundColor: 'rgba(255,255,255,0.1)', // Subtle white fill
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Top Navigation Bar */}
      <nav className="relative z-30 w-full flex items-center justify-between p-6 md:p-8">
        <div className="flex items-center space-x-2">
          <motion.span
            className="text-3xl font-extrabold text-quickgig-text-light dark:text-quickgig-text-dark"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            QuickGig
          </motion.span>
        </div>

        <div className="flex items-center space-x-4 md:space-x-8">
          <motion.a
            href="/sign-up"
            className="px-6 py-3 rounded-full text-lg font-semibold bg-quickgig-accent text-quickgig-text-light shadow-lg hover:shadow-xl transition-all duration-300 hidden sm:flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Sign Up <ArrowRight size={18} className="ml-2" />
          </motion.a>
          <motion.a
            href="/sign-in"
            className="px-6 py-3 rounded-full text-lg font-semibold border-2 border-quickgig-text-light dark:border-quickgig-text-dark text-quickgig-text-light dark:text-quickgig-text-dark bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-300 hidden sm:flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Sign In
          </motion.a>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md transition-all duration-300 hover:scale-105 cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col md:flex-row items-center justify-center p-6 md:p-12 relative z-10">
        {/* Left Side: Headline & Description */}
        <motion.div
          className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left mb-12 md:mb-0 md:mr-12"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-quickgig-text-light dark:text-quickgig-text-dark mb-6 leading-tight min-h-[140px] md:min-h-[180px]"> {/* Added min-height for consistent layout */}
            {mainHeadlineText} {/* Directly use the corrected headline */}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-md">
            Join a new era of freelancing. With immersive design and powerful tools, 
            QuickGig connects bold talent with bold businesses
          </p>
          <motion.button
            onClick={() => router.push('/sign-up')}
            className="px-8 py-4 rounded-full text-lg font-semibold bg-quickgig-accent text-quickgig-text-light shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Gigg’n <ArrowRight size={20} className="ml-2" />
          </motion.button>
        </motion.div>

        {/* Center: 3D Animated QuickGig Network */}
        <div className="w-full md:w-1/3 flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            className="absolute inset-0"
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.7} />
            <AnimatedConnectionFlow3D darkMode={darkMode} />
          </Canvas>
        </div>

        {/* Right Side: Secondary Text & Tags */}
        <motion.div
          className="w-full md:w-1/3 flex flex-col items-center md:items-end text-center md:text-right mt-12 md:mt-0 md:ml-12"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            Freelance. Reimagined. 
            QuickGig is where fast movers, and game changers build the future of work.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-3">
            <motion.div
              className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.3 }}
            >
              <Sparkles size={16} className="mr-1 text-quickgig-accent" /> Instant Gigs
            </motion.div>
            <motion.div
              className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.3 }}
            >
              <Network size={16} className="mr-1 text-quickgig-accent" /> Global Talent
            </motion.div>
            <motion.div
              className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.3 }}
            >
              <Briefcase size={16} className="mr-1 text-quickgig-accent" /> Seamless Projects
            </motion.div>
            <motion.div
              className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.3 }}
            >
              <Zap size={16} className="mr-1 text-quickgig-accent" /> Rapid Growth
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default HomePage;
