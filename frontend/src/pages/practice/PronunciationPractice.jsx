import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { savePracticeProgress, getPracticeProgress } from "../../lib/database";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import { ArrowLeft, Mic, Volume2, ChevronRight, RefreshCw } from "lucide-react";
import "./practice.css";

function PronunciationPractice() {
    const [words, setWords] = useState([]);
    const [index, setIndex] = useState(0);
    const [spoken, setSpoken] = useState("");
    const [result, setResult] = useState(null); // { isMatch, score, expected, spoken }
    const [isRecording, setIsRecording] = useState(false);
    const [difficulty, setDifficulty] = useState("simple"); // simple, medium, hard
    const [allData, setAllData] = useState(null);
    const [completedCount, setCompletedCount] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [highlightedCharIndex, setHighlightedCharIndex] = useState(-1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [progressLoaded, setProgressLoaded] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const lang = searchParams.get("lang") || "english";
    const saveTimeoutRef = useRef(null);
    const highlightIntervalRef = useRef(null);

    // Language display names
    const langNames = {
        'english': 'English',
        'hindi': 'Hindi',
        'tamil': 'Tamil',
        'telugu': 'Telugu'
    };

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                const res = await fetch(`http://localhost:3001/api/practice/${lang}/pronunciation`);
                const data = await res.json();
                if (cancelled) return;

                setAllData(data);
                let initialWords = [];
                let initialDifficulty = 'simple';

                if (data && data.simple) {
                    initialWords = data.simple;
                } else if (Array.isArray(data)) {
                    initialWords = data;
                }

                // Restore saved progress
                if (user?.id) {
                    const saved = await getPracticeProgress(user.id, lang, 'pronunciation');
                    if (!cancelled && saved) {
                        initialDifficulty = saved.difficulty || 'simple';
                        const diffWords = data?.[initialDifficulty] || initialWords;
                        initialWords = diffWords;
                        setDifficulty(initialDifficulty);
                        setIndex(Math.min(saved.current_index, diffWords.length - 1));
                        setCompletedCount(saved.completed_count || 0);
                    }
                }

                setWords(initialWords);
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
    const savePronunciationProgress = (newIndex, diff, newCompleted) => {
        if (!user?.id) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            savePracticeProgress(user.id, {
                language: lang,
                practice_type: 'pronunciation',
                current_index: newIndex,
                difficulty: diff || difficulty,
                completed_count: newCompleted
            });
        }, 500);
    };

    // Save on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            if (user?.id && words.length > 0) {
                savePracticeProgress(user.id, {
                    language: lang,
                    practice_type: 'pronunciation',
                    current_index: index,
                    difficulty: difficulty,
                    completed_count: completedCount
                });
            }
        };
    }, [user?.id, lang, index, difficulty, completedCount, words.length]);

    const handleDifficultyChange = (newDifficulty) => {
        setDifficulty(newDifficulty);
        setIndex(0);
        setSpoken("");
        setResult(null);
        if (allData && allData[newDifficulty]) {
            setWords(allData[newDifficulty]);
        }
        // Save the new difficulty selection
        if (user?.id) {
            savePracticeProgress(user.id, {
                language: lang,
                practice_type: 'pronunciation',
                current_index: 0,
                difficulty: newDifficulty,
                completed_count: completedCount
            });
        }
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

    // Google Translate TTS language codes
    const gttsLangMap = {
        'english': 'en',
        'hindi': 'hi',
        'tamil': 'ta',
        'telugu': 'te'
    };

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
    const speakWithGoogleTTS = (text) => {
        const gttsLang = gttsLangMap[lang] || 'en';
        const encodedText = encodeURIComponent(text);
        const url = `http://localhost:3001/api/practice/tts?text=${encodedText}&lang=${gttsLang}`;
        const audio = new Audio(url);
        audio.playbackRate = playbackRate;
        setIsSpeaking(true);
        setHighlightedCharIndex(-1);

        // Clear any previous highlight interval
        if (highlightIntervalRef.current) clearInterval(highlightIntervalRef.current);

        audio.onended = () => {
            setIsSpeaking(false);
            setHighlightedCharIndex(-1);
            if (highlightIntervalRef.current) clearInterval(highlightIntervalRef.current);
        };

        // Simulate word highlighting for Audio element
        audio.onplaying = () => {
            const wordsArr = text.split(/\s+/);
            if (wordsArr.length <= 1) return;

            // Estimate total duration: ~0.4s per word at 1x speed, adjusted for playback rate
            const estimatedDuration = (audio.duration && isFinite(audio.duration))
                ? audio.duration
                : (wordsArr.length * 0.4) / playbackRate;
            const msPerWord = (estimatedDuration / wordsArr.length) * 1000;

            let wordIdx = 0;
            // Set first word immediately
            let charPos = 0;
            setHighlightedCharIndex(0);

            highlightIntervalRef.current = setInterval(() => {
                wordIdx++;
                if (wordIdx >= wordsArr.length) {
                    clearInterval(highlightIntervalRef.current);
                    return;
                }
                // Calculate charIndex for this word
                charPos = 0;
                for (let i = 0; i < wordIdx; i++) {
                    charPos += wordsArr[i].length + 1;
                }
                setHighlightedCharIndex(charPos);
            }, msPerWord);
        };

        audio.play().catch(err => {
            console.error('TTS proxy fallback failed:', err);
            setIsSpeaking(false);
            if (highlightIntervalRef.current) clearInterval(highlightIntervalRef.current);
        });
    };

    const speak = (text) => {
        const langMap = {
            'english': 'en-US',
            'hindi': 'hi-IN',
            'tamil': 'ta-IN',
            'telugu': 'te-IN'
        };
        const lCode = langMap[lang] || 'en-US';

        // If no system voice exists, use Google TTS fallback
        if (!hasSystemVoice(lCode)) {
            speakWithGoogleTTS(text);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lCode;
        utterance.rate = playbackRate;

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

        // Track whether onboundary fires (some voices don't support it)
        let boundaryFired = false;

        // Word-level highlighting via onboundary
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                boundaryFired = true;
                // Cancel fallback timer if native boundary works
                if (highlightIntervalRef.current) {
                    clearInterval(highlightIntervalRef.current);
                    highlightIntervalRef.current = null;
                }
                setHighlightedCharIndex(event.charIndex);
            }
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setHighlightedCharIndex(-1);
            if (highlightIntervalRef.current) clearInterval(highlightIntervalRef.current);
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            setHighlightedCharIndex(-1);
            if (highlightIntervalRef.current) clearInterval(highlightIntervalRef.current);
        };

        setHighlightedCharIndex(-1);
        setIsSpeaking(true);
        if (highlightIntervalRef.current) clearInterval(highlightIntervalRef.current);

        window.speechSynthesis.cancel();
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);

            // Fallback: if onboundary doesn't fire within 300ms, simulate word highlighting
            setTimeout(() => {
                if (!boundaryFired && text.split(/\s+/).length > 1) {
                    const wordsArr = text.split(/\s+/);
                    // Estimate ~0.5s per word at 1x speed
                    const msPerWord = (500 / playbackRate);
                    let wordIdx = 0;
                    setHighlightedCharIndex(0);

                    highlightIntervalRef.current = setInterval(() => {
                        wordIdx++;
                        if (wordIdx >= wordsArr.length) {
                            clearInterval(highlightIntervalRef.current);
                            return;
                        }
                        let charPos = 0;
                        for (let i = 0; i < wordIdx; i++) {
                            charPos += wordsArr[i].length + 1;
                        }
                        setHighlightedCharIndex(charPos);
                    }, msPerWord);
                }
            }, 300);
        }, 50);
    };

    const startRecognition = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        const langMap = {
            'english': 'en-US',
            'hindi': 'hi-IN',
            'tamil': 'ta-IN',
            'telugu': 'te-IN'
        };
        recognition.lang = langMap[lang] || "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsRecording(true);
            setResult(null);
            setSpoken("");
        };

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setSpoken(text);
            checkPronunciation(text);
            setIsRecording(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.start();
    };

    const checkPronunciation = async (spokenText) => {
        const current = words[index];

        try {
            const res = await fetch("http://localhost:3001/api/practice/check-pronunciation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expected: current.text, spoken: spokenText }),
            });

            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error("Error checking pronunciation:", error);
        }
    };

    const next = () => {
        if (!words.length) return;
        const newIndex = (index + 1) % words.length;
        const newCompleted = completedCount + 1;
        setIndex(newIndex);
        setSpoken("");
        setResult(null);
        setCompletedCount(newCompleted);
        savePronunciationProgress(newIndex, difficulty, newCompleted);
    };

    const current = words[index];

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (!current) return;

            const key = e.key.toLowerCase();
            if (key === ' ' || key === 'spacebar') {
                e.preventDefault();
                if (!isRecording) startRecognition();
            } else if (key === 'l') {
                speak(current.text);
            } else if (key === 'n') {
                next();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRecording, current, words]);

    if (!words.length || !progressLoaded) return (
        <div className="practice-layout">
            <Navbar />
            <div className="practice-page">
                <p>Loading {langNames[lang]} pronunciation...</p>
            </div>
        </div>
    );

    const getScoreColor = (score) => {
        if (score >= 80) return "var(--color-success)";
        if (score >= 50) return "#F59E0B";
        return "var(--color-error)";
    };

    return (
        <div className="practice-layout">
            <Navbar />

            <div className="practice-page">
                {/* Difficulty Selection */}
                <div style={{ padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => handleDifficultyChange("simple")}
                        className={`difficulty-btn ${difficulty === "simple" ? 'active' : ''}`}
                    >
                        Simple
                    </button>
                    <button
                        onClick={() => handleDifficultyChange("medium")}
                        className={`difficulty-btn ${difficulty === "medium" ? 'active' : ''}`}
                    >
                        Medium
                    </button>
                    <button
                        onClick={() => handleDifficultyChange("hard")}
                        className={`difficulty-btn ${difficulty === "hard" ? 'active' : ''}`}
                    >
                        Hard
                    </button>
                </div>

                {/* Top Progress Bar */}
                <div className="practice-top-progress">
                    <span>Item {index + 1} of {words.length} ({difficulty.toUpperCase()})</span>
                    <div className="top-progress-bar">
                        <div
                            className="top-progress-fill"
                            style={{ width: `${((index + 1) / words.length) * 100}%`, backgroundColor: 'var(--color-success)' }}
                        />
                    </div>
                    <span>{Math.round(((index + 1) / words.length) * 100)}% complete</span>
                </div>

                <div className="practice-card practice-card-animated" key={index}>
                    <div className="practice-header-nav">
                        <button className="back-btn" onClick={() => navigate(`/practice?lang=${lang}`)}>
                            <ArrowLeft size={16} /> Back to Practice
                        </button>
                    </div>

                    <div className="word-display">
                        <h2>
                            {(() => {
                                const text = current.text;
                                const wordsArr = text.split(/\s+/);
                                if (wordsArr.length <= 1 || highlightedCharIndex < 0 || !isSpeaking) {
                                    return <span className={isSpeaking && highlightedCharIndex >= 0 ? 'tts-highlight' : ''}>{text}</span>;
                                }
                                // Multi-word: map charIndex to active word
                                let charPos = 0;
                                let activeIdx = 0;
                                for (let i = 0; i < wordsArr.length; i++) {
                                    if (charPos + wordsArr[i].length > highlightedCharIndex) {
                                        activeIdx = i;
                                        break;
                                    }
                                    charPos += wordsArr[i].length + 1;
                                }
                                return wordsArr.map((w, i) => (
                                    <span key={i} className={i === activeIdx ? 'tts-highlight' : ''}>
                                        {w}{i < wordsArr.length - 1 ? ' ' : ''}
                                    </span>
                                ));
                            })()}
                        </h2>

                        <div className="minimalist-btn-group">
                            <button
                                className="listen-btn"
                                onClick={() => speak(current.text)}
                                title="Listen to pronunciation"
                            >
                                <Volume2 size={28} />
                            </button>
                            <span className="minimalist-btn-label">Listen</span>
                        </div>

                        {/* Audio Speed Control */}
                        <div className="speed-control">
                            <span className="speed-label">Speed:</span>
                            <div className="speed-buttons">
                                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                    <button
                                        key={rate}
                                        className={`speed-btn ${playbackRate === rate ? 'active' : ''}`}
                                        onClick={() => setPlaybackRate(rate)}
                                    >
                                        {rate}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="record-btn-container">
                        <div className="minimalist-btn-group">
                            <button
                                onClick={startRecognition}
                                className={`record-btn-circular ${isRecording ? 'recording' : ''}`}
                                disabled={isRecording}
                            >
                                <Mic size={32} />
                            </button>
                            <span className="minimalist-btn-label">Speak</span>
                        </div>
                        <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                            {isRecording ? 'Listening...' : 'Tap the microphone to practice'}
                        </p>
                    </div>

                    {spoken && (
                        <div className="result-section">
                            <p className="spoken-text-display">
                                You said: <span className="spoken-value">"{spoken}"</span>
                            </p>

                            {result && (
                                <div className="score-display-minimal">
                                    <span className="score-value-text" style={{ color: getScoreColor(result.score) }}>
                                        {result.score}%
                                    </span>
                                    <div className="score-message">
                                        <h4 style={{ color: getScoreColor(result.score), margin: '0 0 5px 0' }}>
                                            {result.score >= 80 ? "Excellent!" : result.score >= 50 ? "Good Try!" : "Keep Practicing"}
                                        </h4>
                                        <p style={{ margin: 0, fontSize: '0.875rem' }}>
                                            {result.isMatch ? "Great pronunciation!" : "Try to match the pronunciation exactly."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="action-buttons">
                        {result && (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setSpoken("");
                                    setResult(null);
                                    startRecognition();
                                }}
                                className="retry-btn"
                            >
                                <RefreshCw size={18} /> Retry
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            onClick={next}
                            className="next-btn"
                        >
                            Next Word <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PronunciationPractice;
