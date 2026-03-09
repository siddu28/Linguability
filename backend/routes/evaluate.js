/**
 * ============================================================
 *  Written Response Evaluation Route
 *  POST /api/evaluate/written
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { evaluateWrittenResponse } = require('../services/writtenEvaluation');
const acceptedTranslations = require('../data/accepted-translations.json');

/**
 * POST /api/evaluate/written
 * Body: { language, promptId, userResponse }
 * Returns: NLP evaluation result with scores and detailed feedback
 */
router.post('/written', (req, res) => {
    const { language, promptId, userResponse } = req.body;

    // Validate inputs
    if (!language || !promptId || userResponse === undefined) {
        return res.status(400).json({
            error: 'Missing required fields: language, promptId, userResponse'
        });
    }

    // Look up the prompt data
    const langData = acceptedTranslations[language];
    if (!langData) {
        return res.status(404).json({
            error: `Language '${language}' not found. Available: ${Object.keys(acceptedTranslations).join(', ')}`
        });
    }

    const promptData = langData[String(promptId)];
    if (!promptData) {
        return res.status(404).json({
            error: `Prompt ID '${promptId}' not found for language '${language}'. Available IDs: ${Object.keys(langData).join(', ')}`
        });
    }

    // Run NLP evaluation
    const result = evaluateWrittenResponse(userResponse, promptData);

    res.json({
        language,
        promptId,
        userResponse,
        expected: promptData.expected,
        ...result
    });
});

/**
 * GET /api/evaluate/prompts/:language
 * Returns all writing prompts for a given language
 */
router.get('/prompts/:language', (req, res) => {
    const { language } = req.params;

    const langData = acceptedTranslations[language];
    if (!langData) {
        return res.status(404).json({
            error: `Language '${language}' not found`
        });
    }

    // Return prompts without the accepted answers (don't reveal answers to frontend)
    const prompts = Object.entries(langData).map(([id, data]) => ({
        id: parseInt(id),
        prompt: data.prompt,
        category: data.category,
        hint: data.expected // Show the expected text as a reference hint
    }));

    res.json(prompts);
});

module.exports = router;
