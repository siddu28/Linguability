import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { savePracticeProgress, getPracticeProgress } from "../../lib/database";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import { ArrowLeft, ChevronRight, Eye } from "lucide-react";
import "./practice.css";

function VocabularyPractice() {
    const [words, setWords] = useState([]);
    const [index, setIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);
    const [progressLoaded, setProgressLoaded] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const lang = searchParams.get("lang") || "english";
    const saveTimeoutRef = useRef(null);

    // Language display names
    const langNames = {
        'english': 'English',
        'hindi': 'Hindi',
        'tamil': 'Tamil',
        'telugu': 'Telugu'
    };

    // Fetch vocabulary data and restore saved progress
    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                const res = await fetch(`http://localhost:3001/api/practice/${lang}/vocabulary`);
                const data = await res.json();

                if (cancelled) return;

                if (Array.isArray(data)) {
                    setWords(data);

                    // Restore saved progress if user is logged in
                    if (user?.id) {
                        const saved = await getPracticeProgress(user.id, lang, 'vocabulary');
                        if (!cancelled && saved) {
                            const restoredIndex = Math.min(saved.current_index, data.length - 1);
                            setIndex(restoredIndex);
                            setCompletedCount(saved.completed_count || 0);
                        }
                    }
                } else {
                    console.error("Invalid data format received");
                    setWords([]);
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
    const saveProgress = (newIndex, newCompletedCount) => {
        if (!user?.id) return;

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            savePracticeProgress(user.id, {
                language: lang,
                practice_type: 'vocabulary',
                current_index: newIndex,
                completed_count: newCompletedCount
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
                    practice_type: 'vocabulary',
                    current_index: index,
                    completed_count: completedCount
                });
            }
        };
    }, [user?.id, lang, index, completedCount, words.length]);

    const nextWord = () => {
        const newIndex = (index + 1) % words.length;
        const newCompleted = completedCount + 1;
        setIndex(newIndex);
        setShowAnswer(false);
        setCompletedCount(newCompleted);
        saveProgress(newIndex, newCompleted);
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
    }, [words, index, completedCount]);

    if (!words.length || !progressLoaded) return (
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
                        {completedCount > 0 && (
                            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                {completedCount} words practiced
                            </span>
                        )}
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
