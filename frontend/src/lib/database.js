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

// ============ ASSESSMENT RESULTS ============

export async function saveAssessmentResult(userId, result) {
    const { data, error } = await supabase
        .from('assessment_results')
        .insert({
            user_id: userId,
            quiz_id: result.quizId,
            quiz_title: result.quizTitle,
            score: result.score,
            total_questions: result.totalQuestions,
            score_percentage: result.scorePercentage,
            time_taken_seconds: result.timeTakenSeconds,
            answers: result.answers || []
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving assessment result:', error)
        throw error
    }
    return data
}

export async function getAssessmentResults(userId) {
    const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })

    if (error) {
        console.error('Error fetching assessment results:', error)
        return []
    }
    return data
}

export async function getAssessmentStats(userId) {
    const { data, error } = await supabase
        .from('assessment_results')
        .select('score_percentage, quiz_id')
        .eq('user_id', userId)

    if (error) {
        console.error('Error fetching assessment stats:', error)
        return { completed: 0, averageScore: 0, completedQuizIds: [] }
    }

    const completed = data.length
    const averageScore = completed > 0
        ? Math.round(data.reduce((sum, r) => sum + parseFloat(r.score_percentage), 0) / completed)
        : 0
    const completedQuizIds = [...new Set(data.map(r => r.quiz_id))]

    return { completed, averageScore, completedQuizIds }
}

export async function hasCompletedQuiz(userId, quizId) {
    const { data, error } = await supabase
        .from('assessment_results')
        .select('id')
        .eq('user_id', userId)
        .eq('quiz_id', quizId)
        .limit(1)

    if (error) {
        console.error('Error checking quiz completion:', error)
        return false
    }
    return data && data.length > 0
}

// ============ PRONUNCIATION RESULTS ============

export async function savePronunciationResult(userId, result) {
    // Save to assessment_results table with type 'pronunciation'
    const { data, error } = await supabase
        .from('assessment_results')
        .insert({
            user_id: userId,
            quiz_id: result.testId,
            quiz_title: result.testTitle,
            score: result.passedWords,
            total_questions: result.totalWords,
            score_percentage: result.score,
            time_taken_seconds: null,
            answers: result.results,
            completed_at: result.completedAt
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving pronunciation result:', error)
        throw error
    }
    return data
}

export async function getPronunciationResults(userId) {
    const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', userId)
        .like('quiz_id', '%pronunciation%')
        .order('completed_at', { ascending: false })

    if (error) {
        console.error('Error fetching pronunciation results:', error)
        return []
    }
    return data
}
