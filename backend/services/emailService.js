/**
 * ============================================================
 * Email Notification Service
 * ============================================================
 * 
 * Sends email notifications using Resend API
 * 
 * Supported email types:
 * - Streak reminders
 * - Achievement unlocked
 * - Low quiz score help
 * - Weekly summary
 * - Welcome email
 * - Re-engagement
 */

const { Resend } = require('resend')

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY)

// Email sender (use your verified domain or Resend's default)
const FROM_EMAIL = process.env.FROM_EMAIL || 'Linguability <onboarding@resend.dev>'

/**
 * Email templates
 */
const TEMPLATES = {
    // Welcome email for new users
    welcome: (userName) => ({
        subject: '🎉 Welcome to Linguability!',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #E91E8C; margin: 0;">Linguability</h1>
                    <p style="color: #666;">Your Language Learning Journey Starts Now</p>
                </div>
                
                <h2 style="color: #333;">Welcome, ${userName || 'Learner'}! 👋</h2>
                
                <p style="color: #555; line-height: 1.6;">
                    We're excited to have you join Linguability! You've taken the first step 
                    towards mastering new languages.
                </p>
                
                <div style="background: linear-gradient(135deg, #E91E8C 0%, #FF6B9D 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <h3 style="color: white; margin: 0 0 10px 0;">🚀 Quick Start Tips:</h3>
                    <ul style="color: white; margin: 0; padding-left: 20px;">
                        <li>Complete your first lesson in English or Hindi</li>
                        <li>Practice pronunciation with our speech tools</li>
                        <li>Take quizzes to track your progress</li>
                        <li>Build your streak by learning daily!</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://linguability-app.vercel.app/lessons" 
                       style="background: #E91E8C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Start Learning Now →
                    </a>
                </div>
                
                <p style="color: #888; font-size: 12px; text-align: center;">
                    Happy learning!<br>The Linguability Team
                </p>
            </div>
        `
    }),

    // Streak reminder
    streakReminder: (userName, streakDays) => ({
        subject: `🔥 Don't break your ${streakDays}-day streak!`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="font-size: 64px;">🔥</span>
                </div>
                
                <h2 style="color: #333; text-align: center;">Hey ${userName || 'there'}!</h2>
                
                <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #92400E;">
                        <strong>Your ${streakDays}-day streak is at risk!</strong><br>
                        Complete a quick lesson today to keep it going.
                    </p>
                </div>
                
                <p style="color: #555; text-align: center;">
                    Just 5 minutes of practice is enough to maintain your streak.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://linguability-app.vercel.app/lessons" 
                       style="background: #F59E0B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Save My Streak →
                    </a>
                </div>
            </div>
        `
    }),

    // Achievement unlocked
    achievement: (userName, achievementTitle, achievementDesc) => ({
        subject: `🏆 Achievement Unlocked: ${achievementTitle}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="font-size: 64px;">🏆</span>
                </div>
                
                <h2 style="color: #E91E8C; text-align: center;">Congratulations, ${userName || 'Learner'}!</h2>
                
                <div style="background: linear-gradient(135deg, #FCE7F3 0%, #FDF2F8 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 20px 0;">
                    <h3 style="color: #E91E8C; margin: 0 0 10px 0;">${achievementTitle}</h3>
                    <p style="color: #666; margin: 0;">${achievementDesc}</p>
                </div>
                
                <p style="color: #555; text-align: center;">
                    Keep up the amazing work! Every step brings you closer to fluency.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://linguability-app.vercel.app/dashboard" 
                       style="background: #E91E8C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        View All Achievements →
                    </a>
                </div>
            </div>
        `
    }),

    // Low quiz score - offer help
    lowScoreHelp: (userName, language, score) => ({
        subject: `📚 Need help with ${language}? We've got you covered!`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Hi ${userName || 'there'}! 👋</h2>
                
                <p style="color: #555; line-height: 1.6;">
                    We noticed you scored <strong>${score}%</strong> on the ${language} quiz. 
                    Don't worry — learning takes time, and we're here to help!
                </p>
                
                <div style="background: #DBEAFE; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                    <h4 style="margin: 0 0 10px 0; color: #1E40AF;">💡 Tips to improve:</h4>
                    <ul style="color: #1E40AF; margin: 0; padding-left: 20px;">
                        <li>Review the ${language} vocabulary lessons</li>
                        <li>Practice pronunciation with audio exercises</li>
                        <li>Take shorter practice quizzes daily</li>
                        <li>Use flashcards for tricky words</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://linguability-app.vercel.app/lessons" 
                       style="background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Review ${language} Lessons →
                    </a>
                </div>
                
                <p style="color: #888; font-size: 14px;">
                    Remember: Every expert was once a beginner! 💪
                </p>
            </div>
        `
    }),

    // Weekly summary
    weeklySummary: (userName, stats) => ({
        subject: `📊 Your Week in Review: ${stats.lessonsCompleted} lessons completed!`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Weekly Summary for ${userName || 'Learner'}</h2>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
                    <div style="background: #FEF3C7; padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 32px;">🔥</div>
                        <div style="font-size: 24px; font-weight: bold; color: #F59E0B;">${stats.streak}</div>
                        <div style="color: #92400E; font-size: 14px;">Day Streak</div>
                    </div>
                    <div style="background: #FCE7F3; padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 32px;">📚</div>
                        <div style="font-size: 24px; font-weight: bold; color: #E91E8C;">${stats.lessonsCompleted}</div>
                        <div style="color: #9D174D; font-size: 14px;">Lessons</div>
                    </div>
                    <div style="background: #DBEAFE; padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 32px;">⏱️</div>
                        <div style="font-size: 24px; font-weight: bold; color: #3B82F6;">${stats.timeSpent}m</div>
                        <div style="color: #1E40AF; font-size: 14px;">Minutes</div>
                    </div>
                    <div style="background: #D1FAE5; padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 32px;">🎯</div>
                        <div style="font-size: 24px; font-weight: bold; color: #059669;">${stats.quizAvg}%</div>
                        <div style="color: #065F46; font-size: 14px;">Quiz Avg</div>
                    </div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://linguability-app.vercel.app/analytics" 
                       style="background: #E91E8C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        See Full Analytics →
                    </a>
                </div>
            </div>
        `
    }),

    // Re-engagement email
    reengagement: (userName, daysInactive) => ({
        subject: `😢 We miss you! Come back and continue learning`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="font-size: 64px;">👋</span>
                </div>
                
                <h2 style="color: #333; text-align: center;">We miss you, ${userName || 'friend'}!</h2>
                
                <p style="color: #555; text-align: center; line-height: 1.6;">
                    It's been ${daysInactive} days since your last lesson. 
                    Your language skills are waiting for you!
                </p>
                
                <div style="background: #F3F4F6; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                    <p style="color: #374151; margin: 0;">
                        🎁 <strong>Welcome back bonus:</strong> Complete a lesson today 
                        and restart your streak!
                    </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://linguability-app.vercel.app/lessons" 
                       style="background: #E91E8C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Resume Learning →
                    </a>
                </div>
            </div>
        `
    })
}

/**
 * Send an email notification
 * 
 * @param {string} to - Recipient email address
 * @param {string} type - Email type (welcome, streakReminder, achievement, etc.)
 * @param {object} data - Data for the template
 * @returns {Promise<object>} - Resend API response
 */
async function sendEmail(to, type, data = {}) {
    try {
        // Validate email
        if (!to || !to.includes('@')) {
            console.error('Invalid email address:', to)
            return { success: false, error: 'Invalid email address' }
        }

        // Get template
        const templateFn = TEMPLATES[type]
        if (!templateFn) {
            console.error('Unknown email template:', type)
            return { success: false, error: 'Unknown template' }
        }

        // Generate email content
        let template
        switch (type) {
            case 'welcome':
                template = templateFn(data.userName)
                break
            case 'streakReminder':
                template = templateFn(data.userName, data.streakDays)
                break
            case 'achievement':
                template = templateFn(data.userName, data.achievementTitle, data.achievementDesc)
                break
            case 'lowScoreHelp':
                template = templateFn(data.userName, data.language, data.score)
                break
            case 'weeklySummary':
                template = templateFn(data.userName, data.stats)
                break
            case 'reengagement':
                template = templateFn(data.userName, data.daysInactive)
                break
            default:
                template = templateFn(data)
        }

        // Send email via Resend
        const result = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: template.subject,
            html: template.html
        })

        console.log(`Email sent successfully: ${type} to ${to}`, result)
        return { success: true, id: result.data?.id }

    } catch (error) {
        console.error('Error sending email:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Send welcome email to new user
 */
async function sendWelcomeEmail(email, userName) {
    return sendEmail(email, 'welcome', { userName })
}

/**
 * Send streak reminder
 */
async function sendStreakReminder(email, userName, streakDays) {
    return sendEmail(email, 'streakReminder', { userName, streakDays })
}

/**
 * Send achievement notification
 */
async function sendAchievementEmail(email, userName, achievementTitle, achievementDesc) {
    return sendEmail(email, 'achievement', { userName, achievementTitle, achievementDesc })
}

/**
 * Send low score help email
 */
async function sendLowScoreHelp(email, userName, language, score) {
    return sendEmail(email, 'lowScoreHelp', { userName, language, score })
}

/**
 * Send weekly summary
 */
async function sendWeeklySummary(email, userName, stats) {
    return sendEmail(email, 'weeklySummary', { userName, stats })
}

/**
 * Send re-engagement email
 */
async function sendReengagementEmail(email, userName, daysInactive) {
    return sendEmail(email, 'reengagement', { userName, daysInactive })
}

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendStreakReminder,
    sendAchievementEmail,
    sendLowScoreHelp,
    sendWeeklySummary,
    sendReengagementEmail
}
