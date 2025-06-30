import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useStats } from '../hooks/useStats'
import StatsCard from '../components/StatsCard'
import ActivityHeatmap from '../components/ActivityHeatmap'
import RatingGraph from '../components/RatingGraph'
import ContestTable from '../components/ContestTable'
import { CheckCircle, Flame, Zap, BarChart3, Trophy } from 'lucide-react'
import { leetcodeAPI } from '../services/api'

const Dashboard = () => {
  const { user } = useAuth()
  const { stats, loading, error, refreshStats } = useStats()

  const [lcContestData, setLcContestData] = useState(null)
  const [lcContestLoading, setLcContestLoading] = useState(true)
  const [lcContestError, setLcContestError] = useState(null)

  useEffect(() => {
    const fetchLeetCodeContest = async () => {
      if (!user?.handles?.leetcode) return setLcContestLoading(false)
      setLcContestLoading(true)
      setLcContestError(null)
      try {
        const res = await leetcodeAPI.getContestHistory(user.handles.leetcode)
        setLcContestData(res.data)
      } catch (err) {
        setLcContestError('Failed to fetch LeetCode contest data')
      } finally {
        setLcContestLoading(false)
      }
    }
    fetchLeetCodeContest()
  }, [user?.handles?.leetcode])

  const getPlatformStats = (platform) =>
    stats?.find((s) => s.platform === platform) || {}

  const leetcodeStats = getPlatformStats('leetcode')
  const codeforcesStats = getPlatformStats('codeforces')

  const mergedActivity = [
    ...(leetcodeStats?.activity?.dailyActivity || []),
    ...(codeforcesStats?.activity?.dailyActivity || [])
  ].reduce((acc, curr) => {
    const dateStr = new Date(curr.date).toISOString().split('T')[0]
    if (!acc[dateStr]) {
      acc[dateStr] = { date: curr.date, problemsSolved: 0, submissions: 0 }
    }
    acc[dateStr].problemsSolved += curr.problemsSolved || 0
    acc[dateStr].submissions += curr.submissions || 0
    return acc
  }, {})
  const heatmapData = Object.values(mergedActivity)

  const leetcodeSolved =
    (leetcodeStats?.problems?.byDifficulty?.easy || 0) +
    (leetcodeStats?.problems?.byDifficulty?.medium || 0) +
    (leetcodeStats?.problems?.byDifficulty?.hard || 0)
  const codeforcesSolved = codeforcesStats?.problems?.solved || 0
  const totalSolved = leetcodeSolved + codeforcesSolved
  const streak = heatmapData.length > 0 ? Math.max(...heatmapData.map(d => d.problemsSolved > 0 ? 1 : 0)) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your competitive programming progress
          </p>
        </div>
        <button
          className="btn-primary flex items-center space-x-2"
          onClick={refreshStats}
          disabled={loading}
        >
          <Zap className="w-4 h-4" />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatsCard
          title="Total Solved"
          value={totalSolved}
          icon={CheckCircle}
          color="primary"
        />
        <StatsCard
          title="Streak"
          value={streak}
          icon={Flame}
          color="danger"
        />
      </div>

      {/* Heatmap */}
      <ActivityHeatmap data={heatmapData} />

      {/* LeetCode Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start min-h-[420px]">
        <div className="space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <StatsCard
              title="LeetCode Solved"
              value={leetcodeSolved}
              icon={CheckCircle}
              color="primary"
              subtitle="Problems solved on LeetCode"
              className="py-2 px-3 text-base w-full"
            />
            <StatsCard
              title="LeetCode Rating"
              value={lcContestData?.userContestRanking?.rating ? Math.round(lcContestData.userContestRanking.rating) : 'N/A'}
              icon={CheckCircle}
              color="warning"
              subtitle="Current LeetCode contest rating"
              className="py-2 px-3 text-base w-full"
            />
          </div>
          <div className="w-full" style={{ minWidth: 0 }}>
            <RatingGraph
              data={(() => {
                const history = (lcContestData?.userContestRankingHistory || [])
                  .filter(h => typeof h.rating === 'number')
                if (!history.length) return []
                const sorted = history.slice().sort((a, b) => a.contest.startTime - b.contest.startTime)
                return sorted.map(h => ({
                  name: h.contest?.title,
                  date: h.contest?.startTime ? new Date(h.contest.startTime * 1000) : null,
                  rating: h.rating,
                  rank: h.ranking
                }))
              })()}
              title={<span className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-yellow-500" />LeetCode Rating</span>}
              yMin={1300}
              style={{ height: 340, minHeight: 260, width: '100%' }}
            />
          </div>
        </div>
        <div className="flex flex-col h-full justify-stretch min-h-[420px]">
          <ContestTable
            contests={(() => {
              const participated = (lcContestData?.userContestRankingHistory || [])
                .filter(h => typeof h.ranking === 'number' && h.ranking !== 0 && h.contest?.startTime && typeof h.rating === 'number')
                .sort((a, b) => b.contest.startTime - a.contest.startTime)
                .map(h => ({
                  name: h.contest?.title,
                  date: h.contest?.startTime ? new Date(h.contest.startTime * 1000) : null,
                  rank: h.ranking,
                  rating: h.rating,
                  participants: h.totalParticipants || lcContestData?.userContestRanking?.totalParticipants || null
                }))
              return participated
            })()}
            title="LeetCode Contests"
            platform="LeetCode"
            className="h-full min-h-[420px]"
          />
          {lcContestLoading && <div className="text-gray-500 text-center mt-4">Loading...</div>}
          {lcContestError && <div className="text-red-600 text-center mt-4">{lcContestError}</div>}
        </div>
      </div>

      {/* Codeforces Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start min-h-[420px]">
        <div className="space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <StatsCard
              title="Codeforces Solved"
              value={codeforcesSolved}
              icon={CheckCircle}
              color="primary"
              subtitle="Problems solved on Codeforces"
              className="py-2 px-3 text-base w-full"
            />
            <StatsCard
              title="Codeforces Rating"
              value={codeforcesStats?.rating?.current ? Math.round(codeforcesStats.rating.current) : 'N/A'}
              icon={CheckCircle}
              color="warning"
              subtitle="Current Codeforces rating"
              className="py-2 px-3 text-base w-full"
            />
          </div>
          <div className="w-full" style={{ minWidth: 0 }}>
            <RatingGraph
              data={(() => {
                const ratingHistory = codeforcesStats?.rating?.history || []
                const contestHistory = codeforcesStats?.contests?.history || []
                if (!ratingHistory.length) return []
                const contestMap = {}
                contestHistory.forEach(c => {
                  if (c.name) contestMap[c.name.trim().toLowerCase()] = c
                })
                return ratingHistory.map(h => {
                  let contest = null
                  if (h.contest) {
                    contest = contestMap[h.contest.trim().toLowerCase()]
                  }
                  if (!contest && h.date) {
                    contest = contestHistory.find(
                      c => c.date && new Date(c.date).toDateString() === new Date(h.date).toDateString()
                    )
                  }
                  let rank = contest?.rank
                  if (!rank) rank = null
                  return {
                    name: contest?.name || h.contest || '',
                    date: h.date ? new Date(h.date).getTime() : null,
                    rating: h.rating,
                    rank: rank
                  }
                })
              })()}
              title={<span className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" />Codeforces Rating</span>}
              style={{ height: 340, minHeight: 260, width: '100%' }}
            />
          </div>
        </div>
        <div className="flex flex-col h-full justify-stretch min-h-[420px]">
          <ContestTable
            contests={(() => {
              const history = (codeforcesStats?.contests?.history || [])
                .filter(c => typeof c.rank === 'number' && c.rank !== 0 && typeof c.rating === 'number' && c.date)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(c => ({
                  name: c.name,
                  date: c.date,
                  rank: c.rank,
                  rating: c.rating
                }))
              return history
            })()}
            title="Codeforces Contests"
            platform="Codeforces"
            className="h-full min-h-[420px]"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
