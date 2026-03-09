/**
 * ============================================================
 * Scheduled Email Jobs Routes
 * ============================================================
 * 
 * Cron jobs for sending scheduled emails:
 * - Daily 7:00 AM: Streak reminders for inactive users
 * - Sunday 7:00 AM: Weekly summary emails
 * 
 * Call this endpoint via external cron service (cron-job.org, Render Cron, etc.)
 */

const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')
const {
    sendStreakReminder,
    sendWeeklySummary,
    sendReengagementEmail
} = require('../services/emailService')

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null

// Simple auth key for cron jobs (set in environment)
const CRON_SECRET = process.env.CRON_SECRET || 'linguability-cron-2026'

/**
 * Middleware to verify cron request
 */
const verifyCronRequest = (req, res, next) => {
    const authHeader = req.headers.authorization
    const providedSecret = authHeader?.replace('Bearer ', '') || req.query.secret

    if (providedSecret !== CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
    next()
}

/**
 * POST /api/cron/daily
 * 
 * Daily job at 7:00 AM:
 * - Send streak reminders to users who have a streak but haven't practiced today
 * - Send re-engagement emails to users inactive for 7+ days
 */
router.post('/daily', verifyCronRequest, async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not configured' })
    }

    const results = {
        streakReminders: { sent: 0, failed: 0 },
        reengagement: { sent: 0, failed: 0 },
        errors: []
    }

    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Get users with their profiles and last activity
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('user_id, display_name, email, streak, last_activity')

        if (profileError) {
            console.error('Error fetching profiles:', profileError)
            results.errors.push('Failed to fetch profiles')
        }

        if (profiles && profiles.length > 0) {
            for (const profile of profiles) {
                if (!profile.email) continue

                const lastActivity = profile.last_activity ? new Date(profile.last_activity) : null
                const daysSinceActivity = lastActivity
                    ? Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24))
                    : 999

                // Send streak reminder if user has streak and didn't practice yesterday
                if (profile.streak > 0 && daysSinceActivity === 1) {
                    try {
                        const result = await sendStreakReminder(
                            profile.email,
                            profile.display_name || 'Learner',
                            profile.streak
                        )
                        if (result.success) {
                            results.streakReminders.sent++
                            // Create in-app notification too
                            await createNotification(profile.user_id, {
                                type: 'streak',
                                title: 'Streak Reminder',
                                message: `Don't break your ${profile.streak}-day streak! Complete a lesson today.`
                            })
                        } else {
                            results.streakReminders.failed++
                        }
                    } catch (err) {
                        results.streakReminders.failed++
                        results.errors.push(`Streak reminder failed for ${profile.user_id}`)
                    }
                }

                // Send re-engagement email if inactive for 7+ days
                if (daysSinceActivity >= 7 && daysSinceActivity < 30) {
                    // Only send once per week (check if we sent one in last 7 days)
                    const { data: recentNotif } = await supabase
                        .from('notifications')
                        .select('id')
                        .eq('user_id', profile.user_id)
                        .eq('type', 'reengagement')
                        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                        .limit(1)

                    if (!recentNotif || recentNotif.length === 0) {
                        try {
                            const result = await sendReengagementEmail(
                                profile.email,
                                profile.display_name || 'Learner',
                                daysSinceActivity
                            )
                            if (result.success) {
                                results.reengagement.sent++
                                await createNotification(profile.user_id, {
                                    type: 'reengagement',
                                    title: 'We miss you!',
                                    message: `It's been ${daysSinceActivity} days since your last lesson. Come back and continue learning!`
                                })
                            } else {
                                results.reengagement.failed++
                            }
                        } catch (err) {
                            results.reengagement.failed++
                        }
                    }
                }
            }
        }

        console.log('Daily cron job completed:', results)
        res.json({
            success: true,
            message: 'Daily email job completed',
            results
        })

    } catch (error) {
        console.error('Daily cron job error:', error)
        res.status(500).json({ error: 'Job failed', message: error.message })
    }
})

/**
 * POST /api/cron/weekly
 * 
 * Weekly job (Sundays at 7:00 AM):
 * - Send weekly summary emails with learning stats
 */
router.post('/weekly', verifyCronRequest, async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not configured' })
    }

    const results = {
        summaries: { sent: 0, failed: 0 },
        errors: []
    }

    try {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        // Get all users with profiles
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('user_id, display_name, email, streak')

        if (profileError) {
            results.errors.push('Failed to fetch profiles')
        }

        if (profiles && profiles.length > 0) {
            for (const profile of profiles) {
                if (!profile.email) continue

                try {
                    // Get user's weekly stats
                    const stats = await getWeeklyStats(profile.user_id, weekAgo)

                    // Only send if user had some activity
                    if (stats.lessonsCompleted > 0 || stats.quizzesCompleted > 0) {
                        const result = await sendWeeklySummary(
                            profile.email,
                            profile.display_name || 'Learner',
                            {
                                streak: profile.streak || 0,
                                lessonsCompleted: stats.lessonsCompleted,
                                timeSpent: stats.timeSpent,
                                quizAvg: stats.quizAvg
                            }
                        )

                        if (result.success) {
                            results.summaries.sent++
                        } else {
                            results.summaries.failed++
                        }
                    }
                } catch (err) {
                    results.summaries.failed++
                    results.errors.push(`Weekly summary failed for ${profile.user_id}`)
                }
            }
        }

        console.log('Weekly cron job completed:', results)
        res.json({
            success: true,
            message: 'Weekly summary job completed',
            results
        })

    } catch (error) {
        console.error('Weekly cron job error:', error)
        res.status(500).json({ error: 'Job failed', message: error.message })
    }
})

/**
 * GET /api/cron/health
 * Health check for cron endpoints
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Cron endpoints ready',
        supabase: supabase ? 'connected' : 'not configured'
    })
})

/**
 * Helper: Create in-app notification
 */
async function createNotification(userId, { type, title, message, link }) {
    if (!supabase) return

    try {
        await supabase.from('notifications').insert({
            user_id: userId,
            type,
            title,
            message,
            link: link || null
        })
    } catch (err) {
        console.error('Error creating notification:', err)
    }
}

/**
 * Helper: Get user's weekly stats
 */
async function getWeeklyStats(userId, since) {
    const stats = {
        lessonsCompleted: 0,
        quizzesCompleted: 0,
        timeSpent: 0,
        quizAvg: 0
    }

    if (!supabase) return stats

    try {
        // Get lessons completed this week
        const { data: lessons } = await supabase
            .from('lesson_progress')
            .select('id')
            .eq('user_id', userId)
            .gte('completed_at', since.toISOString())

        stats.lessonsCompleted = lessons?.length || 0

        // Get quiz results this week
        const { data: quizzes } = await supabase
            .from('assessment_results')
            .select('score_percentage, time_taken_seconds')
            .eq('user_id', userId)
            .gte('completed_at', since.toISOString())

        if (quizzes && quizzes.length > 0) {
            stats.quizzesCompleted = quizzes.length
            stats.quizAvg = Math.round(
                quizzes.reduce((sum, q) => sum + (q.score_percentage || 0), 0) / quizzes.length
            )
            stats.timeSpent = Math.round(
                quizzes.reduce((sum, q) => sum + (q.time_taken_seconds || 0), 0) / 60
            )
        }

    } catch (err) {
        console.error('Error getting weekly stats:', err)
    }

    return stats
}

module.exports = router
