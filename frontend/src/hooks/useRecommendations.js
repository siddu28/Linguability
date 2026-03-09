/**
 * ============================================================
 * useRecommendations Hook
 * ============================================================
 * 
 * Custom React hook to fetch personalized recommendations
 * Uses Supabase directly for guaranteed personalization
 * 
 * Usage:
 *   const { recommendations, loading, error, refresh } = useRecommendations(userId)
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// Language display names
const LANGUAGE_NAMES = {
    english: 'English',
    hindi: 'Hindi',
    tamil: 'Tamil',
    telugu: 'Telugu'
}

/**
 * Fetch personalized recommendations for a user
 * 
 * @param {string} userId - The user's ID
 * @param {Object} options - Options
 * @param {number} options.limit - Max recommendations (default: 5)
 * @param {boolean} options.autoFetch - Auto-fetch on mount (default: true)
 * @returns {Object} { recommendations, loading, error, refresh }
 */
export function useRecommendations(userId, options = {}) {
    const { limit = 5, autoFetch = true } = options
    
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [lastFetched, setLastFetched] = useState(null)

    /**
     * Fetch recommendations using Supabase directly
     */
    const fetchRecommendations = useCallback(async () => {
        if (!userId) {
            setLoading(false)
            setRecommendations(getDefaultRecommendations())
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Fetch assessment results and lesson progress directly from Supabase
            const [assessmentRes, progressRes] = await Promise.all([
                supabase
                    .from('assessment_results')
                    .select('*')
                    .eq('user_id', userId)
                    .order('completed_at', { ascending: false }),
                supabase
                    .from('lesson_progress')
                    .select('*')
                    .eq('user_id', userId)
                    .order('last_accessed_at', { ascending: false })
            ])

            const assessmentResults = assessmentRes.data || []
            const lessonProgress = progressRes.data || []

            console.log('Assessment results:', assessmentResults)
            console.log('Lesson progress:', lessonProgress)

            // Generate personalized recommendations
            const personalizedRecs = generateSmartRecommendations(
                assessmentResults,
                lessonProgress,
                limit
            )

            setRecommendations(personalizedRecs)
            setLastFetched(new Date())

        } catch (err) {
            console.error('Error fetching recommendations:', err)
            setError(err.message)
            setRecommendations(getDefaultRecommendations())
        } finally {
            setLoading(false)
        }
    }, [userId, limit])

    /**
     * Record user interaction with a recommendation
     */
    const recordFeedback = useCallback(async (activityId, action, rating = null) => {
        // Log locally for now
        console.log('Recommendation feedback:', { activityId, action, rating })
    }, [])

    /**
     * Auto-fetch on mount and when userId changes
     */
    useEffect(() => {
        if (autoFetch) {
            fetchRecommendations()
        }
    }, [fetchRecommendations, autoFetch])

    return {
        recommendations,
        loading,
        error,
        lastFetched,
        refresh: fetchRecommendations,
        recordFeedback
    }
}

/**
 * Generate smart recommendations based on user data
 */
