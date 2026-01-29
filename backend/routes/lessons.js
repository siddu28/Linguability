const express = require('express')
const router = express.Router()
const wordsData = require('../data/words.json')

// Get all languages
router.get('/languages', (req, res) => {
    const languages = Object.keys(wordsData).map(id => ({
        id,
        name: wordsData[id].name,
        flag: wordsData[id].flag
    }))
    res.json(languages)
})

// Get words for a specific language and lesson
router.get('/:languageId/:lessonType', (req, res) => {
    const { languageId, lessonType } = req.params

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
