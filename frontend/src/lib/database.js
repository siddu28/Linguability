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
    let payload = { ...updates, updated_at: new Date().toISOString() }

    // Remove columns already known to be missing
    for (const col of _missingProfileCols) delete payload[col]

    // Try up to 5 times, removing any column the DB doesn't recognize
    for (let attempt = 0; attempt < 5; attempt++) {
        const { data, error } = await supabase
            .from('profiles')
            .update(payload)
            .eq('id', userId)
            .select()
            .single()

        if (!error) return data

        if (error.code === '42703' || error.message?.includes('column')) {
            const match = error.message.match(/Could not find the '(\w+)' column/)
            if (match) {
                _missingProfileCols.add(match[1])
                delete payload[match[1]]
                continue
            }
        }

        console.error('Error updating profile:', error)
        throw error
    }

    return null
}

// ============ USER SETTINGS ============

// Cache columns that are known to be missing from the DB to avoid repeated warnings
const _missingSettingsCols = new Set()
const _missingProfileCols = new Set()

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
    // Build payload, progressively removing columns that don't exist in the DB
    const allColumns = {
        user_id: userId,
        focus_mode: settings.focus_mode ?? false,
        font_size: settings.font_size ?? 'medium',
        font_family: settings.font_family ?? 'system',
        line_spacing: settings.line_spacing ?? 'normal',
        letter_spacing: settings.letter_spacing ?? 'normal',
        high_contrast: settings.high_contrast ?? false,
        text_to_speech: settings.text_to_speech ?? false,
        reading_speed: settings.reading_speed ?? 'normal',
        screen_reader_friendly: settings.screen_reader_friendly ?? false,
        updated_at: new Date().toISOString()
    }

    let payload = { ...allColumns }

    // Remove columns already known to be missing
    for (const col of _missingSettingsCols) delete payload[col]

    // Try up to 5 times, each time removing the offending column
    for (let attempt = 0; attempt < 5; attempt++) {
        const { data, error } = await supabase
            .from('user_settings')
            .upsert(payload)
            .select()
            .single()

        if (!error) return data

        // If a column doesn't exist, remove it and retry
        if (error.code === '42703' || error.message?.includes('column')) {
            const match = error.message.match(/Could not find the '(\w+)' column/)
            if (match) {
                _missingSettingsCols.add(match[1])
                delete payload[match[1]]
                continue
            }
        }

        // Non-column error, throw immediately
        console.error('Error saving settings:', error)
        throw error
    }

    console.error('Failed to save settings after removing missing columns')
    return null
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

// ============ QUIZ PROGRESS (SAVE/RESUME) ============

export async function saveQuizProgress(userId, progressData) {
    const { data, error } = await supabase
        .from('quiz_progress')
        .upsert({
            user_id: userId,
            quiz_id: progressData.quizId,
            quiz_type: progressData.quizType,
            current_index: progressData.currentIndex,
            answers: progressData.answers,
            questions: progressData.questions,
            start_time: progressData.startTime,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,quiz_id'
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving quiz progress:', error)
        throw error
    }
    return data
}

export async function getQuizProgress(userId, quizId) {
    const { data, error } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('quiz_id', quizId)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching quiz progress:', error)
    }
    return data
}

export async function deleteQuizProgress(userId, quizId) {
    const { error } = await supabase
        .from('quiz_progress')
        .delete()
        .eq('user_id', userId)
        .eq('quiz_id', quizId)

    if (error) {
        console.error('Error deleting quiz progress:', error)
    }
}

export async function getAllQuizProgress(userId) {
    const { data, error } = await supabase
        .from('quiz_progress')
        .select('quiz_id, quiz_type, current_index, updated_at')
        .eq('user_id', userId)

    if (error) {
        console.error('Error fetching all quiz progress:', error)
        return []
    }
    return data
}

// ============ PRACTICE PROGRESS ============

export async function savePracticeProgress(userId, progress) {
    const { data, error } = await supabase
        .from('practice_progress')
        .upsert({
            user_id: userId,
            language: progress.language,
            practice_type: progress.practice_type,
            current_index: progress.current_index ?? 0,
            score: progress.score ?? 0,
            difficulty: progress.difficulty ?? 'simple',
            category: progress.category ?? 'words',
            completed_count: progress.completed_count ?? 0,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,language,practice_type'
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving practice progress:', error)
        // Don't throw — progress saving is non-critical
        return null
    }
    return data
}

export async function getPracticeProgress(userId, language, practiceType) {
    const { data, error } = await supabase
        .from('practice_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('language', language)
        .eq('practice_type', practiceType)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Error fetching practice progress:', error)
    }
    return data
}

export async function getAllPracticeProgress(userId) {
    const { data, error } = await supabase
        .from('practice_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching all practice progress:', error)
        return []
    }
    return data
}
