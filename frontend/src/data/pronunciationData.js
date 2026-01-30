// Pronunciation test configuration and data for speaking assessments
// Uses Web Speech API SpeechRecognition for speech-to-text

// Pronunciation tests configuration
export const pronunciationTests = {
    // =============== ENGLISH PRONUNCIATION TESTS ===============
    'english-pronunciation-basics': {
        id: 'english-pronunciation-basics',
        title: 'English Pronunciation - Basics',
        description: 'Practice pronouncing basic English words clearly',
        language: 'english',
        level: 'beginner',
        wordsCount: 10,
        duration: 300, // 5 minutes
        type: 'speaking',
        prerequisite: null,
        passingScore: 70
    },
    'english-pronunciation-intermediate': {
        id: 'english-pronunciation-intermediate',
        title: 'English Pronunciation - Intermediate',
        description: 'Challenge yourself with longer words and phrases',
        language: 'english',
        level: 'intermediate',
        wordsCount: 12,
        duration: 420, // 7 minutes
        type: 'speaking',
        prerequisite: 'english-pronunciation-basics',
        passingScore: 70
    },
    'english-pronunciation-advanced': {
        id: 'english-pronunciation-advanced',
        title: 'English Pronunciation - Advanced',
        description: 'Master difficult English pronunciations and phrases',
        language: 'english',
        level: 'advanced',
        wordsCount: 15,
        duration: 600, // 10 minutes
        type: 'speaking',
        prerequisite: 'english-pronunciation-intermediate',
        passingScore: 75
    },

    // =============== HINDI PRONUNCIATION TESTS ===============
    'hindi-pronunciation-basics': {
        id: 'hindi-pronunciation-basics',
        title: 'Hindi Pronunciation - Basics',
        description: 'Practice pronouncing basic Hindi words and greetings',
        language: 'hindi',
        level: 'beginner',
        wordsCount: 10,
        duration: 300, // 5 minutes
        type: 'speaking',
        prerequisite: null,
        passingScore: 70
    },
    'hindi-pronunciation-intermediate': {
        id: 'hindi-pronunciation-intermediate',
        title: 'Hindi Pronunciation - Intermediate',
        description: 'Learn to pronounce common Hindi phrases clearly',
        language: 'hindi',
        level: 'intermediate',
        wordsCount: 12,
        duration: 420, // 7 minutes
        type: 'speaking',
        prerequisite: 'hindi-pronunciation-basics',
        passingScore: 70
    },
    'hindi-pronunciation-advanced': {
        id: 'hindi-pronunciation-advanced',
        title: 'Hindi Pronunciation - Advanced',
        description: 'Master complex Hindi sentences and expressions',
        language: 'hindi',
        level: 'advanced',
        wordsCount: 15,
        duration: 600, // 10 minutes
        type: 'speaking',
        prerequisite: 'hindi-pronunciation-intermediate',
        passingScore: 75
    }
}

