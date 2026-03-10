const express = require('express')
const router = express.Router()

// ─── Gemini Setup ───────────────────────────────────────────────────────────
let genAI = null
let geminiModels = []

try {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
        genAI = new GoogleGenerativeAI(apiKey)
        // Try multiple models in order of preference — if one is rate-limited, try the next
        geminiModels = [
            genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }),
            genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' }),
            genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }),
        ]
        console.log('✅ Gemini AI initialized (3 models ready)')
    } else {
        console.warn('⚠️  GEMINI_API_KEY not set – chatbot will use rule-based fallback')
    }
} catch (err) {
    console.warn('⚠️  Could not initialize Gemini:', err.message)
}

// ─── System Prompt (compact to save tokens) ─────────────────────────────────
// This is intentionally concise to reduce token usage on the free tier.
const SYSTEM_PROMPT = `You are LinguaBot, an intelligent AI tutor on Linguability, a language-learning platform for students including those with disabilities.

CAPABILITIES: You are a REAL AI assistant. You can do EVERYTHING:
- Solve math (arithmetic, algebra, calculus, word problems) — show steps
- Teach ANY subject (science, history, geography, coding, logic)
- Language teaching: vocabulary, grammar, translation, pronunciation in English, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు)
- Create quizzes, exercises, flashcards
- Help with essays, creative writing, grammar correction
- Explain concepts at any level
- Answer general knowledge questions
- Have natural conversations on any topic

NAVIGATION: When suggesting a platform page, include path in brackets:
[/dashboard] [/lessons] [/practice] [/practice/vocabulary] [/practice/listening] [/practice/pronunciation] [/assessments] [/study-rooms] [/analytics] [/profile] [/settings] [/notifications]

TONE: Warm, patient, encouraging. Use emojis. Be concise for simple questions, detailed for teaching. Never say you can only help with navigation — you help with EVERYTHING like a real AI assistant.`

// ─── Conversation History ───────────────────────────────────────────────────
const conversationHistory = new Map()
const MAX_HISTORY = 20
const SESSION_TTL_MS = 30 * 60 * 1000

setInterval(() => {
    const now = Date.now()
    for (const [key, session] of conversationHistory) {
        if (now - session.lastActive > SESSION_TTL_MS) {
            conversationHistory.delete(key)
        }
    }
}, 10 * 60 * 1000)

