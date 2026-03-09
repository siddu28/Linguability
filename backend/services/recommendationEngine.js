/**
 * ============================================================
 * Intelligent Recommendation Engine
 * ============================================================
 * 
 * Analyzes user behavior and suggests optimal next activities using:
 * - Spaced repetition (lessons not reviewed recently)
 * - Weakness targeting (low-scoring areas)
 * - Learning preference alignment (audio/visual learners)
 * - Goal alignment (career, travel, academic)
 * - Completion gaps (partially completed lessons)
 */

const { createClient } = require('@supabase/supabase-js')

// Activity types with metadata
const ACTIVITY_TYPES = {
    LESSON: {
        type: 'lesson',
        baseWeight: 1.0,
        icon: 'BookOpen'
    },
    PRONUNCIATION: {
        type: 'pronunciation',
        baseWeight: 0.9,
        icon: 'Mic'
    },
    VOCABULARY: {
        type: 'vocabulary',
        baseWeight: 0.85,
        icon: 'BookOpen'
    },
    LISTENING: {
        type: 'listening',
        baseWeight: 0.8,
        icon: 'Volume2'
    },
    QUIZ: {
        type: 'quiz',
        baseWeight: 0.75,
        icon: 'Target'
    }
}

// Learning style mappings
const LEARNING_STYLE_WEIGHTS = {
    audio: {
        pronunciation: 1.5,
        listening: 1.3,
        vocabulary: 0.8,
        lesson: 1.0,
        quiz: 0.9
    },
    visual: {
        vocabulary: 1.5,
        lesson: 1.3,
        quiz: 1.2,
        pronunciation: 0.8,
        listening: 0.8
    },
    kinesthetic: {
        pronunciation: 1.3,
        quiz: 1.3,
        vocabulary: 1.2,
        lesson: 1.0,
        listening: 0.9
    },
    reading_writing: {
        vocabulary: 1.4,
        lesson: 1.3,
        quiz: 1.2,
        listening: 0.7,
        pronunciation: 0.8
    }
}

// Goal-based activity priorities
const GOAL_PRIORITIES = {
    career: ['sentences', 'vocabulary', 'pronunciation'],
    travel: ['pronunciation', 'sentences', 'vocabulary'],
    academic: ['vocabulary', 'quiz', 'lesson'],
    personal: ['lesson', 'vocabulary', 'pronunciation'],
    conversation: ['pronunciation', 'listening', 'sentences']
}

// Language names for display
const LANGUAGE_NAMES = {
    english: 'English',
    hindi: 'Hindi',
    tamil: 'Tamil',
    telugu: 'Telugu'
}

// Section names for display
const SECTION_NAMES = {
    words: 'Vocabulary',
    numbers: 'Numbers',
    sentences: 'Sentences'
}

/**
 * Main recommendation engine class
 */
class RecommendationEngine {
    constructor(supabase) {
        this.supabase = supabase
    }

    /**
     * Get personalized recommendations for a user
     * @param {string} userId - The user's ID
     * @param {number} limit - Number of recommendations to return (default: 5)
     * @returns {Promise<Array>} Ranked list of recommendations
     */
    async getRecommendations(userId, limit = 5) {
        try {
            // Fetch all user data in parallel
            const [profile, lessonProgress, assessmentResults, practiceProgress, settings] = await Promise.all([
                this.getProfile(userId),
                this.getLessonProgress(userId),
                this.getAssessmentResults(userId),
                this.getPracticeProgress(userId),
                this.getUserSettings(userId)
            ])

            // Build user context
            const userContext = this.buildUserContext(profile, settings)
            
            // Generate candidate activities
            const candidates = this.generateCandidates(
                userContext,
                lessonProgress,
                assessmentResults,
                practiceProgress
            )

            // Score and rank candidates
            const scoredCandidates = this.scoreCandidates(
                candidates,
                userContext,
                lessonProgress,
                assessmentResults,
                practiceProgress
            )

            // Select top recommendations
            const recommendations = this.selectTopRecommendations(scoredCandidates, limit)

            return recommendations
        } catch (error) {
            console.error('Recommendation engine error:', error)
            return this.getFallbackRecommendations()
        }
    }

