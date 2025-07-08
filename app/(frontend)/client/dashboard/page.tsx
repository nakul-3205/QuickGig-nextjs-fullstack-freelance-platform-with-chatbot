'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, CheckCircle, XCircle, Clock, DollarSign, Code, Calendar, User as UserIcon, LogOut, Sun, Moon, Link as LinkIcon, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ClientDashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { signOut } = useClerk()

  const [loading, setLoading] = useState(true)
  const [gigs, setGigs] = useState<any[]>([])
  const [darkMode, setDarkMode] = useState(false)

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

  const fetchGigs = async () => {
    try {
      const res = await fetch('/api/client-gig')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load gigs')
      setGigs(json.gigs || [])
      console.log("Gigs data received by frontend:", json.gigs);
    } catch (err: any) {
      console.error("Error fetching gigs:", err)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && user) {
      fetchGigs()
    }
  }, [isLoaded, user])

  const handleDecision = async (gigId: string, freelancerId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch('/api/client-gig', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigId, freelancerId, action })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Update failed')

      toast.success(`Application ${action}ed`)
      setGigs(prev =>
        prev.map(g =>
          g._id === gigId
            ? {
                ...g,
                applicants: g.applicants.map((a: any) =>
                  a._id === freelancerId ? { ...a, status: action } : a
                )
              }
            : g
        )
      )
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/')
    } catch (err) {
      toast.error('Failed to sign out')
    }
  }

  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'pending':
      default: return 'bg-blue-500 text-white';
    }
  }, []);

  const getApplicantStatusColor = useCallback((status: string | undefined) => {
    const lowerCaseStatus = (status || '').toLowerCase();
    switch (lowerCaseStatus) {
      case 'accepted': return 'text-green-500 dark:text-green-400';
      case 'rejected': return 'text-red-500 dark:text-red-400';
      case 'withdrawn': return 'text-yellow-500 dark:text-yellow-400';
      case 'pending':
      default: return 'text-blue-500 dark:text-blue-400';
    }
  }, []);

  const getApplicantStatusIcon = useCallback((status: string | undefined) => {
    const lowerCaseStatus = (status || '').toLowerCase();
    switch (lowerCaseStatus) {
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
        <h1 className="text-3xl font-extrabold text-quickgig-accent">Client Dashboard</h1>
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
            onClick={() => router.push('/client/profile')}
            className="hover:opacity-80 transition-opacity"
          >
            <img
              src={user?.imageUrl || '/default-avatar.png'}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-quickgig-accent"
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

      {/* Post New Gig Button */}
      <div className="max-w-7xl mx-auto mb-8 text-right">
        <Button
          onClick={() => router.push('/client/post-gig')}
          className="bg-quickgig-accent hover:bg-quickgig-accent/90 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-200"
        >
          <PlusCircle className="mr-2" size={20} />
          Post New Gig
        </Button>
      </div>

      {gigs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-7xl mx-auto">
          <p className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">You haven’t posted any gigs yet.</p>
          <p className="text-lg text-gray-500 dark:text-gray-400">Click "Post New Gig" to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-7xl mx-auto">
          {gigs.map((gig) => (
            <motion.div
              key={gig._id}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-quickgig-text-light dark:text-quickgig-text-dark mb-1">{gig.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Calendar size={14} className="mr-1" /> Deadline: {new Date(gig.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center mt-3 md:mt-0">
                  <Badge className={`text-md font-semibold px-3 py-1 rounded-full ${getStatusColor(gig.status)}`}>
                    {gig.status.toUpperCase()}
                  </Badge>
                  <p className="text-lg font-semibold text-quickgig-accent ml-4 flex items-center">
                    <DollarSign size={18} className="mr-1" /> ₹{gig.budget.toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4">{gig.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary" className="bg-quickgig-accent/20 text-quickgig-accent hover:bg-quickgig-accent/30">{gig.category}</Badge>
                {gig.tags?.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">
                    <Code size={14} className="mr-1" /> {tag}
                  </Badge>
                ))}
              </div>

              <h3 className="font-bold text-xl text-quickgig-text-light dark:text-quickgig-text-dark mb-3">Applicants ({gig.applicants.length})</h3>
              {gig.applicants.length === 0 ? (
                <p className="text-md text-gray-500 dark:text-gray-400 py-4 px-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">No applicants yet for this gig.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gig.applicants.map((applicant: any) => (
                    <motion.div
                      key={applicant._id}
                      className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* --- DEBUGGING LOG: Individual applicant data --- */}
                      {console.log("Processing applicant:", applicant)}
                      <div className="flex items-center mb-2">
                        <img
                          src={applicant.avatar || '/default-avatar.png'}
                          alt="Applicant Avatar"
                          className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300 dark:border-gray-600"
                        />
                        <div>
                          <p className="font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">{applicant.email}</p>
                          <p className={`text-sm font-medium ${getApplicantStatusColor(applicant.status)} flex items-center`}>
                            {getApplicantStatusIcon(applicant.status)} Status: {String(applicant.status || '').toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">{applicant.bio || 'No bio provided.'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Code size={14} className="mr-1" /> Skills: {applicant.skills?.join(', ') || 'None listed'}
                      </p>
                      {applicant.portfoliosite && (
                        <a
                          href={applicant.portfoliosite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-sm flex items-center mt-1"
                        >
                          <LinkIcon size={14} className="mr-1" /> View Portfolio
                        </a>
                      )}

                      <div className="flex gap-3 mt-4">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleDecision(gig._id, applicant._id, 'accept')}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold flex-1"
                          disabled={applicant.status !== 'pending'}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDecision(gig._id, applicant._id, 'reject')}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold flex-1"
                          disabled={applicant.status !== 'pending'}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
