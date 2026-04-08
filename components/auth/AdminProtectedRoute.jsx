'use client'

import { useAuth } from '@/app/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminProtectedRoute({ children, redirectTo = '/' }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showNoAccessMessage, setShowNoAccessMessage] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user?.role !== 'ADMIN') {
      setShowNoAccessMessage(true)
      const timeoutId = setTimeout(() => {
        router.push(redirectTo)
      }, 1500)

      return () => clearTimeout(timeoutId)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg">Loading, please wait...</p>
        </div>
      </div>
    )
  }

  if (!user || user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-500 text-lg font-medium">
          {showNoAccessMessage ? 'You have no access to this page.' : 'Checking access...'}
        </p>
      </div>
    )
  }

  return <>{children}</>
}