    /**
     * Fetch user profile from Supabase
     */
    async getProfile(userId) {
        const { data, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error)
        }
        return data || {}
    }

    /**
     * Fetch user settings from Supabase
     */
    async getUserSettings(userId) {
        const { data, error } = await this.supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching settings:', error)
        }
        return data || {}
    }

    /**
     * Fetch lesson progress from Supabase
     */
    async getLessonProgress(userId) {
        const { data, error } = await this.supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .order('last_accessed_at', { ascending: false })

        if (error) {
            console.error('Error fetching lesson progress:', error)
            return []
        }
        return data || []
    }

    /**
     * Fetch assessment results from Supabase
     */
    async getAssessmentResults(userId) {
        const { data, error } = await this.supabase
            .from('assessment_results')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })

        if (error) {
            console.error('Error fetching assessment results:', error)
            return []
        }
        return data || []
    }

    /**
     * Fetch practice progress from Supabase
     */
    async getPracticeProgress(userId) {
        const { data, error } = await this.supabase
            .from('practice_progress')
            .select('*')
            .eq('user_id', userId)

        if (error) {
            console.error('Error fetching practice progress:', error)
            return []
        }
        return data || []
    }

    /**
     * Build user context from profile and settings
     */
    buildUserContext(profile, settings) {
        return {
            learningChallenges: profile.learning_challenges || [],
            learningGoals: profile.learning_goals || [],
            experienceLevel: profile.experience_level || 'beginner',
            preferredLanguage: profile.preferred_language || 'english',
            learningStyle: this.inferLearningStyle(profile, settings),
            focusMode: settings.focus_mode || false,
            accessibilityNeeds: {
                dyslexia: (profile.learning_challenges || []).includes('dyslexia'),
                adhd: (profile.learning_challenges || []).includes('adhd'),
                visualImpairment: (profile.learning_challenges || []).includes('visual_impairment'),
                hearingImpairment: (profile.learning_challenges || []).includes('hearing_impairment')
            }
        }
    }

    /**
     * Infer learning style from profile and settings
     */
    inferLearningStyle(profile, settings) {
        const challenges = profile.learning_challenges || []
        
        // Hearing impaired users prefer visual learning
        if (challenges.includes('hearing_impairment')) {
            return 'visual'
        }
        
        // Visual impairment users prefer audio learning
        if (challenges.includes('visual_impairment')) {
            return 'audio'
        }
        
        // ADHD users often benefit from kinesthetic (interactive) learning
        if (challenges.includes('adhd')) {
            return 'kinesthetic'
        }
        
        // Dyslexia users often prefer audio
        if (challenges.includes('dyslexia')) {
            return 'audio'
        }
        
        // Default to visual for general users
        return 'visual'
    }

    /**
     * Generate candidate activities for recommendation
     */
    generateCandidates(userContext, lessonProgress, assessmentResults, practiceProgress) {
        const candidates = []
        const languages = ['english', 'hindi', 'tamil', 'telugu']
        const sections = ['words', 'numbers', 'sentences']
        const practiceTypes = ['vocabulary', 'pronunciation', 'listening']

        // Generate lesson candidates
        for (const lang of languages) {
            for (const section of sections) {
                for (let lessonNum = 1; lessonNum <= 5; lessonNum++) {
                    const lessonId = `${lang}_${section}_${lessonNum}`
                    const progress = lessonProgress.find(p => p.lesson_id === lessonId)
                    
                    candidates.push({
                        type: 'lesson',
                        activityId: lessonId,
                        language: lang,
                        section: section,
                        lessonNumber: lessonNum,
                        title: `${LANGUAGE_NAMES[lang]} ${SECTION_NAMES[section]}`,
                        subtitle: this.getLessonTitle(lessonNum),
                        status: progress?.status || 'not_started',
                        progressPercent: progress?.progress_percent || 0,
                        lastAccessed: progress?.last_accessed_at,
                        action: '/lessons',
                        icon: 'BookOpen'
                    })
                }
            }
        }

        // Generate practice candidates
        for (const lang of languages) {
            for (const practiceType of practiceTypes) {
                const progress = practiceProgress.find(
                    p => p.language === lang && p.practice_type === practiceType
                )
                
                candidates.push({
                    type: 'practice',
                    activityId: `${lang}_${practiceType}`,
                    language: lang,
                    practiceType: practiceType,
                    title: `${LANGUAGE_NAMES[lang]} ${this.capitalize(practiceType)}`,
                    subtitle: this.getPracticeSubtitle(practiceType, progress),
                    score: progress?.score || 0,
                    lastAccessed: progress?.updated_at,
                    action: '/practice',
                    icon: this.getPracticeIcon(practiceType)
                })
            }
        }

        // Generate quiz candidates based on assessment results
        const quizTypes = ['greetings', 'objects', 'colors', 'family', 'food']
        for (const quizType of quizTypes) {
            const results = assessmentResults.filter(r => 
                r.quiz_id?.includes(quizType) || r.quiz_title?.toLowerCase().includes(quizType)
            )
            const latestResult = results[0]
            
            candidates.push({
                type: 'quiz',
                activityId: `quiz_${quizType}`,
                quizType: quizType,
                title: `${this.capitalize(quizType)} Quiz`,
                subtitle: latestResult 
                    ? `Last score: ${latestResult.score_percentage}%`
                    : 'Test your knowledge',
                lastScore: latestResult?.score_percentage,
                lastAccessed: latestResult?.completed_at,
                action: '/assessments',
                icon: 'Target'
            })
        }

        return candidates
    }

    /**
     * Score all candidates based on multiple factors
     */
    scoreCandidates(candidates, userContext, lessonProgress, assessmentResults, practiceProgress) {
        return candidates.map(candidate => {
            let score = 0
            const reasons = []

            // 1. Spaced repetition score (0-30 points)
            const spacedRepScore = this.calculateSpacedRepetitionScore(candidate)
            score += spacedRepScore.score
            if (spacedRepScore.reason) reasons.push(spacedRepScore.reason)

            // 2. Weakness targeting score (0-25 points)
            const weaknessScore = this.calculateWeaknessScore(candidate, assessmentResults, practiceProgress)
            score += weaknessScore.score
            if (weaknessScore.reason) reasons.push(weaknessScore.reason)

            // 3. Learning preference alignment (0-20 points)
            const preferenceScore = this.calculatePreferenceScore(candidate, userContext)
            score += preferenceScore.score
            if (preferenceScore.reason) reasons.push(preferenceScore.reason)

            // 4. Goal alignment score (0-15 points)
            const goalScore = this.calculateGoalScore(candidate, userContext)
            score += goalScore.score
            if (goalScore.reason) reasons.push(goalScore.reason)

            // 5. Completion gap score (0-20 points)
            const completionScore = this.calculateCompletionGapScore(candidate, lessonProgress)
            score += completionScore.score
            if (completionScore.reason) reasons.push(completionScore.reason)

            // 6. Accessibility adjustment
            const accessibilityAdjustment = this.adjustForAccessibility(candidate, userContext)
            score += accessibilityAdjustment.score
            if (accessibilityAdjustment.reason) reasons.push(accessibilityAdjustment.reason)

            // Select the most compelling reason for display
            const primaryReason = reasons.length > 0 
                ? reasons.reduce((a, b) => a.priority > b.priority ? a : b).text
                : this.getDefaultReason(candidate)

            return {
                ...candidate,
                score,
                reason: primaryReason,
                reasons
            }
        })
    }

    /**
     * Calculate spaced repetition score
     * Items not reviewed recently get higher scores
     */
    calculateSpacedRepetitionScore(candidate) {
        if (!candidate.lastAccessed) {
            // Never accessed - not urgent for review
            return { score: 5, reason: null }
        }

        const daysSinceAccess = this.daysSince(candidate.lastAccessed)
        
        // Optimal review intervals: 1 day, 3 days, 7 days, 14 days, 30 days
        if (daysSinceAccess >= 7 && daysSinceAccess < 14) {
            return {
                score: 30,
                reason: { text: `Due for review (${daysSinceAccess} days ago)`, priority: 10 }
            }
        } else if (daysSinceAccess >= 3 && daysSinceAccess < 7) {
            return {
                score: 25,
                reason: { text: `Good time to review`, priority: 8 }
            }
        } else if (daysSinceAccess >= 14) {
            return {
                score: 20,
                reason: { text: `Haven't practiced in ${daysSinceAccess} days`, priority: 9 }
            }
        } else if (daysSinceAccess >= 1) {
            return { score: 15, reason: null }
        }
        
        // Accessed today - low priority for repetition
        return { score: 5, reason: null }
    }

    /**
     * Calculate weakness targeting score
     * Low-scoring areas get prioritized
     * IMPORTANT: When quiz scores are low, boost LESSONS for that language
     */
    calculateWeaknessScore(candidate, assessmentResults, practiceProgress) {
        // Check for low quiz scores - recommend retaking the quiz
        if (candidate.type === 'quiz' && candidate.lastScore !== undefined) {
            if (candidate.lastScore < 50) {
                return {
                    score: 25,
                    reason: { text: `You scored ${candidate.lastScore}% — try again!`, priority: 10 }
                }
            } else if (candidate.lastScore < 70) {
                return {
                    score: 20,
                    reason: { text: `Improve your ${candidate.lastScore}% score`, priority: 8 }
                }
            }
        }

        // Check for low practice scores
        if (candidate.type === 'practice' && candidate.score !== undefined) {
            if (candidate.score < 50) {
                return {
                    score: 22,
                    reason: { text: `Needs improvement — keep practicing!`, priority: 9 }
                }
            }
        }

        // ============================================================
        // KEY FIX: When user has low quiz scores for a LANGUAGE,
        // boost LESSONS for that language to help them learn
        // ============================================================
        if (candidate.type === 'lesson' && candidate.language) {
            // Find all quiz results that mention this language
            const languageQuizResults = assessmentResults.filter(r => {
                const quizId = (r.quiz_id || '').toLowerCase()
                const quizTitle = (r.quiz_title || '').toLowerCase()
                const language = (r.language || '').toLowerCase()
                const candidateLang = candidate.language.toLowerCase()
                
                return quizId.includes(candidateLang) || 
                       quizTitle.includes(candidateLang) ||
                       language === candidateLang
            })

            if (languageQuizResults.length > 0) {
                // Calculate average score for this language's quizzes
                const avgScore = languageQuizResults.reduce((sum, r) => 
                    sum + (r.score_percentage || r.score || 0), 0) / languageQuizResults.length
                
                // Find the lowest recent score
                const lowestScore = Math.min(...languageQuizResults.map(r => 
                    r.score_percentage || r.score || 100))
                
                const langName = LANGUAGE_NAMES[candidate.language] || candidate.language

                if (lowestScore < 50) {
                    return {
                        score: 30, // Highest priority - they really need help
                        reason: { 
                            text: `Your ${langName} quiz score was ${lowestScore}% — study these lessons!`, 
                            priority: 12 
                        }
                    }
                } else if (avgScore < 60) {
                    return {
                        score: 25,
                        reason: { 
                            text: `Improve your ${langName} skills (avg: ${Math.round(avgScore)}%)`, 
                            priority: 10 
                        }
                    }
                } else if (avgScore < 75) {
                    return {
                        score: 18,
                        reason: { 
                            text: `Strengthen your ${langName} knowledge`, 
                            priority: 7 
                        }
                    }
                }
            }
        }

        // ============================================================
        // Also boost PRACTICE activities for languages with low quiz scores
        // ============================================================
        if (candidate.type === 'practice' && candidate.language) {
            const languageQuizResults = assessmentResults.filter(r => {
                const quizId = (r.quiz_id || '').toLowerCase()
                const quizTitle = (r.quiz_title || '').toLowerCase()
                const language = (r.language || '').toLowerCase()
                const candidateLang = candidate.language.toLowerCase()
                
                return quizId.includes(candidateLang) || 
                       quizTitle.includes(candidateLang) ||
                       language === candidateLang
            })

            if (languageQuizResults.length > 0) {
                const lowestScore = Math.min(...languageQuizResults.map(r => 
                    r.score_percentage || r.score || 100))
                const langName = LANGUAGE_NAMES[candidate.language] || candidate.language

                if (lowestScore < 50) {
                    return {
                        score: 28, // High priority — practice helps learn
                        reason: { 
                            text: `Practice ${langName} to improve your ${lowestScore}% quiz score`, 
                            priority: 11 
                        }
                    }
                } else if (lowestScore < 70) {
                    return {
                        score: 20,
                        reason: { 
                            text: `${langName} practice will boost your score`, 
                            priority: 8 
                        }
                    }
                }
            }
        }

        // Check assessment history for related weaknesses (general fallback)
        const relatedResults = assessmentResults.filter(r => 
            r.quiz_id?.includes(candidate.language) ||
            r.quiz_id?.includes(candidate.section) ||
            r.quiz_id?.includes(candidate.practiceType)
        )

        if (relatedResults.length > 0) {
            const avgScore = relatedResults.reduce((sum, r) => sum + (r.score_percentage || 0), 0) / relatedResults.length
            if (avgScore < 60) {
                return {
                    score: 18,
                    reason: { text: `Area needs more practice`, priority: 7 }
                }
            }
        }

        return { score: 0, reason: null }
    }

    /**
     * Calculate learning preference score
     * Matches activity type to user's learning style
     */
    calculatePreferenceScore(candidate, userContext) {
        const learningStyle = userContext.learningStyle
        const styleWeights = LEARNING_STYLE_WEIGHTS[learningStyle] || LEARNING_STYLE_WEIGHTS.visual

        // Map candidate type to weight key
        let activityType = candidate.type
        if (candidate.practiceType) {
            activityType = candidate.practiceType
        }

        const weight = styleWeights[activityType] || 1.0
        const score = Math.round(20 * weight)

        if (weight >= 1.3) {
            return {
                score,
                reason: { text: `Matches your learning style`, priority: 5 }
            }
        }

        return { score, reason: null }
    }

    /**
     * Calculate goal alignment score
     */
    calculateGoalScore(candidate, userContext) {
        const goals = userContext.learningGoals || []
        let totalScore = 0
        let matchedGoal = null

        for (const goal of goals) {
            const priorities = GOAL_PRIORITIES[goal] || []
            const activityCategory = candidate.section || candidate.practiceType || candidate.type

            const priorityIndex = priorities.indexOf(activityCategory)
            if (priorityIndex !== -1) {
                const goalScore = 15 - (priorityIndex * 5) // 15, 10, 5 points
                if (goalScore > totalScore) {
                    totalScore = goalScore
                    matchedGoal = goal
                }
            }
        }

        if (matchedGoal && totalScore >= 10) {
            return {
                score: totalScore,
                reason: { text: `Aligned with your ${matchedGoal} goals`, priority: 6 }
            }
        }

        return { score: totalScore, reason: null }
    }

    /**
     * Calculate completion gap score
     * Partially completed items get priority
     */
    calculateCompletionGapScore(candidate, lessonProgress) {
        if (candidate.type === 'lesson') {
            if (candidate.status === 'in_progress') {
                return {
                    score: 20,
                    reason: { text: `Continue where you left off (${candidate.progressPercent}%)`, priority: 10 }
                }
            }

            // Check if this is the next lesson in sequence
            const [lang, section, num] = candidate.activityId.split('_')
            const prevLessonId = `${lang}_${section}_${parseInt(num) - 1}`
            const prevLesson = lessonProgress.find(p => p.lesson_id === prevLessonId)

            if (prevLesson?.status === 'completed' && candidate.status === 'not_started') {
                return {
                    score: 18,
                    reason: { text: `Next lesson in your ${LANGUAGE_NAMES[lang]} path`, priority: 9 }
                }
            }
        }

        return { score: 0, reason: null }
    }

    /**
     * Adjust score based on accessibility needs
     */
    adjustForAccessibility(candidate, userContext) {
        const { accessibilityNeeds } = userContext
        let adjustment = 0
        let reason = null

        // Hearing impaired: deprioritize audio activities
        if (accessibilityNeeds.hearingImpairment) {
            if (candidate.practiceType === 'listening' || candidate.practiceType === 'pronunciation') {
                adjustment = -15
            } else if (candidate.type === 'lesson' || candidate.practiceType === 'vocabulary') {
                adjustment = 5
                reason = { text: 'Visual learning activity', priority: 4 }
            }
        }

        // Visual impairment: prioritize audio activities
        if (accessibilityNeeds.visualImpairment) {
            if (candidate.practiceType === 'pronunciation' || candidate.practiceType === 'listening') {
                adjustment = 10
                reason = { text: 'Audio-based activity', priority: 4 }
            }
        }

        // ADHD: prioritize shorter, interactive activities
        if (accessibilityNeeds.adhd) {
            if (candidate.type === 'practice' || candidate.type === 'quiz') {
                adjustment = 5
                reason = { text: 'Quick, interactive activity', priority: 3 }
            }
        }

        // Dyslexia: prioritize audio over reading-heavy
        if (accessibilityNeeds.dyslexia) {
            if (candidate.practiceType === 'pronunciation' || candidate.practiceType === 'listening') {
                adjustment = 8
                reason = { text: 'Audio-focused activity', priority: 4 }
            }
        }

        return { score: adjustment, reason }
    }

    /**
     * Select top recommendations from scored candidates
     */
    selectTopRecommendations(scoredCandidates, limit) {
        // Sort by score descending
        const sorted = scoredCandidates.sort((a, b) => b.score - a.score)

        // Ensure diversity - don't recommend all of same type
        const selected = []
        const typeCounts = {}

        for (const candidate of sorted) {
            const typeKey = `${candidate.type}_${candidate.language || ''}`
            typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1

            // Limit same type/language combinations
            if (typeCounts[typeKey] <= 2) {
                selected.push({
                    type: candidate.type,
                    activityId: candidate.activityId,
                    title: candidate.title,
                    subtitle: candidate.reason || candidate.subtitle,
                    action: candidate.action,
                    icon: candidate.icon,
                    score: candidate.score,
                    language: candidate.language,
                    section: candidate.section,
                    practiceType: candidate.practiceType,
                    progressPercent: candidate.progressPercent
                })
            }

            if (selected.length >= limit) break
        }

        return selected
    }

    /**
     * Get fallback recommendations when engine fails
     */
    getFallbackRecommendations() {
        return [
            {
                type: 'lesson',
                activityId: 'english_words_1',
                title: 'English Vocabulary',
                subtitle: 'Start with basics',
                action: '/lessons',
                icon: 'BookOpen',
                score: 0
            },
            {
                type: 'practice',
                activityId: 'english_pronunciation',
                title: 'Pronunciation Practice',
                subtitle: 'Improve your speaking',
                action: '/practice',
                icon: 'Mic',
                score: 0
            },
            {
                type: 'quiz',
                activityId: 'quiz_greetings',
                title: 'Greetings Quiz',
                subtitle: 'Test your knowledge',
                action: '/assessments',
                icon: 'Target',
                score: 0
            }
        ]
    }

    // ============ Helper Methods ============

    daysSince(dateString) {
        if (!dateString) return 999
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    getLessonTitle(lessonNum) {
        const titles = {
            1: 'Basic Greetings',
            2: 'Common Objects',
            3: 'Colors & Shapes',
            4: 'Family Members',
            5: 'Food & Drinks'
        }
        return titles[lessonNum] || `Lesson ${lessonNum}`
    }

    getPracticeSubtitle(practiceType, progress) {
        if (progress?.score) {
            return `Current score: ${progress.score}%`
        }
        
        const subtitles = {
            vocabulary: 'Build your word bank',
            pronunciation: 'Perfect your accent',
            listening: 'Train your ear'
        }
        return subtitles[practiceType] || 'Practice makes perfect'
    }

    getPracticeIcon(practiceType) {
        const icons = {
            vocabulary: 'BookOpen',
            pronunciation: 'Mic',
            listening: 'Volume2'
        }
        return icons[practiceType] || 'BookOpen'
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    getDefaultReason(candidate) {
        if (candidate.type === 'lesson') {
            return candidate.status === 'not_started' 
                ? 'Start learning' 
                : 'Continue learning'
        }
        if (candidate.type === 'practice') {
            return 'Practice makes perfect'
        }
        if (candidate.type === 'quiz') {
            return 'Test your knowledge'
        }
        return 'Recommended for you'
    }
}

module.exports = { RecommendationEngine }
