/**
 * ============================================================
 *  LLM Service — Groq-powered Dynamic Content Generation
 *  Generates practice items, lesson content, and assessment
 *  questions on-the-fly (Profile-Grounded RAG).
 * ============================================================
 */

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Default model — Groq's fastest available
const MODEL = 'llama-3.3-70b-versatile';

// ─── Helpers ──────────────────────────────────────────────

/**
 * Safely parse a JSON string from LLM output.
 * Handles markdown code fences and trailing junk.
 */
function parseJSON(raw) {
    let cleaned = raw.trim();
    // Strip markdown code fences
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    // Find first [ or { and last ] or }
    const start = cleaned.search(/[\[{]/);
    const end = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));
    if (start === -1 || end === -1) throw new Error('No JSON found in LLM response');
    return JSON.parse(cleaned.substring(start, end + 1));
}

// ─── Practice Content Generation ─────────────────────────

/**
 * Generate practice content matching the exact frontend format.
 *
 * @param {string} language   - e.g. "english", "hindi", "tamil", "telugu"
 * @param {string} type       - "listening" | "vocabulary" | "writing" | "pronunciation"
 * @param {string[]} knownWords - Words the user already knows (for grounding)
 * @returns {Promise<object>}
 */
async function generatePracticeContent(language, type, knownWords = []) {
    const knownContext = knownWords.length > 0
        ? `The student already knows these words: ${knownWords.slice(0, 50).join(', ')}. Build upon them — introduce related but NEW vocabulary they haven't seen.`
        : 'The student is a beginner. Use basic, common vocabulary.';

    const languageDisplay = language.charAt(0).toUpperCase() + language.slice(1);

    const prompts = {
        listening: `Generate a JSON object with TWO arrays: "words" and "sentences" for ${languageDisplay} listening practice.

"words" array: 10 items, each with:
  { "id": <number>, "text": "<word in ${languageDisplay}>", "options": ["<correct>", "<wrong1>", "<wrong2>", "<wrong3>"], "category": "<category>" }

"sentences" array: 10 items, each with:
  { "id": <number>, "text": "<sentence in ${languageDisplay}>", "options": ["<correct>", "<wrong1>", "<wrong2>", "<wrong3>"], "category": "<category>" }

The correct answer MUST always be the first element in options. Use diverse categories (Food, Nature, Actions, Places, Family, Feelings, Colors, Activities).
${knownContext}
Return ONLY valid JSON, no explanation.`,

        vocabulary: `Generate a JSON array of 10 vocabulary items for ${languageDisplay} practice.
Each item: { "id": <number>, "word": "<word in ${languageDisplay}>", "meaning": "<short definition>", "example": "<example sentence>", "category": "<category>" }

Use diverse categories (Food, Nature, Actions, Places, Family, Feelings, Objects, Activities).
${knownContext}
Return ONLY a valid JSON array, no explanation.`,

        writing: `Generate a JSON array of 8 writing prompts for ${languageDisplay} practice.
Each item: { "id": <number>, "prompt": "<instruction telling user what to write>", "expectedText": "<the correct answer>", "hint": "<the correct answer>" }

The prompts should ask the user to write words or short sentences in ${languageDisplay}.
${knownContext}
Return ONLY a valid JSON array, no explanation.`,

        pronunciation: `Generate a JSON object with THREE arrays: "simple", "medium", and "hard" for ${languageDisplay} pronunciation practice.

"simple": 3 items — single words or very short phrases
"medium": 3 items — common phrases or short sentences
"hard": 2 items — longer complex sentences

Each item: { "id": <number>, "text": "<text in ${languageDisplay}>" }

IDs should be sequential starting from 1 across all arrays.
${knownContext}
Return ONLY valid JSON, no explanation.`
    };

    const prompt = prompts[type];
    if (!prompt) throw new Error(`Unknown practice type: ${type}`);

    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: 'You are a language learning content generator. Output ONLY valid JSON. No markdown, no explanation, no extra text.'
            },
            { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
    });

    const raw = completion.choices[0]?.message?.content || '';
    return parseJSON(raw);
}

// ─── Lesson Content Generation ───────────────────────────

/**
 * Generate lesson vocabulary content for a specific lesson type.
 *
 * @param {string} language  - e.g. "english", "hindi"
 * @param {string} lessonType - e.g. "greetings", "objects", "colors", "family", "food"
 * @param {string[]} knownWords - Words the user already knows
 * @returns {Promise<Array>}
 */
async function generateLessonContent(language, lessonType, knownWords = []) {
    const languageDisplay = language.charAt(0).toUpperCase() + language.slice(1);
    const knownContext = knownWords.length > 0
        ? `The student already knows: ${knownWords.slice(0, 50).join(', ')}. Generate NEW words they haven't seen.`
        : 'The student is a beginner.';

    const prompt = `Generate a JSON array of 10 vocabulary words for a ${languageDisplay} lesson on "${lessonType}".
Each item: {
  "id": <number>,
  "word": "<word in ${languageDisplay}>",
  "phonetic": "<IPA pronunciation>",
  "speakable": "<simple phonetic for TTS>",
  "translation": "<English translation/meaning>"
}

${knownContext}
Return ONLY a valid JSON array, no explanation.`;

    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: 'You are a language learning content generator. Output ONLY valid JSON. No markdown, no explanation.'
            },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
    });

    const raw = completion.choices[0]?.message?.content || '';
    return parseJSON(raw);
}

// ─── Assessment Content Generation ───────────────────────

/**
 * Generate quiz questions for assessments.
 *
 * @param {string} language   - e.g. "hindi", "tamil", "telugu"
 * @param {string} level      - "beginner" | "intermediate" | "advanced"
 * @param {string[]} categories - e.g. ["greetings", "objects", "food"]
 * @param {number} count      - Number of questions to generate
 * @param {string[]} knownWords - Words the user already knows
 * @returns {Promise<Array>}
 */
async function generateAssessmentQuestions(language, level, categories, count = 10, knownWords = []) {
    const languageDisplay = language.charAt(0).toUpperCase() + language.slice(1);
    const knownContext = knownWords.length > 0
        ? `The student knows these words: ${knownWords.slice(0, 50).join(', ')}. Test them on these AND introduce a few new related words.`
        : 'The student is at the beginning level.';

    const prompt = `Generate a JSON array of ${count} multiple-choice quiz questions for a ${level} ${languageDisplay} vocabulary assessment.
Categories to cover: ${categories.join(', ')}.

Each item: {
  "id": <number>,
  "question": "<question text>",
  "options": ["<optionA>", "<optionB>", "<optionC>", "<optionD>"],
  "correctAnswer": <0-based index of correct option>,
  "category": "<category>"
}

Mix question types:
- "What does '<${languageDisplay} word>' mean in English?"
- "How do you say '<English word>' in ${languageDisplay}?"
- Fill-in-the-blank sentences

${knownContext}
Return ONLY a valid JSON array, no explanation.`;

    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: 'You are a language assessment question generator. Output ONLY valid JSON. No markdown, no explanation.'
            },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500
    });

    const raw = completion.choices[0]?.message?.content || '';
    return parseJSON(raw);
}

module.exports = {
    generatePracticeContent,
    generateLessonContent,
    generateAssessmentQuestions
};
