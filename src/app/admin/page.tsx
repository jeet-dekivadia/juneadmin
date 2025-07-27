'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { 
  Search, 
  RefreshCw, 
  Lightbulb,
  Eye,
  ChevronUp, 
  ChevronDown,
  Menu,
  X
} from 'lucide-react'
import { format, parseISO, subDays, subMonths, subWeeks, subHours, startOfDay, startOfWeek, startOfMonth, startOfYear, differenceInDays, differenceInHours } from 'date-fns'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WaitlistEntry {
  id: number
  email: string
  name: string
  phone: string
  gender: string
  age: number
  instagram: string
  linkedin: string
  twitter: string
  priority_score: number
  access_code: string
  batch_number: number
  location: string
  created_at: string
  updated_at: string
}

export default function AdminDashboard() {
  const [waitlistData, setWaitlistData] = useState<WaitlistEntry[]>([])
  const [filteredData, setFilteredData] = useState<WaitlistEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalEntries, setTotalEntries] = useState(0)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{key: keyof WaitlistEntry, direction: 'asc' | 'desc'} | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [selectedUser, setSelectedUser] = useState<WaitlistEntry | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const fetchWaitlistData = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error, count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching waitlist data:', error)
        return
      }

      setWaitlistData(data || [])
      setTotalEntries(count || 0)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const setupRealtimeSubscription = useCallback(() => {
    const channel = supabase
      .channel('waitlist_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waitlist'
        },
        (payload) => {
          console.log('Real-time update:', payload)
          fetchWaitlistData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchWaitlistData])

  const applyFiltersAndSearch = useCallback(() => {
    const filtered = waitlistData.filter(entry => {
      const matchesSearch = searchTerm === '' || 
        Object.values(entry).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      return matchesSearch
    })

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    setFilteredData(filtered)
  }, [waitlistData, searchTerm, sortConfig])

  useEffect(() => {
    const hasAccess = localStorage.getItem('juneAdminAccess')
    if (!hasAccess) {
      router.push('/')
      return
    }

    fetchWaitlistData()
    setupRealtimeSubscription()
  }, [router, fetchWaitlistData, setupRealtimeSubscription])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [applyFiltersAndSearch])

  const handleSort = (key: keyof WaitlistEntry) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig?.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const exportData = (format: 'csv' | 'json') => {
    try {
      const dataToExport = filteredData

      if (format === 'csv') {
        const headers = Object.keys(dataToExport[0] || {}).join(',')
        const rows = dataToExport.map(entry => Object.values(entry).join(','))
        const csv = [headers, ...rows].join('\n')
        
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `june-waitlist-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const json = JSON.stringify(dataToExport, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `june-waitlist-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
      setShowMobileMenu(false)
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    }
  }

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const handleLogout = () => {
    try {
      localStorage.removeItem('juneAdminAccess')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm')
  }

  const formatDateMobile = (dateString: string) => {
    return format(parseISO(dateString), 'MMM dd, yyyy')
  }

  // Comprehensive 50+ Analytics
  const getAnalytics = () => {
    const now = new Date()
    const today = startOfDay(now)
    const yesterday = subDays(today, 1)
    const thisWeek = startOfWeek(now)
    const thisMonth = startOfMonth(now)
    const thisYear = startOfYear(now)

    // Basic counts
    const totalUsers = waitlistData.length
    const usersToday = waitlistData.filter(entry => new Date(entry.created_at) >= today).length
    const usersYesterday = waitlistData.filter(entry => {
      const date = new Date(entry.created_at)
      return date >= yesterday && date < today
    }).length
    const usersThisWeek = waitlistData.filter(entry => new Date(entry.created_at) >= thisWeek).length
    const usersLastWeek = waitlistData.filter(entry => {
      const date = new Date(entry.created_at)
      return date >= subWeeks(thisWeek, 1) && date < thisWeek
    }).length
    const usersThisMonth = waitlistData.filter(entry => new Date(entry.created_at) >= thisMonth).length
    const usersLastMonth = waitlistData.filter(entry => {
      const date = new Date(entry.created_at)
      return date >= subMonths(thisMonth, 1) && date < thisMonth
    }).length
    const usersThisYear = waitlistData.filter(entry => new Date(entry.created_at) >= thisYear).length
    const usersLast7Days = waitlistData.filter(entry => new Date(entry.created_at) >= subDays(now, 7)).length
    const usersLast30Days = waitlistData.filter(entry => new Date(entry.created_at) >= subDays(now, 30)).length
    const usersLast90Days = waitlistData.filter(entry => new Date(entry.created_at) >= subDays(now, 90)).length

    // Growth rates
    const dailyGrowthRate = usersYesterday > 0 ? ((usersToday - usersYesterday) / usersYesterday * 100) : 0
    const weeklyGrowthRate = usersLastWeek > 0 ? ((usersThisWeek - usersLastWeek) / usersLastWeek * 100) : 0
    const monthlyGrowthRate = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100) : 0

    // Age analytics
    const ageData = waitlistData.filter(e => e.age && e.age > 0)
    const avgAge = ageData.length > 0 ? ageData.reduce((sum, e) => sum + e.age, 0) / ageData.length : 0
    const minAge = ageData.length > 0 ? Math.min(...ageData.map(e => e.age)) : 0
    const maxAge = ageData.length > 0 ? Math.max(...ageData.map(e => e.age)) : 0
    const ageGroups = {
      '18-25': ageData.filter(e => e.age >= 18 && e.age <= 25).length,
      '26-35': ageData.filter(e => e.age >= 26 && e.age <= 35).length,
      '36-45': ageData.filter(e => e.age >= 36 && e.age <= 45).length,
      '46+': ageData.filter(e => e.age >= 46).length
    }

    // Priority analytics
    const priorityData = waitlistData.filter(e => e.priority_score !== null && e.priority_score !== undefined)
    const avgPriority = priorityData.length > 0 ? priorityData.reduce((sum, e) => sum + (e.priority_score || 0), 0) / priorityData.length : 0
    const minPriority = priorityData.length > 0 ? Math.min(...priorityData.map(e => e.priority_score || 0)) : 0
    const maxPriority = priorityData.length > 0 ? Math.max(...priorityData.map(e => e.priority_score || 0)) : 0
    const highPriorityUsers = waitlistData.filter(e => (e.priority_score || 0) >= 8).length
    const mediumPriorityUsers = waitlistData.filter(e => (e.priority_score || 0) >= 5 && (e.priority_score || 0) < 8).length
    const lowPriorityUsers = waitlistData.filter(e => (e.priority_score || 0) < 5).length

    // Location analytics
    const locationDistribution = waitlistData.reduce((acc, entry) => {
      const location = entry.location || 'Unknown'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topLocations = Object.entries(locationDistribution).sort(([,a], [,b]) => b - a).slice(0, 10)
    const uniqueLocations = Object.keys(locationDistribution).length

    // Batch analytics
    const batchDistribution = waitlistData.reduce((acc, entry) => {
      const batch = entry.batch_number || 'No Batch'
      acc[batch] = (acc[batch] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const totalBatches = Object.keys(batchDistribution).length - (batchDistribution['No Batch'] ? 1 : 0)

    // Contact information analytics
    const usersWithEmail = waitlistData.filter(e => e.email && e.email.trim() !== '').length
    const usersWithPhone = waitlistData.filter(e => e.phone && e.phone.trim() !== '').length
    const usersWithName = waitlistData.filter(e => e.name && e.name.trim() !== '').length
    const usersWithInstagram = waitlistData.filter(e => e.instagram && e.instagram.trim() !== '').length
    const usersWithLinkedIn = waitlistData.filter(e => e.linkedin && e.linkedin.trim() !== '').length
    const usersWithTwitter = waitlistData.filter(e => e.twitter && e.twitter.trim() !== '').length
    const usersWithAllSocial = waitlistData.filter(e => e.instagram && e.linkedin && e.twitter).length

    // Completion rates
    const emailCompletionRate = (usersWithEmail / totalUsers * 100)
    const phoneCompletionRate = (usersWithPhone / totalUsers * 100)
    const nameCompletionRate = (usersWithName / totalUsers * 100)

    // Time-based analytics
    const hourlyDistribution = Array.from({length: 24}, (_, hour) => {
      const count = waitlistData.filter(entry => new Date(entry.created_at).getHours() === hour).length
      return { hour, count }
    })
    const peakHour = hourlyDistribution.reduce((peak, current) => current.count > peak.count ? current : peak)

    const dayOfWeekDistribution = Array.from({length: 7}, (_, day) => {
      const count = waitlistData.filter(entry => new Date(entry.created_at).getDay() === day).length
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return { day: dayNames[day], count }
    })
    const peakDay = dayOfWeekDistribution.reduce((peak, current) => current.count > peak.count ? current : peak)

    // Registration velocity
    const last24Hours = waitlistData.filter(entry => new Date(entry.created_at) >= subHours(now, 24)).length
    const averagePerDay = totalUsers > 0 && waitlistData.length > 0 ? 
      totalUsers / differenceInDays(now, new Date(waitlistData[waitlistData.length - 1]?.created_at)) : 0

    // Growth data for charts
    const growthData: { date: string; total: number; daily: number }[] = []
    for (let i = 30; i >= 0; i--) {
      const date = subDays(now, i)
      const totalUntilDate = waitlistData.filter(entry => new Date(entry.created_at) <= date).length
      const dailyCount = waitlistData.filter(entry => {
        const entryDate = new Date(entry.created_at)
        return entryDate >= startOfDay(date) && entryDate < startOfDay(subDays(date, -1))
      }).length
      growthData.push({
        date: format(date, 'MMM dd'),
        total: totalUntilDate,
        daily: dailyCount
      })
    }

    const recentUsers = waitlistData.filter(entry => new Date(entry.created_at) >= subHours(now, 1)).length
    const dormantPeriods = growthData.filter(day => day.daily === 0).length

    return {
      // Basic metrics (10)
      totalUsers,
      usersToday,
      usersYesterday,
      usersThisWeek,
      usersLastWeek,
      usersThisMonth,
      usersLastMonth,
      usersThisYear,
      usersLast7Days,
      usersLast30Days,

      // Growth metrics (8)
      usersLast90Days,
      dailyGrowthRate,
      weeklyGrowthRate,
      monthlyGrowthRate,
      last24Hours,
      averagePerDay,
      recentUsers,
      dormantPeriods,

      // Age analytics (7)
      avgAge,
      minAge,
      maxAge,
      ageGroups,
      ageDataCount: ageData.length,
      usersWithoutAge: totalUsers - ageData.length,
      medianAge: ageData.length > 0 ? ageData.sort((a, b) => a.age - b.age)[Math.floor(ageData.length / 2)]?.age || 0 : 0,

      // Priority analytics (6)
      avgPriority,
      minPriority,
      maxPriority,
      highPriorityUsers,
      mediumPriorityUsers,
      lowPriorityUsers,

      // Location analytics (4)
      locationDistribution,
      topLocations,
      uniqueLocations,
      usersWithoutLocation: waitlistData.filter(e => !e.location || e.location.trim() === '').length,

      // Batch analytics (3)
      batchDistribution,
      totalBatches,
      usersWithoutBatch: waitlistData.filter(e => !e.batch_number).length,

      // Contact analytics (10)
      usersWithEmail,
      usersWithPhone,
      usersWithName,
      usersWithInstagram,
      usersWithLinkedIn,
      usersWithTwitter,
      usersWithAllSocial,
      emailCompletionRate,
      phoneCompletionRate,

      // Additional completion rates (4)
      nameCompletionRate,
      usersWithAccessCode: waitlistData.filter(e => e.access_code && e.access_code.trim() !== '').length,
      completeProfiles: waitlistData.filter(e => e.name && e.email && e.phone && e.age).length,

      // Time analytics (6)
      hourlyDistribution,
      peakHour,
      dayOfWeekDistribution,
      peakDay,
      growthData
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-black" />
          <span className="text-black font-light text-sm sm:text-base">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  const analytics = getAnalytics()
  const paginatedData = getPaginatedData()

  return (
    <div className="min-h-screen bg-beige-50">
      {/* Header */}
      <div className="bg-white border-b border-beige-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-medium text-black">June Admin</h1>
              <p className="text-xs sm:text-sm text-black font-light">{totalEntries} total entries</p>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2 sm:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 bg-beige-100 hover:bg-beige-200 rounded-lg"
              >
                {showMobileMenu ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-3 lg:space-x-4">
              <button
                onClick={fetchWaitlistData}
                className="p-2 bg-beige-100 hover:bg-beige-200 rounded-lg"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4 text-black" />
              </button>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="p-2 bg-beige-100 hover:bg-beige-200 rounded-lg"
                title="Toggle Analytics"
              >
                <Lightbulb className="w-4 h-4 text-black" />
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportData('csv')}
                  className="px-3 py-2 text-sm bg-black hover:bg-gray-800 text-white rounded-lg font-medium"
                >
                  CSV
                </button>
                <button
                  onClick={() => exportData('json')}
                  className="px-3 py-2 text-sm bg-black hover:bg-gray-800 text-white rounded-lg font-medium"
                >
                  JSON
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-black hover:text-gray-600 font-medium"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="sm:hidden mt-4 pt-4 border-t border-beige-200">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => {fetchWaitlistData(); setShowMobileMenu(false)}}
                  className="flex items-center justify-center p-3 bg-beige-100 hover:bg-beige-200 rounded-lg"
                >
                  <RefreshCw className="w-4 h-4 text-black mr-2" />
                  <span className="text-sm font-medium text-black">Refresh</span>
                </button>
                <button
                  onClick={() => {setShowAnalytics(!showAnalytics); setShowMobileMenu(false)}}
                  className="flex items-center justify-center p-3 bg-beige-100 hover:bg-beige-200 rounded-lg"
                >
                  <Lightbulb className="w-4 h-4 text-black mr-2" />
                  <span className="text-sm font-medium text-black">Analytics</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => exportData('csv')}
                  className="p-3 bg-black hover:bg-gray-800 text-white rounded-lg font-medium text-sm"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportData('json')}
                  className="p-3 bg-black hover:bg-gray-800 text-white rounded-lg font-medium text-sm"
                >
                  Export JSON
                </button>
              </div>
              <button
                onClick={() => {handleLogout(); setShowMobileMenu(false)}}
                className="w-full p-3 text-center text-black hover:text-gray-600 font-medium text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Search */}
        <div className="bg-white border border-beige-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search all fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-3 sm:py-2 border border-beige-200 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-black font-light text-sm sm:text-base bg-white"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-beige-200 rounded-lg overflow-hidden mb-4 sm:mb-6">
          {/* Mobile Cards View */}
          <div className="block sm:hidden">
            {paginatedData.map((entry, index) => (
              <div key={entry.id} className={`p-4 border-b border-beige-200 ${index % 2 === 0 ? 'bg-white' : 'bg-beige-100'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black truncate">
                      {entry.name || 'No Name'} #{entry.id}
                    </div>
                    <div className="text-xs text-black font-light mt-1">
                      {entry.email && <div className="truncate">{entry.email}</div>}
                      {entry.phone && <div className="mt-1">{entry.phone}</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(entry)}
                    className="ml-3 p-2 bg-beige-100 hover:bg-beige-200 rounded-lg flex-shrink-0"
                  >
                    <Eye className="w-4 h-4 text-black" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-600 font-light">Age:</span>
                    <span className="text-black font-medium ml-1">{entry.age || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-light">Priority:</span>
                    <span className="text-black font-medium ml-1">{entry.priority_score || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-light">Batch:</span>
                    <span className="text-black font-medium ml-1">{entry.batch_number || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-light">Location:</span>
                    <span className="text-black font-medium ml-1">{entry.location ? entry.location.substring(0, 10) + '...' : '-'}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-600 font-light">
                  Created: {formatDateMobile(entry.created_at)}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-beige-100 border-b border-beige-200">
                  {(['id', 'name', 'email', 'phone', 'age', 'location', 'priority_score', 'batch_number', 'access_code', 'created_at'] as (keyof WaitlistEntry)[]).map(key => (
                    <th key={key} className="text-left p-3 lg:p-4">
                      <button
                        onClick={() => handleSort(key)}
                        className="flex items-center space-x-1 text-xs lg:text-sm font-medium text-black hover:text-gray-600"
                      >
                        <span>{key.replace('_', ' ').toUpperCase()}</span>
                        {sortConfig?.key === key && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                  ))}
                  <th className="p-3 lg:p-4 text-xs lg:text-sm font-medium text-black">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((entry, index) => (
                  <tr 
                    key={entry.id} 
                    className={`border-b border-beige-200 hover:bg-beige-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-beige-100'
                    }`}
                  >
                    <td className="p-3 lg:p-4 text-xs lg:text-sm text-black font-medium">{entry.id}</td>
                    <td className="p-3 lg:p-4 text-xs lg:text-sm text-black">{entry.name || '-'}</td>
                    <td className="p-3 lg:p-4 text-xs lg:text-sm text-black max-w-[150px] truncate">{entry.email || '-'}</td>
                    <td className="p-3 lg:p-4 text-xs lg:text-sm text-black">{entry.phone || '-'}</td>
                    <td className="p-3 lg:p-4 text-xs lg:text-sm text-black">{entry.age || '-'}</td>
                    <td className="p-3 lg:p-4 text-xs lg:text-sm text-black max-w-[120px] truncate">{entry.location || '-'}</td>
                    <td className="p-3 lg:p-4 text-xs lg:text-sm text-black font-medium">{entry.priority_score || 0}</td>
                    <td className="p-3 lg:p-4 text-xs lg:text-sm text-black">{entry.batch_number || '-'}</td>
                    <td className="p-3 lg:p-4 text-xs lg:text-sm text-gray-600 font-mono max-w-[100px] truncate">{entry.access_code || '-'}</td>
                    <td className="p-3 lg:p-4 text-xs lg:text-sm text-gray-600 font-light">{formatDate(entry.created_at)}</td>
                    <td className="p-3 lg:p-4">
                      <button
                        onClick={() => setSelectedUser(entry)}
                        className="p-2 bg-beige-100 hover:bg-beige-200 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-black" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-beige-100 border-t border-beige-200 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div className="text-xs sm:text-sm text-black font-light text-center sm:text-left">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded text-xs sm:text-sm bg-beige-200 hover:bg-beige-300 text-black disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-black font-light text-xs sm:text-sm">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded text-xs sm:text-sm bg-beige-200 hover:bg-beige-300 text-black disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          
          {filteredData.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-black font-light text-sm sm:text-base">No entries found</div>
            </div>
          )}
        </div>

        {/* Comprehensive Analytics */}
        {showAnalytics && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-medium text-black mb-4 sm:mb-6">📊 Comprehensive Analytics (50+ Metrics)</h2>

            {/* Basic Metrics */}
            <div className="bg-white border border-beige-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-black mb-4">📈 Basic Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Total Users</div>
                  <div className="text-lg font-medium text-black">{analytics.totalUsers}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Today</div>
                  <div className="text-lg font-medium text-black">{analytics.usersToday}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Yesterday</div>
                  <div className="text-lg font-medium text-black">{analytics.usersYesterday}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">This Week</div>
                  <div className="text-lg font-medium text-black">{analytics.usersThisWeek}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">This Month</div>
                  <div className="text-lg font-medium text-black">{analytics.usersThisMonth}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Last 7 Days</div>
                  <div className="text-lg font-medium text-black">{analytics.usersLast7Days}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Last 30 Days</div>
                  <div className="text-lg font-medium text-black">{analytics.usersLast30Days}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Last 90 Days</div>
                  <div className="text-lg font-medium text-black">{analytics.usersLast90Days}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">This Year</div>
                  <div className="text-lg font-medium text-black">{analytics.usersThisYear}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Last 24 Hours</div>
                  <div className="text-lg font-medium text-black">{analytics.last24Hours}</div>
                </div>
              </div>
            </div>

            {/* Growth Analytics */}
            <div className="bg-white border border-beige-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-black mb-4">🚀 Growth Analytics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Daily Growth Rate</div>
                  <div className="text-lg font-medium text-black">{analytics.dailyGrowthRate.toFixed(1)}%</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Weekly Growth Rate</div>
                  <div className="text-lg font-medium text-black">{analytics.weeklyGrowthRate.toFixed(1)}%</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Monthly Growth Rate</div>
                  <div className="text-lg font-medium text-black">{analytics.monthlyGrowthRate.toFixed(1)}%</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Avg Per Day</div>
                  <div className="text-lg font-medium text-black">{analytics.averagePerDay.toFixed(1)}</div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analytics.growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ede5d3" />
                  <XAxis dataKey="date" fontSize={10} fill="#000000" />
                  <YAxis fontSize={10} fill="#000000" />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#000000" strokeWidth={2} />
                  <Line type="monotone" dataKey="daily" stroke="#666666" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Age Analytics */}
            <div className="bg-white border border-beige-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-black mb-4">👥 Age Analytics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-4">
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Average Age</div>
                  <div className="text-lg font-medium text-black">{analytics.avgAge.toFixed(1)}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Median Age</div>
                  <div className="text-lg font-medium text-black">{analytics.medianAge}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Min Age</div>
                  <div className="text-lg font-medium text-black">{analytics.minAge}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Max Age</div>
                  <div className="text-lg font-medium text-black">{analytics.maxAge}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">18-25 Years</div>
                  <div className="text-lg font-medium text-black">{analytics.ageGroups['18-25']}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">26-35 Years</div>
                  <div className="text-lg font-medium text-black">{analytics.ageGroups['26-35']}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">36+ Years</div>
                  <div className="text-lg font-medium text-black">{analytics.ageGroups['36-45'] + analytics.ageGroups['46+']}</div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={Object.entries(analytics.ageGroups).map(([key, value]) => ({age: key, count: value}))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ede5d3" />
                  <XAxis dataKey="age" fontSize={10} fill="#000000" />
                  <YAxis fontSize={10} fill="#000000" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#666666" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Priority Analytics */}
            <div className="bg-white border border-beige-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-black mb-4">⭐ Priority Analytics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Avg Priority</div>
                  <div className="text-lg font-medium text-black">{analytics.avgPriority.toFixed(1)}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Min Priority</div>
                  <div className="text-lg font-medium text-black">{analytics.minPriority}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Max Priority</div>
                  <div className="text-lg font-medium text-black">{analytics.maxPriority}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">High Priority (8+)</div>
                  <div className="text-lg font-medium text-black">{analytics.highPriorityUsers}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Medium Priority (5-7)</div>
                  <div className="text-lg font-medium text-black">{analytics.mediumPriorityUsers}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Low Priority (&lt;5)</div>
                  <div className="text-lg font-medium text-black">{analytics.lowPriorityUsers}</div>
                </div>
              </div>
            </div>

            {/* Location Analytics */}
            <div className="bg-white border border-beige-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-black mb-4">🌍 Location Analytics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Unique Locations</div>
                  <div className="text-lg font-medium text-black">{analytics.uniqueLocations}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Without Location</div>
                  <div className="text-lg font-medium text-black">{analytics.usersWithoutLocation}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Top Location</div>
                  <div className="text-lg font-medium text-black">{analytics.topLocations[0]?.[1] || 0}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Location Coverage</div>
                  <div className="text-lg font-medium text-black">{((analytics.totalUsers - analytics.usersWithoutLocation) / analytics.totalUsers * 100).toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-black text-sm">Top 10 Locations</h4>
                {analytics.topLocations.slice(0, 10).map(([location, count], index) => (
                  <div key={location} className="flex justify-between items-center p-2 bg-beige-100 rounded">
                    <span className="text-sm text-black font-light">{index + 1}. {location}</span>
                    <span className="text-sm text-black font-medium">{count} users</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information Analytics */}
            <div className="bg-white border border-beige-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-black mb-4">📞 Contact Information Analytics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">With Email</div>
                  <div className="text-lg font-medium text-black">{analytics.usersWithEmail}</div>
                  <div className="text-xs text-gray-600">{analytics.emailCompletionRate.toFixed(1)}%</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">With Phone</div>
                  <div className="text-lg font-medium text-black">{analytics.usersWithPhone}</div>
                  <div className="text-xs text-gray-600">{analytics.phoneCompletionRate.toFixed(1)}%</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">With Name</div>
                  <div className="text-lg font-medium text-black">{analytics.usersWithName}</div>
                  <div className="text-xs text-gray-600">{analytics.nameCompletionRate.toFixed(1)}%</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Complete Profiles</div>
                  <div className="text-lg font-medium text-black">{analytics.completeProfiles}</div>
                  <div className="text-xs text-gray-600">{(analytics.completeProfiles / analytics.totalUsers * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">With Access Code</div>
                  <div className="text-lg font-medium text-black">{analytics.usersWithAccessCode}</div>
                  <div className="text-xs text-gray-600">{(analytics.usersWithAccessCode / analytics.totalUsers * 100).toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">With Instagram</div>
                  <div className="text-lg font-medium text-black">{analytics.usersWithInstagram}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">With LinkedIn</div>
                  <div className="text-lg font-medium text-black">{analytics.usersWithLinkedIn}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">With Twitter</div>
                  <div className="text-lg font-medium text-black">{analytics.usersWithTwitter}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">All Social Media</div>
                  <div className="text-lg font-medium text-black">{analytics.usersWithAllSocial}</div>
                </div>
              </div>
            </div>

            {/* Time-based Analytics */}
            <div className="bg-white border border-beige-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-black mb-4">⏰ Time-based Analytics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Peak Hour</div>
                  <div className="text-lg font-medium text-black">{analytics.peakHour.hour}:00</div>
                  <div className="text-xs text-gray-600">{analytics.peakHour.count} users</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Peak Day</div>
                  <div className="text-lg font-medium text-black">{analytics.peakDay.day}</div>
                  <div className="text-xs text-gray-600">{analytics.peakDay.count} users</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Recent Users (1h)</div>
                  <div className="text-lg font-medium text-black">{analytics.recentUsers}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Dormant Days</div>
                  <div className="text-lg font-medium text-black">{analytics.dormantPeriods}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-black text-sm mb-2">Hourly Distribution</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={analytics.hourlyDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ede5d3" />
                      <XAxis dataKey="hour" fontSize={8} fill="#000000" />
                      <YAxis fontSize={8} fill="#000000" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#666666" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h4 className="font-medium text-black text-sm mb-2">Day of Week Distribution</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={analytics.dayOfWeekDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ede5d3" />
                      <XAxis dataKey="day" fontSize={8} fill="#000000" />
                      <YAxis fontSize={8} fill="#000000" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#333333" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Batch Analytics */}
            <div className="bg-white border border-beige-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-black mb-4">📊 Batch Analytics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Total Batches</div>
                  <div className="text-lg font-medium text-black">{analytics.totalBatches}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Without Batch</div>
                  <div className="text-lg font-medium text-black">{analytics.usersWithoutBatch}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Avg per Batch</div>
                  <div className="text-lg font-medium text-black">{analytics.totalBatches > 0 ? Math.round((analytics.totalUsers - analytics.usersWithoutBatch) / analytics.totalBatches) : 0}</div>
                </div>
                <div className="bg-beige-100 rounded-lg p-3">
                  <div className="text-xs text-black font-light">Batch Coverage</div>
                  <div className="text-lg font-medium text-black">{((analytics.totalUsers - analytics.usersWithoutBatch) / analytics.totalUsers * 100).toFixed(1)}%</div>
                </div>
              </div>
              
              {analytics.totalBatches > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-black text-sm">Batch Distribution</h4>
                  {Object.entries(analytics.batchDistribution)
                    .filter(([batch]) => batch !== 'No Batch')
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([batch, count]) => (
                      <div key={batch} className="flex justify-between items-center p-2 bg-beige-100 rounded">
                        <span className="text-sm text-black font-light">Batch {batch}</span>
                        <span className="text-sm text-black font-medium">{count} users</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-beige-200">
            <div className="sticky top-0 bg-white border-b border-beige-200 p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-medium text-black truncate pr-4">
                  {selectedUser.name || 'User Details'} #{selectedUser.id}
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 bg-beige-100 hover:bg-beige-200 rounded-lg flex-shrink-0"
                >
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="font-medium text-black mb-3 text-sm sm:text-base">Basic Information</h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="text-black"><span className="font-light">ID:</span> <span className="font-medium">{selectedUser.id}</span></div>
                    <div className="text-black"><span className="font-light">Email:</span> <span className="font-medium break-all">{selectedUser.email || 'N/A'}</span></div>
                    <div className="text-black"><span className="font-light">Phone:</span> <span className="font-medium">{selectedUser.phone || 'N/A'}</span></div>
                    <div className="text-black"><span className="font-light">Age:</span> <span className="font-medium">{selectedUser.age || 'N/A'}</span></div>
                    <div className="text-black"><span className="font-light">Location:</span> <span className="font-medium">{selectedUser.location || 'N/A'}</span></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-black mb-3 text-sm sm:text-base">System Information</h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="text-black"><span className="font-light">Priority Score:</span> <span className="font-medium">{selectedUser.priority_score || 0}</span></div>
                    <div className="text-black"><span className="font-light">Batch Number:</span> <span className="font-medium">{selectedUser.batch_number || 'N/A'}</span></div>
                    <div className="text-black"><span className="font-light">Access Code:</span> <span className="font-medium font-mono text-xs break-all">{selectedUser.access_code || 'N/A'}</span></div>
                    <div className="text-black"><span className="font-light">Created:</span> <span className="font-medium">{formatDate(selectedUser.created_at)}</span></div>
                    <div className="text-black"><span className="font-light">Updated:</span> <span className="font-medium">{formatDate(selectedUser.updated_at)}</span></div>
                  </div>
                </div>
                
                {(selectedUser.instagram || selectedUser.linkedin || selectedUser.twitter) && (
                  <div className="sm:col-span-2">
                    <h4 className="font-medium text-black mb-3 text-sm sm:text-base">Social Media</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedUser.instagram && (
                        <a href={selectedUser.instagram} target="_blank" rel="noopener noreferrer" 
                           className="text-black hover:text-gray-600 font-light text-xs sm:text-sm">
                          Instagram ↗
                        </a>
                      )}
                      {selectedUser.linkedin && (
                        <a href={selectedUser.linkedin} target="_blank" rel="noopener noreferrer" 
                           className="text-black hover:text-gray-600 font-light text-xs sm:text-sm">
                          LinkedIn ↗
                        </a>
                      )}
                      {selectedUser.twitter && (
                        <a href={selectedUser.twitter} target="_blank" rel="noopener noreferrer" 
                           className="text-black hover:text-gray-600 font-light text-xs sm:text-sm">
                          Twitter ↗
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 