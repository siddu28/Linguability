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
router.post('/check-pronunciation', (req, res) => {
    const { expected, spoken } = req.body;

    const e = expected.toLowerCase();
    const s = spoken.toLowerCase();

    res.json({
        isMatch: s.includes(e) || e.includes(s),
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
