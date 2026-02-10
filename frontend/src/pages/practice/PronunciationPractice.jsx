import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const lang = searchParams.get("lang") || "english";

    // Language display names
    const langNames = {
        'english': 'English',
        'hindi': 'Hindi',
        'tamil': 'Tamil',
        'telugu': 'Telugu'
    };

    useEffect(() => {
        fetch(`http://localhost:3001/api/practice/${lang}/pronunciation`)
            .then(res => res.json())
            .then(data => {
                setAllData(data);
                // Load initial difficulty level
                if (data && data.simple) {
                    setWords(data.simple);
                } else if (Array.isArray(data)) {
                    // Fallback for old format
                    setWords(data);
                }
            })
            .catch(err => console.error("Error fetching practice data:", err));
    }, [lang]);

    const handleDifficultyChange = (newDifficulty) => {
        setDifficulty(newDifficulty);
        setIndex(0);
        setSpoken("");
        setResult(null);
        if (allData && allData[newDifficulty]) {
            setWords(allData[newDifficulty]);
        }
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        const langMap = {
            'english': 'en-US',
            'hindi': 'hi-IN',
            'tamil': 'ta-IN',
            'telugu': 'te-IN'
        };
        utterance.lang = langMap[lang] || 'en-US';
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
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
        setIndex((prev) => (prev + 1) % words.length);
        setSpoken("");
        setResult(null);
    };

    if (!words.length) return (
        <div className="practice-layout">
            <Navbar />
            <div className="practice-page">
                <p>Loading {langNames[lang]} pronunciation...</p>
            </div>
        </div>
    );

    const current = words[index];

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

                <div className="practice-card">
                    <div className="practice-header-nav">
                        <button className="back-btn" onClick={() => navigate(`/practice?lang=${lang}`)}>
                            <ArrowLeft size={16} /> Back to Practice
                        </button>
                    </div>

                    <div className="word-display">
                        <h2>{current.text}</h2>

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
