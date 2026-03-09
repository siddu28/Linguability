/**
 * ============================================================
 * Email Notifications API Routes
 * ============================================================
 * 
 * Endpoints for sending email notifications and in-app notifications
 */

const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')
const {
    sendWelcomeEmail,
    sendStreakReminder,
    sendAchievementEmail,
    sendLowScoreHelp,
    sendWeeklySummary,
    sendReengagementEmail
} = require('../services/emailService')

// Initialize Supabase client for in-app notifications
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null

/**
 * Helper: Create in-app notification in database
 */
async function createInAppNotification(userId, { type, title, message, link }) {
    if (!supabase || !userId) return { success: false }

    try {
        const { data, error } = await supabase.from('notifications').insert({
            user_id: userId,
            type,
            title,
            message,
            link: link || null
        }).select().single()

        if (error) throw error
        return { success: true, id: data?.id }
    } catch (err) {
        console.error('Error creating notification:', err)
        return { success: false, error: err.message }
    }
}

/**
 * POST /api/notifications/create
 * Create an in-app notification (no email)
 * 
 * Body: { userId, type, title, message, link? }
 */
router.post('/create', async (req, res) => {
    try {
        const { userId, type, title, message, link } = req.body

        if (!userId || !type || !title || !message) {
            return res.status(400).json({ error: 'userId, type, title, and message are required' })
        }

        const result = await createInAppNotification(userId, { type, title, message, link })

        if (result.success) {
            res.json({ message: 'Notification created', id: result.id })
        } else {
            res.status(500).json({ error: result.error || 'Failed to create notification' })
        }
    } catch (error) {
        console.error('Error creating notification:', error)
        res.status(500).json({ error: 'Failed to create notification' })
    }
})

/**
 * POST /api/notifications/welcome
 * Send welcome email to new user
 * 
 * Body: { email, userName }
 */
router.post('/welcome', async (req, res) => {
    try {
        const { email, userName } = req.body

        if (!email) {
            return res.status(400).json({ error: 'Email is required' })
        }

        const result = await sendWelcomeEmail(email, userName)

        if (result.success) {
            res.json({ message: 'Welcome email sent', id: result.id })
        } else {
            res.status(500).json({ error: result.error })
        }
    } catch (error) {
        console.error('Error sending welcome email:', error)
        res.status(500).json({ error: 'Failed to send email' })
    }
})

/**
 * POST /api/notifications/streak-reminder
 * Send streak reminder email
 * 
 * Body: { email, userName, streakDays }
 */
router.post('/streak-reminder', async (req, res) => {
    try {
        const { email, userName, streakDays } = req.body

        if (!email) {
            return res.status(400).json({ error: 'Email is required' })
        }

        const result = await sendStreakReminder(email, userName, streakDays || 0)

        if (result.success) {
            res.json({ message: 'Streak reminder sent', id: result.id })
        } else {
            res.status(500).json({ error: result.error })
        }
    } catch (error) {
        console.error('Error sending streak reminder:', error)
        res.status(500).json({ error: 'Failed to send email' })
    }
})

/**
 * POST /api/notifications/achievement
 * Send achievement unlocked email
 * 
 * Body: { email, userName, achievementTitle, achievementDesc }
 */
router.post('/achievement', async (req, res) => {
    try {
        const { email, userName, achievementTitle, achievementDesc } = req.body

        if (!email || !achievementTitle) {
            return res.status(400).json({ error: 'Email and achievement title are required' })
        }

        const result = await sendAchievementEmail(email, userName, achievementTitle, achievementDesc || '')

        if (result.success) {
            res.json({ message: 'Achievement email sent', id: result.id })
        } else {
            res.status(500).json({ error: result.error })
        }
    } catch (error) {
        console.error('Error sending achievement email:', error)
        res.status(500).json({ error: 'Failed to send email' })
    }
})

/**
 * POST /api/notifications/low-score-help
 * Send helpful email after low quiz score
 * 
 * Body: { email, userName, language, score }
 */
router.post('/low-score-help', async (req, res) => {
    try {
        const { email, userName, language, score } = req.body

        if (!email || !language || score === undefined) {
            return res.status(400).json({ error: 'Email, language, and score are required' })
        }

        const result = await sendLowScoreHelp(email, userName, language, score)

        if (result.success) {
            res.json({ message: 'Low score help email sent', id: result.id })
        } else {
            res.status(500).json({ error: result.error })
        }
    } catch (error) {
        console.error('Error sending low score help email:', error)
        res.status(500).json({ error: 'Failed to send email' })
    }
})

/**
 * POST /api/notifications/weekly-summary
 * Send weekly learning summary
 * 
 * Body: { email, userName, stats: { streak, lessonsCompleted, timeSpent, quizAvg } }
 */
router.post('/weekly-summary', async (req, res) => {
    try {
        const { email, userName, stats } = req.body

        if (!email || !stats) {
            return res.status(400).json({ error: 'Email and stats are required' })
        }

        const result = await sendWeeklySummary(email, userName, stats)

        if (result.success) {
            res.json({ message: 'Weekly summary sent', id: result.id })
        } else {
            res.status(500).json({ error: result.error })
        }
    } catch (error) {
        console.error('Error sending weekly summary:', error)
        res.status(500).json({ error: 'Failed to send email' })
    }
})

/**
 * POST /api/notifications/reengagement
 * Send re-engagement email to inactive user
 * 
 * Body: { email, userName, daysInactive }
 */
router.post('/reengagement', async (req, res) => {
    try {
        const { email, userName, daysInactive } = req.body

        if (!email) {
            return res.status(400).json({ error: 'Email is required' })
        }

        const result = await sendReengagementEmail(email, userName, daysInactive || 7)

        if (result.success) {
            res.json({ message: 'Re-engagement email sent', id: result.id })
        } else {
            res.status(500).json({ error: result.error })
        }
    } catch (error) {
        console.error('Error sending re-engagement email:', error)
        res.status(500).json({ error: 'Failed to send email' })
    }
})

/**
 * POST /api/notifications/send
 * Generic endpoint to send any notification type
 * 
 * Body: { email, type, data }
 */
router.post('/send', async (req, res) => {
    try {
        const { email, type, data } = req.body

        if (!email || !type) {
            return res.status(400).json({ error: 'Email and type are required' })
        }

        let result
        switch (type) {
            case 'welcome':
                result = await sendWelcomeEmail(email, data?.userName)
                break
            case 'streakReminder':
                result = await sendStreakReminder(email, data?.userName, data?.streakDays)
                break
            case 'achievement':
                result = await sendAchievementEmail(email, data?.userName, data?.achievementTitle, data?.achievementDesc)
                break
            case 'lowScoreHelp':
                result = await sendLowScoreHelp(email, data?.userName, data?.language, data?.score)
                break
            case 'weeklySummary':
                result = await sendWeeklySummary(email, data?.userName, data?.stats)
                break
            case 'reengagement':
                result = await sendReengagementEmail(email, data?.userName, data?.daysInactive)
                break
            default:
                return res.status(400).json({ error: 'Unknown notification type' })
        }

        if (result.success) {
            res.json({ message: `${type} email sent`, id: result.id })
        } else {
            res.status(500).json({ error: result.error })
        }
    } catch (error) {
        console.error('Error sending notification:', error)
        res.status(500).json({ error: 'Failed to send email' })
    }
})

module.exports = router
