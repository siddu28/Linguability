// Sentences data for each language and lesson
// Each item has: word (in target language), phonetic (IPA), speakable (TTS-friendly), english translation

export const sentencesData = {
    english: {
        simple_statements: [
            { id: 1, word: 'I am happy', phonetic: '/aɪ æm ˈhæpi/', speakable: 'I am happy', translation: 'Expression of joy' },
            { id: 2, word: 'This is my book', phonetic: '/ðɪs ɪz maɪ bʊk/', speakable: 'This is my book', translation: 'Possession statement' },
            { id: 3, word: 'The weather is nice', phonetic: '/ðə ˈweðər ɪz naɪs/', speakable: 'The weather is nice', translation: 'Weather description' },
            { id: 4, word: 'I like food', phonetic: '/aɪ laɪk fuːd/', speakable: 'I like food', translation: 'Expressing preference' },
            { id: 5, word: 'She is my friend', phonetic: '/ʃiː ɪz maɪ frend/', speakable: 'She is my friend', translation: 'Introducing someone' },
        ],
        asking_questions: [
            { id: 1, word: 'What is your name?', phonetic: '/wɒt ɪz jɔːr neɪm/', speakable: 'What is your name?', translation: 'Asking for name' },
            { id: 2, word: 'How are you?', phonetic: '/haʊ ɑːr juː/', speakable: 'How are you?', translation: 'Asking about wellbeing' },
            { id: 3, word: 'Where is the bathroom?', phonetic: '/weər ɪz ðə ˈbæθruːm/', speakable: 'Where is the bathroom?', translation: 'Asking for location' },
            { id: 4, word: 'How much does this cost?', phonetic: '/haʊ mʌtʃ dʌz ðɪs kɒst/', speakable: 'How much does this cost?', translation: 'Asking price' },
            { id: 5, word: 'What time is it?', phonetic: '/wɒt taɪm ɪz ɪt/', speakable: 'What time is it?', translation: 'Asking time' },
        ],
        daily_conversations: [
            { id: 1, word: 'Nice to meet you', phonetic: '/naɪs tuː miːt juː/', speakable: 'Nice to meet you', translation: 'Greeting new person' },
            { id: 2, word: 'See you later', phonetic: '/siː juː ˈleɪtər/', speakable: 'See you later', translation: 'Farewell phrase' },
            { id: 3, word: 'Have a nice day', phonetic: '/hæv ə naɪs deɪ/', speakable: 'Have a nice day', translation: 'Wishing well' },
            { id: 4, word: 'I am sorry', phonetic: '/aɪ æm ˈsɒri/', speakable: 'I am sorry', translation: 'Apologizing' },
            { id: 5, word: 'Excuse me', phonetic: '/ɪkˈskjuːz miː/', speakable: 'Excuse me', translation: 'Getting attention' },
        ],
        expressing_feelings: [
            { id: 1, word: 'I am tired', phonetic: '/aɪ æm ˈtaɪərd/', speakable: 'I am tired', translation: 'Expressing fatigue' },
            { id: 2, word: 'I am hungry', phonetic: '/aɪ æm ˈhʌŋɡri/', speakable: 'I am hungry', translation: 'Expressing hunger' },
            { id: 3, word: 'I am excited', phonetic: '/aɪ æm ɪkˈsaɪtɪd/', speakable: 'I am excited', translation: 'Expressing enthusiasm' },
            { id: 4, word: 'I am worried', phonetic: '/aɪ æm ˈwʌrid/', speakable: 'I am worried', translation: 'Expressing concern' },
            { id: 5, word: 'I feel good', phonetic: '/aɪ fiːl ɡʊd/', speakable: 'I feel good', translation: 'Expressing wellness' },
        ],
        complex_sentences: [
            { id: 1, word: 'If it rains, I will stay home', phonetic: '/ɪf ɪt reɪnz aɪ wɪl steɪ hoʊm/', speakable: 'If it rains, I will stay home', translation: 'Conditional statement' },
            { id: 2, word: 'Although I am tired, I will help', phonetic: '/ɔːlˈðoʊ aɪ æm taɪərd aɪ wɪl help/', speakable: 'Although I am tired, I will help', translation: 'Concession statement' },
            { id: 3, word: 'I went to the store and bought milk', phonetic: '/aɪ went tuː ðə stɔːr ænd bɔːt mɪlk/', speakable: 'I went to the store and bought milk', translation: 'Compound sentence' },
            { id: 4, word: 'The book that I read was interesting', phonetic: '/ðə bʊk ðæt aɪ red wɒz ˈɪntrəstɪŋ/', speakable: 'The book that I read was interesting', translation: 'Relative clause' },
            { id: 5, word: 'Because I was late, I missed the bus', phonetic: '/bɪˈkʌz aɪ wɒz leɪt aɪ mɪst ðə bʌs/', speakable: 'Because I was late, I missed the bus', translation: 'Cause and effect' },
        ],
    },
    hindi: {
        simple_statements: [
            { id: 1, word: 'मैं खुश हूँ', phonetic: '/maiṁ khuś hūṁ/', speakable: 'main khush hoon', translation: 'I am happy' },
            { id: 2, word: 'यह मेरी किताब है', phonetic: '/yah merī kitāb hai/', speakable: 'yeh meri kitaab hai', translation: 'This is my book' },
            { id: 3, word: 'मौसम अच्छा है', phonetic: '/mausam acchā hai/', speakable: 'mausam ach-chaa hai', translation: 'The weather is nice' },
            { id: 4, word: 'मुझे खाना पसंद है', phonetic: '/mujhe khānā pasand hai/', speakable: 'mujhe khaa-naa pasand hai', translation: 'I like food' },
            { id: 5, word: 'वह मेरी दोस्त है', phonetic: '/vah merī dost hai/', speakable: 'voh meri dost hai', translation: 'She is my friend' },
        ],
        asking_questions: [
            { id: 1, word: 'आपका नाम क्या है?', phonetic: '/āpkā nām kyā hai/', speakable: 'aap-kaa naam kya hai', translation: 'What is your name?' },
            { id: 2, word: 'आप कैसे हैं?', phonetic: '/āp kaise haiṁ/', speakable: 'aap kai-say hain', translation: 'How are you?' },
            { id: 3, word: 'शौचालय कहाँ है?', phonetic: '/śaucālay kahāṁ hai/', speakable: 'shau-chaa-lay kuh-haan hai', translation: 'Where is the bathroom?' },
            { id: 4, word: 'इसका दाम क्या है?', phonetic: '/iskā dām kyā hai/', speakable: 'is-kaa daam kya hai', translation: 'How much does this cost?' },
            { id: 5, word: 'क्या समय हुआ है?', phonetic: '/kyā samay huā hai/', speakable: 'kya suh-muy hua hai', translation: 'What time is it?' },
        ],
        daily_conversations: [
            { id: 1, word: 'आपसे मिलकर खुशी हुई', phonetic: '/āpse milkar khuśī huī/', speakable: 'aap-say mil-kur khushi hui', translation: 'Nice to meet you' },
            { id: 2, word: 'फिर मिलेंगे', phonetic: '/phir mileṁge/', speakable: 'phir mi-len-gay', translation: 'See you later' },
            { id: 3, word: 'आपका दिन शुभ हो', phonetic: '/āpkā din śubh ho/', speakable: 'aap-kaa din shubh ho', translation: 'Have a nice day' },
            { id: 4, word: 'मुझे माफ़ कीजिए', phonetic: '/mujhe māf kījie/', speakable: 'mujhe maaf kee-ji-yay', translation: 'I am sorry' },
            { id: 5, word: 'सुनिए', phonetic: '/sunie/', speakable: 'su-ni-yay', translation: 'Excuse me' },
        ],
        expressing_feelings: [
            { id: 1, word: 'मैं थका हुआ हूँ', phonetic: '/maiṁ thakā huā hūṁ/', speakable: 'main thuh-kaa hua hoon', translation: 'I am tired' },
            { id: 2, word: 'मुझे भूख लगी है', phonetic: '/mujhe bhūkh lagī hai/', speakable: 'mujhe bhookh luh-gi hai', translation: 'I am hungry' },
            { id: 3, word: 'मैं उत्साहित हूँ', phonetic: '/maiṁ utsāhit hūṁ/', speakable: 'main ut-saa-hit hoon', translation: 'I am excited' },
            { id: 4, word: 'मैं चिंतित हूँ', phonetic: '/maiṁ cintit hūṁ/', speakable: 'main chin-tit hoon', translation: 'I am worried' },
            { id: 5, word: 'मैं अच्छा महसूस करता हूँ', phonetic: '/maiṁ acchā mahsūs kartā hūṁ/', speakable: 'main ach-chaa meh-soos kur-taa hoon', translation: 'I feel good' },
        ],
        complex_sentences: [
            { id: 1, word: 'अगर बारिश होगी तो मैं घर रहूँगा', phonetic: '/agar bāriś hogī to maiṁ ghar rahūṁgā/', speakable: 'agar baa-rish ho-gi to main ghar ruh-hoon-gaa', translation: 'If it rains, I will stay home' },
            { id: 2, word: 'हालांकि मैं थका हूँ, मैं मदद करूंगा', phonetic: '/hālāṁki maiṁ thakā hūṁ maiṁ madad karūṁgā/', speakable: 'haa-laan-ki main thuh-kaa hoon main muh-dud kuh-roon-gaa', translation: 'Although I am tired, I will help' },
            { id: 3, word: 'मैं दुकान गया और दूध लाया', phonetic: '/maiṁ dukān gayā aur dūdh lāyā/', speakable: 'main doo-kaan guh-yaa aur doodh laa-yaa', translation: 'I went to the store and bought milk' },
            { id: 4, word: 'जो किताब मैंने पढ़ी वह दिलचस्प थी', phonetic: '/jo kitāb maiṁne paṛhī vah dilcasp thī/', speakable: 'jo ki-taab main-nay puh-ree voh dil-chusp thi', translation: 'The book that I read was interesting' },
            { id: 5, word: 'क्योंकि मुझे देर हो गई, मैं बस छूट गई', phonetic: '/kyoṁki mujhe der ho gaī maiṁ bas chūṭ gaī/', speakable: 'kyon-ki mujhe dayr ho gai main bus chhoot gai', translation: 'Because I was late, I missed the bus' },
        ],
    },
    tamil: {
        simple_statements: [
            { id: 1, word: 'நான் சந்தோஷமாக இருக்கிறேன்', phonetic: '/nāṉ cantōṣamāka irukkiṟēṉ/', speakable: 'naan san-tho-shum-aa-ga i-ruk-ki-rayn', translation: 'I am happy' },
            { id: 2, word: 'இது என் புத்தகம்', phonetic: '/itu eṉ puttakam/', speakable: 'i-dhu en puth-thuh-kum', translation: 'This is my book' },
            { id: 3, word: 'வானிலை நன்றாக உள்ளது', phonetic: '/vāṉilai naṉṟāka uḷḷatu/', speakable: 'vaa-ni-lai nan-draa-ga ul-luh-thu', translation: 'The weather is nice' },
            { id: 4, word: 'எனக்கு உணவு பிடிக்கும்', phonetic: '/eṉakku uṇavu piṭikkum/', speakable: 'eh-nuh-ku u-nuh-vu pi-dik-kum', translation: 'I like food' },
            { id: 5, word: 'அவள் என் தோழி', phonetic: '/avaḷ eṉ tōḻi/', speakable: 'uh-vul en tho-li', translation: 'She is my friend' },
        ],
        asking_questions: [
            { id: 1, word: 'உங்கள் பெயர் என்ன?', phonetic: '/uṅkaḷ peyar eṉṉa/', speakable: 'ung-gul pay-yar en-nuh', translation: 'What is your name?' },
            { id: 2, word: 'நீங்கள் எப்படி இருக்கிறீர்கள்?', phonetic: '/nīṅkaḷ eppaṭi irukkiṟīrkaḷ/', speakable: 'neeng-gul ep-puh-di i-ruk-kee-ree-gul', translation: 'How are you?' },
            { id: 3, word: 'கழிவறை எங்கே?', phonetic: '/kaḻivaṟai eṅkē/', speakable: 'kuh-li-vuh-rai eng-gay', translation: 'Where is the bathroom?' },
            { id: 4, word: 'இதன் விலை என்ன?', phonetic: '/itaṉ vilai eṉṉa/', speakable: 'i-dhun vi-lai en-nuh', translation: 'How much does this cost?' },
            { id: 5, word: 'என்ன நேரம்?', phonetic: '/eṉṉa nēram/', speakable: 'en-nuh nay-rum', translation: 'What time is it?' },
        ],
        daily_conversations: [
            { id: 1, word: 'உங்களை சந்தித்ததில் மகிழ்ச்சி', phonetic: '/uṅkaḷai cantittadil makiḻcci/', speakable: 'ung-guh-lai san-dhith-thuh-dhil muh-gizh-chi', translation: 'Nice to meet you' },
            { id: 2, word: 'பின்னர் சந்திப்போம்', phonetic: '/piṉṉar cantippōm/', speakable: 'pin-nur san-dhip-pohm', translation: 'See you later' },
            { id: 3, word: 'உங்கள் நாள் நலமாக இருக்கட்டும்', phonetic: '/uṅkaḷ nāḷ nalamāka irukkaṭṭum/', speakable: 'ung-gul naal nuh-luh-maa-ga i-ruk-kut-tum', translation: 'Have a nice day' },
            { id: 4, word: 'மன்னிக்கவும்', phonetic: '/maṉṉikkavum/', speakable: 'mun-nik-kuh-vum', translation: 'I am sorry' },
            { id: 5, word: 'தயவுசெய்து', phonetic: '/tayavuceytu/', speakable: 'thuh-yuh-vu-say-dhu', translation: 'Excuse me / Please' },
        ],
        expressing_feelings: [
            { id: 1, word: 'நான் களைப்பாக இருக்கிறேன்', phonetic: '/nāṉ kaḷaippāka irukkiṟēṉ/', speakable: 'naan kuh-lai-paa-ga i-ruk-ki-rayn', translation: 'I am tired' },
            { id: 2, word: 'எனக்கு பசிக்கிறது', phonetic: '/eṉakku pacikkiṟatu/', speakable: 'eh-nuh-ku puh-sik-ki-ruh-dhu', translation: 'I am hungry' },
            { id: 3, word: 'நான் உற்சாகமாக இருக்கிறேன்', phonetic: '/nāṉ uṟcākamāka irukkiṟēṉ/', speakable: 'naan ut-saa-gum-aa-ga i-ruk-ki-rayn', translation: 'I am excited' },
            { id: 4, word: 'நான் கவலைப்படுகிறேன்', phonetic: '/nāṉ kavalaippaṭukiṟēṉ/', speakable: 'naan kuh-vuh-lai-puh-du-gi-rayn', translation: 'I am worried' },
            { id: 5, word: 'எனக்கு நன்றாக இருக்கிறது', phonetic: '/eṉakku naṉṟāka irukkiṟatu/', speakable: 'eh-nuh-ku nan-draa-ga i-ruk-ki-ruh-dhu', translation: 'I feel good' },
        ],
        complex_sentences: [
            { id: 1, word: 'மழை பெய்தால், நான் வீட்டில் இருப்பேன்', phonetic: '/maḻai peytāl nāṉ vīṭṭil iruppēṉ/', speakable: 'muh-lai pay-dhaal naan veet-til i-rup-payn', translation: 'If it rains, I will stay home' },
            { id: 2, word: 'நான் களைப்பாக இருந்தாலும், உதவுவேன்', phonetic: '/nāṉ kaḷaippāka iruntālum utavuvēṉ/', speakable: 'naan kuh-lai-paa-ga i-run-dhaa-lum u-dhuh-vu-vayn', translation: 'Although I am tired, I will help' },
            { id: 3, word: 'நான் கடைக்கு சென்று பால் வாங்கினேன்', phonetic: '/nāṉ kaṭaikku ceṉṟu pāl vāṅkiṉēṉ/', speakable: 'naan kuh-dai-ku sen-dru paal vaang-gi-nayn', translation: 'I went to the store and bought milk' },
            { id: 4, word: 'நான் படித்த புத்தகம் சுவாரஸ்யமாக இருந்தது', phonetic: '/nāṉ paṭitta puttakam cuvāracyamāka iruntatu/', speakable: 'naan puh-dit-thuh puth-thuh-kum su-vaa-rus-yum-aa-ga i-run-dhuh-dhu', translation: 'The book that I read was interesting' },
            { id: 5, word: 'நான் தாமதமாக வந்ததால், பேருந்தை தவறவிட்டேன்', phonetic: '/nāṉ tāmatamāka vantatāl pēruntai tavaṟaviṭṭēṉ/', speakable: 'naan thaa-muh-dhum-aa-ga van-dhuh-dhaal pay-run-dhai thuh-vuh-ruh-vit-tayn', translation: 'Because I was late, I missed the bus' },
        ],
    },
    telugu: {
        simple_statements: [
            { id: 1, word: 'నేను సంతోషంగా ఉన్నాను', phonetic: '/nēnu santōṣaṅgā unnānu/', speakable: 'nay-nu san-tho-shum-gaa un-naa-nu', translation: 'I am happy' },
            { id: 2, word: 'ఇది నా పుస్తకం', phonetic: '/idi nā pustakaṁ/', speakable: 'i-di naa poos-thuh-kum', translation: 'This is my book' },
            { id: 3, word: 'వాతావరణం బాగుంది', phonetic: '/vātāvaraṇaṁ bāguṇḍi/', speakable: 'vaa-thaa-vuh-ruh-num baa-gun-di', translation: 'The weather is nice' },
            { id: 4, word: 'నాకు ఆహారం ఇష్టం', phonetic: '/nāku āhāraṁ iṣṭaṁ/', speakable: 'naa-ku aa-haa-rum ish-tum', translation: 'I like food' },
            { id: 5, word: 'ఆమె నా స్నేహితురాలు', phonetic: '/āme nā snēhiturālu/', speakable: 'aa-may naa snay-hi-thu-raa-lu', translation: 'She is my friend' },
        ],
        asking_questions: [
            { id: 1, word: 'మీ పేరు ఏమిటి?', phonetic: '/mī pēru ēmiṭi/', speakable: 'mee pay-ru ay-mi-ti', translation: 'What is your name?' },
            { id: 2, word: 'మీరు ఎలా ఉన్నారు?', phonetic: '/mīru elā unnāru/', speakable: 'mee-ru eh-laa un-naa-ru', translation: 'How are you?' },
            { id: 3, word: 'బాత్రూమ్ ఎక్కడ ఉంది?', phonetic: '/bāthrūm ekkaḍa uṇḍi/', speakable: 'baath-room ek-kuh-duh un-di', translation: 'Where is the bathroom?' },
            { id: 4, word: 'ఇది ఎంత?', phonetic: '/idi eṇṭa/', speakable: 'i-di en-tuh', translation: 'How much does this cost?' },
            { id: 5, word: 'ఎన్ని గంటలు?', phonetic: '/enni gaṇṭalu/', speakable: 'en-ni gun-tuh-lu', translation: 'What time is it?' },
        ],
        daily_conversations: [
            { id: 1, word: 'మిమ్మల్ని కలిసినందుకు సంతోషం', phonetic: '/mimmalini kalisinanduku santōṣaṁ/', speakable: 'mim-muh-li-ni kuh-li-si-nun-du-ku san-tho-shum', translation: 'Nice to meet you' },
            { id: 2, word: 'తరువాత కలుద్దాం', phonetic: '/taruvāta kaluddāṁ/', speakable: 'thuh-ru-vaa-thuh kuh-lud-daam', translation: 'See you later' },
            { id: 3, word: 'మీ రోజు శుభం', phonetic: '/mī rōju śubhaṁ/', speakable: 'mee ro-ju shub-hum', translation: 'Have a nice day' },
            { id: 4, word: 'క్షమించండి', phonetic: '/kṣamiṇcaṇḍi/', speakable: 'kshuh-min-chun-di', translation: 'I am sorry' },
            { id: 5, word: 'దయచేసి', phonetic: '/dayacēsi/', speakable: 'duh-yuh-chay-si', translation: 'Excuse me / Please' },
        ],
        expressing_feelings: [
            { id: 1, word: 'నేను అలసిపోయాను', phonetic: '/nēnu alasipōyānu/', speakable: 'nay-nu uh-luh-si-po-yaa-nu', translation: 'I am tired' },
            { id: 2, word: 'నాకు ఆకలిగా ఉంది', phonetic: '/nāku ākaligā uṇḍi/', speakable: 'naa-ku aa-kuh-li-gaa un-di', translation: 'I am hungry' },
            { id: 3, word: 'నేను ఉత్సాహంగా ఉన్నాను', phonetic: '/nēnu utsāhaṅgā unnānu/', speakable: 'nay-nu ut-saa-hum-gaa un-naa-nu', translation: 'I am excited' },
            { id: 4, word: 'నేను ఆందోళన చెందుతున్నాను', phonetic: '/nēnu āndōḷana cendutuṇnānu/', speakable: 'nay-nu aan-do-luh-nuh chen-du-thun-naa-nu', translation: 'I am worried' },
            { id: 5, word: 'నాకు బాగుంది', phonetic: '/nāku bāguṇḍi/', speakable: 'naa-ku baa-gun-di', translation: 'I feel good' },
        ],
        complex_sentences: [
            { id: 1, word: 'వర్షం పడితే, నేను ఇంట్లో ఉంటాను', phonetic: '/varṣaṁ paḍitē nēnu iṇṭlō uṇṭānu/', speakable: 'var-shum puh-di-thay nay-nu int-lo un-taa-nu', translation: 'If it rains, I will stay home' },
            { id: 2, word: 'నేను అలసిపోయినా, సహాయం చేస్తాను', phonetic: '/nēnu alasipōyinā sahāyaṁ cēstānu/', speakable: 'nay-nu uh-luh-si-po-yi-naa suh-haa-yum chays-taa-nu', translation: 'Although I am tired, I will help' },
            { id: 3, word: 'నేను దుకాణానికి వెళ్ళి పాలు తెచ్చాను', phonetic: '/nēnu dukāṇāniki veḷḷi pālu teccānu/', speakable: 'nay-nu du-kaa-naa-ni-ki vel-li paa-lu thech-chaa-nu', translation: 'I went to the store and bought milk' },
            { id: 4, word: 'నేను చదివిన పుస్తకం ఆసక్తికరంగా ఉంది', phonetic: '/nēnu cadivina pustakaṁ āsaktikaraṅgā uṇḍi/', speakable: 'nay-nu chuh-di-vi-nuh poos-thuh-kum aa-suk-thi-kuh-rum-gaa un-di', translation: 'The book that I read was interesting' },
            { id: 5, word: 'నేను ఆలస్యంగా వచ్చినందున, బస్సు మిస్సయ్యాను', phonetic: '/nēnu ālasyaṅgā vaccinanduna bassu missayyānu/', speakable: 'nay-nu aa-lus-yum-gaa vuh-chi-nun-du-nuh bus-su mis-say-yaa-nu', translation: 'Because I was late, I missed the bus' },
        ],
    },
}

// Map lesson titles to data keys for sentences
export const sentencesKeyMap = {
    'Simple Statements': 'simple_statements',
    'Asking Questions': 'asking_questions',
    'Daily Conversations': 'daily_conversations',
    'Expressing Feelings': 'expressing_feelings',
    'Complex Sentences': 'complex_sentences',
}

// Get sentences for a specific language and lesson
export function getSentencesForLesson(languageId, lessonTitle) {
    const lessonKey = sentencesKeyMap[lessonTitle]
    if (!lessonKey) return []

    const languageData = sentencesData[languageId]
    if (!languageData) return []

    return languageData[lessonKey] || []
}
