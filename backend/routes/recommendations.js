/**
 * ============================================================
 * Recommendations API Route
 * ============================================================
 * 
 * Endpoint: GET /api/recommendations/:userId
 * 
 * Returns personalized activity recommendations based on:
 * - User profile (learning challenges, goals, experience)
 * - Progress data (lessons, assessments, practice)
 * - Spaced repetition algorithm
 * - Weakness targeting
 * - Learning style alignment
 */

const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')
const { RecommendationEngine } = require('../services/recommendationEngine')

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null

/**
 * GET /api/recommendations/:userId
 * 
 * Get personalized recommendations for a user
 * 
 * Query params:
 *   - limit: Number of recommendations (default: 5, max: 10)
 * 
 * Returns:
 *   {
 *     success: boolean,
 *     recommendations: [
 *       {
 *         type: 'lesson' | 'practice' | 'quiz',
 *         activityId: string,
 *         title: string,
 *         subtitle: string (explanation/reason),
 *         action: string (route path),
 *         icon: string,
 *         score: number,
 *         language?: string,
 *         progressPercent?: number
 *       }
 *     ],
 *     meta: {
 *       userId: string,
 *       generatedAt: string,
 *       algorithmVersion: string
 *     }
 *   }
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params
        const limit = Math.min(parseInt(req.query.limit) || 5, 10)

        // Validate userId
        if (!userId || userId === 'undefined' || userId === 'null') {
            return res.status(400).json({
                success: false,
                error: 'Valid userId is required'
            })
        }

        // Check if Supabase is configured
        if (!supabase) {
            console.warn('Supabase not configured, returning fallback recommendations')
            return res.json({
                success: true,
                recommendations: getFallbackRecommendations(),
                meta: {
                    userId,
                    generatedAt: new Date().toISOString(),
                    algorithmVersion: '1.0.0',
                    fallback: true
                }
            })
        }

        // Initialize recommendation engine
        const engine = new RecommendationEngine(supabase)

        // Get personalized recommendations
        const recommendations = await engine.getRecommendations(userId, limit)

        res.json({
            success: true,
            recommendations,
            meta: {
                userId,
                generatedAt: new Date().toISOString(),
                algorithmVersion: '1.0.0',
                count: recommendations.length
            }
        })

    } catch (error) {
        console.error('Error generating recommendations:', error)
        
        res.status(500).json({
            success: false,
            error: 'Failed to generate recommendations',
            recommendations: getFallbackRecommendations(),
            meta: {
                userId: req.params.userId,
                generatedAt: new Date().toISOString(),
                algorithmVersion: '1.0.0',
                fallback: true
            }
        })
    }
})

/**
 * GET /api/recommendations/health
 * 
 * Health check for recommendations service
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'recommendations',
        supabaseConfigured: !!supabase,
        timestamp: new Date().toISOString()
    })
})

/**
 * POST /api/recommendations/:userId/feedback
 * 
 * Record user feedback on a recommendation
 * (For future ML improvements)
 */
router.post('/:userId/feedback', async (req, res) => {
    try {
        const { userId } = req.params
        const { activityId, action, rating } = req.body

        // Validate input
        if (!activityId || !action) {
            return res.status(400).json({
                success: false,
                error: 'activityId and action are required'
            })
        }

        // Log feedback (could be saved to DB for ML training)
        console.log(`Recommendation feedback: user=${userId}, activity=${activityId}, action=${action}, rating=${rating}`)

        // In future: Save to database for recommendation model training
        // await supabase.from('recommendation_feedback').insert({
        //     user_id: userId,
        //     activity_id: activityId,
        //     action: action,
        //     rating: rating,
        //     created_at: new Date().toISOString()
        // })

        res.json({
            success: true,
            message: 'Feedback recorded'
        })

    } catch (error) {
        console.error('Error recording feedback:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to record feedback'
        })
    }
})

/**
 * Fallback recommendations when Supabase is unavailable
 */
function getFallbackRecommendations() {
    return [
        {
            type: 'lesson',
            activityId: 'english_words_1',
            title: 'English Vocabulary',
            subtitle: 'Start with the basics',
            action: '/lessons',
            icon: 'BookOpen',
            score: 100
        },
        {
            type: 'practice',
            activityId: 'english_pronunciation',
            title: 'Pronunciation Practice',
            subtitle: 'Improve your speaking',
            action: '/practice',
            icon: 'Mic',
            score: 90
        },
        {
            type: 'lesson',
            activityId: 'hindi_words_1',
            title: 'Hindi Basics',
            subtitle: 'Learn a new language',
            action: '/lessons',
            icon: 'BookOpen',
            score: 80
        }
    ]
}

module.exports = router
