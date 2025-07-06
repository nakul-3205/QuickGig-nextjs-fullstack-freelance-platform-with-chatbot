'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Sun, Moon, Mail, Lock, Briefcase, TrendingUp, Zap, Chrome } from 'lucide-react';

// THREE.JS IMPORTS
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import * as THREE from 'three';

// 3D Animated Background Component
interface AnimatedBackground3DProps {
  darkMode: boolean;
}

const AnimatedBackground3D: React.FC<AnimatedBackground3DProps> = ({ darkMode }) => {
  const ref = useRef<any>();
  const count = 15000; // Even more particles for a denser network
  const positions = new Float32Array(count * 3);
  const tempVector = new THREE.Vector3();
  const gridSize = 2.5; // Size of the cube grid

  // Generate points in a structured grid within a cube
  for (let i = 0; i < count; i++) {
    tempVector.set(
      (Math.random() - 0.5) * gridSize * 2,
      (Math.random() - 0.5) * gridSize * 2,
      (Math.random() - 0.5) * gridSize * 2
    );
    tempVector.toArray(positions, i * 3);
  }

  const { camera } = useThree();
  const mouse = useRef(new THREE.Vector2());

  const onMouseMove = useCallback((event: MouseEvent) => {
    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]);

  useFrame((state, delta) => {
    // Continuous rotation for the entire network
    if (ref.current) {
      ref.current.rotation.x += delta * 0.015; // Slower, subtle rotation
      ref.current.rotation.y += delta * 0.02;
    }

    // Subtle camera movement based on mouse and time
    camera.position.x += (mouse.current.x * 0.2 - camera.position.x) * 0.05;
    camera.position.y += (mouse.current.y * 0.2 - camera.position.y) * 0.05;
    camera.position.z = 5 + Math.sin(state.clock.elapsedTime * 0.08) * 0.7; // Gentle zoom in/out, slightly more pronounced
    camera.lookAt(0, 0, 0);

    // Animate individual particle positions for "flow" or "breathing" effect
    const positionsArray = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const originalX = positions[i * 3];
      const originalY = positions[i * 3 + 1];
      const originalZ = positions[i * 3 + 2];

      // Add a sine wave offset to Y position based on time and original X/Z for variation
      positionsArray[i * 3 + 1] = originalY + Math.sin(state.clock.elapsedTime * 5 + originalX * 2 + originalZ * 2) * 0.05;
      // Add a subtle sine wave to X and Z as well for more complex movement
      positionsArray[i * 3] = originalX + Math.cos(state.clock.elapsedTime * 4 + originalY * 3) * 0.03;
      positionsArray[i * 3 + 2] = originalZ + Math.sin(state.clock.elapsedTime * 6 + originalY * 2) * 0.04;
    }
    ref.current.geometry.attributes.position.needsUpdate = true; // Tell Three.js to update geometry
  });

  // Dynamic particle color based on dark mode
  const particleColor = darkMode ? new THREE.Color('#93c5fd') : new THREE.Color('#20c997'); // Light blue in dark, vibrant green in light

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={particleColor}
        size={0.025} // Slightly larger particles for visibility
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};


