import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';

const LeetCodeRatingGraph = ({ timeline = [] }) => {
  if (!timeline.length) return <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">No data</div>;

  // Prepare chart data
  const chartData = timeline.map((c, idx) => ({
    idx,
    shortTitle: c.shortTitle,
    rating: c.rating,
    participated: c.participated,
    ranking: c.ranking,
    date: c.startTime ? new Date(c.startTime * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
  }));

  // Find min rating for Y-axis
  const minRating = Math.max(0, Math.min(...chartData.filter(d => d.rating !== null).map(d => d.rating)) - 100);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">{d.date}</div>
          <div className="font-semibold text-gray-900 dark:text-white">{d.shortTitle}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Rank: {d.ranking || 'N/A'}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Rating: {d.rating !== null ? d.rating : 'N/A'}</div>
        </div>
      );
    }
    return null;
  };

  // Custom dot: yellow for last, blue for participated, gray for skipped
  const renderDot = (props) => {
    const { cx, cy, index, payload } = props;
    if (index === chartData.length - 1 && payload.participated) {
      return <circle cx={cx} cy={cy} r={7} fill="#fbbf24" stroke="#f59e42" strokeWidth={2} />;
    }
    if (payload.participated) {
      return <circle cx={cx} cy={cy} r={4} fill="#2563eb" stroke="#1d4ed8" strokeWidth={1} />;
    }
    return <circle cx={cx} cy={cy} r={3} fill="#d1d5db" />;
  };

  // Build the line data: null for skipped, rating for participated
  const lineData = chartData.map(d => d.rating);

  // Build the dashed line for skipped contests
  const connectNulls = false; // Don't connect skipped contests

  return (
    <div className="card bg-white dark:bg-gray-800 w-full">
      <div className="card-header bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6">
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white">LeetCode Rating Timeline</h3>
      </div>
      <div className="card-body bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6">
        <div className="h-64 w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="shortTitle"
                interval={Math.ceil(chartData.length / 8) - 1}
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[minRating, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#fbbf24"
                strokeWidth={3}
                dot={renderDot}
                connectNulls={false}
                isAnimationActive={false}
                activeDot={{ r: 8, stroke: '#fbbf24', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeRatingGraph; 