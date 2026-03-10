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
        listening: `You MUST generate a JSON object with exactly TWO arrays: "words" and "sentences" for ${languageDisplay} listening practice.

IMPORTANT: Generate EXACTLY 15 items in "words" and EXACTLY 15 items in "sentences". Do NOT generate fewer.

"words" array — 15 items, each:
{ "id": <number 1-15>, "text": "<single word in ${languageDisplay}>", "options": ["<correct>", "<wrong1>", "<wrong2>", "<wrong3>"], "category": "<category>" }

"sentences" array — 15 items, each:
{ "id": <number 16-30>, "text": "<short sentence in ${languageDisplay}>", "options": ["<correct sentence>", "<wrong1>", "<wrong2>", "<wrong3>"], "category": "<category>" }

Rules:
- The CORRECT answer is always options[0].
- Use diverse categories: Food, Nature, Actions, Places, Family, Feelings, Colors, Activities, Objects, Occupation, Drinks, Weather.
- All text must be in ${languageDisplay}.
- Every item must have exactly 4 options.
${knownContext}
Return ONLY valid JSON. No explanation, no markdown.`,

        vocabulary: `You MUST generate a JSON array with EXACTLY 15 vocabulary items for ${languageDisplay} practice.

IMPORTANT: The array MUST contain exactly 15 objects. Do NOT return fewer.

Each object:
{ "id": <number 1-15>, "word": "<word in ${languageDisplay}>", "meaning": "<short definition in English>", "example": "<example sentence using the word>", "category": "<category>" }

Use at least 8 different categories from: Food, Nature, Actions, Places, Family, Feelings, Objects, Activities, Colors, Body, Time, Weather, Occupation, Animals, Clothing.
${knownContext}
Return ONLY a valid JSON array with 15 items. No explanation, no markdown.`,

        writing: `You MUST generate a JSON array with EXACTLY 12 writing prompts for ${languageDisplay} practice.

IMPORTANT: The array MUST contain exactly 12 objects. Do NOT return fewer.

Each object:
{ "id": <number 1-12>, "prompt": "<instruction telling user what to write>", "expectedText": "<the CORRECT ${languageDisplay} answer>", "hint": "<same as expectedText>" }

CRITICAL RULES:
- The "expectedText" and "hint" fields MUST be the CORRECT answer to the prompt. They must MATCH the prompt perfectly.
- Example for Telugu: if prompt is "Write the Telugu word for 'water'", then expectedText MUST be "నీరు" (the Telugu word for water), NOT any other word.
- Example for English: if prompt is "Write 'I am happy' in English", then expectedText MUST be "I am happy".
- NEVER put a mismatched answer. Double-check every single prompt-answer pair.
- Mix simple single words and short phrases/sentences.
- Use diverse topics: greetings, food, family, numbers, colors, animals, body parts, daily activities.
${knownContext}
Return ONLY a valid JSON array with 12 items. No explanation, no markdown.`,

        pronunciation: `You MUST generate a JSON object with THREE arrays for ${languageDisplay} pronunciation practice.

IMPORTANT: Generate the EXACT counts specified below. Do NOT return fewer.

"simple": EXACTLY 5 items — single common words
"medium": EXACTLY 5 items — common phrases or short sentences (3-5 words)
"hard": EXACTLY 5 items — longer complex sentences (6+ words)

Each item: { "id": <number>, "text": "<text in ${languageDisplay}>" }

IDs must be sequential: simple 1-5, medium 6-10, hard 11-15.
Use diverse everyday topics.
${knownContext}
Return ONLY valid JSON. No explanation, no markdown.`
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
        temperature: 0.9,
        max_tokens: 4000
    });

    const raw = completion.choices[0]?.message?.content || '';
    console.log(`[LLM] ${language}/${type} — finish_reason: ${completion.choices[0]?.finish_reason}, tokens: ${completion.usage?.completion_tokens}/${completion.usage?.total_tokens}`);
    console.log(`[LLM] raw length: ${raw.length} chars`);
    const parsed = parseJSON(raw);
    const count = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
    console.log(`[LLM] parsed ${count} top-level items`);
    return parsed;
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
