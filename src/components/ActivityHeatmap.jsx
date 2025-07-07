import React, { useState, useRef } from 'react'
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

  // Build a map of all activity for each date and platform
  const platformMap = {}
  data.forEach(item => {
    const dateStr = new Date(item.date).toISOString().split('T')[0]
    if (!platformMap[dateStr]) platformMap[dateStr] = {}
    if (!platformMap[dateStr][item.platform]) platformMap[dateStr][item.platform] = 0
    platformMap[dateStr][item.platform] += item.submissions || 0
  })

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

  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' })
  const containerRef = useRef(null)

  // Custom click handler for heatmap cells
  const handleCellClick = (value) => {
    if (!value || !value.date) {
      setTooltip({ visible: false, x: 0, y: 0, content: '' })
      return
    }
    const dateStr = value.date
    const platforms = platformMap[dateStr] || {}
    let tooltipText = `${dateStr}`
    const lines = []
    lines.push(`LeetCode: ${platforms['LeetCode'] || 0} submissions`)
    lines.push(`Codeforces: ${platforms['Codeforces'] || 0} submissions`)
    tooltipText += `\n` + lines.join('\n')
    setTimeout(() => {
      const svg = containerRef.current.querySelector('svg')
      if (!svg) return
      const rect = svg.querySelector(`[data-date='${dateStr}']`)
      if (rect) {
        const rectBox = rect.getBoundingClientRect()
        // Position tooltip absolutely in the viewport
        const x = rectBox.left + rectBox.width / 2
        const y = rectBox.top
        setTooltip({
          visible: true,
          x,
          y,
          content: tooltipText
        })
      }
    }, 0)
  }

  // Hide tooltip on click outside
  React.useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setTooltip(t => t.visible ? { ...t, visible: false } : t)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className={`card ${className}`} ref={containerRef} style={{ position: 'relative' }}>
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
            onClick={handleCellClick}
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
          {tooltip.visible && (
            <div
              style={{
                position: 'absolute',
                left: tooltip.x,
                top: tooltip.y - 36,
                background: '#222',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: 4,
                fontSize: 12,
                whiteSpace: 'pre',
                zIndex: 100,
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                maxWidth: 120,
                minWidth: 80,
                textAlign: 'left',
              }}
            >
              {tooltip.content}
            </div>
          )}
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