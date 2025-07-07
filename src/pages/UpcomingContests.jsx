import React, { useEffect, useState } from 'react'
import api from '../services/api'

const PLATFORM_ICONS = {
  Codeforces: '🏆',
  LeetCode: '🟧',
  AtCoder: '🇯🇵',
  // Add more as needed
}

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { start, end }
}

function getMonthMatrix(year, month) {
  // month: 0-based
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const firstWeekday = (firstDay.getDay() + 6) % 7 // 0=Monday, 6=Sunday
  const daysInMonth = lastDay.getDate()
  const matrix = []
  let week = Array(firstWeekday).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d)
    if (week.length === 7) {
      matrix.push(week)
      week = []
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null)
    matrix.push(week)
  }
  return matrix
}

const UpcomingContests = () => {
  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const monthMatrix = getMonthMatrix(year, month)

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get('/contests/upcoming')
        const { start, end } = getMonthRange(today)
        const monthContests = (res.data || []).filter(c => {
          const t = new Date(c.start)
          return t >= start && t <= end
        })
        setContests(monthContests)
        if (monthContests.length === 0) {
          setError('No upcoming contests this month.')
        }
      } catch (err) {
        setError('Unable to fetch contest data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchContests()
    // eslint-disable-next-line
  }, [])

  // Group contests by date string (YYYY-MM-DD)
  const contestsByDate = {}
  contests.forEach(c => {
    const dateObj = new Date(c.start)
    // Always use UTC date from API for mapping
    const dateStr = dateObj.toISOString().split('T')[0]
    if (!contestsByDate[dateStr]) contestsByDate[dateStr] = []
    // For badge, set display time as before
    let displayTimeIST = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })
    if (c.platform === 'LeetCode') {
      if (/Biweekly/i.test(c.name)) {
        displayTimeIST = '20:00' // Always show 8:00 PM IST for Biweekly
      } else if (/Weekly/i.test(c.name)) {
        displayTimeIST = '08:00' // Always show 8:00 AM IST for Weekly
      }
    } else if (c.platform === 'Codeforces') {
      // Try to extract division info
      const divMatch = c.name.match(/Div\.? ?(\d+)/i)
      if (divMatch) {
        displayTimeIST = `CF Div-${divMatch[1]}`
      } else {
        displayTimeIST = 'CF'
      }
    }
    contestsByDate[dateStr].push({ ...c, displayTimeIST })
  })

  // Render
  const monthName = today.toLocaleString('default', { month: 'long' })
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Upcoming Contests</h1>
      <div className="w-full flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-6xl">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">{monthName} {year}</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-2">
              <thead>
                <tr>
                  {weekDays.map(day => (
                    <th key={day} className="text-lg font-bold text-center text-gray-700 dark:text-gray-200">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthMatrix.map((week, i) => (
                  <tr key={i}>
                    {week.map((d, j) => {
                      let cellDate = null
                      let cellDateObj = null
                      if (d) {
                        // Always use UTC for cell date
                        cellDateObj = new Date(Date.UTC(year, month, d))
                        cellDate = cellDateObj.toISOString().split('T')[0]
                      }
                      const isToday = d && today.getUTCDate() === d && today.getUTCMonth() === month && today.getUTCFullYear() === year
                      return (
                        <td
                          key={j}
                          className={`align-top bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-2 w-[150px] h-[150px] ${isToday ? 'ring-4 ring-blue-400' : ''}`}
                          style={{ minWidth: 150, width: 150, minHeight: 150, verticalAlign: 'top' }}
                        >
                          <div className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1 text-left">
                            {d || ''}
                          </div>
                          <div className="flex flex-col gap-1">
                            {cellDate && contestsByDate[cellDate] && contestsByDate[cellDate].map((contest, idx) => {
                              let badgeText = contest.name
                              if (contest.platform === 'LeetCode') {
                                if (/Biweekly/i.test(contest.name)) {
                                  badgeText = 'LC Biweekly'
                                } else if (/Weekly/i.test(contest.name)) {
                                  badgeText = 'LC Weekly'
                                }
                              } else if (contest.platform === 'Codeforces') {
                                // Try to extract division info
                                const divMatch = contest.name.match(/Div\.? ?(\d+)/i)
                                if (divMatch) {
                                  badgeText = `CF Div-${divMatch[1]}`
                                } else {
                                  badgeText = 'CF'
                                }
                              }
                              return (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <span className="mr-1">{PLATFORM_ICONS[contest.platform] || '🎯'}</span>{badgeText}
                                </span>
                              )
                            })}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && <p>Loading...</p>}
          {error && <p className={error.includes('No upcoming') ? 'text-gray-500' : 'text-red-600'}>{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default UpcomingContests 