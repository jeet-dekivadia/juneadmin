'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()

  useEffect(() => {
    // Immediate redirect - no unauthorized page display
    router.replace('/')
  }, [router])

  return null // Don't render anything
} 