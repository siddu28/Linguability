import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { savePracticeProgress, getPracticeProgress } from "../../lib/database";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import { Volume2, ChevronRight, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import "./practice.css";

function ListeningPractice() {
    const [playbackRate, setPlaybackRate] = useState(1);
    const [list, setList] = useState([]);
    const [wordsSource, setWordsSource] = useState([]);
    const [sentencesSource, setSentencesSource] = useState([]);
    const [category, setCategory] = useState('words');
    const [index, setIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [hasPlayed, setHasPlayed] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const lang = searchParams.get("lang") || "english";
    const saveTimeoutRef = useRef(null);
    const [progressLoaded, setProgressLoaded] = useState(false);

    const langNames = {
        'english': 'English',
        'hindi': 'Hindi',
        'tamil': 'Tamil',
        'telugu': 'Telugu'
    };

    const langMap = {
        'english': 'en-US',
        'hindi': 'hi-IN',
        'tamil': 'ta-IN',
        'telugu': 'te-IN'
    };

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                const res = await fetch(`http://localhost:3001/api/practice/${lang}/listening`);
                const data = await res.json();
                if (cancelled) return;

                let ws = [];
                let ss = [];

                if (Array.isArray(data)) {
                    ws = data.map(item => ({
                        ...item,
                        shuffledOptions: shuffleArray(Array.isArray(item.options) ? [...item.options] : [])
                    }));
                    setWordsSource(ws);
                    setSentencesSource([]);
                    setList(ws);
                } else if (data && (Array.isArray(data.words) || Array.isArray(data.sentences))) {
                    ws = (data.words || []).map(item => ({
                        ...item,
                        shuffledOptions: shuffleArray(Array.isArray(item.options) ? [...item.options] : [])
                    }));
                    ss = (data.sentences || []).map(item => ({
                        ...item,
                        shuffledOptions: shuffleArray(Array.isArray(item.options) ? [...item.options] : [])
                    }));
                    setWordsSource(ws);
                    setSentencesSource(ss);
                    setList(ws.length ? ws : ss);
                    setCategory(ws.length ? 'words' : 'sentences');
                } else {
                    console.error("Invalid data format received for listening:", data);
                    setWordsSource([]);
                    setSentencesSource([]);
                    setList([]);
                }

                // Restore saved progress
                if (user?.id) {
                    const saved = await getPracticeProgress(user.id, lang, 'listening');
                    if (!cancelled && saved) {
                        const activeList = saved.category === 'sentences' ? ss : ws;
                        if (activeList.length > 0) {
                            setCategory(saved.category || 'words');
                            setIndex(Math.min(saved.current_index, activeList.length - 1));
                            setScore(saved.score || 0);
                            setList(activeList);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching practice data:", err);
            } finally {
                if (!cancelled) setProgressLoaded(true);
            }
        }

        loadData();
        return () => { cancelled = true; };
    }, [lang, user?.id]);

    // Save progress (debounced)
    const saveListeningProgress = (newIndex, newScore, cat) => {
        if (!user?.id) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            savePracticeProgress(user.id, {
                language: lang,
                practice_type: 'listening',
                current_index: newIndex,
                score: newScore,
                category: cat || category,
                completed_count: newIndex + 1
            });
        }, 500);
    };

    // Save on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            if (user?.id && list.length > 0) {
                savePracticeProgress(user.id, {
                    language: lang,
                    practice_type: 'listening',
                    current_index: index,
                    score: score,
                    category: category,
                    completed_count: index + 1
                });
            }
        };
    }, [user?.id, lang, index, score, category, list.length]);

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // Google Translate TTS language codes
    const gttsLangMap = {
        'english': 'en',
        'hindi': 'hi',
        'tamil': 'ta',
        'telugu': 'te'
    };

    // Pre-warm speech synthesis to detect available voices
    const [availableVoices, setAvailableVoices] = useState([]);
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setAvailableVoices(voices);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    // Check if a system voice exists for the current language
    const hasSystemVoice = (lCode) => {
        const normalizedLCode = lCode.toLowerCase().replace('_', '-');
        const root = normalizedLCode.split('-')[0];
        return availableVoices.some(v => {
            const vLang = v.lang.toLowerCase().replace('_', '-');
            return vLang === normalizedLCode || vLang.startsWith(root);
        }) || availableVoices.some(v => v.name.toLowerCase().includes(lang.toLowerCase()));
    };

    // Fallback: Use backend TTS proxy (bypasses CORS)
    const speakWithGoogleTTS = (text, rate = 1) => {
        const gttsLang = gttsLangMap[lang] || 'en';
        const encodedText = encodeURIComponent(text);
        const url = `http://localhost:3001/api/practice/tts?text=${encodedText}&lang=${gttsLang}`;
        const audio = new Audio(url);
        audio.playbackRate = rate;
        audio.play().then(() => {
            setHasPlayed(true);
        }).catch(err => {
            console.error('TTS proxy fallback failed:', err);
        });
    };

    const speak = (text, rate = playbackRate) => {
        const lCode = langMap[lang] || 'en-US';

        // If no system voice exists, use Google TTS fallback
        if (!hasSystemVoice(lCode)) {
            speakWithGoogleTTS(text, rate);
            return;
        }

        const performSpeak = () => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lCode;
            utterance.rate = rate;

            const voices = window.speechSynthesis.getVoices();
            const normalizedLCode = lCode.toLowerCase().replace('_', '-');
            let selectedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === normalizedLCode);
            if (!selectedVoice) {
                const root = normalizedLCode.split('-')[0];
                selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith(root));
            }
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.name.toLowerCase().includes(lang.toLowerCase()));
            }
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            window.speechSynthesis.cancel();
            setTimeout(() => {
                window.speechSynthesis.speak(utterance);
                setHasPlayed(true);
            }, 50);
        };

        performSpeak();
    };

    const handleOptionSelect = (option) => {
        if (showResult) return;
        setSelectedOption(option);
    };

    const checkAnswer = () => {
        if (!selectedOption) return;
        setShowResult(true);
        const isCorrect = selectedOption === list[index].text;
        if (isCorrect) {
            const newScore = score + 1;
            setScore(newScore);
            saveListeningProgress(index, newScore, category);
        } else {
            saveListeningProgress(index, score, category);
        }
    };

    const next = () => {
        if (index < list.length - 1) {
            setIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowResult(false);
            setHasPlayed(false);
        }
    };

    const togglePlaybackRate = () => {
        const newRate = playbackRate === 1 ? 0.6 : 1;
        setPlaybackRate(newRate);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const key = e.key.toLowerCase();
            if (key === ' ' || key === 'enter') {
                e.preventDefault();
                if (!showResult && selectedOption) {
                    checkAnswer();
                } else if (showResult) {
                    next();
                }
            } else if (key === 'l') {
                if (list[index]) speak(list[index].text, playbackRate);
            } else if (key === 's') {
                togglePlaybackRate();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedOption, showResult, index, list, playbackRate]);

    const restart = () => {
        setIndex(0);
        setSelectedOption(null);
        setShowResult(false);
        setScore(0);
        setHasPlayed(false);
        setList(prev => prev.map(item => ({
            ...item,
            shuffledOptions: shuffleArray([...item.options])
        })));
    };

    const switchCategory = (cat) => {
        if (cat === category) return;
        setCategory(cat);
        setIndex(0);
        setSelectedOption(null);
        setShowResult(false);
        setScore(0);
        setHasPlayed(false);

        const source = cat === 'words' ? wordsSource : sentencesSource;
        // ensure shuffledOptions are present
        const prepared = source.map(item => ({
            ...item,
            shuffledOptions: shuffleArray(Array.isArray(item.options) ? [...item.options] : [])
        }));
        setList(prepared);
    }

    if (!list.length || !progressLoaded) return (
        <div className="practice-layout">
            <Navbar />
            <div className="practice-page">
                <p>Loading {langNames[lang]} listening practice...</p>
            </div>
        </div>
    );

    const current = list[index];
    const isLastQuestion = index === list.length - 1;
    const isComplete = isLastQuestion && showResult;

    return (
        <div className="practice-layout">
            <Navbar />

            <div className="practice-page">
                {/* Top Progress Bar */}
                <div className="practice-top-progress">
                    <span>Question {index + 1} of {list.length}</span>
                    <div className="top-progress-bar">
                        <div
                            className="top-progress-fill"
                            style={{
                                width: `${((index + (showResult ? 1 : 0)) / list.length) * 100}%`,
                                backgroundColor: 'var(--color-success)'
                            }}
                        />
                    </div>
                    <span>Score: {score}/{list.length}</span>
                </div>

                <div className="practice-card practice-card-animated" key={index}>
                    <div className="practice-header-nav">
                        <button className="back-btn" onClick={() => navigate(`/practice?lang=${lang}`)}>
                            <ArrowLeft size={16} /> Back to Practice
                        </button>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                            <button
                                className={`category-toggle ${category === 'words' ? 'active' : ''}`}
                                onClick={() => switchCategory('words')}
                            >
                                Words
                            </button>
                            <button
                                className={`category-toggle ${category === 'sentences' ? 'active' : ''}`}
                                onClick={() => switchCategory('sentences')}
                            >
                                Sentences
                            </button>
                        </div>
                    </div>

                    {!isComplete ? (
                        <div className="listening-standard-content">
                            <div className="audio-section">
                                <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center' }}>
                                    Listen carefully and select what you hear
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <div className="minimalist-btn-group">
                                        <button
                                            onClick={() => speak(current.text)}
                                            className="listen-btn"
                                            style={{ width: '100px', height: '100px' }}
                                        >
                                            <Volume2 size={40} strokeWidth={2.5} />
                                        </button>
                                        <span className="minimalist-btn-label">Listen</span>
                                    </div>

                                    <div className="minimalist-btn-group">
                                        <button
                                            onClick={togglePlaybackRate}
                                            className="mini-speak-btn"
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                backgroundColor: playbackRate < 1 ? 'var(--color-primary)' : 'var(--color-white)',
                                                color: playbackRate < 1 ? 'white' : 'var(--color-primary)',
                                                borderColor: playbackRate < 1 ? 'var(--color-primary)' : 'var(--color-border)'
                                            }}
                                        >
                                            <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                                {playbackRate === 1 ? '0.6x' : '1.0x'}
                                            </span>
                                        </button>
                                        <span className="minimalist-btn-label">
                                            {playbackRate === 1 ? 'Slow' : 'Normal'}
                                        </span>
                                    </div>
                                </div>
                                {!hasPlayed && (
                                    <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                                        Click the button to play audio
                                    </p>
                                )}
                            </div>

                            {hasPlayed && (
                                <div className="options-grid">
                                    {current.shuffledOptions.map((option, i) => (
                                        <button
                                            key={i}
                                            className={`option-btn ${selectedOption === option ? 'selected' : ''} ${showResult
                                                ? option === current.text
                                                    ? 'correct'
                                                    : selectedOption === option
                                                        ? 'incorrect'
                                                        : ''
                                                : ''
                                                }`}
                                            onClick={() => handleOptionSelect(option)}
                                            disabled={showResult}
                                        >
                                            {option}
                                            {showResult && option === current.text && (
                                                <CheckCircle size={20} style={{ position: 'absolute', right: '15px' }} />
                                            )}
                                            {showResult && selectedOption === option && option !== current.text && (
                                                <XCircle size={20} style={{ position: 'absolute', right: '15px' }} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="action-buttons">
                                {!showResult ? (
                                    <Button
                                        variant="primary"
                                        onClick={checkAnswer}
                                        disabled={!selectedOption}
                                        style={{ minWidth: '220px' }}
                                    >
                                        Check Answer
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        onClick={next}
                                        style={{ minWidth: '220px' }}
                                    >
                                        {isLastQuestion ? 'See Results' : 'Next Question'} <ChevronRight size={18} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="completion-card" style={{ textAlign: 'center', width: '100%' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎉</div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Practice Complete!</h2>
                            <div style={{ fontSize: '3rem', fontWeight: '700', color: '#10b981', marginBottom: '1.5rem' }}>
                                {score} / {list.length}
                            </div>
                            <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '1.125rem' }}>
                                {score === list.length
                                    ? "Perfect! You got all answers correct!"
                                    : score >= list.length / 2
                                        ? "Good job! Keep practicing to improve."
                                        : "Keep practicing! You'll get better with time."}
                            </p>
                            <div className="action-buttons">
                                <Button variant="primary" onClick={restart}>
                                    Practice Again
                                </Button>
                                <Button variant="secondary" onClick={() => navigate(`/practice?lang=${lang}`)}>
                                    Back to Practice
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ListeningPractice;
