import { useState, useEffect, useCallback } from 'react'
import { statsAPI } from '../services/api'

export const useStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fetching, setFetching] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      setFetching(true)
      setError(null)
      const response = await statsAPI.getStats()
      setStats(response.data.stats)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch stats')
    } finally {
      setFetching(false)
    }
  }, [])

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await statsAPI.getDashboard()
      setStats(response.data.stats)
      return response.data.overview
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard data')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshStats = useCallback(async () => {
    try {
      setFetching(true)
      setError(null)
      const response = await statsAPI.fetchStats()
      // After fetching new stats, get the updated data
      await fetchStats()
      return response.data.results
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to refresh stats')
      return null
    } finally {
      setFetching(false)
    }
  }, [fetchStats])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return {
    stats,
    loading,
    error,
    fetching,
    fetchStats,
    fetchDashboard,
    refreshStats,
  }
} 