// Words/phrases for pronunciation tests organized by difficulty
export const pronunciationWords = {
    english: {
        beginner: [
            { id: 1, word: 'Hello', hint: 'Common greeting', phonetic: '/həˈloʊ/' },
            { id: 2, word: 'Thank you', hint: 'Expression of gratitude', phonetic: '/θæŋk juː/' },
            { id: 3, word: 'Water', hint: 'Drink to stay hydrated', phonetic: '/ˈwɔːtər/' },
            { id: 4, word: 'Apple', hint: 'A red or green fruit', phonetic: '/ˈæpəl/' },
            { id: 5, word: 'Happy', hint: 'Feeling of joy', phonetic: '/ˈhæpi/' },
            { id: 6, word: 'Family', hint: 'Parents and children', phonetic: '/ˈfæməli/' },
            { id: 7, word: 'Morning', hint: 'Start of the day', phonetic: '/ˈmɔːrnɪŋ/' },
            { id: 8, word: 'Welcome', hint: 'Greeting for guests', phonetic: '/ˈwelkəm/' },
            { id: 9, word: 'Friend', hint: 'Person you like', phonetic: '/frend/' },
            { id: 10, word: 'Beautiful', hint: 'Very pretty', phonetic: '/ˈbjuːtɪfəl/' },
            { id: 11, word: 'Teacher', hint: 'Person who teaches', phonetic: '/ˈtiːtʃər/' },
            { id: 12, word: 'Student', hint: 'Person who learns', phonetic: '/ˈstuːdənt/' },
        ],
        intermediate: [
            { id: 1, word: 'Comfortable', hint: 'Feeling at ease', phonetic: '/ˈkʌmftəbəl/' },
            { id: 2, word: 'Restaurant', hint: 'Place to eat', phonetic: '/ˈrestərɒnt/' },
            { id: 3, word: 'Interesting', hint: 'Captivating attention', phonetic: '/ˈɪntrəstɪŋ/' },
            { id: 4, word: 'Vegetable', hint: 'Healthy food like carrots', phonetic: '/ˈvedʒtəbəl/' },
            { id: 5, word: 'Temperature', hint: 'How hot or cold', phonetic: '/ˈtemprətʃər/' },
            { id: 6, word: 'Especially', hint: 'Particularly', phonetic: '/ɪˈspeʃəli/' },
            { id: 7, word: 'Necessary', hint: 'Required or needed', phonetic: '/ˈnesəseri/' },
            { id: 8, word: 'Different', hint: 'Not the same', phonetic: '/ˈdɪfrənt/' },
            { id: 9, word: 'Important', hint: 'Of great value', phonetic: '/ɪmˈpɔːrtənt/' },
            { id: 10, word: 'Probably', hint: 'Most likely', phonetic: '/ˈprɒbəbli/' },
            { id: 11, word: 'Beautiful sunset', hint: 'Pretty evening sky', phonetic: '/ˈbjuːtɪfəl ˈsʌnset/' },
            { id: 12, word: 'Good morning', hint: 'Morning greeting', phonetic: '/ɡʊd ˈmɔːrnɪŋ/' },
            { id: 13, word: 'How are you', hint: 'Asking about wellbeing', phonetic: '/haʊ ɑːr juː/' },
            { id: 14, word: 'Nice to meet you', hint: 'Greeting when meeting', phonetic: '/naɪs tuː miːt juː/' },
        ],
        advanced: [
            { id: 1, word: 'Pronunciation', hint: 'Way of saying words', phonetic: '/prəˌnʌnsiˈeɪʃən/' },
            { id: 2, word: 'Entrepreneurship', hint: 'Starting businesses', phonetic: '/ˌɒntrəprəˈnɜːʃɪp/' },
            { id: 3, word: 'Miscellaneous', hint: 'Various mixed items', phonetic: '/ˌmɪsəˈleɪniəs/' },
            { id: 4, word: 'Phenomenon', hint: 'Observable event', phonetic: '/fəˈnɒmɪnən/' },
            { id: 5, word: 'Conscientious', hint: 'Very careful and thorough', phonetic: '/ˌkɒnʃiˈenʃəs/' },
            { id: 6, word: 'Enthusiastic', hint: 'Very excited about', phonetic: '/ɪnˌθjuːziˈæstɪk/' },
            { id: 7, word: 'Approximately', hint: 'Close to, nearly', phonetic: '/əˈprɒksɪmətli/' },
            { id: 8, word: 'Responsibilities', hint: 'Duties to handle', phonetic: '/rɪˌspɒnsəˈbɪlətiz/' },
            { id: 9, word: 'Communication skills', hint: 'Ability to convey ideas', phonetic: '/kəˌmjuːnɪˈkeɪʃən skɪlz/' },
            { id: 10, word: 'The weather is beautiful today', hint: 'Comment about nice weather', phonetic: null },
            { id: 11, word: 'I would like to order please', hint: 'Restaurant phrase', phonetic: null },
            { id: 12, word: 'Could you repeat that slowly', hint: 'Asking for clarification', phonetic: null },
            { id: 13, word: 'Simultaneously', hint: 'At the same time', phonetic: '/ˌsɪməlˈteɪniəsli/' },
            { id: 14, word: 'Sophisticated', hint: 'Complex and refined', phonetic: '/səˈfɪstɪkeɪtɪd/' },
            { id: 15, word: 'Opportunity', hint: 'Favorable chance', phonetic: '/ˌɒpəˈtjuːnəti/' },
            { id: 16, word: 'Congratulations on your achievement', hint: 'Praising success', phonetic: null },
        ]
    },

    // =============== HINDI WORDS ===============
    hindi: {
        beginner: [
            { id: 1, word: 'नमस्ते', hint: 'Hello/Greetings', phonetic: 'Namaste' },
            { id: 2, word: 'धन्यवाद', hint: 'Thank you', phonetic: 'Dhanyavaad' },
            { id: 3, word: 'पानी', hint: 'Water', phonetic: 'Paani' },
            { id: 4, word: 'खाना', hint: 'Food', phonetic: 'Khaana' },
            { id: 5, word: 'घर', hint: 'Home/House', phonetic: 'Ghar' },
            { id: 6, word: 'माँ', hint: 'Mother', phonetic: 'Maa' },
            { id: 7, word: 'पिता', hint: 'Father', phonetic: 'Pita' },
            { id: 8, word: 'भाई', hint: 'Brother', phonetic: 'Bhai' },
            { id: 9, word: 'बहन', hint: 'Sister', phonetic: 'Behen' },
            { id: 10, word: 'दोस्त', hint: 'Friend', phonetic: 'Dost' },
            { id: 11, word: 'अच्छा', hint: 'Good', phonetic: 'Accha' },
            { id: 12, word: 'प्यार', hint: 'Love', phonetic: 'Pyaar' },
        ],
        intermediate: [
            { id: 1, word: 'आप कैसे हैं', hint: 'How are you?', phonetic: 'Aap kaise hain' },
            { id: 2, word: 'मेरा नाम', hint: 'My name', phonetic: 'Mera naam' },
            { id: 3, word: 'शुभ प्रभात', hint: 'Good morning', phonetic: 'Shubh prabhat' },
            { id: 4, word: 'शुभ रात्रि', hint: 'Good night', phonetic: 'Shubh ratri' },
            { id: 5, word: 'कृपया', hint: 'Please', phonetic: 'Kripaya' },
            { id: 6, word: 'माफ कीजिए', hint: 'Excuse me/Sorry', phonetic: 'Maaf kijiye' },
            { id: 7, word: 'क्या हाल है', hint: 'How are things', phonetic: 'Kya haal hai' },
            { id: 8, word: 'बहुत अच्छा', hint: 'Very good', phonetic: 'Bahut accha' },
            { id: 9, word: 'मुझे समझ नहीं आया', hint: 'I did not understand', phonetic: 'Mujhe samajh nahi aaya' },
            { id: 10, word: 'फिर मिलेंगे', hint: 'See you again', phonetic: 'Phir milenge' },
            { id: 11, word: 'आपका स्वागत है', hint: 'You are welcome', phonetic: 'Aapka swagat hai' },
            { id: 12, word: 'कितना पैसा', hint: 'How much money', phonetic: 'Kitna paisa' },
            { id: 13, word: 'मुझे चाहिए', hint: 'I need/want', phonetic: 'Mujhe chahiye' },
            { id: 14, word: 'क्या आप मदद कर सकते हैं', hint: 'Can you help?', phonetic: 'Kya aap madad kar sakte hain' },
        ],
        advanced: [
            { id: 1, word: 'मुझे आपसे मिलकर खुशी हुई', hint: 'Nice to meet you', phonetic: 'Mujhe aapse milkar khushi hui' },
            { id: 2, word: 'आज का मौसम बहुत अच्छा है', hint: 'Today\'s weather is very nice', phonetic: 'Aaj ka mausam bahut accha hai' },
            { id: 3, word: 'मैं हिंदी सीख रहा हूं', hint: 'I am learning Hindi', phonetic: 'Main Hindi seekh raha hoon' },
            { id: 4, word: 'कृपया धीरे बोलिए', hint: 'Please speak slowly', phonetic: 'Kripaya dheere boliye' },
            { id: 5, word: 'यह कितने का है', hint: 'How much does this cost?', phonetic: 'Yah kitne ka hai' },
            { id: 6, word: 'मुझे खाना बहुत पसंद आया', hint: 'I really liked the food', phonetic: 'Mujhe khaana bahut pasand aaya' },
            { id: 7, word: 'आपका दिन शुभ हो', hint: 'Have a nice day', phonetic: 'Aapka din shubh ho' },
            { id: 8, word: 'मैं भारत से हूं', hint: 'I am from India', phonetic: 'Main Bharat se hoon' },
            { id: 9, word: 'क्या आप अंग्रेजी बोलते हैं', hint: 'Do you speak English?', phonetic: 'Kya aap angrezi bolte hain' },
            { id: 10, word: 'मुझे माफ करें मुझे देर हो गई', hint: 'Sorry I am late', phonetic: 'Mujhe maaf karen mujhe der ho gayi' },
            { id: 11, word: 'यह जगह बहुत सुंदर है', hint: 'This place is very beautiful', phonetic: 'Yah jagah bahut sundar hai' },
            { id: 12, word: 'आपसे बात करके अच्छा लगा', hint: 'Nice talking to you', phonetic: 'Aapse baat karke accha laga' },
            { id: 13, word: 'मेरी हिंदी अच्छी नहीं है', hint: 'My Hindi is not good', phonetic: 'Meri Hindi acchi nahi hai' },
            { id: 14, word: 'क्या आप मुझे रास्ता बता सकते हैं', hint: 'Can you show me the way?', phonetic: 'Kya aap mujhe rasta bata sakte hain' },
            { id: 15, word: 'धन्यवाद आपकी मदद के लिए', hint: 'Thank you for your help', phonetic: 'Dhanyavaad aapki madad ke liye' },
            { id: 16, word: 'मैं बहुत खुश हूं', hint: 'I am very happy', phonetic: 'Main bahut khush hoon' },
        ]
    }
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Generate pronunciation test words
export function generatePronunciationWords(testId) {
    const test = pronunciationTests[testId]
    if (!test) return []

    const levelMap = {
        'beginner': 'beginner',
        'intermediate': 'intermediate',
        'advanced': 'advanced'
    }

    const level = levelMap[test.level]
    const words = pronunciationWords[test.language]?.[level] || []

    // Shuffle and select required count
    return shuffleArray(words).slice(0, test.wordsCount)
}

// Get test by ID
export function getPronunciationTestById(testId) {
    return pronunciationTests[testId] || null
}

// Get all pronunciation tests
export function getAllPronunciationTests() {
    return Object.values(pronunciationTests)
}

// Check if test is unlocked
export function isPronunciationTestUnlocked(testId, completedTestIds) {
    const test = pronunciationTests[testId]
    if (!test) return false
    if (!test.prerequisite) return true
    return completedTestIds.includes(test.prerequisite)
}

// Simple string similarity comparison (Levenshtein-based percentage)
export function calculatePronunciationScore(spoken, expected) {
    const spokenLower = spoken.toLowerCase().trim()
    const expectedLower = expected.toLowerCase().trim()

    // Exact match
    if (spokenLower === expectedLower) return 100

    // Check if spoken contains the expected word(s)
    if (spokenLower.includes(expectedLower) || expectedLower.includes(spokenLower)) {
        return 85
    }

    // Calculate Levenshtein distance for partial matches
    const distance = levenshteinDistance(spokenLower, expectedLower)
    const maxLen = Math.max(spokenLower.length, expectedLower.length)
    const similarity = ((maxLen - distance) / maxLen) * 100

    return Math.round(similarity)
}

// Levenshtein distance algorithm
function levenshteinDistance(str1, str2) {
    const m = str1.length
    const n = str2.length
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
            }
        }
    }

    return dp[m][n]
}
