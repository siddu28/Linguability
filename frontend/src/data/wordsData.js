// Word data for each language and lesson
// Each word has: word (in target language), phonetic (IPA), speakable (TTS-friendly), english translation

export const wordsData = {
    english: {
        greetings: [
            { id: 1, word: 'Hello', phonetic: '/həˈloʊ/', speakable: 'Hello', translation: 'A common greeting' },
            { id: 2, word: 'Good Morning', phonetic: '/ɡʊd ˈmɔːrnɪŋ/', speakable: 'Good Morning', translation: 'Morning greeting' },
            { id: 3, word: 'Good Night', phonetic: '/ɡʊd naɪt/', speakable: 'Good Night', translation: 'Night farewell' },
            { id: 4, word: 'Thank You', phonetic: '/θæŋk juː/', speakable: 'Thank You', translation: 'Expression of gratitude' },
            { id: 5, word: 'Welcome', phonetic: '/ˈwelkəm/', speakable: 'Welcome', translation: 'Greeting or response to thanks' },
            { id: 6, word: 'Hi', phonetic: '/haɪ/', speakable: 'Hi', translation: 'Informal greeting' },
            { id: 7, word: 'Good Afternoon', phonetic: '/ɡʊd ˌæftərˈnuːn/', speakable: 'Good Afternoon', translation: 'Afternoon greeting' },
            { id: 8, word: 'Good Evening', phonetic: '/ɡʊd ˈiːvnɪŋ/', speakable: 'Good Evening', translation: 'Evening greeting' },
            { id: 9, word: 'How do you do', phonetic: '/haʊ duː juː duː/', speakable: 'How do you do', translation: 'Formal greeting' },
            { id: 10, word: 'Goodbye', phonetic: '/ɡʊdˈbaɪ/', speakable: 'Goodbye', translation: 'Farewell greeting' },
        ],
        objects: [
            { id: 1, word: 'Book', phonetic: '/bʊk/', speakable: 'Book', translation: 'A written work' },
            { id: 2, word: 'Table', phonetic: '/ˈteɪbəl/', speakable: 'Table', translation: 'Furniture for eating/working' },
            { id: 3, word: 'Chair', phonetic: '/tʃer/', speakable: 'Chair', translation: 'Seat for one person' },
            { id: 4, word: 'Phone', phonetic: '/foʊn/', speakable: 'Phone', translation: 'Communication device' },
            { id: 5, word: 'Water', phonetic: '/ˈwɔːtər/', speakable: 'Water', translation: 'Liquid for drinking' },
            { id: 6, word: 'Door', phonetic: '/dɔːr/', speakable: 'Door', translation: 'Entrance to a room' },
            { id: 7, word: 'Window', phonetic: '/ˈwɪndoʊ/', speakable: 'Window', translation: 'Opening for light and air' },
            { id: 8, word: 'Pencil', phonetic: '/ˈpensəl/', speakable: 'Pencil', translation: 'Writing instrument' },
            { id: 9, word: 'Paper', phonetic: '/ˈpeɪpər/', speakable: 'Paper', translation: 'Material for writing' },
            { id: 10, word: 'Pen', phonetic: '/pen/', speakable: 'Pen', translation: 'Writing tool with ink' },
        ],
        colors: [
            { id: 1, word: 'Red', phonetic: '/red/', speakable: 'Red', translation: 'Color of blood' },
            { id: 2, word: 'Blue', phonetic: '/bluː/', speakable: 'Blue', translation: 'Color of the sky' },
            { id: 3, word: 'Green', phonetic: '/ɡriːn/', speakable: 'Green', translation: 'Color of grass' },
            { id: 4, word: 'Yellow', phonetic: '/ˈjeloʊ/', speakable: 'Yellow', translation: 'Color of the sun' },
            { id: 5, word: 'Circle', phonetic: '/ˈsɜːrkəl/', speakable: 'Circle', translation: 'Round shape' },
            { id: 6, word: 'Black', phonetic: '/blæk/', speakable: 'Black', translation: 'Darkest color' },
            { id: 7, word: 'White', phonetic: '/waɪt/', speakable: 'White', translation: 'Lightest color' },
            { id: 8, word: 'Orange', phonetic: '/ˈɔːrɪndʒ/', speakable: 'Orange', translation: 'Color between red and yellow' },
            { id: 9, word: 'Purple', phonetic: '/ˈpɜːrpəl/', speakable: 'Purple', translation: 'Color between red and blue' },
            { id: 10, word: 'Square', phonetic: '/skwer/', speakable: 'Square', translation: 'Shape with four equal sides' },
        ],
        family: [
            { id: 1, word: 'Mother', phonetic: '/ˈmʌðər/', speakable: 'Mother', translation: 'Female parent' },
            { id: 2, word: 'Father', phonetic: '/ˈfɑːðər/', speakable: 'Father', translation: 'Male parent' },
            { id: 3, word: 'Sister', phonetic: '/ˈsɪstər/', speakable: 'Sister', translation: 'Female sibling' },
            { id: 4, word: 'Brother', phonetic: '/ˈbrʌðər/', speakable: 'Brother', translation: 'Male sibling' },
            { id: 5, word: 'Family', phonetic: '/ˈfæməli/', speakable: 'Family', translation: 'Group of related people' },
            { id: 6, word: 'Grandmother', phonetic: '/ˈɡrænmʌðər/', speakable: 'Grandmother', translation: 'Mothers mother' },
            { id: 7, word: 'Grandfather', phonetic: '/ˈɡrænfɑːðər/', speakable: 'Grandfather', translation: 'Fathers father' },
            { id: 8, word: 'Aunt', phonetic: '/ænt/', speakable: 'Aunt', translation: 'Mothers sister' },
            { id: 9, word: 'Uncle', phonetic: '/ˈʌŋkəl/', speakable: 'Uncle', translation: 'Fathers brother' },
            { id: 10, word: 'Cousin', phonetic: '/ˈkʌzən/', speakable: 'Cousin', translation: 'Child of aunt or uncle' },
        ],
        food: [
            { id: 1, word: 'Rice', phonetic: '/raɪs/', speakable: 'Rice', translation: 'Grain food' },
            { id: 2, word: 'Bread', phonetic: '/bred/', speakable: 'Bread', translation: 'Baked food' },
            { id: 3, word: 'Milk', phonetic: '/mɪlk/', speakable: 'Milk', translation: 'White drink from cows' },
            { id: 4, word: 'Apple', phonetic: '/ˈæpəl/', speakable: 'Apple', translation: 'Red/green fruit' },
            { id: 5, word: 'Tea', phonetic: '/tiː/', speakable: 'Tea', translation: 'Hot beverage' },
            { id: 6, word: 'Coffee', phonetic: '/ˈkɔːfi/', speakable: 'Coffee', translation: 'Dark hot drink' },
            { id: 7, word: 'Chicken', phonetic: '/ˈtʃɪkən/', speakable: 'Chicken', translation: 'Poultry meat' },
            { id: 8, word: 'Fish', phonetic: '/fɪʃ/', speakable: 'Fish', translation: 'Aquatic food' },
            { id: 9, word: 'Banana', phonetic: '/bəˈnænə/', speakable: 'Banana', translation: 'Yellow fruit' },
            { id: 10, word: 'Cheese', phonetic: '/tʃiːz/', speakable: 'Cheese', translation: 'Dairy product' },
        ],
    },
    hindi: {
        greetings: [
            { id: 1, word: 'नमस्ते', phonetic: '/namasté/', speakable: 'nuh-muh-stay', translation: 'Hello / Greetings' },
            { id: 2, word: 'सुप्रभात', phonetic: '/suprabhāt/', speakable: 'soo-pruh-bhaat', translation: 'Good Morning' },
            { id: 3, word: 'शुभ रात्रि', phonetic: '/śubh rātri/', speakable: 'shubh raa-tree', translation: 'Good Night' },
            { id: 4, word: 'धन्यवाद', phonetic: '/dhanyavād/', speakable: 'dhun-yuh-vaad', translation: 'Thank You' },
            { id: 5, word: 'स्वागत है', phonetic: '/svāgat hai/', speakable: 'svaa-gut hai', translation: 'Welcome' },
        ],
        objects: [
            { id: 1, word: 'किताब', phonetic: '/kitāb/', speakable: 'ki-taab', translation: 'Book' },
            { id: 2, word: 'मेज़', phonetic: '/mez/', speakable: 'mez', translation: 'Table' },
            { id: 3, word: 'कुर्सी', phonetic: '/kursī/', speakable: 'kur-see', translation: 'Chair' },
            { id: 4, word: 'फ़ोन', phonetic: '/fon/', speakable: 'phone', translation: 'Phone' },
            { id: 5, word: 'पानी', phonetic: '/pānī/', speakable: 'paa-nee', translation: 'Water' },
            { id: 6, word: 'दरवाज़ा', phonetic: '/darvāzā/', speakable: 'dur-vaa-zah', translation: 'Door' },
            { id: 7, word: 'खिड़की', phonetic: '/khiṛkī/', speakable: 'khid-kee', translation: 'Window' },
            { id: 8, word: 'पेंसिल', phonetic: '/pensil/', speakable: 'pen-sil', translation: 'Pencil' },
            { id: 9, word: 'कागज़', phonetic: '/kāgaz/', speakable: 'ka-gaz', translation: 'Paper' },
            { id: 10, word: 'कलम', phonetic: '/kalam/', speakable: 'kuh-lum', translation: 'Pen' },
        ],
        colors: [
            { id: 1, word: 'लाल', phonetic: '/lāl/', speakable: 'laal', translation: 'Red' },
            { id: 2, word: 'नीला', phonetic: '/nīlā/', speakable: 'nee-laa', translation: 'Blue' },
            { id: 3, word: 'हरा', phonetic: '/harā/', speakable: 'huh-raa', translation: 'Green' },
            { id: 4, word: 'पीला', phonetic: '/pīlā/', speakable: 'pee-laa', translation: 'Yellow' },
            { id: 5, word: 'गोल', phonetic: '/gol/', speakable: 'gol', translation: 'Circle' },
            { id: 6, word: 'काला', phonetic: '/kālā/', speakable: 'kaa-laa', translation: 'Black' },
            { id: 7, word: 'सफ़ेद', phonetic: '/safed/', speakable: 'suh-fed', translation: 'White' },
            { id: 8, word: 'नारंगी', phonetic: '/nārangī/', speakable: 'naa-run-gi', translation: 'Orange' },
            { id: 9, word: 'बैंगनी', phonetic: '/baingni/', speakable: 'bain-gni', translation: 'Purple' },
            { id: 10, word: 'चौकोर', phonetic: '/cauk̄or/', speakable: 'chau-kor', translation: 'Square' },
        ],
        family: [
            { id: 1, word: 'माँ', phonetic: '/māṁ/', speakable: 'maa', translation: 'Mother' },
            { id: 2, word: 'पिता', phonetic: '/pitā/', speakable: 'pi-taa', translation: 'Father' },
            { id: 3, word: 'बहन', phonetic: '/bahan/', speakable: 'buh-hun', translation: 'Sister' },
            { id: 4, word: 'भाई', phonetic: '/bhāī/', speakable: 'bhai', translation: 'Brother' },
            { id: 5, word: 'परिवार', phonetic: '/parivār/', speakable: 'puh-ri-vaar', translation: 'Family' },
            { id: 6, word: 'दादी', phonetic: '/dādī/', speakable: 'daa-di', translation: 'Grandmother' },
            { id: 7, word: 'दादा', phonetic: '/dādā/', speakable: 'daa-dah', translation: 'Grandfather' },
            { id: 8, word: 'आंटी', phonetic: '/ānṭī/', speakable: 'aan-tee', translation: 'Aunt' },
            { id: 9, word: 'अंकल', phonetic: '/aṅkal/', speakable: 'un-kul', translation: 'Uncle' },
            { id: 10, word: 'चचेरा भाई', phonetic: '/cachera bhāī/', speakable: 'chuh-chay-ruh bhai', translation: 'Cousin' },
        ],
        food: [
            { id: 1, word: 'चावल', phonetic: '/chāval/', speakable: 'chaa-vul', translation: 'Rice' },
            { id: 2, word: 'रोटी', phonetic: '/roṭī/', speakable: 'ro-tee', translation: 'Bread' },
            { id: 3, word: 'दूध', phonetic: '/dūdh/', speakable: 'doodh', translation: 'Milk' },
            { id: 4, word: 'सेब', phonetic: '/seb/', speakable: 'sayb', translation: 'Apple' },
            { id: 5, word: 'चाय', phonetic: '/chāy/', speakable: 'chai', translation: 'Tea' },
            { id: 6, word: 'कॉफ़ी', phonetic: '/k͜ofī/', speakable: 'ko-fi', translation: 'Coffee' },
            { id: 7, word: 'मुर्गी', phonetic: '/murigī/', speakable: 'mur-gi', translation: 'Chicken' },
            { id: 8, word: 'मछली', phonetic: '/machlī/', speakable: 'muh-chli', translation: 'Fish' },
            { id: 9, word: 'केला', phonetic: '/kelā/', speakable: 'kay-lah', translation: 'Banana' },
            { id: 10, word: 'पनीर', phonetic: '/panīr/', speakable: 'puh-neer', translation: 'Cheese' },
        ],
    },
    tamil: {
        greetings: [
            { id: 1, word: 'வணக்கம்', phonetic: '/vaṇakkam/', speakable: 'vuh-nuh-kum', translation: 'Hello / Greetings' },
            { id: 2, word: 'காலை வணக்கம்', phonetic: '/kālai vaṇakkam/', speakable: 'kaa-lai vuh-nuh-kum', translation: 'Good Morning' },
            { id: 3, word: 'இரவு வணக்கம்', phonetic: '/iravu vaṇakkam/', speakable: 'i-ruh-voo vuh-nuh-kum', translation: 'Good Night' },
            { id: 4, word: 'நன்றி', phonetic: '/naṉṟi/', speakable: 'nun-dree', translation: 'Thank You' },
            { id: 5, word: 'வரவேற்கிறேன்', phonetic: '/varavēṟkiṟēṉ/', speakable: 'vuh-ruh-vay-ki-rayn', translation: 'Welcome' },
        ],
        objects: [
            { id: 1, word: 'புத்தகம்', phonetic: '/puttakam/', speakable: 'puth-thuh-kum', translation: 'Book' },
            { id: 2, word: 'மேசை', phonetic: '/mēcai/', speakable: 'may-sai', translation: 'Table' },
            { id: 3, word: 'நாற்காலி', phonetic: '/nāṟkāli/', speakable: 'naar-kaa-li', translation: 'Chair' },
            { id: 4, word: 'தொலைபேசி', phonetic: '/tolaipēci/', speakable: 'tho-lai-pay-si', translation: 'Phone' },
            { id: 5, word: 'தண்ணீர்', phonetic: '/taṇṇīr/', speakable: 'thun-neer', translation: 'Water' },
        ],
        colors: [
            { id: 1, word: 'சிவப்பு', phonetic: '/civappu/', speakable: 'si-vuh-poo', translation: 'Red' },
            { id: 2, word: 'நீலம்', phonetic: '/nīlam/', speakable: 'nee-lum', translation: 'Blue' },
            { id: 3, word: 'பச்சை', phonetic: '/paccai/', speakable: 'puh-chai', translation: 'Green' },
            { id: 4, word: 'மஞ்சள்', phonetic: '/mañcaḷ/', speakable: 'mun-jul', translation: 'Yellow' },
            { id: 5, word: 'வட்டம்', phonetic: '/vaṭṭam/', speakable: 'vut-tum', translation: 'Circle' },
        ],
        family: [
            { id: 1, word: 'அம்மா', phonetic: '/ammā/', speakable: 'um-maa', translation: 'Mother' },
            { id: 2, word: 'அப்பா', phonetic: '/appā/', speakable: 'up-paa', translation: 'Father' },
            { id: 3, word: 'அக்கா', phonetic: '/akkā/', speakable: 'uk-kaa', translation: 'Sister' },
            { id: 4, word: 'அண்ணன்', phonetic: '/aṇṇaṉ/', speakable: 'un-nun', translation: 'Brother' },
            { id: 5, word: 'குடும்பம்', phonetic: '/kuṭumpam/', speakable: 'ku-dum-bum', translation: 'Family' },
        ],
        food: [
            { id: 1, word: 'அரிசி', phonetic: '/arici/', speakable: 'uh-ri-si', translation: 'Rice' },
            { id: 2, word: 'ரொட்டி', phonetic: '/roṭṭi/', speakable: 'rot-tee', translation: 'Bread' },
            { id: 3, word: 'பால்', phonetic: '/pāl/', speakable: 'paal', translation: 'Milk' },
            { id: 4, word: 'ஆப்பிள்', phonetic: '/āppiḷ/', speakable: 'aap-pul', translation: 'Apple' },
            { id: 5, word: 'தேநீர்', phonetic: '/tēnīr/', speakable: 'thay-neer', translation: 'Tea' },
        ],
    },
    telugu: {
        greetings: [
            { id: 1, word: 'నమస్కారం', phonetic: '/namaskāraṁ/', speakable: 'nuh-muh-skaa-rum', translation: 'Hello / Greetings' },
            { id: 2, word: 'శుభోదయం', phonetic: '/śubhōdayaṁ/', speakable: 'shu-bho-duh-yum', translation: 'Good Morning' },
            { id: 3, word: 'శుభ రాత్రి', phonetic: '/śubha rātri/', speakable: 'shu-bhuh raa-tree', translation: 'Good Night' },
            { id: 4, word: 'ధన్యవాదాలు', phonetic: '/dhanyavādālu/', speakable: 'dhun-yuh-vaa-daa-loo', translation: 'Thank You' },
            { id: 5, word: 'స్వాగతం', phonetic: '/svāgataṁ/', speakable: 'svaa-guh-tum', translation: 'Welcome' },
        ],
        objects: [
            { id: 1, word: 'పుస్తకం', phonetic: '/pustakaṁ/', speakable: 'poos-thuh-kum', translation: 'Book' },
            { id: 2, word: 'బల్ల', phonetic: '/balla/', speakable: 'bul-luh', translation: 'Table' },
            { id: 3, word: 'కుర్చీ', phonetic: '/kurcī/', speakable: 'kur-chee', translation: 'Chair' },
            { id: 4, word: 'ఫోన్', phonetic: '/fōn/', speakable: 'phone', translation: 'Phone' },
            { id: 5, word: 'నీళ్ళు', phonetic: '/nīḷḷu/', speakable: 'neel-loo', translation: 'Water' },
        ],
        colors: [
            { id: 1, word: 'ఎరుపు', phonetic: '/erupu/', speakable: 'eh-roo-poo', translation: 'Red' },
            { id: 2, word: 'నీలం', phonetic: '/nīlaṁ/', speakable: 'nee-lum', translation: 'Blue' },
            { id: 3, word: 'ఆకుపచ్చ', phonetic: '/ākupacca/', speakable: 'aa-koo-puh-chuh', translation: 'Green' },
            { id: 4, word: 'పసుపు', phonetic: '/pasupu/', speakable: 'puh-soo-poo', translation: 'Yellow' },
            { id: 5, word: 'వృత్తం', phonetic: '/vr̥ttaṁ/', speakable: 'vrit-tum', translation: 'Circle' },
        ],
        family: [
            { id: 1, word: 'అమ్మ', phonetic: '/amma/', speakable: 'um-muh', translation: 'Mother' },
            { id: 2, word: 'నాన్న', phonetic: '/nānna/', speakable: 'naan-nuh', translation: 'Father' },
            { id: 3, word: 'అక్క', phonetic: '/akka/', speakable: 'uk-kuh', translation: 'Sister' },
            { id: 4, word: 'అన్న', phonetic: '/anna/', speakable: 'un-nuh', translation: 'Brother' },
            { id: 5, word: 'కుటుంబం', phonetic: '/kuṭumbaṁ/', speakable: 'ku-tum-bum', translation: 'Family' },
        ],
        food: [
            { id: 1, word: 'బియ్యం', phonetic: '/biyyaṁ/', speakable: 'biy-yum', translation: 'Rice' },
            { id: 2, word: 'రొట్టె', phonetic: '/roṭṭe/', speakable: 'rot-tay', translation: 'Bread' },
            { id: 3, word: 'పాలు', phonetic: '/pālu/', speakable: 'paa-loo', translation: 'Milk' },
            { id: 4, word: 'ఆపిల్', phonetic: '/āpil/', speakable: 'aap-il', translation: 'Apple' },
            { id: 5, word: 'టీ', phonetic: '/ṭī/', speakable: 'tee', translation: 'Tea' },
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
