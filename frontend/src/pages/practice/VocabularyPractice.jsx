import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import { ArrowLeft, ChevronRight, Eye } from "lucide-react";
import "./practice.css";

function VocabularyPractice() {
    const [words, setWords] = useState([]);
    const [index, setIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
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
        fetch(`http://localhost:3001/api/practice/${lang}/vocabulary`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setWords(data);
                } else {
                    console.error("Invalid data format received");
                    setWords([]);
                }
            })
            .catch(err => console.error("Error fetching practice data:", err));
    }, [lang]);

    const nextWord = () => {
        setIndex((prev) => (prev + 1) % words.length);
        setShowAnswer(false);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const key = e.key.toLowerCase();
            if (key === 'n') {
                nextWord();
            } else if (key === 's') {
                setShowAnswer(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [words]);

    if (!words.length) return (
        <div className="practice-layout">
            <Navbar />
            <div className="practice-page">
                <p>Loading {langNames[lang]} vocabulary...</p>
            </div>
        </div>
    );

    const current = words[index];

    return (
        <div className="practice-layout">
            <Navbar />

            <div className="practice-page">
                {/* Top Progress Bar */}
                <div className="practice-top-progress">
                    <span>Word {index + 1} of {words.length}</span>
                    <div className="top-progress-bar">
                        <div
                            className="top-progress-fill"
                            style={{
                                width: `${((index + 1) / words.length) * 100}%`,
                                backgroundColor: 'var(--color-success)'
                            }}
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
                        <h2>{current.word}</h2>
                    </div>

                    <div className="vocabulary-content" style={{ minHeight: '200px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {showAnswer ? (
                            <div className="answer-section" style={{ width: '100%', textAlign: 'center', animation: 'premiumFadeIn 0.5s ease' }}>
                                <div className="answer-section-inner">
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ color: 'var(--color-primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Meaning</h4>
                                        <p className="meaning-text">{current.meaning}</p>
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Example</h4>
                                        <p className="example-text">"{current.example}"</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div className="minimalist-btn-group">
                                    <button
                                        className="listen-btn"
                                        onClick={() => setShowAnswer(true)}
                                        style={{ width: '90px', height: '90px' }}
                                    >
                                        <Eye size={36} />
                                    </button>
                                    <span className="minimalist-btn-label">Show Meaning</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="action-buttons" style={{ marginTop: '3rem' }}>
                        <Button
                            variant="primary"
                            onClick={nextWord}
                            style={{ minWidth: '200px' }}
                        >
                            Next Word <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VocabularyPractice;