function SignUpRoute() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Dark mode logic
  useEffect(() => {
    const savedMode = localStorage.getItem('theme');
    if (savedMode === 'dark' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
      console.log('Dark mode activated (useEffect 1)'); // Log for debugging
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
      console.log('Light mode activated (useEffect 1)'); // Log for debugging
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Dark mode class added to HTML (useEffect 2)'); // Log for debugging
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Dark mode class removed from HTML (useEffect 2)'); // Log for debugging
    }
  }, [darkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }
    setLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
      toast.success('Verification code sent to your email!');
    } catch (err: any) {
      console.error('Error signing up:', JSON.stringify(err, null, 2));
      toast.error(err.errors?.[0]?.longMessage || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }
    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        toast.success('Account verified and signed in!');
        router.push('/select-role');
      } else {
        console.warn('Verification status:', completeSignUp.status);
        toast.error('Verification failed. Please check your code.');
      }
    } catch (err: any) {
      console.error('Error verifying email:', JSON.stringify(err, null, 2));
      toast.error(err.errors?.[0]?.longMessage || 'Failed to verify email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/select-role',
      });
    } catch (err: any) {
      console.error('OAuth error', JSON.stringify(err, null, 2));
      toast.error(err.errors?.[0]?.longMessage || 'Failed to sign up with Google.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 dark:bg-gray-950 text-gray-900 dark:text-white">
        <svg className="animate-spin h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-blue-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md transition-all duration-300 hover:scale-105 z-20"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Left Side: Signup Form */}
      <motion.div
        className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 z-10"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-6">
            Join QuickGig
          </h1>

          {!pendingVerification ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
              </motion.div>
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className={`
                  w-full py-3 rounded-xl text-lg font-semibold
                  transition-all duration-300 ease-in-out flex items-center justify-center
                  ${loading
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
                  }
                `}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Sign Up'
                )}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300">
                A verification code has been sent to your email. Please enter it below.
              </p>
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <input
                  type="text"
                  placeholder="Verification Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 text-center tracking-widest"
                  required
                />
              </motion.div>
              <motion.button
                type="submit"
                disabled={loading}
                className={`
                  w-full py-3 rounded-xl text-lg font-semibold
                  transition-all duration-300 ease-in-out flex items-center justify-center
                  ${loading
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
                  }
                `}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Verify Email'
                )}
              </motion.button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          <motion.button
            onClick={signInWithGoogle}
            disabled={loading}
            className={`
              w-full py-3 rounded-xl text-lg font-semibold
              transition-all duration-300 ease-in-out flex items-center justify-center space-x-2
              border border-gray-300 dark:border-gray-600
              ${loading
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-md'
              }
            `}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            <Chrome size={20} />
            <span>Continue with Google</span>
          </motion.button>

          <p className="mt-6 text-gray-500 dark:text-gray-400 text-sm">
            Already have an account?{' '}
            <motion.a
              href="/sign-in"
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Log In
            </motion.a>
          </p>
        </div>
      </motion.div>

      {/* Right Side: Engaging Content / 3D Animations */}
      <motion.div
        className="hidden md:flex w-full md:w-1/2 items-center justify-center p-8 md:p-12 relative overflow-hidden rounded-l-3xl"
        style={{
          background: 'linear-gradient(135deg, var(--tw-gradient-stops))',
          '--tw-gradient-from': 'rgba(34, 197, 94, 0.9)', // emerald-500 with opacity
          '--tw-gradient-to': 'rgba(128, 0, 128, 0.9)', // purple with opacity
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to)',
        } as React.CSSProperties}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="relative z-10 text-white text-center p-4">
          <motion.h2
            className="text-5xl font-extrabold mb-4 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0, y: [0, -5, 0] }}
            transition={{ delay: 0.9, duration: 0.6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', repeatDelay: 2 }}
          >
            Unlock Your Potential with QuickGig.
          </motion.h2>
          <motion.p
            className="text-xl opacity-90 mb-8 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, y: [0, 5, 0] }}
            transition={{ delay: 1.1, duration: 0.6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', repeatDelay: 2 }}
          >
            Connect with top talent or find your dream projects.
            Seamlessly, securely, and stylishly.
          </motion.p>
          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-center text-lg font-semibold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              <Briefcase size={24} className="mr-3" /> Post & Discover Gigs
            </motion.div>
            <motion.div
              className="flex items-center justify-center text-lg font-semibold"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <TrendingUp size={24} className="mr-3" /> Grow Your Business
            </motion.div>
            <motion.div
              className="flex items-center justify-center text-lg font-semibold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.7, duration: 0.5 }}
            >
              <Zap size={24} className="mr-3" /> Find Top Talent
            </motion.div>
          </div>
        </div>

        {/* 3D Canvas for Three.js particles */}
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          className="absolute inset-0 z-0"
          style={{
            background: 'transparent', // Canvas background is transparent to show CSS gradient
            borderRadius: '0 1.5rem 1.5rem 0',
          }}
        >
          {/* Ambient light to ensure particles are visible */}
          <ambientLight intensity={0.5} />
          {/* Directional light for subtle shading */}
          <directionalLight position={[1, 1, 1]} intensity={0.8} />
          <AnimatedBackground3D darkMode={darkMode} />
        </Canvas>
      </motion.div>
    </div>
  );
}

export default SignUpRoute;
