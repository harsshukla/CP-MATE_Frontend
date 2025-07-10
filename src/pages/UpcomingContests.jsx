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
  const [modalContest, setModalContest] = useState(null)
  const [apiStatus, setApiStatus] = useState({ leetcode: 'unknown' })
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
        
        // Handle new response format
        const contestData = res.data.contests || res.data || []
        setApiStatus({
          leetcode: res.data.leetcodeApiStatus || 'unknown'
        })
        
        // Filter contests for current month (should already be filtered by backend, but double-check)
        const { start, end } = getMonthRange(today)
        const monthContests = contestData.filter(c => {
          const contestDate = new Date(c.start)
          return contestDate >= start && contestDate <= end && (c.platform === 'LeetCode' || c.platform === 'Codeforces')
        })
        
        setContests(monthContests)
        
        if (monthContests.length === 0) {
          setError('No contests found for this month.')
        }
        
        console.log(`Loaded ${monthContests.length} contests for the month`)
        
      } catch (err) {
        console.error('Error fetching contests:', err)
        setError('Unable to fetch contest data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchContests()
    // eslint-disable-next-line
  }, [])

  // Refetch contests handler
  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/contests/upcoming')
      const contestData = res.data.contests || res.data || []
      setApiStatus({
        leetcode: res.data.leetcodeApiStatus || 'unknown'
      })
      const { start, end } = getMonthRange(today)
      const monthContests = contestData.filter(c => {
        const contestDate = new Date(c.start)
        return contestDate >= start && contestDate <= end && (c.platform === 'LeetCode' || c.platform === 'Codeforces')
      })
      setContests(monthContests)
      if (monthContests.length === 0) {
        setError('No contests found for this month.')
      }
      console.log(`Refreshed: loaded ${monthContests.length} contests for the month`)
    } catch (err) {
      console.error('Error refreshing contests:', err)
      setError('Unable to fetch contest data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

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
        displayTimeIST = '20:00' 
      } else if (/Weekly/i.test(c.name)) {
        displayTimeIST = '08:00' 
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
    
    contestsByDate[dateStr].push({ 
      ...c, 
      displayTimeIST,
      isPast: new Date(c.start) < new Date(),
      phase: c.phase || (new Date(c.start) < new Date() ? 'FINISHED' : 'BEFORE')
    })
  })

  // Render
  const monthName = today.toLocaleString('default', { month: 'long' })
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center py-4 sm:py-8 px-2 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-8">Contest Calendar</h1>
      <div className="w-full max-w-6xl flex justify-end mb-2">
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-3 py-1.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm disabled:opacity-60"
          disabled={loading}
        >
          {loading ? (
            <span className="inline-block mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          ) : (
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1 1 19 5.635" /></svg>
          )}
          Refresh Contests
        </button>
      </div>
      
      {/* API Status Warning */}
      {apiStatus.leetcode === 'fallback' && (
        <div className="w-full max-w-6xl mb-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  LeetCode API Unavailable
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    Using fallback contest schedule. Some contests may be missing or inaccurate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 sm:p-6 w-full max-w-6xl overflow-x-auto">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">{monthName} {year}</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-2 min-w-[600px]">
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
                              
                              // Determine badge color based on contest status
                              const isPast = contest.isPast || contest.phase === 'FINISHED'
                              const badgeColorClass = isPast 
                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200'
                              
                              return (
                                <button
                                  key={idx}
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeColorClass} focus:outline-none break-words max-w-full`}
                                  onClick={() => {
                                    if (contest.platform === 'LeetCode') {
                                      console.log('contest.titleSlug:', contest.titleSlug);
                                      console.log('contest object:', contest);
                                    }
                                    if (contest.platform === 'LeetCode') {
                                      console.log('LeetCode Contest Object:', contest);
                                      let match;
                                      if (/weekly/i.test(contest.name)) {
                                        match = contest.name.match(/(\d+)/);
                                        console.log('Weekly regex match:', match);
                                        if (match) {
                                          console.log('LeetCode Weekly Contest Number:', match[1]);
                                        } else {
                                          console.warn('No number found in LeetCode Weekly contest name:', contest.name);
                                        }
                                      } else if (/biweekly/i.test(contest.name)) {
                                        match = contest.name.match(/(\d+)/);
                                        console.log('Biweekly regex match:', match);
                                        if (match) {
                                          console.log('LeetCode Biweekly Contest Number:', match[1]);
                                        } else {
                                          console.warn('No number found in LeetCode Biweekly contest name:', contest.name);
                                        }
                                      }
                                    }
                                    setModalContest(contest);
                                  }}
                                >
                                  <span className="mr-1">{PLATFORM_ICONS[contest.platform] || '🎯'}</span>{badgeText}
                                </button>
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
          
          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded"></div>
              <span>Upcoming</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
              <span>Past</span>
            </div>
          </div>
          
          {/* Loading and Error States */}
          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading contests...</p>
            </div>
          )}
          {error && (
            <div className="mt-4 text-center">
              <p className={error.includes('No contests found') ? 'text-gray-500 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}>
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Modal for contest details */}
      {modalContest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{
              modalContest.platform === 'LeetCode' && modalContest.title
                ? modalContest.title
                : modalContest.name || 'Contest'
            }</h2>
            <div className="mb-2 text-gray-700 dark:text-gray-200">
              <div><b>Date:</b> {(() => {
                let dateObj;
                if (modalContest.platform === 'LeetCode' && modalContest.startTime) {
                  dateObj = new Date(modalContest.startTime * 1000);
                } else {
                  dateObj = new Date(modalContest.start);
                }
                return dateObj.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
              })()}</div>
              <div>
                <b>Time:</b> {(() => {
                  let startDate, endDate;
                  if (modalContest.platform === 'LeetCode' && modalContest.startTime) {
                    startDate = new Date(modalContest.startTime * 1000);
                    endDate = new Date(startDate.getTime() + (modalContest.duration ? modalContest.duration * 60 * 60 * 1000 : 0));
                  } else {
                    startDate = new Date(modalContest.start);
                    endDate = new Date(startDate.getTime() + (modalContest.duration ? modalContest.duration * 60 * 60 * 1000 : 0));
                  }
                  const startStr = startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
                  const endStr = endDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
                  return `${startStr} - ${endStr}`;
                })()}
              </div>
              <div><b>Platform:</b> {modalContest.platform}</div>
            </div>
            {/* LeetCode: use titleSlug for contest link if available */}
            {modalContest.platform === 'LeetCode' ? (
              <a
                href={modalContest.titleSlug ? `https://leetcode.com/contest/${modalContest.titleSlug}/` : 'https://leetcode.com/contest/'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block px-4 py-2 mt-2"
              >
                Go to Contest
              </a>
            ) : (
              <a
                href={modalContest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block px-4 py-2 mt-2"
              >
                Go to Contest
              </a>
            )}
            <button onClick={() => setModalContest(null)} className="ml-4 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpcomingContests 