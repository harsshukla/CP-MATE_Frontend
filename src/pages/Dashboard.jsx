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

  useEffect(() => {
    const handler = () => {
      refreshStats();
    };
    window.addEventListener('handlesUpdated', handler);
    return () => window.removeEventListener('handlesUpdated', handler);
  }, [refreshStats]);

  const getPlatformStats = (platform) =>
    stats?.find((s) => s.platform === platform) || {}

  const leetcodeStats = getPlatformStats('leetcode')
  const codeforcesStats = getPlatformStats('codeforces')

  // Build merged activity with platform info for each day
  const leetActivity = (leetcodeStats?.activity?.dailyActivity || []).map(item => ({
    ...item,
    platform: 'LeetCode',
    submissions: item.submissions || 0
  }));
  const cfActivity = (codeforcesStats?.activity?.dailyActivity || []).map(item => ({
    ...item,
    platform: 'Codeforces',
    submissions: item.submissions || 0
  }));
  const mergedActivity = [...leetActivity, ...cfActivity];

  const leetcodeSolved =
    (leetcodeStats?.problems?.byDifficulty?.easy || 0) +
    (leetcodeStats?.problems?.byDifficulty?.medium || 0) +
    (leetcodeStats?.problems?.byDifficulty?.hard || 0)
  const codeforcesSolved = codeforcesStats?.problems?.solved || 0
  const totalSolved = leetcodeSolved + codeforcesSolved

  // Build a map of all activity by date string
  const activityMap = {};
  mergedActivity.forEach(d => {
    const dateStr = new Date(d.date).toISOString().split('T')[0];
    activityMap[dateStr] = (activityMap[dateStr] || 0) + (d.problemsSolved || 0);
  });
  // Get the full range of dates for the heatmap (last 12 months)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 11);
  startDate.setDate(1);
  let maxStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;
  let streak = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    if (activityMap[dateStr] > 0) {
      tempStreak++;
      if (dateStr === todayStr) {
        streak = tempStreak; // current streak ends today
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else {
      tempStreak = 0;
      if (dateStr === todayStr) streak = 0;
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          title="Total Solved"
          value={totalSolved}
          icon={CheckCircle}
          color="primary"
        />
        <StatsCard
          title="Current Streak"
          value={streak}
          icon={Flame}
          color="danger"
        />
        <StatsCard
          title="Max Streak"
          value={maxStreak}
          icon={Flame}
          color="warning"
        />
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto w-full">
        <ActivityHeatmap data={mergedActivity} />
      </div>

      {/* LeetCode Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start min-h-[420px]">
        <div className="space-y-4 sm:space-y-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
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
          <div className="w-full overflow-x-auto">
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
        <div className="flex flex-col h-full justify-stretch min-h-[420px] w-full overflow-x-auto">
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
