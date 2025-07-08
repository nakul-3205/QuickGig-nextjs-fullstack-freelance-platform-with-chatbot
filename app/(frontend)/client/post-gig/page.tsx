'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { PlusCircle, ArrowLeft, Sun, Moon } from 'lucide-react'

export default function PostGigPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [budget, setBudget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async () => {
    if (!title || !description || !category || !budget || !deadline) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/client-gig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          budget: Number(budget),
          deadline,
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
        })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to post gig')

      toast.success('Gig posted successfully!')
      router.push('/client/dashboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-quickgig-light-bg dark:bg-quickgig-dark-bg text-quickgig-text-light dark:text-quickgig-text-dark transition-colors duration-500 p-4 md:p-8">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        <motion.button
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md transition-all duration-300 hover:scale-105"
          onClick={() => setDarkMode(!darkMode)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Moon size={20} /> : <Sun size={20} />}
        </motion.button>
        <Button
          onClick={() => router.push('/client/dashboard')}
          className="bg-quickgig-accent hover:bg-quickgig-accent/90 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
        >
          <ArrowLeft size={18} className="mr-2" /> Go to Dashboard
        </Button>
      </div>

      <motion.div
        className="max-w-3xl mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-3xl border border-gray-200 dark:border-gray-800 p-8 md:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-extrabold mb-8 text-quickgig-accent text-center">
          Post a New Gig
        </h1>

        <div className="space-y-6">
          <div>
            <Label htmlFor="title" className="block mb-2 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Develop a React Native Mobile App"
              className="w-full p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark
                         focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent
                         transition-colors duration-200"
            />
          </div>

          <div>
            <Label htmlFor="description" className="block mb-2 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={6}
              placeholder="Provide a detailed description of the gig, including requirements and deliverables."
              className="w-full p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark
                         focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent
                         resize-none transition-colors duration-200"
            />
          </div>

          <div>
            <Label htmlFor="category" className="block mb-2 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Web Development, Graphic Design, Content Writing"
              className="w-full p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark
                         focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent
                         transition-colors duration-200"
            />
          </div>

          <div>
            <Label htmlFor="budget" className="block mb-2 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">Budget (₹)</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              min="0"
              placeholder="e.g. 50000"
              className="w-full p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark
                         focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent
                         transition-colors duration-200"
            />
          </div>

          <div>
            <Label htmlFor="deadline" className="block mb-2 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark
                         focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent
                         transition-colors duration-200"
            />
          </div>

          <div>
            <Label htmlFor="tags" className="block mb-2 text-lg font-semibold text-quickgig-text-light dark:text-quickgig-text-dark">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="e.g. React, MongoDB, UI Design"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full p-4 rounded-lg border-2 border-gray-300 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 text-quickgig-text-light dark:text-quickgig-text-dark
                         focus:outline-none focus:ring-2 focus:ring-quickgig-accent focus:border-transparent
                         transition-colors duration-200"
            />
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            className={`
              w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300
              ${loading ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-400' : 'bg-quickgig-accent hover:bg-quickgig-accent/90 dark:hover:bg-quickgig-accent/80 text-gray-900 dark:text-white shadow-md hover:shadow-lg'}
            `}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
          >
            {loading ? 'Posting...' : 'Post Gig'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
