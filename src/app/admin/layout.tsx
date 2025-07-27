'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // Additional security layer - check session validity on every admin page load
    const validateSession = () => {
      const hasLocalAccess = localStorage.getItem('juneAdminAccess')
      const hasSessionCookie = document.cookie.includes('june-admin-session=authenticated-junedating-2025')
      
      if (!hasLocalAccess || !hasSessionCookie) {
        // Immediate redirect if session is invalid
        localStorage.removeItem('juneAdminAccess')
        document.cookie = 'june-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        router.replace('/')
        return false
      }
      return true
    }

    // Initial validation
    validateSession()

    // Periodic session validation (every 30 seconds)
    const intervalId = setInterval(validateSession, 30000)

    // Validate on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        validateSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  return <>{children}</>
} 