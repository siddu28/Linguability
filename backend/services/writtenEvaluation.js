/**
 * ============================================================
 *  Written Response NLP Evaluation Service
 *  Uses: natural (tokenizer, n-grams, JaroWinkler) + string-similarity (Dice)
 * ============================================================
 */

const natural = require('natural');
const stringSimilarity = require('string-similarity');
const { semanticSimilarity } = require('./semanticEvaluation');

// Tokeniser that works for both Latin and Devanagari/Indian scripts
const tokenizer = new natural.WordTokenizer();

/**
 * Tokenize text — handles both Latin-script and Unicode (Hindi/Tamil/Telugu)
 * Falls back to splitting on whitespace for non-Latin scripts
 */
function smartTokenize(text) {
    if (!text) return [];
    const tokens = tokenizer.tokenize(text.toLowerCase());
    // If the standard tokenizer produces nothing (e.g. pure Devanagari),
    // fall back to whitespace split
    if (!tokens || tokens.length === 0) {
        return text.toLowerCase().trim().split(/\s+/).filter(Boolean);
    }
    return tokens;
}

/**
 * Generate character-level n-grams for a string
 */
function charNgrams(text, n = 2) {
    const normalized = text.toLowerCase().replace(/\s+/g, '');
    const grams = [];
    for (let i = 0; i <= normalized.length - n; i++) {
        grams.push(normalized.substring(i, i + n));
    }
    return grams;
}

/**
 * Jaccard similarity between two sets of tokens
 */
function jaccardSimilarity(tokensA, tokensB) {
    if (tokensA.length === 0 && tokensB.length === 0) return 1;
    if (tokensA.length === 0 || tokensB.length === 0) return 0;

    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return intersection.size / union.size;
}

/**
 * N-gram cosine similarity
 */