function generateSmartRecommendations(assessmentResults, lessonProgress, limit) {
    const recommendations = []
    const languages = ['english', 'hindi', 'tamil', 'telugu']
    
    // ============================================================
    // PRIORITY 1: Languages with LOW quiz scores
    // ============================================================
    for (const lang of languages) {
        // Find quiz results for this language
        const langQuizResults = assessmentResults.filter(r => {
            const quizId = (r.quiz_id || '').toLowerCase()
            const quizTitle = (r.quiz_title || '').toLowerCase()
            return quizId.includes(lang) || quizTitle.includes(lang)
        })

        if (langQuizResults.length > 0) {
            // Calculate average and lowest score
            const scores = langQuizResults.map(r => r.score_percentage || r.score || 0)
            const lowestScore = Math.min(...scores)
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
            const langName = LANGUAGE_NAMES[lang]

            if (lowestScore < 50) {
                // Critical: Very low score - recommend lessons first
                recommendations.push({
                    type: 'lesson',
                    activityId: `${lang}_words_1`,
                    title: `${langName} Vocabulary`,
                    subtitle: `Your quiz score was ${lowestScore}% — study to improve!`,
                    reason: `Low score detected: ${lowestScore}%`,
                    action: '/lessons',
                    icon: 'BookOpen',
                    score: 100 + (50 - lowestScore), // Higher priority for lower scores
                    confidence: 0.95,
                    language: lang
                })

                // Also recommend practice for this language
                recommendations.push({
                    type: 'practice',
                    activityId: `${lang}_pronunciation`,
                    title: `${langName} Practice`,
                    subtitle: `Practice ${langName} to boost your ${lowestScore}% score`,
                    reason: 'Practice helps improve quiz scores',
                    action: '/practice',
                    icon: 'Mic',
                    score: 95 + (50 - lowestScore),
                    confidence: 0.90,
                    language: lang
                })
            } else if (avgScore < 70) {
                // Medium: Needs improvement
                recommendations.push({
                    type: 'lesson',
                    activityId: `${lang}_words_1`,
                    title: `${langName} Review`,
                    subtitle: `Improve your ${Math.round(avgScore)}% average`,
                    reason: 'Room for improvement',
                    action: '/lessons',
                    icon: 'BookOpen',
                    score: 80 + (70 - avgScore),
                    confidence: 0.85,
                    language: lang
                })
            }
        }
    }

    // ============================================================
    // PRIORITY 2: In-progress lessons (continue where you left off)
    // ============================================================
    const inProgressLessons = lessonProgress.filter(p => 
        p.status === 'in_progress' && p.progress_percent < 100
    )

    for (const lesson of inProgressLessons.slice(0, 2)) {
        const [lang, section, num] = (lesson.lesson_id || '').split('_')
        if (lang && LANGUAGE_NAMES[lang]) {
            recommendations.push({
                type: 'lesson',
                activityId: lesson.lesson_id,
                title: `Continue ${LANGUAGE_NAMES[lang]}`,
                subtitle: `${lesson.progress_percent || 0}% complete — keep going!`,
                reason: 'Resume your lesson',
                action: '/lessons',
                icon: 'BookOpen',
                score: 75,
                confidence: 0.88,
                language: lang
            })
        }
    }

    // ============================================================
    // PRIORITY 3: Lessons not accessed recently (spaced repetition)
    // ============================================================
    const completedLessons = lessonProgress.filter(p => p.status === 'completed')
    for (const lesson of completedLessons.slice(0, 3)) {
        const lastAccess = new Date(lesson.last_accessed_at)
        const daysSince = Math.floor((Date.now() - lastAccess) / (1000 * 60 * 60 * 24))
        
        if (daysSince >= 7) {
            const [lang] = (lesson.lesson_id || '').split('_')
            if (lang && LANGUAGE_NAMES[lang]) {
                recommendations.push({
                    type: 'lesson',
                    activityId: lesson.lesson_id,
                    title: `${LANGUAGE_NAMES[lang]} Review`,
                    subtitle: `Last practiced ${daysSince} days ago — time to review!`,
                    reason: 'Spaced repetition',
                    action: '/lessons',
                    icon: 'BookOpen',
                    score: 60 + Math.min(daysSince, 30),
                    confidence: 0.80,
                    language: lang
                })
            }
        }
    }

    // ============================================================
    // PRIORITY 4: Languages not tried yet
    // ============================================================
    const triedLanguages = new Set([
        ...assessmentResults.map(r => {
            for (const lang of languages) {
                if ((r.quiz_id || '').toLowerCase().includes(lang) ||
                    (r.quiz_title || '').toLowerCase().includes(lang)) {
                    return lang
                }
            }
            return null
        }).filter(Boolean),
        ...lessonProgress.map(p => (p.lesson_id || '').split('_')[0])
    ])

    for (const lang of languages) {
        if (!triedLanguages.has(lang)) {
            recommendations.push({
                type: 'lesson',
                activityId: `${lang}_words_1`,
                title: `Start ${LANGUAGE_NAMES[lang]}`,
                subtitle: 'Try a new language!',
                reason: 'Explore new languages',
                action: '/lessons',
                icon: 'BookOpen',
                score: 50,
                confidence: 0.70,
                language: lang
            })
        }
    }

    // ============================================================
    // Add default recommendations if we don't have enough
    // ============================================================
    if (recommendations.length < limit) {
        const defaults = getDefaultRecommendations()
        for (const rec of defaults) {
            if (recommendations.length >= limit) break
            if (!recommendations.find(r => r.activityId === rec.activityId)) {
                recommendations.push(rec)
            }
        }
    }

    // Sort by score (highest first) and return top N
    recommendations.sort((a, b) => b.score - a.score)
    return recommendations.slice(0, limit)
}

/**
 * Default recommendations for new users
 */
function getDefaultRecommendations() {
    return [
        {
            type: 'lesson',
            activityId: 'english_words_1',
            title: 'Start with English',
            subtitle: 'Begin your language journey',
            reason: 'Great starting point',
            action: '/lessons',
            icon: 'BookOpen',
            score: 50,
            confidence: 0.60
        },
        {
            type: 'practice',
            activityId: 'english_pronunciation',
            title: 'Pronunciation Practice',
            subtitle: 'Improve your speaking skills',
            reason: 'Practice makes perfect',
            action: '/practice',
            icon: 'Mic',
            score: 45,
            confidence: 0.55
        },
        {
            type: 'lesson',
            activityId: 'hindi_words_1',
            title: 'Explore Hindi',
            subtitle: 'Learn a new language',
            reason: 'Expand your horizons',
            action: '/lessons',
            icon: 'BookOpen',
            score: 40,
            confidence: 0.50
        }
    ]
}

export default useRecommendations
