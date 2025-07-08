'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button' // Assuming you have a Button component
import { Badge } from '@/components/ui/badge'   // Assuming you have a Badge component
import { DollarSign, Code, Calendar, Sun, Moon, LogOut, User as UserIcon, Briefcase, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function FreelancerDashboard() {
  const [gigs, setGigs] = useState<any[]>([])
  const [userApplications, setUserApplications] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { signOut } = useClerk()

  const [darkMode, setDarkMode] = useState(false)

  // Dark mode logic
  useEffect(() => {
    const savedMode = localStorage.getItem('theme')
    if (savedMode === 'dark' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  // Fetch gigs and user applications
  const fetchData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      // Fetch all available gigs
      const gigRes = await fetch('/api/show-gigs'); 
      if (!gigRes.ok) throw new Error('Failed to fetch gigs');
      const gigsData = await gigRes.json();
      setGigs(gigsData.gigs || []);

      // Fetch user's applications to determine which gigs they've applied to
      const userRes = await fetch(`/api/get-user?clerkId=${user.id}`);
      if (!userRes.ok) throw new Error('Failed to fetch user applications');
      const userData = await userRes.json();
      
      // FIX: Safely access 'applications' property using optional chaining
      const appliedGigIds = userData.user?.applications ? 
                            userData.user.applications.map((app: any) => app.gig.toString()) : [];
      setUserApplications(appliedGigIds);

    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      toast.error(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchData();
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [user, isLoaded]);

  // Handle applying to a gig
  const handleApply = async (gigId: string) => {
    if (userApplications.length >= 5) {
      toast.error('You have reached the maximum of 5 active applications.');
      return;
    }
    if (userApplications.includes(gigId)) {
      toast.error('You have already applied for this gig.');
      return;
    }

    try {
      const res = await fetch('/api/apply', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user?.id,
          gigId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Application failed. Please try again.');
      }

      toast.success('Applied successfully!');
      // Optimistically update UI
      setUserApplications(prev => [...prev, gigId]); 
    } catch (err: any) {
      console.error('Apply error:', err);
      toast.error(err.message || 'An unexpected error occurred during application.');
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/')
    } catch (err) {
      toast.error('Failed to sign out')
    }
  }

  // Determine if a gig is already applied to
  const isApplied = useCallback((gigId: string) => {
    return userApplications.includes(gigId);
  }, [userApplications]);

  // Loading and redirection states
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quickgig-light-bg dark:bg-quickgig-dark-bg text-quickgig-text-light dark:text-quickgig-text-dark">
        <p className="text-xl">Loading your gigs...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return (
      <div className="min-h-screen flex items-center justify-center bg-quickgig-light-bg dark:bg-quickgig-dark-bg text-quickgig-text-light dark:text-quickgig-text-dark">
        <p className="text-xl">Redirecting to sign in...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-quickgig-light-bg dark:bg-quickgig-dark-bg text-quickgig-text-light dark:text-quickgig-text-dark transition-colors duration-500 p-4 md:p-8">
      {/* Top Bar with Dark Mode Toggle, Profile, and Sign Out */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-extrabold text-quickgig-accent">Freelancer Dashboard</h1>
        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <motion.button
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md transition-all duration-300 hover:scale-105"
            onClick={() => setDarkMode(!darkMode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>

          {/* Profile Button */}
          <button
            onClick={() => router.push('/freelancer/profile')}
            className="hover:opacity-80 transition-opacity"
          >
            <img
              src={user?.imageUrl || '/default-avatar.png'}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-quickgig-accent"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = '/default-avatar.png';
              }}
            />
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {gigs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-7xl mx-auto">
          <p className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">No gigs available at the moment.</p>
          <p className="text-lg text-gray-500 dark:text-gray-400">Check back later for new opportunities!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {gigs.map((gig: any) => (
            <motion.div
              key={gig._id}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div>
                <h2 className="text-2xl font-bold text-quickgig-text-light dark:text-quickgig-text-dark mb-2">{gig.title}</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{gig.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="bg-quickgig-accent/20 text-quickgig-accent hover:bg-quickgig-accent/30">
                    <Briefcase size={14} className="mr-1" /> {gig.category}
                  </Badge>
                  {gig.tags?.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">
                      <Code size={14} className="mr-1" /> {tag}
                    </Badge>
                  ))}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                  <p className="flex items-center"><DollarSign size={16} className="mr-2" /> Budget: ₹{gig.budget.toLocaleString()}</p>
                  <p className="flex items-center"><Calendar size={16} className="mr-2" /> Deadline: {new Date(gig.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <Button
                disabled={isApplied(gig._id) || userApplications.length >= 5}
                onClick={() => handleApply(gig._id)}
                className={`mt-4 w-full py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg
                  ${isApplied(gig._id)
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-white' // Keep text white for disabled states
                    : userApplications.length >= 5
                      ? 'bg-red-500 dark:bg-red-600 cursor-not-allowed text-white' // Keep text white for disabled states
                      : `bg-quickgig-accent hover:bg-quickgig-accent/90 ${darkMode ? 'text-white' : 'text-gray-900'}` // Conditional text color
                  }
                `}
              >
                {isApplied(gig._id) ? (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Applied</>
                ) : userApplications.length >= 5 ? (
                  <><XCircle className="w-4 h-4 mr-2" /> Limit Reached</>
                ) : (
                  'Apply Now'
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
