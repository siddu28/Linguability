import { supabase } from './supabaseClient'

// ============ PROFILES ============

export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }
    return data
}

export async function updateProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        console.error('Error updating profile:', error)
        throw error
    }
    return data
}

// ============ USER SETTINGS ============

export async function getUserSettings(userId) {
    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Error fetching settings:', error)
    }
    return data
}

export async function upsertUserSettings(userId, settings) {
    const { data, error } = await supabase
        .from('user_settings')
        .upsert({
            user_id: userId,
            ...settings,
            updated_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving settings:', error)
        throw error
    }
    return data
}

// ============ LESSON PROGRESS ============

export async function getLessonProgress(userId) {
    const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false })

    if (error) {
        console.error('Error fetching progress:', error)
        return []
    }
    return data
}

export async function updateLessonProgress(userId, lessonId, progress) {
    const { data, error } = await supabase
        .from('lesson_progress')
        .upsert({
            user_id: userId,
            lesson_id: lessonId,
            ...progress,
            last_accessed_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        console.error('Error updating progress:', error)
        throw error
    }
    return data
}

// Mark lesson as completed
export async function markLessonComplete(userId, lessonId) {
    return updateLessonProgress(userId, lessonId, {
        status: 'completed',
        progress_percent: 100,
        completed_at: new Date().toISOString()
    })
}

// Get progress for a specific lesson
export async function getSingleLessonProgress(userId, lessonId) {
    const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching lesson progress:', error)
    }
    return data
}

// ============ NOTIFICATIONS ============

export async function getNotifications(userId) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error('Error fetching notifications:', error)
        return []
    }
    return data
}

export async function markNotificationRead(notificationId) {
    const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)

    if (error) {
        console.error('Error marking notification read:', error)
        throw error
    }
}

export async function createNotification(userId, notification) {
    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            ...notification
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating notification:', error)
        throw error
    }
    return data
}
