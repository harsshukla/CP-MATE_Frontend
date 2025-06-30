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

  const getRatingChangeColor = (change) => {
    if (!change) return 'text-gray-500'
    return change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="card-body">
        {contests.length > 0 ? (
          <div className="overflow-x-auto">
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
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {contests.map((contest, index) => (
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
                        #{contest.rank?.toLocaleString() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getRatingChangeColor(contest.rating)}`}>
                        {contest.rating?.toLocaleString() || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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