'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { Pencil, User as UserIcon, Mail, Code, Link as LinkIcon, Briefcase, Sun, Moon, ArrowLeft, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react'

// Updated interface to match your backend's GET /api/applied-gigs response structure
interface AppliedGig {
  applicationId: string; // Corresponds to app._id from backend
  gigId: string;         // Corresponds to app.gig?._id from backend
  gigTitle: string;      // Corresponds to app.gig?.title from backend
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: string;     // Corresponds to app.createdAt from backend
  // Note: 'deadline' from the gig itself is not directly in your backend's appliedGigs map,
  // so we will use 'appliedAt' for display or assume it's handled elsewhere.
}

export default function FreelancerProfilePage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  const [darkMode, setDarkMode] = useState(false)

  const [data, setData] = useState<any>(null)
  const [editMode, setEditMode] = useState(false)
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('')
  const [portfolio, setPortfolio] = useState('')

  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

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

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded || !user?.id) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/applied-gigs?clerkId=${user.id}`)
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to load profile')
        }
        const json = await res.json()
        
        
        setData(json); 
        setBio(json.bio || '');
        setSkills((json.skills || []).join(', '));
        setPortfolio(json.portfoliosite || '');
      } catch (err: any) {
        toast.error(err.message || 'Failed to load profile')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user, isLoaded])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      // Your PUT endpoint for profile updates is /api/applied-gigs
      const res = await fetch('/api/applied-gigs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user?.id,
          bio,
          skills: skills.split(',').map((s) => s.trim()).filter(s => s !== ''),
          portfoliosite: portfolio,
        }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Update failed')
      }
      toast.success('Profile updated successfully!')
      setEditMode(false)
      const updatedData = await res.json()
      // Assuming your PUT response returns an object with a 'user' key containing updated fields
      setData((prev: any) => ({
        ...prev,
        bio: updatedData.user.bio, 
        skills: updatedData.user.skills,
        portfoliosite: updatedData.user.portfoliosite,
      }))
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error updating profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const removeApplication = async (applicationId: string) => { 
    

   
    const confirmed = true; 
    if (!confirmed) {
      return;
    }

    try {
      
      const res = await fetch('/api/applied-gigs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ clerkId: user?.id, gigId: applicationId }), 
        body: JSON.stringify({ applicationId }),

      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to remove application')
      }
      toast.success('Application withdrawn successfully!')
      // Filter out the withdrawn application from the state
      setData((prev: any) => ({
        ...prev,
        appliedGigs: prev.appliedGigs.filter((app: AppliedGig) => app.applicationId !== applicationId),
      }))
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to remove application')
    }
  }

  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'text-green-500 dark:text-green-400';
      case 'rejected': return 'text-red-500 dark:text-red-400';
      case 'withdrawn': return 'text-yellow-500 dark:text-yellow-400';
      case 'pending':
      default: return 'text-blue-500 dark:text-blue-400';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return <CheckCircle size={16} className="inline mr-1" />;
      case 'rejected': return <XCircle size={16} className="inline mr-1" />;
      case 'withdrawn': return <Trash2 size={16} className="inline mr-1" />;
      case 'pending':
      default: return <Clock size={16} className="inline mr-1" />;
    }
  }, []);


  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quickgig-light-bg dark:bg-quickgig-dark-bg text-quickgig-text-light dark:text-quickgig-text-dark">
        <p className="text-xl">Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return (
      <div className="min-h-screen flex items-center justify-center bg-quickgig-light-bg dark:bg-quickgig-dark-bg text-quickgig-text-light dark:text-quickgig-text-dark">
        <p className="text-xl">Please sign in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-quickgig-light-bg dark:bg-quickgig-dark-bg text-quickgig-text-light dark:text-quickgig-text-dark transition-colors duration-500 p-4 md:p-8">
      {/* Floating Dark Mode Toggle */}
      <motion.button
        className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md transition-all duration-300 hover:scale-105 z-50"
        onClick={() => setDarkMode(!darkMode)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Moon size={20} /> : <Sun size={20} />}
      </motion.button>

      {/* Top Bar: Dashboard Button */}
      <div className="max-w-4xl mx-auto flex justify-end items-center mb-8 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        <Button
          onClick={() => router.push('/freelancer/dashboard')}
          className="bg-quickgig-accent hover:bg-quickgig-accent/90 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
        >
          <ArrowLeft size={18} className="mr-2" /> Go to Dashboard
        </Button>
      </div>

      {/* Profile Card */}
      <motion.div
        className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-3xl border border-gray-200 dark:border-gray-800 p-8 md:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-extrabold mb-8 text-quickgig-accent text-center">
          Freelancer Profile
        </h1>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <motion.img
            src={user.imageUrl || '/default-avatar.png'}
            alt="Profile Avatar"
            className="w-20 h-20 rounded-full border-4 border-quickgig-accent object-cover shadow-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.src = '/default-avatar.png';
            }}
          />
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold text-quickgig-text-light dark:text-quickgig-text-dark mb-1">
              {user.fullName || user.username || 'Your Name'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 flex items-center justify-center sm:justify-start">
              <Mail size={18} className="mr-2 text-quickgig-accent" /> {user.emailAddresses[0]?.emailAddress}
            </p>
            <p className="text-md text-gray-500 dark:text-gray-400">
              <UserIcon size={16} className="inline mr-1 text-quickgig-accent" /> Freelancer
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-quickgig-accent hover:bg-quickgig-accent/10 dark:hover:bg-quickgig-accent/20"
              onClick={() => setEditMode(!editMode)}
            >
              <Pencil className="w-4 h-4 mr-2" /> {editMode ? 'View Profile' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="space-y-6 mb-8">
          {editMode ? (
            <>
              <div>
                <Label htmlFor="bio" className="block mb-2 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  rows={5}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell us about your experience, expertise, and what makes you unique..."
                  className="w-full p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark
                             focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent
                             resize-none transition-colors duration-200"
                />
              </div>

              <div>
                <Label htmlFor="skills" className="block mb-2 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">
                  Skills (comma separated)
                </Label>
                <Input
                  id="skills"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="e.g. React, Next.js, UI/UX Design"
                  className="w-full p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark
                             focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent
                             transition-colors duration-200"
                />
              </div>

              <div>
                <Label htmlFor="portfolio" className="block mb-2 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">
                  Portfolio Site
                </Label>
                <Input
                  id="portfolio"
                  type="url"
                  value={portfolio}
                  onChange={e => setPortfolio(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark
                             focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent
                             transition-colors duration-200"
                />
              </div>

              <motion.button
                onClick={handleUpdate}
                disabled={isUpdating}
                className={`
                  w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300
                  ${isUpdating ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-400' : 'bg-quickgig-accent hover:bg-quickgig-accent/90 dark:hover:bg-quickgig-accent/80 text-white shadow-md hover:shadow-lg'}
                `}
                whileHover={{ scale: isUpdating ? 1 : 1.01 }}
                whileTap={{ scale: isUpdating ? 1 : 0.99 }}
              >
                {isUpdating ? 'Updating...' : 'Save Profile'}
              </motion.button>
            </>
          ) : (
            <>
              <p className="text-quickgig-text-light dark:text-quickgig-text-dark">
                <strong className="font-semibold text-lg flex items-center mb-2"><Briefcase size={20} className="mr-2 text-quickgig-accent" />Bio:</strong>{" "}
                <span className="text-gray-700 dark:text-gray-300 ml-7 block">{data?.bio || 'Not available'}</span>
              </p>
              <p className="text-quickgig-text-light dark:text-quickgig-text-dark">
                <strong className="font-semibold text-lg flex items-center mb-2"><Code size={20} className="mr-2 text-quickgig-accent" />Skills:</strong>{" "}
                <span className="text-gray-700 dark:text-gray-300 ml-7 block">{(data?.skills || []).join(', ') || 'Not available'}</span>
              </p>
              <p className="text-quickgig-text-light dark:text-quickgig-text-dark">
                <strong className="font-semibold text-lg flex items-center mb-2"><LinkIcon size={20} className="mr-2 text-quickgig-accent" />Portfolio:</strong>{" "}
                {data?.portfoliosite ? (
                  <a href={data.portfoliosite} className="text-blue-500 underline hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500 ml-7 block" target="_blank" rel="noopener noreferrer">
                    {data.portfoliosite}
                  </a>
                ) : <span className="text-gray-700 dark:text-gray-300 ml-7 block">Not available</span>}
              </p>
            </>
          )}
        </div>

        <hr className="my-8 border-gray-200 dark:border-gray-700" />

        {/* Applied Gigs Section */}
        <h2 className="text-3xl font-extrabold mb-6 text-quickgig-accent text-center">
          My Applications
        </h2>
        {data?.appliedGigs?.length === 0 ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner">
            <p className="text-xl font-medium mb-2">You haven't applied to any gigs yet.</p>
            <p className="text-md">Explore available gigs on the dashboard!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {data?.appliedGigs?.map((app: AppliedGig) => ( // Changed gig to app for clarity with backend structure
              <motion.li
                key={app.applicationId} // Use applicationId as the key
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between
                           bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-2 sm:mb-0">
                  <p className="font-bold text-xl text-quickgig-text-light dark:text-quickgig-text-dark">{app.gigTitle}</p> {/* Use gigTitle */}
                  <p className={`text-sm font-semibold ${getStatusColor(app.status)} flex items-center`}>
                    {getStatusIcon(app.status)} Status: {app.status.toUpperCase()}
                  </p>
                  {app.appliedAt && ( // Use appliedAt for display, as gig.deadline is not available
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                      <Clock size={14} className="inline mr-1" /> Applied On: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {/* Only show withdraw button if status is pending or accepted */}
                {(app.status === 'pending' || app.status === 'accepted') && (
                  <Button
                    variant="destructive"
                    onClick={() => removeApplication(app.applicationId)} // Pass applicationId
                    className="px-4 py-2 rounded-lg text-white font-semibold transition-all duration-300
                               bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                  >
                    <Trash2 size={18} className="mr-2" /> Withdraw
                  </Button>
                )}
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  )
}
