'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { LogOut } from "lucide-react";

import { motion } from 'framer-motion'
import { Trash2, Pencil, Save, Users, Sun, Moon, ArrowLeft, DollarSign, Code, Calendar, Link as LinkIcon } from 'lucide-react'

export default function ClientProfile() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { signOut } = useClerk()

  const [gigs, setGigs] = useState<any[]>([])
  const [editingGigId, setEditingGigId] = useState<string | null>(null)
  const [formState, setFormState] = useState<any>({})
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

  // Fetch gigs
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const res = await fetch('/api/client-gig', { method: 'GET' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch gigs')
        setGigs(data.gigs)
      } catch (err: any) {
        console.error(err)
        toast.error(err.message)
      }
    }
    if (isLoaded) fetchGigs()
  }, [isLoaded])

  // Handle gig deletion with custom confirmation toast
  const handleDelete = (gigId: string) => {
    toast((t) => (
      <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Are you sure you want to delete this gig?</p>
        <div className="flex gap-4">
          <Button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch('/api/client-gig', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ gigId }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Delete failed');
                setGigs(prev => prev.filter(g => g._id !== gigId));
                toast.success('Gig deleted successfully!');
              } catch (err: any) {
                console.error(err);
                toast.error(err.message);
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Yes, Delete
          </Button>
          <Button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
          >
            Cancel
          </Button>
        </div>
      </div>
    ), {
      duration: Infinity, // Keep toast open until action
      position: 'top-center',
    });
  };

  // Start editing a gig
  const startEdit = (gig: any) => {
    setEditingGigId(gig._id)
    setFormState({
      title: gig.title,
      description: gig.description,
      category: gig.category,
      budget: gig.budget,
      deadline: gig.deadline?.slice(0, 10), // Format date for input
    })
  }

  // Save edited gig
  const saveEdit = async (gigId: string) => {
    try {
      const res = await fetch('/api/edit-gig', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formState, gigId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')

      setGigs(prev =>
        prev.map(g => (g._id === gigId ? { ...g, ...formState } : g))
      )
      toast.success('Gig updated successfully!')
      setEditingGigId(null)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/')
    } catch (err) {
      toast.error('Failed to sign out')
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quickgig-light-bg dark:bg-quickgig-dark-bg text-quickgig-text-light dark:text-quickgig-text-dark">
        <p className="text-xl">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-quickgig-light-bg dark:bg-quickgig-dark-bg text-quickgig-text-light dark:text-quickgig-text-dark transition-colors duration-500 p-4 md:p-8">
      {/* Top Bar with Dark Mode Toggle, Profile, and Sign Out */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-extrabold text-quickgig-accent">Client Profile</h1>
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

          {/* Go to Dashboard Button */}
          <Button
            onClick={() => router.push('/client/dashboard')}
            className="bg-quickgig-accent hover:bg-quickgig-accent/90 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
          >
            <ArrowLeft size={18} className="mr-2" /> Go to Dashboard
          </Button>

          {/* Profile Button (Optional, can be removed if handled by Topbar layout) */}
          <button
            onClick={() => router.push('/client/profile')} // Self-referential, but useful if this component isn't always accessed via Topbar
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
          <p className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">You haven’t posted any gigs yet.</p>
          <p className="text-lg text-gray-500 dark:text-gray-400">Post your first gig from the dashboard!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {gigs.map(gig => (
            <motion.div
              key={gig._id}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 flex flex-col h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              whileHover={{ translateY: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
            >
              {editingGigId === gig._id ? (
                <div className="flex-grow space-y-4">
                  <div>
                    <Label htmlFor={`title-${gig._id}`} className="block mb-1 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">Title</Label>
                    <Input
                      id={`title-${gig._id}`}
                      value={formState.title}
                      onChange={e => setFormState(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`description-${gig._id}`} className="block mb-1 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">Description</Label>
                    <Textarea
                      id={`description-${gig._id}`}
                      rows={4}
                      value={formState.description}
                      onChange={e => setFormState(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent resize-none transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`category-${gig._id}`} className="block mb-1 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">Category</Label>
                    <Input
                      id={`category-${gig._id}`}
                      value={formState.category}
                      onChange={e => setFormState(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`budget-${gig._id}`} className="block mb-1 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">Budget</Label>
                    <Input
                      id={`budget-${gig._id}`}
                      type="number"
                      value={formState.budget}
                      onChange={e => setFormState(prev => ({ ...prev, budget: Number(e.target.value) }))}
                      className="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`deadline-${gig._id}`} className="block mb-1 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">Deadline</Label>
                    <Input
                      id={`deadline-${gig._id}`}
                      type="date"
                      value={formState.deadline}
                      onChange={e => setFormState(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button
                      onClick={() => saveEdit(gig._id)}
                      className="bg-quickgig-accent hover:bg-quickgig-accent/90 text-white font-semibold py-2 px-4 rounded-lg"
                    >
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                    <Button variant="ghost" onClick={() => setEditingGigId(null)} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-2xl font-bold text-quickgig-text-light dark:text-quickgig-text-dark">{gig.title}</h2>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(gig)} className="text-quickgig-accent hover:bg-quickgig-accent/10 dark:hover:bg-quickgig-accent/20">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(gig._id)} className="bg-red-500 hover:bg-red-600 text-white">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                    <Calendar size={14} className="mr-1" /> Deadline: {new Date(gig.deadline).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 flex-grow">{gig.description}</p>
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-lg font-semibold text-quickgig-accent flex items-center">
                      <DollarSign size={16} className="mr-1" /> Budget: ₹{gig.budget.toLocaleString()}
                    </p>
                    <p className="text-md text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <Code size={16} className="mr-1" /> Category: {gig.category}
                    </p>
                    {gig.tags && gig.tags.length > 0 && (
                      <p className="text-md text-gray-600 dark:text-gray-400 flex items-center mt-1">
                        Tags: {gig.tags.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* View Applicants Section */}
                  {gig.applicants && gig.applicants.length > 0 && (
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="text-lg font-semibold mb-3 flex items-center text-quickgig-text-light dark:text-quickgig-text-dark">
                        <Users className="w-5 h-5 mr-2 text-quickgig-accent" /> Applicants ({gig.applicants.length})
                      </h3>
                      <ul className="space-y-3">
                        {gig.applicants.map((applicant: any) => (
                          <li
                            key={applicant._id}
                            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm border border-gray-200 dark:border-gray-700"
                          >
                            <p className="font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">{applicant.email}</p>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">{applicant.bio || 'No bio provided.'}</p>
                            <p className="text-gray-600 dark:text-gray-400 flex items-center">
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
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Status: {applicant.status}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
