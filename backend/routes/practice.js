const express = require('express');
const router = express.Router();
const practiceData = require('../data/practice.json');


// ================== GET ALL PRACTICE (optional) ==================
router.get('/', (req, res) => {
    res.json(practiceData);
});


// ================== LISTENING ==================
router.get('/:languageId/listening', (req, res) => {
    const data = practiceData[req.params.languageId];
    if (!data) return res.status(404).json({ error: "Language not found" });

    res.json(data.listening);
});


// ================== PRONUNCIATION WORDS ==================
router.get('/:languageId/pronunciation', (req, res) => {
    const data = practiceData[req.params.languageId];
    if (!data) return res.status(404).json({ error: "Language not found" });

    res.json(data.pronunciation);
});


// ================== VOCABULARY ==================
router.get('/:languageId/vocabulary', (req, res) => {
    const data = practiceData[req.params.languageId];
    if (!data) return res.status(404).json({ error: "Language not found" });

    res.json(data.vocabulary);
});


// ================== PRONUNCIATION CHECK ==================
// Levenshtein distance for string similarity
const levenshteinDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

// ================== PRONUNCIATION CHECK ==================
router.post('/check-pronunciation', (req, res) => {
    const { expected, spoken } = req.body;

    if (!spoken || !expected) {
        return res.json({
            isMatch: false,
            score: 0,
            expected: expected || "",
            spoken: spoken || ""
        });
    }

    const e = expected.toLowerCase().trim();
    const s = spoken.toLowerCase().trim();

    // Calculate accuracy
    const distance = levenshteinDistance(e, s);
    const maxLength = Math.max(e.length, s.length);
    let score = 0;

    if (maxLength > 0) {
        score = Math.round(((maxLength - distance) / maxLength) * 100);
    } else {
        score = 100; // Both empty strings
    }

    // Ensure score is non-negative
    score = Math.max(0, score);

    // Consider it a match if score is above 80% or if one includes the other (fallback)
    const isMatch = score >= 80 || s.includes(e) || e.includes(s);

    res.json({
        isMatch,
        score,
        expected: e,
        spoken: s
    });
});

// GET all languages for practice (like lessons)
router.get('/languages', (req, res) => {
    const langs = Object.keys(practiceData).map(id => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1)
    }))
    res.json(langs)
})

// GET practice by language + type
router.get('/:languageId/:type', (req, res) => {
    const { languageId, type } = req.params

    const lang = practiceData[languageId]
    if (!lang) return res.status(404).json({ error: "Language not found" })

    if (!lang[type]) return res.status(404).json({ error: "Practice type not found" })

    res.json(lang[type])
})

module.exports = router;