// ─── Smart Rule-based Fallback ──────────────────────────────────────────────
// Used ONLY when ALL Gemini models are unavailable
function getRuleBasedReply(message) {
    const msg = message.toLowerCase().trim()

    // ── Math evaluation ─────────────────────────────────────────────────
    const mathMatch = msg.match(/(?:what\s+is\s+|calculate\s+|solve\s+|compute\s+|evaluate\s+)?(-?\d+(?:\.\d+)?[\s]*[+\-*/x×÷%^][\s]*-?\d+(?:\.\d+)?(?:[\s]*[+\-*/x×÷%^][\s]*-?\d+(?:\.\d+)?)*)/)
    if (mathMatch) {
        try {
            let expr = mathMatch[1].replace(/x|×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**')
            const result = Function('"use strict"; return (' + expr + ')')()
            if (typeof result === 'number' && isFinite(result)) {
                return `🔢 **${mathMatch[1].trim()} = ${result}** ✨\n\nWant me to help with more math or try something else? 😊`
            }
        } catch (e) { /* fall through */ }
    }

    // ── Translation lookups ─────────────────────────────────────────────
    const translations = {
        'hello': { hindi: 'नमस्ते (namaste)', tamil: 'வணக்கம் (vaṇakkam)', telugu: 'నమస్కారం (namaskāram)' },
        'thank you': { hindi: 'धन्यवाद (dhanyavaad)', tamil: 'நன்றி (naṉṟi)', telugu: 'ధన్యవాదాలు (dhan\'yavādālu)' },
        'good morning': { hindi: 'शुभ प्रभात (shubh prabhaat)', tamil: 'காலை வணக்கம் (kālai vaṇakkam)', telugu: 'శుభోదయం (śubhōdayaṁ)' },
        'water': { hindi: 'पानी (paani)', tamil: 'தண்ணீர் (taṇṇīr)', telugu: 'నీరు (nīru)' },
        'book': { hindi: 'किताब (kitaab)', tamil: 'புத்தகம் (puttakam)', telugu: 'పుస్తకం (pustakaṁ)' },
        'apple': { hindi: 'सेब (seb)', tamil: 'ஆப்பிள் (āppiḷ)', telugu: 'యాపిల్ (yāpil)' },
        'school': { hindi: 'स्कूल (school)', tamil: 'பள்ளி (paḷḷi)', telugu: 'పాఠశాల (pāṭhaśāla)' },
        'mother': { hindi: 'माँ (maa)', tamil: 'அம்மா (ammā)', telugu: 'అమ్మ (amma)' },
        'father': { hindi: 'पिता (pita)', tamil: 'அப்பா (appā)', telugu: 'నாన్న (nānna)' },
        'friend': { hindi: 'दोस्त (dost)', tamil: 'நண்பன் (naṇpaṉ)', telugu: 'స్నేహితుడు (snēhituḍu)' },
    }

    const translateMatch = msg.match(/(?:translate|how\s+(?:do\s+you\s+|to\s+)?say|what\s+is\s+.+\s+in)\s+['""']?(\w+(?:\s+\w+)?)['""']?/i)
    if (translateMatch || msg.includes('translate')) {
        for (const [word, trans] of Object.entries(translations)) {
            if (msg.includes(word)) {
                return `**"${word}"** in different languages 🌍:\n\n🇮🇳 Hindi: ${trans.hindi}\n🇮🇳 Tamil: ${trans.tamil}\n🇮🇳 Telugu: ${trans.telugu}\n\nPractice more at [/practice/vocabulary]! 📚`
            }
        }
    }

    // ── Keyword-based rules ─────────────────────────────────────────────
    const rules = [
        { keywords: ['hello', 'hi', 'hey', 'hii'], reply: "Hello! 👋 I'm LinguaBot, your AI learning assistant. I can help with math, languages, quizzes, science, grammar, and much more — just ask me anything! 😊" },
        { keywords: ['quiz', 'test me'], reply: "📋 **Quick Quiz!**\n\n1. What is 'water' in Hindi?\n2. What is 12 × 8?\n3. What is the capital of France?\n4. 'வணக்கம்' means ___ in English?\n\nType your answers! 🎯" },
        { keywords: ['lesson', 'learn', 'study', 'teach'], reply: "Browse lessons at [/lessons]! Or ask me to teach you anything right here — math, science, languages, grammar, history — I'm your AI tutor! 📚" },
        { keywords: ['practice', 'exercise'], reply: "Head to [/practice] for structured exercises! Or ask me for a quiz, translation, or explanation right here! 🎯" },
        { keywords: ['help', 'what can you'], reply: "I can help with **everything**! 🚀\n\n🔢 Math & Science\n🌍 Translations & Languages\n📖 Grammar & Writing\n📋 Quizzes & Exercises\n💡 General Knowledge\n🧭 Platform Navigation\n\nJust ask anything! 😊" },
        { keywords: ['thank', 'thanks', 'awesome'], reply: "You're welcome! 🌟 Ask me anything else — I'm always here!" },
        { keywords: ['bye', 'goodbye'], reply: "Goodbye! Happy learning! 🎉" },
    ]

    for (const rule of rules) {
        if (rule.keywords.some(kw => msg.includes(kw))) {
            return rule.reply
        }
    }

    return "I'm your AI learning assistant and I can help with **anything**! 😊\n\nTry asking me:\n🔢 \"What is 2+3\" or \"Solve 5x + 3 = 18\"\n🌍 \"Translate hello to Hindi\"\n📖 \"Explain photosynthesis\" or \"What is gravity?\"\n✍️ \"Check my grammar\" or \"Help me write an essay\"\n📋 \"Give me a quiz\"\n\nJust ask! 🚀"
}

// ─── Call Gemini with retry across models ────────────────────────────────────
async function callGemini(contents) {
    for (const model of geminiModels) {
        try {
            const result = await Promise.race([
                model.generateContent({ contents }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000))
            ])
            return result.response.text()
        } catch (err) {
            const isRateLimit = err.status === 429 || err.message?.includes('429')
            console.warn(`⚠️  Gemini model error: ${isRateLimit ? 'rate limited' : err.message?.substring(0, 60)}`)
            continue
        }
    }
    throw new Error('All Gemini models unavailable')
}

// ─── POST /api/chatbot ──────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { message, sessionId } = req.body

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' })
        }

        const sid = sessionId || 'default'
        let reply

        // Try Gemini AI first — this makes the bot a REAL AI
        if (geminiModels.length > 0) {
            try {
                if (!conversationHistory.has(sid)) {
                    conversationHistory.set(sid, { messages: [], lastActive: Date.now() })
                }
                const session = conversationHistory.get(sid)
                session.lastActive = Date.now()

                // Build message contents with compact system prompt
                const contents = [
                    { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\nRespond to the student\'s message.' }] },
                    { role: 'model', parts: [{ text: "Hello! 👋 I'm LinguaBot — your AI tutor. I can help with math, languages, science, writing, and anything else. What would you like to learn? 😊" }] },
                ]

                // Add conversation history (only recent to save tokens)
                for (const msg of session.messages.slice(-MAX_HISTORY)) {
                    contents.push(msg)
                }

                contents.push({ role: 'user', parts: [{ text: message.trim() }] })

                reply = await callGemini(contents)

                // Store in history
                session.messages.push({ role: 'user', parts: [{ text: message.trim() }] })
                session.messages.push({ role: 'model', parts: [{ text: reply }] })

                if (session.messages.length > MAX_HISTORY * 2) {
                    session.messages = session.messages.slice(-MAX_HISTORY * 2)
                }
            } catch (geminiErr) {
                console.error('All Gemini models failed, using fallback:', geminiErr.message)
                reply = getRuleBasedReply(message)
            }
        } else {
            reply = getRuleBasedReply(message)
        }

        res.json({ reply })
    } catch (err) {
        console.error('Chatbot error:', err)
        res.status(500).json({ error: 'Something went wrong', reply: "Sorry, I'm having trouble right now. Please try again! 🙏" })
    }
})

module.exports = router
