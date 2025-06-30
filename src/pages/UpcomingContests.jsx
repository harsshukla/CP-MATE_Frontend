import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import api from '../services/api'

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { start, end }
}

const getContestUrl = (contest) => {
  if (contest.platform === 'Codeforces') {
    return `https://codeforces.com/contest/${contest.id}`
  }
  if (contest.platform === 'LeetCode') {
    return `https://leetcode.com/contest/${contest.id}`
  }
  return '#'
}

const UpcomingContests = () => {
  const [contests, setContests] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch merged upcoming contests from backend
        const res = await api.get('/contests/upcoming')
        const { start, end } = getMonthRange(new Date())
        // Only show contests in the current month
        const monthContests = (res.data || []).filter(
          c => {
            const t = new Date(c.start)
            return t >= start && t <= end
          }
        )
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
  }, [])

  // Get contest dates for the current month
  const contestDates = contests.map(c => c.start.toISOString().split('T')[0])

  // Get contests for selected date
  const contestsOnDate = contests.filter(
    c => c.start.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
  )

  // Tile content for calendar
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0]
      if (contestDates.includes(dateStr)) {
        return (
          <button
            type="button"
            className="w-2 h-2 mx-auto mt-1 rounded-full bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
            tabIndex={-1}
            aria-label="View contests"
            onClick={e => {
              e.stopPropagation()
              setSelectedDate(date)
            }}
          ></button>
        )
      }
    }
    return null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Contests</h1>
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Month</h3>
        </div>
        <div className="card-body flex flex-col items-center">
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            tileContent={tileContent}
            minDetail="month"
            maxDetail="month"
            showNeighboringMonth={false}
          />
          <div className="mt-6 w-full">
            <h4 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">Contests on {selectedDate.toLocaleDateString()}</h4>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className={error.includes('No upcoming') ? 'text-gray-500' : 'text-red-600'}>{error}</p>
            ) : contestsOnDate.length === 0 ? (
              <p className="text-gray-500">No contests on this day.</p>
            ) : (
              <ul className="space-y-2">
                {contestsOnDate.map(contest => (
                  <li key={contest.id} className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-400">{contest.name}</div>
                      <div className="text-xs text-gray-500">{contest.platform} &bull; {contest.start.toLocaleTimeString()} &bull; {contest.duration.toFixed(1)} hrs</div>
                    </div>
                    <a
                      href={getContestUrl(contest)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary mt-2 md:mt-0 md:ml-4 px-3 py-1 text-sm"
                    >
                      Go to Contest
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpcomingContests 