'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast' // Assuming react-hot-toast is installed and configured
import { motion } from 'framer-motion'

export default function FreelancerOnboarding() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('')
  const [portfoliosite, setPortfolioSite] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!bio || !skills) {
      toast.error('Bio and skills are required.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/useronboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user?.id,
          bio,
          skills: skills.split(',').map(skill => skill.trim()).filter(skill => skill !== ''),
          portfoliosite
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Onboarding failed')
      }

      toast.success('Onboarding complete!')
      router.push('/freelancer/dashboard') // Redirect to the freelancer dashboard

    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quickgig-light-bg dark:bg-quickgig-dark-bg text-quickgig-text-light dark:text-quickgig-text-dark">
        <p className="text-xl">Loading user data...</p>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-quickgig-light-bg dark:bg-quickgig-dark-bg text-quickgig-text-light dark:text-quickgig-text-dark transition-colors duration-500">
      <motion.div
        className="max-w-2xl w-full p-8 md:p-10 bg-white dark:bg-gray-900 shadow-2xl rounded-3xl border border-gray-200 dark:border-gray-800"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h1
          className="text-4xl font-extrabold mb-8 text-quickgig-accent text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Freelancer Onboarding
        </motion.h1>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div>
            <label htmlFor="bio" className="block mb-2 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">
              Bio <span className="text-quickgig-accent">*</span>
            </label>
            <textarea
              id="bio"
              rows={5}
              className="w-full p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark
                         focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent
                         resize-none transition-colors duration-200"
              placeholder="Tell us about your experience, expertise, and what makes you unique..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="skills" className="block mb-2 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">
              Skills <span className="text-quickgig-accent">*</span>
            </label>
            <input
              id="skills"
              type="text"
              className="w-full p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark
                         focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent
                         transition-colors duration-200"
              placeholder="e.g. React, Next.js, UI/UX Design, Content Writing"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Comma-separated list (e.g. HTML, CSS, JavaScript, SEO)
            </p>
          </div>

          <div>
            <label htmlFor="portfolio" className="block mb-2 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">
              Portfolio Site (optional)
            </label>
            <input
              id="portfolio"
              type="url"
              className="w-full p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark
                         focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent
                         transition-colors duration-200"
              placeholder="https://yourportfolio.com"
              value={portfoliosite}
              onChange={(e) => setPortfolioSite(e.target.value)}
            />
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            className={`
              w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300
              ${loading 
                ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-400' 
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-400 dark:hover:bg-blue-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'}
            `}
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
          >
            {loading ? 'Submitting...' : 'Complete Onboarding'}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
