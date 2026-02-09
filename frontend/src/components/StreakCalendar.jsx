import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import './StreakCalendar.css'

function StreakCalendar({ activityDates = [], currentStreak = 0 }) {
    const [monthOffset, setMonthOffset] = useState(0) // 0 = current month

    // Get month data for display
    const monthData = useMemo(() => {
        const today = new Date()
        const targetDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1)
        const year = targetDate.getFullYear()
        const month = targetDate.getMonth()

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDay = firstDay.getDay() // 0 = Sunday

        const monthName = targetDate.toLocaleString('default', { month: 'long', year: 'numeric' })

        return {
            year,
            month,
            daysInMonth,
            startingDay,
            monthName
        }
    }, [monthOffset])

    // Convert activity dates to a Set for quick lookup
    const activitySet = useMemo(() => {
        const set = new Set()
        activityDates.forEach(dateStr => {
            const date = new Date(dateStr)
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
            set.add(key)
        })
        return set
    }, [activityDates])

    // Count activities per day for intensity
    const activityCount = useMemo(() => {
        const counts = {}
        activityDates.forEach(dateStr => {
            const date = new Date(dateStr)
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
            counts[key] = (counts[key] || 0) + 1
        })
        return counts
    }, [activityDates])

    // Check if a day has activity
    const hasActivity = (day) => {
        const key = `${monthData.year}-${monthData.month}-${day}`
        return activitySet.has(key)
    }

    // Get activity level (0-4) for styling
    const getActivityLevel = (day) => {
        const key = `${monthData.year}-${monthData.month}-${day}`
        const count = activityCount[key] || 0
        if (count === 0) return 0
        if (count === 1) return 1
        if (count <= 3) return 2
        if (count <= 5) return 3
        return 4
    }

    // Check if day is today
    const isToday = (day) => {
        const today = new Date()
        return (
            monthData.year === today.getFullYear() &&
            monthData.month === today.getMonth() &&
            day === today.getDate()
        )
    }

    // Check if day is in the future
    const isFuture = (day) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const checkDate = new Date(monthData.year, monthData.month, day)
        return checkDate > today
    }

    // Generate calendar grid
    const renderCalendar = () => {
        const days = []
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        // Weekday headers
        weekDays.forEach(day => {
            days.push(
                <div key={`header-${day}`} className="calendar-header-cell">
                    {day}
                </div>
            )
        })

        // Empty cells for start of month
        for (let i = 0; i < monthData.startingDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-cell empty" />)
        }

        // Days of the month
        for (let day = 1; day <= monthData.daysInMonth; day++) {
            const active = hasActivity(day)
            const level = getActivityLevel(day)
            const today = isToday(day)
            const future = isFuture(day)

            days.push(
                <div
                    key={day}
                    className={`calendar-cell 
                        ${active ? 'active' : ''} 
                        ${today ? 'today' : ''} 
                        ${future ? 'future' : ''}
                        level-${level}
                    `}
                    title={active ? `Activity on ${monthData.monthName} ${day}` : ''}
                >
                    <span className="day-number">{day}</span>
                    {active && <span className="activity-dot" />}
                </div>
            )
        }

        return days
    }

    const goToPrevMonth = () => {
        if (monthOffset < 11) { // Max 12 months back
            setMonthOffset(prev => prev + 1)
        }
    }

    const goToNextMonth = () => {
        if (monthOffset > 0) {
            setMonthOffset(prev => prev - 1)
        }
    }

    // Calculate stats for the current view
    const monthStats = useMemo(() => {
        let activeDays = 0
        for (let day = 1; day <= monthData.daysInMonth; day++) {
            if (hasActivity(day)) activeDays++
        }
        return { activeDays }
    }, [monthData, activitySet])

    return (
        <div className="streak-calendar">
            {/* Header with streak */}
            <div className="calendar-top-header">
                <div className="streak-badge">
                    <Flame className="streak-icon" size={20} />
                    <span className="streak-count">{currentStreak}</span>
                    <span className="streak-label">day streak</span>
                </div>
                <div className="month-stats">
                    <span className="active-days">{monthStats.activeDays}</span>
                    <span className="active-days-label">active days this month</span>
                </div>
            </div>

            {/* Month navigation */}
            <div className="calendar-nav">
                <button
                    className="nav-btn"
                    onClick={goToPrevMonth}
                    disabled={monthOffset >= 11}
                >
                    <ChevronLeft size={20} />
                </button>
                <h3 className="month-title">{monthData.monthName}</h3>
                <button
                    className="nav-btn"
                    onClick={goToNextMonth}
                    disabled={monthOffset === 0}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Calendar grid */}
            <div className="calendar-grid">
                {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="calendar-legend">
                <span className="legend-label">Less</span>
                <div className="legend-scale">
                    <div className="legend-cell level-0" />
                    <div className="legend-cell level-1" />
                    <div className="legend-cell level-2" />
                    <div className="legend-cell level-3" />
                    <div className="legend-cell level-4" />
                </div>
                <span className="legend-label">More</span>
            </div>
        </div>
    )
}

export default StreakCalendar
