import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts'

const RatingGraph = ({ data = [], title = 'Rating Progress', platform = '', className = '', yMin, latestContest }) => {
  // Prepare chart data: each contest as a point
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    rating: item.rating,
    fullDate: new Date(item.date).getTime(),
    rank: item.rank
  })).sort((a, b) => a.fullDate - b.fullDate)

  // Find min rating for Y-axis
  const minRating = yMin !== undefined ? yMin : Math.max(0, Math.min(...chartData.map(d => d.rating)) - 100)

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-base font-bold text-blue-700 dark:text-yellow-300 mb-1">
            {d.name ? d.name : 'Contest'}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Rating: {Math.round(payload[0].value)}
          </p>
          {typeof d.rank !== 'undefined' && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Rank: {d.rank && d.rank !== 0 ? d.rank : 'NA'}</p>
          )}
        </div>
      )
    }
    return null
  }

  // Highlight last point
  const renderDot = (props) => {
    const { cx, cy, index, payload, key } = props;
    if (index === chartData.length - 1 && payload.participated) {
      return <circle key={key || index} cx={cx} cy={cy} r={7} fill="#fbbf24" stroke="#f59e42" strokeWidth={2} />;
    }
    if (payload.participated) {
      return <circle key={key || index} cx={cx} cy={cy} r={4} fill="#2563eb" stroke="#1d4ed8" strokeWidth={1} />;
    }
    return <circle key={key || index} cx={cx} cy={cy} r={3} fill="#d1d5db" />;
  }

  return (
    <div className={`card w-full ${className} bg-white dark:bg-gray-800`}>
      <div className="card-header flex flex-col md:flex-row md:items-center md:justify-between p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-800">
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white">
          {title} {platform && `(${platform})`}
        </h3>
        {latestContest && (
          <div className="mt-2 md:mt-0 md:text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">Rating {latestContest.rating}</div>
            <div className="text-gray-500 dark:text-gray-300 text-md">{latestContest.date}</div>
            <div className="font-semibold text-gray-700 dark:text-gray-200">{latestContest.name}</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Rank:{latestContest.rank}</div>
          </div>
        )}
      </div>
      <div className="card-body p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-800">
        {chartData.length > 0 ? (
          <div className="h-64 w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="idx"
                  hide={true}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[minRating, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rating" stroke="#fbbf24" fill="url(#colorRating)" fillOpacity={0.2} />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#fbbf24" 
                  strokeWidth={3}
                  dot={renderDot}
                  activeDot={{ r: 8, stroke: '#fbbf24', strokeWidth: 2 }}
                />
                <defs>
                  <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>No rating data available</p>
              <p className="text-sm">Connect your {platform} account to see your rating progress</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RatingGraph 