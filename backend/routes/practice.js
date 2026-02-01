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


module.exports = router;
