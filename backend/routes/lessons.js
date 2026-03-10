const express = require('express')
const router = express.Router()
const wordsData = require('../data/words.json')
const { generateLessonContent } = require('../services/llmService')

// Get all languages
router.get('/languages', (req, res) => {
    const languages = Object.keys(wordsData).map(id => ({
        id,
        name: wordsData[id].name,
        flag: wordsData[id].flag
    }))
    res.json(languages)
})

// Get words for a specific language and lesson — with dynamic RAG generation
router.get('/:languageId/:lessonType', async (req, res) => {
    const { languageId, lessonType } = req.params
    const knownWords = req.query.knownWords ? req.query.knownWords.split(',') : []

    // Try dynamic generation if GROQ_API_KEY is set
    if (process.env.GROQ_API_KEY) {
        try {
            const generated = await generateLessonContent(languageId, lessonType, knownWords)
            return res.json(generated)
        } catch (err) {
            console.error(`[Lessons] LLM generation failed for ${languageId}/${lessonType}, falling back to static:`, err.message)
        }
    }

    // Fallback to static data
    if (!wordsData[languageId]) {
        return res.status(404).json({ error: 'Language not found' })
    }

    const words = wordsData[languageId][lessonType]
    if (!words) {
        return res.status(404).json({ error: 'Lesson type not found' })
    }

    res.json(words)
})

// Check pronunciation (placeholder - can integrate with speech service later)
router.post('/check-pronunciation', (req, res) => {
    const { expected, spoken, languageId } = req.body

    // Simple similarity check
    const expectedLower = expected.toLowerCase()
    const spokenLower = spoken.toLowerCase()

    const isMatch =
        spokenLower === expectedLower ||
        expectedLower.includes(spokenLower) ||
        spokenLower.includes(expectedLower)

    res.json({
        isMatch,
        expected: expectedLower,
        spoken: spokenLower,
        confidence: isMatch ? 1.0 : 0.3
    })
})

module.exports = router
