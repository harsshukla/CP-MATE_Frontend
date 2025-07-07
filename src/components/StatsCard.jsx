import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary', 
  trend, 
  subtitle,
  className = '' 
}) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400',
    success: 'bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-400',
    warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900 dark:text-warning-400',
    danger: 'bg-danger-100 text-danger-600 dark:bg-danger-900 dark:text-danger-400',
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  }

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString()
    }
    return val || '0'
  }

  return (
    <div className={`card break-words w-full ${className}`}>
      <div className="card-body p-3 sm:p-4 md:p-6 text-sm sm:text-base w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 min-w-0 w-full">
          <div className="flex items-center min-w-0 w-full">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="ml-4 min-w-0 w-full">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                {title}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate break-words">
                {formatValue(value)}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {trend && (
            <div className={`flex items-center text-sm ${
              trend > 0 ? 'text-success-600 dark:text-success-400' : 
              trend < 0 ? 'text-danger-600 dark:text-danger-400' : 
              'text-gray-500 dark:text-gray-400'
            }`}>
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4 mr-1" />
              ) : null}
              {trend !== 0 && `${Math.abs(trend)}%`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatsCard 