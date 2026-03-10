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
    let payload = { id: userId, ...updates, updated_at: new Date().toISOString() }

    // Remove columns already known to be missing
    for (const col of _missingProfileCols) delete payload[col]

    // Try up to 5 times, removing any column the DB doesn't recognize
    for (let attempt = 0; attempt < 5; attempt++) {
        const { data, error } = await supabase
            .from('profiles')
            .upsert(payload)
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

// ============ XP & LEADERBOARD ============

// Get user's total XP
export async function getUserXP(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('total_xp')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching user XP:', error)
        return 0
    }
    return data?.total_xp || 0
}

// Add XP to user (calculates based on achievements and progress if column doesn't exist)
export async function addUserXP(userId, amount, reason) {
    try {
        // Try to update total_xp directly
        const { data, error } = await supabase
            .from('profiles')
            .update({ 
                total_xp: supabase.raw(`COALESCE(total_xp, 0) + ${amount}`),
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select('total_xp')
            .single()

        if (error) {
            // If column doesn't exist, silently fail (XP will be calculated client-side)
            if (error.message?.includes('total_xp')) {
                console.warn('total_xp column not found - run database-xp-leaderboard.sql')
                return null
            }
            console.error('Error adding XP:', error)
            return null
        }
        
        return data?.total_xp
    } catch (err) {
        console.error('Error adding XP:', err)
        return null
    }
}

// Get leaderboard
export async function getLeaderboard(limit = 50) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_id, total_xp')
            .order('total_xp', { ascending: false, nullsFirst: false })
            .limit(limit)

        if (error) {
            // If total_xp column doesn't exist, calculate from progress
            if (error.message?.includes('total_xp')) {
                console.warn('total_xp column not found - falling back to calculation')
                return await calculateLeaderboardFromProgress(limit)
            }
            console.error('Error fetching leaderboard:', error)
            return []
        }
        
        return data || []
    } catch (err) {
        console.error('Error fetching leaderboard:', err)
        return []
    }
}

// Calculate leaderboard from lesson_progress if total_xp doesn't exist
async function calculateLeaderboardFromProgress(limit = 50) {
    try {
        // Get all profiles
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_id')
            .limit(100)

        // Get all lesson progress
        const { data: progress } = await supabase
            .from('lesson_progress')
            .select('user_id, status')

        if (!profiles) return []

        // Calculate XP per user
        const userXP = {}
        progress?.forEach(p => {
            if (!userXP[p.user_id]) userXP[p.user_id] = 0
            if (p.status === 'completed') userXP[p.user_id] += 25
            else if (p.status === 'in_progress') userXP[p.user_id] += 5
        })

        // Merge and sort
        const leaderboard = profiles
            .map(p => ({
                ...p,
                total_xp: userXP[p.id] || 0
            }))
            .sort((a, b) => b.total_xp - a.total_xp)
            .slice(0, limit)

        return leaderboard
    } catch (err) {
        console.error('Error calculating leaderboard:', err)
        return []
    }
}

// Get user's rank on leaderboard
export async function getUserRank(userId) {
    const leaderboard = await getLeaderboard(100)
    const index = leaderboard.findIndex(u => u.id === userId)
    return index >= 0 ? index + 1 : null
}

// ============ WRITING RESULTS ============

export async function saveWritingResult(userId, result) {
    const { data, error } = await supabase
        .from('writing_results')
        .insert({
            user_id: userId,
            language: result.language,
            prompt_id: result.promptId,
            user_response: result.userResponse,
            score: result.score,
            is_correct: result.isCorrect,
            created_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving writing result:', error)
        return null
    }
    return data
}

export async function getWritingResults(userId) {
    const { data, error } = await supabase
        .from('writing_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching writing results:', error)
        return []
    }
    return data
}

// ============ USER KNOWLEDGE (for Profile-Grounded RAG) ============

/**
 * Record a word the user has learned (upsert to avoid duplicates).
 */
export async function recordLearnedWord(userId, word, language) {
    const { data, error } = await supabase
        .from('user_knowledge')
        .upsert({
            user_id: userId,
            word,
            language,
            learned_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,word,language'
        })
        .select()
        .single()

    if (error) {
        console.error('Error recording learned word:', error)
        return null
    }
    return data
}

/**
 * Record multiple words the user has learned in a batch.
 */
export async function recordLearnedWords(userId, words, language) {
    if (!words || words.length === 0) return []

    const rows = words.map(word => ({
        user_id: userId,
        word,
        language,
        learned_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
        .from('user_knowledge')
        .upsert(rows, {
            onConflict: 'user_id,word,language'
        })
        .select()

    if (error) {
        console.error('Error recording learned words:', error)
        return []
    }
    return data
}

/**
 * Get all words the user has learned for a given language.
 * Returns an array of word strings (for passing to the RAG LLM).
 */
export async function getLearnedWords(userId, language) {
    const { data, error } = await supabase
        .from('user_knowledge')
        .select('word')
        .eq('user_id', userId)
        .eq('language', language)
        .order('learned_at', { ascending: false })

    if (error) {
        console.error('Error fetching learned words:', error)
        return []
    }
    return data.map(row => row.word)
}
