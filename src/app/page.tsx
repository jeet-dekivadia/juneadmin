'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [adminCode, setAdminCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Security: Clear any existing admin session on login page load
  useEffect(() => {
    localStorage.removeItem('juneAdminAccess')
    document.cookie = 'june-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (adminCode === 'junedating@2025') {
      // Set both localStorage and secure HTTP-only session
      localStorage.setItem('juneAdminAccess', 'true')
      
      // Set secure session cookie
      document.cookie = 'june-admin-session=authenticated-junedating-2025; path=/; secure; samesite=strict; max-age=86400'
      
      router.push('/admin')
    } else {
      setError('Invalid admin code')
      setAdminCode('')
      // Clear any existing session
      document.cookie = 'june-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-beige-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white border border-beige-200 rounded-lg p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-medium text-black mb-2">
            June Admin
          </h1>
          <p className="text-black text-sm sm:text-base font-light">
            Enter admin code to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label htmlFor="adminCode" className="block text-sm font-medium text-black mb-2">
              Admin Code
            </label>
            <input
              id="adminCode"
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="Enter code"
              className="w-full px-4 py-3 sm:py-4 border border-beige-200 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-black font-light text-base bg-white"
              required
            />
          </div>
          
          {error && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm text-center font-light">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 sm:py-4 bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium text-base"
          >
            {isLoading ? 'Verifying...' : 'Access Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  )
}
