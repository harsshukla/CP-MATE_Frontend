import React from 'react'
import { Trophy, Calendar, Users } from 'lucide-react'

const ContestTable = ({ contests = [], title = 'Recent Contests', platform = '', className = '' }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRankColor = (rank, participants) => {
    if (!rank || !participants) return 'text-gray-500'
    const percentage = (rank / participants) * 100
    if (percentage <= 10) return 'text-green-600 dark:text-green-400'
    if (percentage <= 25) return 'text-blue-600 dark:text-blue-400'
    if (percentage <= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getDeltaColor = (delta) => {
    if (delta === 'N/A' || delta === 0 || delta === null || delta === undefined) return 'text-gray-500'
    return delta > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  // Calculate rating delta for each contest
  const contestsWithDelta = contests.map((contest, idx) => {
    let delta = 'N/A';
    let rating = typeof contest.rating === 'number' ? Math.round(contest.rating) : null;
    if (typeof contest.rank === 'number' && contest.rank !== 0 && typeof contest.rating === 'number') {
      // Find previous contest with a valid rating
      let prevIdx = idx + 1;
      while (prevIdx < contests.length && typeof contests[prevIdx].rating !== 'number') {
        prevIdx++;
      }
      let prevRating = null;
      if (prevIdx < contests.length && typeof contests[prevIdx].rating === 'number') {
        prevRating = contests[prevIdx].rating;
      } else {
        // For first contest, use 1500 for LeetCode, 0 for Codeforces
        prevRating = platform === 'LeetCode' ? 1500 : 0;
      }
      delta = Math.round(contest.rating - prevRating);
      if (delta > 0) delta = `+${delta}`;
    }
    return { ...contest, delta, rating };
  });

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="card-body">
        {contestsWithDelta.length > 0 ? (
          <div className="overflow-x-auto">
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rating Δ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {contestsWithDelta.map((contest, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {contest.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(contest.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getRankColor(contest.rank, contest.participants)}`}>
                          {typeof contest.rank === 'number' && contest.rank !== 0 ? `#${contest.rank.toLocaleString()}` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {contest.rating !== null ? contest.rating : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getDeltaColor(contest.delta)}`}>
                          {contest.delta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>No contest data available</p>
            <p className="text-sm">Connect your {platform} account to see your contest history</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContestTable 