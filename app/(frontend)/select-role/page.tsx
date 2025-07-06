'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'
import { motion } from 'framer-motion';
import { User, Briefcase, Sun, Moon, CheckCircle } from 'lucide-react';

// THREE.JS IMPORTS
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import * as THREE from 'three';

type Roles = 'client' | 'freelancer';

// 3D Animated Background Component
interface AnimatedBackground3DProps {
  darkMode: boolean;
}

const AnimatedBackground3D: React.FC<AnimatedBackground3DProps> = ({ darkMode }) => {
  const ref = useRef<any>();
  const count = 15000;
  const positions = new Float32Array(count * 3);
  const tempVector = new THREE.Vector3();
  const gridSize = 2.5;

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
    if (ref.current) {
      ref.current.rotation.x += delta * 0.015;
      ref.current.rotation.y += delta * 0.02;
    }

    camera.position.x += (mouse.current.x * 0.2 - camera.position.x) * 0.05;
    camera.position.y += (mouse.current.y * 0.2 - camera.position.y) * 0.05;
    camera.position.z = 5 + Math.sin(state.clock.elapsedTime * 0.08) * 0.7;
    camera.lookAt(0, 0, 0);

    const positionsArray = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const originalX = positions[i * 3];
      const originalY = positions[i * 3 + 1];
      const originalZ = positions[i * 3 + 2];

      positionsArray[i * 3 + 1] = originalY + Math.sin(state.clock.elapsedTime * 5 + originalX * 2 + originalZ * 2) * 0.05;
      positionsArray[i * 3] = originalX + Math.cos(state.clock.elapsedTime * 4 + originalY * 3) * 0.03;
      positionsArray[i * 3 + 2] = originalZ + Math.sin(state.clock.elapsedTime * 6 + originalY * 2) * 0.04;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  const particleColor = darkMode ? new THREE.Color('#93c5fd') : new THREE.Color('#20c997');

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={particleColor}
        size={0.025}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};


interface RoleCardProps {
  roleType: Roles;
  title: string;
  description: string;
  icon: React.ElementType;
  isSelected: boolean;
  onSelect: (role: Roles) => void;
  isDisabled: boolean;
}

const RoleCard: React.FC<RoleCardProps> = ({
  roleType,
  title,
  description,
  icon: Icon,
  isSelected,
  onSelect,
  isDisabled,
}) => {
  return (
    <motion.div
      className={`
        relative flex flex-col items-center p-8 rounded-2xl cursor-pointer
        transition-all duration-300 ease-in-out
        border-2 ${isSelected ? 'border-emerald-500 dark:border-emerald-400' : 'border-gray-200 dark:border-gray-800'}
        bg-white dark:bg-gray-800
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:scale-[1.02]'}
      `}
      onClick={() => !isDisabled && onSelect(roleType)}
      whileHover={{ scale: isDisabled ? 1 : 1.02, boxShadow: isDisabled ? 'none' : '0 10px 20px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isSelected && (
        <motion.div
          className="absolute top-4 right-4 text-emerald-500 dark:text-emerald-400"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <CheckCircle size={24} />
        </motion.div>
      )}
      <div className="mb-4 text-emerald-500 dark:text-emerald-400">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
        {description}
      </p>
    </motion.div>
  );
};


function SelecRolePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Roles | null>(null);
  const [darkMode, setDarkMode] = useState(false);

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

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
        return;
      }
      // Check if user already has a role
      if (user.publicMetadata?.role) {
        const role = user.publicMetadata.role as Roles;
        const redirectTo = role === 'client' ? '/client/dashboard' : '/freelancer/dashboard';
        router.push(redirectTo);
        toast.success(`Welcome back! Redirecting to your ${role} dashboard.`);
        return;
      }
    }
  }, [user, isLoaded, router]);

  const handleRoleSelection = async (role: Roles) => {
    setLoading(true)
    try {
      setSelectedRole(role); // Update local state for UI selection

      // THIS IS THE CRITICAL LINE FOR CLERK METADATA UPDATE
      await user?.update({
         unsafeMetadata: { role }
        // publicMetadata: { role }
      });

      toast.success(`Role set as ${role}! Redirecting to your dashboard.`);
             console.log('rederceting ')
      setTimeout(() => {
        if (role === 'client') {
          router.push('/client/dashboard')
        }
        if (role === 'freelancer') {
          router.push('/freelancer/dashboard')
        }
        setLoading(false)
      }, 1000);
       console.log('redett')
    } catch (error) {
      console.error('Error updating user role in Clerk:', error);
      toast.error('Failed to set role. Please try again.');
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 dark:bg-gray-950 text-gray-900 dark:text-white">
        <svg className="animate-spin h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-medium">Loading your experience...</p>
      </div>
    );
  }

  if (!user || user.publicMetadata?.role) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300 p-4">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md transition-all duration-300 hover:scale-105 z-20"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-4">
          Welcome to QuickGig!
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          To get started, please tell us how you plan to use our platform.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8 mb-10">
        <RoleCard
          roleType="client"
          title="I'm a Client"
          description="Hire top talent for your projects, manage tasks, and collaborate seamlessly."
          icon={Briefcase}
          isSelected={selectedRole === 'client'}
          onSelect={setSelectedRole}
          isDisabled={loading}
        />
        <RoleCard
          roleType="freelancer"
          title="I'm a Freelancer"
          description="Showcase your skills, find exciting projects, and grow your career."
          icon={User}
          isSelected={selectedRole === 'freelancer'}
          onSelect={setSelectedRole}
          isDisabled={loading}
        />
      </div>

      <motion.button
        onClick={() => handleRoleSelection(selectedRole as Roles)}
        disabled={!selectedRole || loading}
        className={`
          px-10 py-4 rounded-full text-lg font-semibold
          transition-all duration-300 ease-in-out
          ${!selectedRole || loading
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
          }
        `}
        whileHover={{ scale: (!selectedRole || loading) ? 1 : 1.05 }}
        whileTap={{ scale: (!selectedRole || loading) ? 1 : 0.95 }}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Confirming Role...
          </span>
        ) : (
          `Continue as ${selectedRole ? (selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)) : '...'}`
        )}
      </motion.button>

      <p className="mt-8 text-gray-500 dark:text-gray-400 text-sm">
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
  );
}

export default SelecRolePage;