function ngramCosineSimilarity(textA, textB, n = 2) {
    const gramsA = charNgrams(textA, n);
    const gramsB = charNgrams(textB, n);

    if (gramsA.length === 0 && gramsB.length === 0) return 1;
    if (gramsA.length === 0 || gramsB.length === 0) return 0;

    // Build frequency maps
    const freqA = {};
    const freqB = {};
    gramsA.forEach(g => { freqA[g] = (freqA[g] || 0) + 1; });
    gramsB.forEach(g => { freqB[g] = (freqB[g] || 0) + 1; });

    // Compute dot product and magnitudes
    const allGrams = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    for (const gram of allGrams) {
        const a = freqA[gram] || 0;
        const b = freqB[gram] || 0;
        dotProduct += a * b;
        magA += a * a;
        magB += b * b;
    }

    const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Check how many keywords from the accepted set the user included
 */
function keywordMatchScore(userText, keywords) {
    if (!keywords || keywords.length === 0) return 1;

    const userLower = userText.toLowerCase();
    let matchCount = 0;

    for (const keyword of keywords) {
        if (userLower.includes(keyword.toLowerCase())) {
            matchCount++;
        }
    }

    return matchCount / keywords.length;
}

/**
 * Find the best matching accepted translation
 */
function findBestMatch(userResponse, acceptedTranslations) {
    if (!acceptedTranslations || acceptedTranslations.length === 0) {
        return { bestMatch: '', score: 0 };
    }

    const result = stringSimilarity.findBestMatch(
        userResponse.toLowerCase(),
        acceptedTranslations.map(t => t.toLowerCase())
    );

    return {
        bestMatch: acceptedTranslations[result.bestMatchIndex],
        score: result.bestMatch.rating
    };
}

/**
 * Main evaluation function
 * 
 * @param {string} userResponse - What the user typed/wrote
 * @param {object} promptData - The expected data from accepted-translations.json
 * @returns {object} Evaluation result with scores and feedback
 */
async function evaluateWrittenResponse(userResponse, promptData) {
    if (!userResponse || !userResponse.trim()) {
        return {
            overallScore: 0,
            isCorrect: false,
            feedback: {
                summary: 'No response provided. Please try writing something!',
                details: []
            },
            scores: {
                exactMatch: 0,
                diceCoefficient: 0,
                jaccardSimilarity: 0,
                ngramSimilarity: 0,
                keywordMatch: 0
            },
            bestMatch: promptData.expected,
            acceptedAlternatives: promptData.accepted
        };
    }

    const userText = userResponse.trim();
    const expected = promptData.expected;
    const accepted = promptData.accepted || [expected];
    const keywords = promptData.keywords || [];

    // 1. Exact match check (case-insensitive)
    const isExactMatch = accepted.some(
        a => a.toLowerCase().trim() === userText.toLowerCase()
    );

    if (isExactMatch) {
        return {
            overallScore: 100,
            isCorrect: true,
            feedback: {
                summary: 'Perfect! Your answer is exactly right! 🎉',
                details: [
                    { aspect: 'Accuracy', score: 100, comment: 'Exact match with expected answer' }
                ]
            },
            scores: {
                exactMatch: 100,
                diceCoefficient: 100,
                jaccardSimilarity: 100,
                ngramSimilarity: 100,
                keywordMatch: 100
            },
            bestMatch: expected,
            acceptedAlternatives: accepted
        };
    }

    // 2. Find best matching accepted translation (Dice coefficient via string-similarity)
    const bestMatchResult = findBestMatch(userText, accepted);
    const diceScore = Math.round(bestMatchResult.score * 100);

    // 3. Jaccard similarity (word-level)
    const userTokens = smartTokenize(userText);
    const expectedTokens = smartTokenize(bestMatchResult.bestMatch);
    const jaccardScore = Math.round(jaccardSimilarity(userTokens, expectedTokens) * 100);

    // 4. N-gram cosine similarity (character-level bigrams)
    const ngramScore = Math.round(ngramCosineSimilarity(userText, bestMatchResult.bestMatch) * 100);

    // 5. Keyword matching
    const kwScore = Math.round(keywordMatchScore(userText, keywords) * 100);

    // 6. Semantic similarity via AI embeddings
    let semanticScore = 0;
    try {
        const semResult = await semanticSimilarity(userText, accepted);
        semanticScore = semResult.score;
    } catch (err) {
        console.error('[WrittenEval] Semantic evaluation fallback:', err.message);
        // Continue without semantic score — the other metrics still work
    }

    // 7. Compute weighted overall score (semantic-aware)
    // Semantic meaning is weighted heaviest so paraphrases score well.
    const overallScore = Math.round(
        semanticScore * 0.35 +  // AI semantic meaning (highest weight)
        diceScore * 0.20 +      // String similarity (handles typos)
        jaccardScore * 0.10 +   // Word-level overlap
        ngramScore * 0.15 +     // Character-level patterns
        kwScore * 0.20          // Key concept presence
    );

    // 8. Generate feedback
    // Also consider high semantic similarity alone as correct (meaning matches)
    const isCorrect = overallScore >= 80 || semanticScore >= 85;
    const details = [];

    // Dice feedback
    if (diceScore >= 90) {
        details.push({ aspect: 'Spelling', score: diceScore, comment: 'Excellent spelling! Very close to the expected answer.' });
    } else if (diceScore >= 70) {
        details.push({ aspect: 'Spelling', score: diceScore, comment: 'Good attempt, but there are some spelling differences.' });
    } else if (diceScore >= 40) {
        details.push({ aspect: 'Spelling', score: diceScore, comment: 'Your spelling needs improvement. Compare with the expected answer.' });
    } else {
        details.push({ aspect: 'Spelling', score: diceScore, comment: 'The spelling is quite different from what was expected.' });
    }

    // Word accuracy feedback
    if (jaccardScore >= 80) {
        details.push({ aspect: 'Word Accuracy', score: jaccardScore, comment: 'You used the right words!' });
    } else if (jaccardScore >= 50) {
        details.push({ aspect: 'Word Accuracy', score: jaccardScore, comment: 'Some of the words are correct, but a few are missing or wrong.' });
    } else {
        details.push({ aspect: 'Word Accuracy', score: jaccardScore, comment: 'Most words don\'t match the expected answer.' });
    }

    // Keyword feedback
    if (kwScore >= 80) {
        details.push({ aspect: 'Key Concepts', score: kwScore, comment: 'You captured the key meaning well!' });
    } else if (kwScore >= 40) {
        details.push({ aspect: 'Key Concepts', score: kwScore, comment: 'Some key words are missing from your answer.' });
    } else {
        details.push({ aspect: 'Key Concepts', score: kwScore, comment: 'The core meaning keywords are missing.' });
    }

    // Overall summary
    let summary;
    if (overallScore >= 90) {
        summary = 'Excellent work! Your answer is nearly perfect! 🌟';
    } else if (overallScore >= 75) {
        summary = 'Good job! You\'re very close to the correct answer. 👍';
    } else if (overallScore >= 50) {
        summary = 'Nice try! Keep practicing to improve your accuracy. 💪';
    } else if (overallScore >= 25) {
        summary = 'Keep going! Compare your answer with the expected one and try again. 📝';
    } else {
        summary = 'Don\'t give up! Check the expected answer and practice writing it. ✏️';
    }

    return {
        overallScore,
        isCorrect,
        feedback: { summary, details },
        scores: {
            exactMatch: 0,
            semanticSimilarity: semanticScore,
            diceCoefficient: diceScore,
            jaccardSimilarity: jaccardScore,
            ngramSimilarity: ngramScore,
            keywordMatch: kwScore
        },
        bestMatch: bestMatchResult.bestMatch,
        acceptedAlternatives: accepted
    };
}

module.exports = { evaluateWrittenResponse };
