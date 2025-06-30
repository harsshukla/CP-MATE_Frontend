import React from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'

function getDateArray(start, end) {
  const arr = []
  let dt = new Date(start)
  while (dt <= end) {
    arr.push(new Date(dt))
    dt.setDate(dt.getDate() + 1)
  }
  return arr
}

const ActivityHeatmap = ({ data = [], title = 'Activity Heatmap', className = '' }) => {
  // Calculate start and end date for last 12 months
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(endDate.getMonth() - 11)
  startDate.setDate(1)

  // Normalize data to YYYY-MM-DD and sum up activity per day
  const activityMap = {}
  data.forEach(item => {
    const dateStr = new Date(item.date).toISOString().split('T')[0]
    if (!activityMap[dateStr]) {
      activityMap[dateStr] = 0
    }
    activityMap[dateStr] += item.problemsSolved || item.submissions || 0
  })

  // Fill in all days in the range, even if zero
  const allDates = getDateArray(startDate, endDate)
  const heatmapData = allDates.map(date => {
    const dateStr = date.toISOString().split('T')[0]
    return {
      date: dateStr,
      count: activityMap[dateStr] || 0
    }
  })

  // Get color class based on count
  const getColorClass = (value) => {
    if (!value || value.count === 0) return 'color-empty'
    if (value.count <= 2) return 'color-scale-1'
    if (value.count <= 5) return 'color-scale-2'
    if (value.count <= 10) return 'color-scale-3'
    return 'color-scale-4'
  }

  // Custom tooltip
  const getTooltipDataAttrs = (value) => {
    if (!value || !value.date) {
      return { 'data-tooltip': 'No data' }
    }
    return {
      'data-tooltip': `${value.date}: ${value.count || 0} problems solved`
    }
  }

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="card-body">
        <div className="overflow-x-auto">
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={heatmapData}
            classForValue={getColorClass}
            tooltipDataAttrs={getTooltipDataAttrs}
            showWeekdayLabels={true}
            weekdayLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
            monthLabels={[
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ]}
            gutterSize={1}
            square={true}
            width={600}
            height={90}
          />
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

export default ActivityHeatmap 