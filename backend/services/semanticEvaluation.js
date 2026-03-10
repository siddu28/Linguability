/**
 * ============================================================
 *  Semantic Sentence Evaluation Service
 *  Uses: @xenova/transformers with Xenova/all-MiniLM-L6-v2
 *  Computes cosine similarity between sentence embeddings.
 * ============================================================
 */

const { pipeline } = require('@xenova/transformers');

let embedder = null;
let loadingPromise = null;

/**
 * Lazily initialise the feature-extraction pipeline (singleton).
 * The model is downloaded once and cached locally.
 */
async function getEmbedder() {
    if (embedder) return embedder;

    if (!loadingPromise) {
        console.log('[SemanticEval] Loading Xenova/all-MiniLM-L6-v2 model …');
        loadingPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        loadingPromise.then(p => {
            embedder = p;
            console.log('[SemanticEval] Model loaded successfully.');
        }).catch(err => {
            loadingPromise = null;
            console.error('[SemanticEval] Failed to load model:', err.message);
        });
    }

    return loadingPromise;
}

/**
 * Get the embedding vector for a sentence.
 * Returns a Float32Array (384-d for MiniLM-L6-v2).
 */
async function getEmbedding(text) {
    const pipe = await getEmbedder();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return output.data; // Float32Array
}

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(vecA, vecB) {
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }

    const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
    return magnitude === 0 ? 0 : dot / magnitude;
}

/**
 * Compute the semantic similarity (0-100) between a user response
 * and one or more accepted translations.
 *
 * Returns the best (highest) similarity score found.
 *
 * @param {string} userResponse - What the user typed
 * @param {string[]} acceptedTexts - Array of accepted translations
 * @returns {Promise<{ score: number, bestMatch: string }>}
 */
async function semanticSimilarity(userResponse, acceptedTexts) {
    if (!userResponse || !acceptedTexts || acceptedTexts.length === 0) {
        return { score: 0, bestMatch: '' };
    }

    const userEmbedding = await getEmbedding(userResponse);

    let bestScore = -1;
    let bestMatch = '';

    for (const text of acceptedTexts) {
        const refEmbedding = await getEmbedding(text);
        const sim = cosineSimilarity(userEmbedding, refEmbedding);
        if (sim > bestScore) {
            bestScore = sim;
            bestMatch = text;
        }
    }

    // Convert from [-1, 1] range to [0, 100] percentage
    const score = Math.round(Math.max(0, bestScore) * 100);

    return { score, bestMatch };
}

/**
 * Pre-warm the model so subsequent calls are fast.
 * Call this at server startup (fire-and-forget).
 */
async function warmUp() {
    try {
        await getEmbedder();
    } catch (_) {
        // silently ignore — will retry on first request
    }
}

module.exports = { semanticSimilarity, warmUp };
