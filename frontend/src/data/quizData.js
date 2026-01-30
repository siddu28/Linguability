// Quiz configuration and question generation for vocabulary quizzes
import { wordsData, advancedWordsData, lessonKeyMap } from './wordsData'

// Available quizzes configuration
// Each quiz can have a 'prerequisite' field pointing to the quiz ID that must be completed first
export const quizzes = {
    // =============== BEGINNER (BASICS) ===============
    'hindi-basics': {
        id: 'hindi-basics',
        title: 'Hindi Basics Quiz',
        description: 'Test your knowledge of basic Hindi vocabulary and phrases',
        language: 'hindi',
        level: 'beginner',
        categories: ['greetings', 'objects', 'colors', 'family', 'food'],
        questionsCount: 10,
        duration: 600, // 10 minutes in seconds
        type: 'quiz',
        prerequisite: null, // No prerequisite, always available
        useAdvanced: false
    },
    'tamil-basics': {
        id: 'tamil-basics',
        title: 'Tamil Basics Quiz',
        description: 'Test your knowledge of basic Tamil vocabulary and phrases',
        language: 'tamil',
        level: 'beginner',
        categories: ['greetings', 'objects', 'colors', 'family', 'food'],
        questionsCount: 10,
        duration: 600,
        type: 'quiz',
        prerequisite: null,
        useAdvanced: false
    },
    'telugu-basics': {
        id: 'telugu-basics',
        title: 'Telugu Basics Quiz',
        description: 'Test your knowledge of basic Telugu vocabulary and phrases',
        language: 'telugu',
        level: 'beginner',
        categories: ['greetings', 'objects', 'colors', 'family', 'food'],
        questionsCount: 10,
        duration: 600,
        type: 'quiz',
        prerequisite: null,
        useAdvanced: false
    },

    // =============== INTERMEDIATE (MEDIUM) ===============
    'hindi-intermediate': {
        id: 'hindi-intermediate',
        title: 'Hindi Intermediate Quiz',
        description: 'Challenge yourself with intermediate Hindi vocabulary',
        language: 'hindi',
        level: 'intermediate',
        categories: ['greetings', 'objects', 'colors', 'family', 'food'],
        questionsCount: 15,
        duration: 900, // 15 minutes
        type: 'quiz',
        prerequisite: 'hindi-basics', // Must complete basics first
        useAdvanced: false
    },
    'tamil-intermediate': {
        id: 'tamil-intermediate',
        title: 'Tamil Intermediate Quiz',
        description: 'Challenge yourself with intermediate Tamil vocabulary',
        language: 'tamil',
        level: 'intermediate',
        categories: ['greetings', 'objects', 'colors', 'family', 'food'],
        questionsCount: 15,
        duration: 900,
        type: 'quiz',
        prerequisite: 'tamil-basics',
        useAdvanced: false
    },
    'telugu-intermediate': {
        id: 'telugu-intermediate',
        title: 'Telugu Intermediate Quiz',
        description: 'Challenge yourself with intermediate Telugu vocabulary',
        language: 'telugu',
        level: 'intermediate',
        categories: ['greetings', 'objects', 'colors', 'family', 'food'],
        questionsCount: 15,
        duration: 900,
        type: 'quiz',
        prerequisite: 'telugu-basics',
        useAdvanced: false
    },

    // =============== ADVANCED (HARD) ===============
    'hindi-advanced': {
        id: 'hindi-advanced',
        title: 'Hindi Advanced Quiz',
        description: 'Master difficult Hindi vocabulary: emotions, nature, actions & more',
        language: 'hindi',
        level: 'advanced',
        categories: ['emotions', 'nature', 'actions', 'body', 'time'],
        questionsCount: 20,
        duration: 1200, // 20 minutes
        type: 'quiz',
        prerequisite: 'hindi-intermediate', // Must complete intermediate first
        useAdvanced: true // Uses advanced vocabulary
    },
    'tamil-advanced': {
        id: 'tamil-advanced',
        title: 'Tamil Advanced Quiz',
        description: 'Master difficult Tamil vocabulary: emotions, nature, actions & more',
        language: 'tamil',
        level: 'advanced',
        categories: ['emotions', 'nature', 'actions', 'body', 'time'],
        questionsCount: 20,
        duration: 1200,
        type: 'quiz',
        prerequisite: 'tamil-intermediate',
        useAdvanced: true
    },
    'telugu-advanced': {
        id: 'telugu-advanced',
        title: 'Telugu Advanced Quiz',
        description: 'Master difficult Telugu vocabulary: emotions, nature, actions & more',
        language: 'telugu',
        level: 'advanced',
        categories: ['emotions', 'nature', 'actions', 'body', 'time'],
        questionsCount: 20,
        duration: 1200,
        type: 'quiz',
        prerequisite: 'telugu-intermediate',
        useAdvanced: true
    },

    // =============== ENGLISH QUIZZES ===============
    'english-basics': {
        id: 'english-basics',
        title: 'English Basics Quiz',
        description: 'Test your knowledge of basic English vocabulary and phrases',
        language: 'english',
        level: 'beginner',
        categories: ['greetings', 'objects', 'colors', 'family', 'food'],
        questionsCount: 10,
        duration: 600,
        type: 'quiz',
        prerequisite: null,
        useAdvanced: false
    },
    'english-intermediate': {
        id: 'english-intermediate',
        title: 'English Intermediate Quiz',
        description: 'Challenge yourself with intermediate English vocabulary',
        language: 'english',
        level: 'intermediate',
        categories: ['greetings', 'objects', 'colors', 'family', 'food'],
        questionsCount: 15,
        duration: 900,
        type: 'quiz',
        prerequisite: 'english-basics',
        useAdvanced: false
    },
    'english-advanced': {
        id: 'english-advanced',
        title: 'English Advanced Quiz',
        description: 'Master advanced English vocabulary: emotions, nature, actions & more',
        language: 'english',
        level: 'advanced',
        categories: ['emotions', 'nature', 'actions', 'body', 'time'],
        questionsCount: 20,
        duration: 1200,
        type: 'quiz',
        prerequisite: 'english-intermediate',
        useAdvanced: true
    }
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Get all words for a language from specified categories (basic/intermediate)
function getWordsForLanguage(languageId, categories) {
    const languageData = wordsData[languageId]
    if (!languageData) return []

    const allWords = []
    categories.forEach(category => {
        const categoryWords = languageData[category]
        if (categoryWords) {
            categoryWords.forEach(word => {
                allWords.push({
                    ...word,
                    category
                })
            })
        }
    })
    return allWords
}

// Get advanced words for a language (for hard quizzes)
function getAdvancedWordsForLanguage(languageId, categories) {
    const languageData = advancedWordsData[languageId]
    if (!languageData) return []

    const allWords = []
    categories.forEach(category => {
        const categoryWords = languageData[category]
        if (categoryWords) {
            categoryWords.forEach(word => {
                allWords.push({
                    ...word,
                    category
                })
            })
        }
    })
    return allWords
}

// Generate wrong options from other words
function generateWrongOptions(correctWord, allWords, count = 3) {
    // Filter out the correct answer and get words with different translations
    const otherWords = allWords.filter(w =>
        w.translation !== correctWord.translation &&
        w.word !== correctWord.word
    )

    // Shuffle and take required count
    const shuffled = shuffleArray(otherWords)
    return shuffled.slice(0, count).map(w => w.word)
}

// Generate quiz questions for a specific quiz
export function generateQuizQuestions(quizId) {
    const quiz = quizzes[quizId]
    if (!quiz) return []

    // Use advanced or basic vocabulary based on quiz configuration
    const allWords = quiz.useAdvanced
        ? getAdvancedWordsForLanguage(quiz.language, quiz.categories)
        : getWordsForLanguage(quiz.language, quiz.categories)

    if (allWords.length < quiz.questionsCount) {
        console.warn(`Not enough words for quiz: ${quizId}`)
    }

    // Shuffle and select questions
    const selectedWords = shuffleArray(allWords).slice(0, quiz.questionsCount)

    // Generate questions
    const questions = selectedWords.map((word, index) => {
        const wrongOptions = generateWrongOptions(word, allWords, 3)
        const allOptions = shuffleArray([word.word, ...wrongOptions])

        return {
            id: index + 1,
            question: `What is the ${quiz.language.charAt(0).toUpperCase() + quiz.language.slice(1)} word for "${word.translation}"?`,
            questionAudio: `What is the ${quiz.language} word for ${word.translation}?`,
            options: allOptions,
            correctAnswer: word.word,
            correctIndex: allOptions.indexOf(word.word),
            category: word.category,
            phonetic: word.phonetic,
            speakable: word.speakable,
            translation: word.translation
        }
    })

    return questions
}

// Get quiz by ID
export function getQuizById(quizId) {
    return quizzes[quizId] || null
}

// Get all available quizzes as array
export function getAllQuizzes() {
    return Object.values(quizzes)
}

// Check if a quiz is unlocked based on completed quizzes
export function isQuizUnlocked(quizId, completedQuizIds) {
    const quiz = quizzes[quizId]
    if (!quiz) return false

    // If no prerequisite, quiz is always unlocked
    if (!quiz.prerequisite) return true

    // Check if prerequisite is completed
    return completedQuizIds.includes(quiz.prerequisite)
}

// Get quizzes that are unlocked for a user
export function getUnlockedQuizzes(completedQuizIds) {
    return Object.values(quizzes).filter(quiz =>
        isQuizUnlocked(quiz.id, completedQuizIds)
    )
}

// Get quizzes that are locked (prerequisite not met)
export function getLockedQuizzes(completedQuizIds) {
    return Object.values(quizzes).filter(quiz =>
        !isQuizUnlocked(quiz.id, completedQuizIds) && quiz.prerequisite
    )
}

// Map lesson titles to quiz IDs (for future use)
export const lessonToQuizMap = {
    'Hindi Basics Quiz': 'hindi-basics',
    'Tamil Basics Quiz': 'tamil-basics',
    'Telugu Basics Quiz': 'telugu-basics',
    'English Basics Quiz': 'english-basics',
    'Hindi Intermediate Quiz': 'hindi-intermediate',
    'Tamil Intermediate Quiz': 'tamil-intermediate',
    'Telugu Intermediate Quiz': 'telugu-intermediate',
    'English Intermediate Quiz': 'english-intermediate',
    'Hindi Advanced Quiz': 'hindi-advanced',
    'Tamil Advanced Quiz': 'tamil-advanced',
    'Telugu Advanced Quiz': 'telugu-advanced',
    'English Advanced Quiz': 'english-advanced'
}
