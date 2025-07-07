'use client'

import { SignOutButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { useClerk } from '@clerk/nextjs'


export default function Topbar() {
  const { user } = useUser()
  const router = useRouter()
 const { signOut } = useClerk()
  const handleSignOut = async () => {
    try {
     await signOut();
     router.push('/')
    } catch (err) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <div className="flex justify-between items-center w-full px-6 py-4 bg-black text-white shadow-md">
      <div className="text-2xl font-bold">QuickGig</div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/freelancer/profile')}
          className="hover:text-blue-400 transition-all"
        >
          <img
            src={user?.imageUrl || '/default-wave.svg'}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover border border-gray-400"
          />
        </button>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 border border-white text-white px-4 py-2 rounded-xl hover:bg-white hover:text-black transition"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
