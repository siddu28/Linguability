/**
 * Email Notification Utilities
 * 
 * Functions to create in-app notifications and trigger email notifications
 */

import { supabase } from './supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://linguability.onrender.com'

/**
 * Create an in-app notification directly via Supabase
 * 
 * @param {string} userId - User ID
 * @param {string} type - Notification type (streak, achievement, lesson, quiz, reminder)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - Optional action link
 * @returns {Promise<object>}
 */
export async function createNotification(userId, type, title, message, link = null) {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                title,
                message,
                link: link || null
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating notification:', error)
            return { success: false, error: error.message }
        }

        return { success: true, id: data?.id }
    } catch (error) {
        console.error('Failed to create notification:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Send a notification email
 * 
 * @param {string} type - Email type (welcome, streakReminder, achievement, etc.)
 * @param {string} email - Recipient email
 * @param {object} data - Additional data for email template
 * @returns {Promise<object>}
 */
export async function sendNotificationEmail(type, email, data = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                type,
                data
            })
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('Email API error:', error)
            return { success: false, error: error.error }
        }

        return await response.json()
    } catch (error) {
        console.error('Failed to send email:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(email, userName) {
    return sendNotificationEmail('welcome', email, { userName })
}

/**
 * Send low score help email
 */
export async function sendLowScoreHelpEmail(email, userName, language, score) {
    return sendNotificationEmail('lowScoreHelp', email, {
        userName,
        language,
        score
    })
}

/**
 * Send achievement unlocked email
 */
export async function sendAchievementEmail(email, userName, achievementTitle, achievementDesc) {
    return sendNotificationEmail('achievement', email, {
        userName,
        achievementTitle,
        achievementDesc
    })
}

/**
 * Send streak reminder email
 */
export async function sendStreakReminderEmail(email, userName, streakDays) {
    return sendNotificationEmail('streakReminder', email, {
        userName,
        streakDays
    })
}
