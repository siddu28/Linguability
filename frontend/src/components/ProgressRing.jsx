import { useEffect, useState, useRef } from 'react'
import { Target, Flame, Trophy } from 'lucide-react'
import './ProgressRing.css'

function ProgressRing({
    progress = 0,
    size = 160,
    strokeWidth = 12,
    goal = 7,
    current = 0,
    label = "Weekly Goal",
    sublabel = "lessons completed"
}) {
    const [animatedProgress, setAnimatedProgress] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const ringRef = useRef(null)

    // Calculate circle properties
    const center = size / 2
    const radius = center - strokeWidth / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

    // Animate progress when visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.3 }
        )

        if (ringRef.current) {
            observer.observe(ringRef.current)
        }

        return () => observer.disconnect()
    }, [])

    // Smooth animation when progress changes or becomes visible
    useEffect(() => {
        if (!isVisible) return

        const targetProgress = Math.min(progress, 100)
        const duration = 1500 // ms
        const startTime = Date.now()
        const startProgress = animatedProgress

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progressRatio = Math.min(elapsed / duration, 1)

            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progressRatio, 3)

            const currentProgress = startProgress + (targetProgress - startProgress) * eased
            setAnimatedProgress(currentProgress)

            if (progressRatio < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [progress, isVisible])

    // Get status and color based on progress
    const getStatus = () => {
        if (progress >= 100) return { text: 'Goal Complete! 🎉', color: '#22C55E', icon: Trophy }
        if (progress >= 70) return { text: 'Almost there!', color: '#F59E0B', icon: Flame }
        if (progress >= 40) return { text: 'Keep going!', color: '#E91E8C', icon: Target }
        return { text: 'Just started', color: '#6B7280', icon: Target }
    }

    const status = getStatus()
    const StatusIcon = status.icon

    return (
        <div className="progress-ring-container" ref={ringRef}>
            <div className="ring-wrapper" style={{ width: size, height: size }}>
                {/* Background ring */}
                <svg className="ring-svg" viewBox={`0 0 ${size} ${size}`}>
                    {/* Track */}
                    <circle
                        className="ring-track"
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />

                    {/* Progress */}
                    <circle
                        className="ring-progress"
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                            stroke: status.color,
                            filter: `drop-shadow(0 0 8px ${status.color}40)`
                        }}
                    />

                    {/* Glow effect at progress tip */}
                    {animatedProgress > 0 && (
                        <circle
                            className="ring-glow"
                            cx={center}
                            cy={center}
                            r={radius}
                            strokeWidth={strokeWidth + 4}
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - 8}
                            style={{
                                stroke: status.color,
                                opacity: 0.3,
                                transform: `rotate(${(animatedProgress / 100) * 360 - 90}deg)`,
                                transformOrigin: 'center'
                            }}
                        />
                    )}
                </svg>

                {/* Center content */}
                <div className="ring-center">
                    <div className="ring-percentage" style={{ color: status.color }}>
                        {Math.round(animatedProgress)}%
                    </div>
                    <div className="ring-fraction">
                        <span className="ring-current">{current}</span>
                        <span className="ring-divider">/</span>
                        <span className="ring-goal">{goal}</span>
                    </div>
                </div>
            </div>

            {/* Labels */}
            <div className="ring-labels">
                <div className="ring-status" style={{ color: status.color }}>
                    <StatusIcon size={16} />
                    <span>{status.text}</span>
                </div>
                <h3 className="ring-label">{label}</h3>
                <p className="ring-sublabel">{sublabel}</p>
            </div>

            {/* Mini stats */}
            <div className="ring-stats">
                <div className="ring-stat">
                    <span className="stat-value">{goal - current}</span>
                    <span className="stat-label">left</span>
                </div>
                <div className="ring-stat-divider" />
                <div className="ring-stat">
                    <span className="stat-value">{current}</span>
                    <span className="stat-label">done</span>
                </div>
            </div>
        </div>
    )
}

export default ProgressRing
