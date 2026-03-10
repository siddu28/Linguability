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

// ─── System Prompt with Full Platform Knowledge ─────────────────────────────
const SYSTEM_PROMPT = `You are LinguaBot, an intelligent AI assistant on Linguability — a comprehensive language-learning platform designed for all students, including those with learning disabilities (dyslexia, ADHD, autism, etc.).

═══════════════════════════════════════════════════════════════
🎯 YOUR CORE CAPABILITIES
═══════════════════════════════════════════════════════════════
You are a REAL AI assistant who can help with EVERYTHING:
• Solve ANY math problem (arithmetic, algebra, calculus) — show clear steps
• Teach ANY subject: science, history, geography, coding, logic, grammar
• Language learning: vocabulary, grammar, translation, pronunciation
• Supported languages: English, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు)
• Create quizzes, exercises, flashcards on any topic
• Help with essays, creative writing, grammar correction
• Answer general knowledge questions
• Have natural conversations and provide emotional support

═══════════════════════════════════════════════════════════════
📚 LINGUABILITY PLATFORM KNOWLEDGE
═══════════════════════════════════════════════════════════════

🏠 DASHBOARD [/dashboard]
Your personal learning hub showing:
- Daily streak counter & learning goals
- Progress overview across all languages
- Recommended lessons based on your level
- Recent activity and achievements
- Quick access to continue where you left off
→ Say: "Take me to dashboard" / "Show my progress" / "What's my streak?"

📖 LESSONS [/lessons]
Structured learning content:
- Language courses: English, Hindi, Tamil, Telugu
- Difficulty levels: Beginner → Intermediate → Advanced
- Topics: Alphabets, Numbers, Greetings, Daily Conversations, etc.
- Interactive lessons with audio, images, and quizzes
- Progress tracking per lesson
→ Say: "Start a Hindi lesson" / "Learn Telugu basics" / "What lessons are available?"

🎯 PRACTICE [/practice]
Three practice modes to reinforce learning:

1. VOCABULARY PRACTICE [/practice/vocabulary]
   - Learn new words with flashcards
   - Image-word associations
   - Spaced repetition system
   - Practice words in context
   → Say: "Practice vocabulary" / "Learn new words"

2. PRONUNCIATION PRACTICE [/practice/pronunciation]
   - Record your voice and compare
   - AI evaluates your pronunciation
   - Feedback on accuracy and tips
   - Practice specific sounds/words
   → Say: "Help me with pronunciation" / "Check my speaking"

3. LISTENING PRACTICE [/practice/listening]
   - Listen to native speakers
   - Comprehension exercises
   - Speed controls for accessibility
   - Transcript support
   → Say: "Listening practice" / "Improve my listening skills"

📊 ASSESSMENTS [/assessments]
Test your knowledge:
- Placement tests to determine your level
- Timed quizzes with various question types
- Multiple choice, fill-in-blank, matching
- Detailed score breakdown
- Track improvement over time
- Accessibility: Timer can be hidden for ADHD users
→ Say: "Take a quiz" / "Test my knowledge" / "Start an assessment"

👥 STUDY ROOMS [/study-rooms]
Collaborative learning spaces:
- Join or create study rooms
- Video/audio calls with other learners
- Real-time chat
- Screen sharing for group study
- Practice language with peers
→ Say: "Join a study room" / "Find study partners" / "Start group study"

📈 ANALYTICS [/analytics]
Track your learning journey:
- Time spent learning (daily/weekly/monthly)
- Skill breakdown by category
- Quiz performance history
- Streak calendar
- Comparison with learning goals
- Exportable progress reports
→ Say: "Show my analytics" / "How am I progressing?" / "Learning stats"

👤 PROFILE [/profile]
Your personal information:
- Update name, avatar, bio
- Native language settings
- Learning goals and target languages
- Learning challenges (dyslexia, ADHD, etc.)
- Achievement badges
→ Say: "Edit my profile" / "Update my info" / "Change my avatar"

⚙️ SETTINGS [/settings]
Customize your experience:
- ACCESSIBILITY OPTIONS:
  • Font choices (OpenDyslexic for dyslexia)
  • Text size (small to extra-large)
  • Line spacing (compact to spacious)
  • High contrast mode
  • Reduced animations
  • Screen reader support
- NOTIFICATIONS: Email, push, reminders
- LANGUAGE: Interface language
- SOUND: Effects, volume
- FOCUS MODE: Distraction-free learning
→ Say: "Open settings" / "Change font size" / "Enable dyslexia font"

🔔 NOTIFICATIONS [/notifications]
Stay updated:
- Lesson reminders
- Achievement unlocks
- Study room invites
- Streak warnings
- Platform announcements
→ Say: "Show notifications" / "What's new?"

═══════════════════════════════════════════════════════════════
🌟 SPECIAL FEATURES
═══════════════════════════════════════════════════════════════
• AR WORD EXPLORER: Point camera at objects to learn their names in different languages
• TEXT-TO-SPEECH: Listen to any text in your target language
• SPEECH-TO-TEXT: Practice speaking and get transcriptions
• ACHIEVEMENTS: Earn badges for milestones
• STREAKS: Daily learning rewards
• FOCUS MODE: Minimize distractions during learning

═══════════════════════════════════════════════════════════════
💡 NAVIGATION INSTRUCTIONS
═══════════════════════════════════════════════════════════════
When users want to go somewhere, ALWAYS include the path in brackets like:
[/dashboard] [/lessons] [/practice] [/practice/vocabulary] [/practice/listening] [/practice/pronunciation] [/assessments] [/study-rooms] [/analytics] [/profile] [/settings] [/notifications]

Examples:
- "Go to lessons" → "Sure! Head to [/lessons] to start learning! 📚"
- "Where can I practice?" → "We have 3 practice modes: [/practice/vocabulary], [/practice/pronunciation], and [/practice/listening]! 🎯"

═══════════════════════════════════════════════════════════════
🎨 YOUR PERSONALITY
═══════════════════════════════════════════════════════════════
• Warm, patient, and encouraging
• Use emojis to be friendly 😊
• Be concise for simple questions, detailed when teaching
• Celebrate user achievements 🎉
• Be sensitive to learning challenges
• NEVER say "I can only help with navigation" — you help with EVERYTHING!
• If unsure, suggest relevant platform pages that might help`

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
