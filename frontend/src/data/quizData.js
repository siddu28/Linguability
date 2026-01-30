// Quiz configuration and question generation for vocabulary quizzes
import { wordsData, lessonKeyMap } from './wordsData'

// Available quizzes configuration
export const quizzes = {
    'hindi-basics': {
        id: 'hindi-basics',
        title: 'Hindi Basics Quiz',
        description: 'Test your knowledge of basic Hindi vocabulary and phrases',
        language: 'hindi',
        level: 'beginner',
        categories: ['greetings', 'objects', 'colors', 'family', 'food'],
        questionsCount: 10,
        duration: 600, // 10 minutes in seconds
        type: 'quiz'
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
        type: 'quiz'
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
        type: 'quiz'
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

// Get all words for a language from specified categories
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

    const allWords = getWordsForLanguage(quiz.language, quiz.categories)
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

// Map lesson titles to quiz IDs (for future use)
export const lessonToQuizMap = {
    'Hindi Basics Quiz': 'hindi-basics',
    'Tamil Basics Quiz': 'tamil-basics',
    'Telugu Basics Quiz': 'telugu-basics'
}
