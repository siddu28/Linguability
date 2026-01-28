// Word data for each language and lesson
// Each word has: word (in target language), phonetic, english translation

export const wordsData = {
    english: {
        greetings: [
            { id: 1, word: 'Hello', phonetic: '/həˈloʊ/', translation: 'A common greeting' },
            { id: 2, word: 'Good Morning', phonetic: '/ɡʊd ˈmɔːrnɪŋ/', translation: 'Morning greeting' },
            { id: 3, word: 'Good Night', phonetic: '/ɡʊd naɪt/', translation: 'Night farewell' },
            { id: 4, word: 'Thank You', phonetic: '/θæŋk juː/', translation: 'Expression of gratitude' },
            { id: 5, word: 'Welcome', phonetic: '/ˈwelkəm/', translation: 'Greeting or response to thanks' },
        ],
        objects: [
            { id: 1, word: 'Book', phonetic: '/bʊk/', translation: 'A written work' },
            { id: 2, word: 'Table', phonetic: '/ˈteɪbəl/', translation: 'Furniture for eating/working' },
            { id: 3, word: 'Chair', phonetic: '/tʃer/', translation: 'Seat for one person' },
            { id: 4, word: 'Phone', phonetic: '/foʊn/', translation: 'Communication device' },
            { id: 5, word: 'Water', phonetic: '/ˈwɔːtər/', translation: 'Liquid for drinking' },
        ],
        colors: [
            { id: 1, word: 'Red', phonetic: '/red/', translation: 'Color of blood' },
            { id: 2, word: 'Blue', phonetic: '/bluː/', translation: 'Color of the sky' },
            { id: 3, word: 'Green', phonetic: '/ɡriːn/', translation: 'Color of grass' },
            { id: 4, word: 'Yellow', phonetic: '/ˈjeloʊ/', translation: 'Color of the sun' },
            { id: 5, word: 'Circle', phonetic: '/ˈsɜːrkəl/', translation: 'Round shape' },
        ],
        family: [
            { id: 1, word: 'Mother', phonetic: '/ˈmʌðər/', translation: 'Female parent' },
            { id: 2, word: 'Father', phonetic: '/ˈfɑːðər/', translation: 'Male parent' },
            { id: 3, word: 'Sister', phonetic: '/ˈsɪstər/', translation: 'Female sibling' },
            { id: 4, word: 'Brother', phonetic: '/ˈbrʌðər/', translation: 'Male sibling' },
            { id: 5, word: 'Family', phonetic: '/ˈfæməli/', translation: 'Group of related people' },
        ],
        food: [
            { id: 1, word: 'Rice', phonetic: '/raɪs/', translation: 'Grain food' },
            { id: 2, word: 'Bread', phonetic: '/bred/', translation: 'Baked food' },
            { id: 3, word: 'Milk', phonetic: '/mɪlk/', translation: 'White drink from cows' },
            { id: 4, word: 'Apple', phonetic: '/ˈæpəl/', translation: 'Red/green fruit' },
            { id: 5, word: 'Tea', phonetic: '/tiː/', translation: 'Hot beverage' },
        ],
    },
    hindi: {
        greetings: [
            { id: 1, word: 'नमस्ते', phonetic: '/namasté/', translation: 'Hello / Greetings' },
            { id: 2, word: 'सुप्रभात', phonetic: '/suprabhāt/', translation: 'Good Morning' },
            { id: 3, word: 'शुभ रात्रि', phonetic: '/śubh rātri/', translation: 'Good Night' },
            { id: 4, word: 'धन्यवाद', phonetic: '/dhanyavād/', translation: 'Thank You' },
            { id: 5, word: 'स्वागत है', phonetic: '/svāgat hai/', translation: 'Welcome' },
        ],
        objects: [
            { id: 1, word: 'किताब', phonetic: '/kitāb/', translation: 'Book' },
            { id: 2, word: 'मेज़', phonetic: '/mez/', translation: 'Table' },
            { id: 3, word: 'कुर्सी', phonetic: '/kursī/', translation: 'Chair' },
            { id: 4, word: 'फ़ोन', phonetic: '/fon/', translation: 'Phone' },
            { id: 5, word: 'पानी', phonetic: '/pānī/', translation: 'Water' },
        ],
        colors: [
            { id: 1, word: 'लाल', phonetic: '/lāl/', translation: 'Red' },
            { id: 2, word: 'नीला', phonetic: '/nīlā/', translation: 'Blue' },
            { id: 3, word: 'हरा', phonetic: '/harā/', translation: 'Green' },
            { id: 4, word: 'पीला', phonetic: '/pīlā/', translation: 'Yellow' },
            { id: 5, word: 'गोल', phonetic: '/gol/', translation: 'Circle' },
        ],
        family: [
            { id: 1, word: 'माँ', phonetic: '/māṁ/', translation: 'Mother' },
            { id: 2, word: 'पिता', phonetic: '/pitā/', translation: 'Father' },
            { id: 3, word: 'बहन', phonetic: '/bahan/', translation: 'Sister' },
            { id: 4, word: 'भाई', phonetic: '/bhāī/', translation: 'Brother' },
            { id: 5, word: 'परिवार', phonetic: '/parivār/', translation: 'Family' },
        ],
        food: [
            { id: 1, word: 'चावल', phonetic: '/chāval/', translation: 'Rice' },
            { id: 2, word: 'रोटी', phonetic: '/roṭī/', translation: 'Bread' },
            { id: 3, word: 'दूध', phonetic: '/dūdh/', translation: 'Milk' },
            { id: 4, word: 'सेब', phonetic: '/seb/', translation: 'Apple' },
            { id: 5, word: 'चाय', phonetic: '/chāy/', translation: 'Tea' },
        ],
    },
    tamil: {
        greetings: [
            { id: 1, word: 'வணக்கம்', phonetic: '/vaṇakkam/', translation: 'Hello / Greetings' },
            { id: 2, word: 'காலை வணக்கம்', phonetic: '/kālai vaṇakkam/', translation: 'Good Morning' },
            { id: 3, word: 'இரவு வணக்கம்', phonetic: '/iravu vaṇakkam/', translation: 'Good Night' },
            { id: 4, word: 'நன்றி', phonetic: '/naṉṟi/', translation: 'Thank You' },
            { id: 5, word: 'வரவேற்கிறேன்', phonetic: '/varavēṟkiṟēṉ/', translation: 'Welcome' },
        ],
        objects: [
            { id: 1, word: 'புத்தகம்', phonetic: '/puttakam/', translation: 'Book' },
            { id: 2, word: 'மேசை', phonetic: '/mēcai/', translation: 'Table' },
            { id: 3, word: 'நாற்காலி', phonetic: '/nāṟkāli/', translation: 'Chair' },
            { id: 4, word: 'தொலைபேசி', phonetic: '/tolaipēci/', translation: 'Phone' },
            { id: 5, word: 'தண்ணீர்', phonetic: '/taṇṇīr/', translation: 'Water' },
        ],
        colors: [
            { id: 1, word: 'சிவப்பு', phonetic: '/civappu/', translation: 'Red' },
            { id: 2, word: 'நீலம்', phonetic: '/nīlam/', translation: 'Blue' },
            { id: 3, word: 'பச்சை', phonetic: '/paccai/', translation: 'Green' },
            { id: 4, word: 'மஞ்சள்', phonetic: '/mañcaḷ/', translation: 'Yellow' },
            { id: 5, word: 'வட்டம்', phonetic: '/vaṭṭam/', translation: 'Circle' },
        ],
        family: [
            { id: 1, word: 'அம்மா', phonetic: '/ammā/', translation: 'Mother' },
            { id: 2, word: 'அப்பா', phonetic: '/appā/', translation: 'Father' },
            { id: 3, word: 'அக்கா', phonetic: '/akkā/', translation: 'Sister' },
            { id: 4, word: 'அண்ணன்', phonetic: '/aṇṇaṉ/', translation: 'Brother' },
            { id: 5, word: 'குடும்பம்', phonetic: '/kuṭumpam/', translation: 'Family' },
        ],
        food: [
            { id: 1, word: 'அரிசி', phonetic: '/arici/', translation: 'Rice' },
            { id: 2, word: 'ரொட்டி', phonetic: '/roṭṭi/', translation: 'Bread' },
            { id: 3, word: 'பால்', phonetic: '/pāl/', translation: 'Milk' },
            { id: 4, word: 'ஆப்பிள்', phonetic: '/āppiḷ/', translation: 'Apple' },
            { id: 5, word: 'தேநீர்', phonetic: '/tēnīr/', translation: 'Tea' },
        ],
    },
    telugu: {
        greetings: [
            { id: 1, word: 'నమస్కారం', phonetic: '/namaskāraṁ/', translation: 'Hello / Greetings' },
            { id: 2, word: 'శుభోదయం', phonetic: '/śubhōdayaṁ/', translation: 'Good Morning' },
            { id: 3, word: 'శుభ రాత్రి', phonetic: '/śubha rātri/', translation: 'Good Night' },
            { id: 4, word: 'ధన్యవాదాలు', phonetic: '/dhanyavādālu/', translation: 'Thank You' },
            { id: 5, word: 'స్వాగతం', phonetic: '/svāgataṁ/', translation: 'Welcome' },
        ],
        objects: [
            { id: 1, word: 'పుస్తకం', phonetic: '/pustakaṁ/', translation: 'Book' },
            { id: 2, word: 'బల్ల', phonetic: '/balla/', translation: 'Table' },
            { id: 3, word: 'కుర్చీ', phonetic: '/kurcī/', translation: 'Chair' },
            { id: 4, word: 'ఫోన్', phonetic: '/fōn/', translation: 'Phone' },
            { id: 5, word: 'నీళ్ళు', phonetic: '/nīḷḷu/', translation: 'Water' },
        ],
        colors: [
            { id: 1, word: 'ఎరుపు', phonetic: '/erupu/', translation: 'Red' },
            { id: 2, word: 'నీలం', phonetic: '/nīlaṁ/', translation: 'Blue' },
            { id: 3, word: 'ఆకుపచ్చ', phonetic: '/ākupacca/', translation: 'Green' },
            { id: 4, word: 'పసుపు', phonetic: '/pasupu/', translation: 'Yellow' },
            { id: 5, word: 'వృత్తం', phonetic: '/vr̥ttaṁ/', translation: 'Circle' },
        ],
        family: [
            { id: 1, word: 'అమ్మ', phonetic: '/amma/', translation: 'Mother' },
            { id: 2, word: 'నాన్న', phonetic: '/nānna/', translation: 'Father' },
            { id: 3, word: 'అక్క', phonetic: '/akka/', translation: 'Sister' },
            { id: 4, word: 'అన్న', phonetic: '/anna/', translation: 'Brother' },
            { id: 5, word: 'కుటుంబం', phonetic: '/kuṭumbaṁ/', translation: 'Family' },
        ],
        food: [
            { id: 1, word: 'బియ్యం', phonetic: '/biyyaṁ/', translation: 'Rice' },
            { id: 2, word: 'రొట్టె', phonetic: '/roṭṭe/', translation: 'Bread' },
            { id: 3, word: 'పాలు', phonetic: '/pālu/', translation: 'Milk' },
            { id: 4, word: 'ఆపిల్', phonetic: '/āpil/', translation: 'Apple' },
            { id: 5, word: 'టీ', phonetic: '/ṭī/', translation: 'Tea' },
        ],
    },
}

// Map lesson titles to data keys
export const lessonKeyMap = {
    'Basic Greetings': 'greetings',
    'Common Objects': 'objects',
    'Colors & Shapes': 'colors',
    'Family Members': 'family',
    'Food & Drinks': 'food',
}

// Get words for a specific language and lesson
export function getWordsForLesson(languageId, lessonTitle) {
    const lessonKey = lessonKeyMap[lessonTitle]
    if (!lessonKey) return []

    const languageData = wordsData[languageId]
    if (!languageData) return []

    return languageData[lessonKey] || []
}
