import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import { Volume2, ChevronRight, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import "./practice.css";

function ListeningPractice() {
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
    const lang = searchParams.get("lang") || "english";

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
        fetch(`http://localhost:3001/api/practice/${lang}/listening`)
            .then(res => res.json())
            .then(data => {
                // Normalize into separate word and sentence sources so UI can toggle between them
                if (Array.isArray(data)) {
                    // Legacy: treat everything as words
                    const ws = data.map(item => ({
                        ...item,
                        shuffledOptions: shuffleArray(Array.isArray(item.options) ? [...item.options] : [])
                    }));
                    setWordsSource(ws);
                    setSentencesSource([]);
                    setList(ws);
                } else if (data && (Array.isArray(data.words) || Array.isArray(data.sentences))) {
                    const ws = (data.words || []).map(item => ({
                        ...item,
                        shuffledOptions: shuffleArray(Array.isArray(item.options) ? [...item.options] : [])
                    }));
                    const ss = (data.sentences || []).map(item => ({
                        ...item,
                        shuffledOptions: shuffleArray(Array.isArray(item.options) ? [...item.options] : [])
                    }));
                    setWordsSource(ws);
                    setSentencesSource(ss);
                    // default to words if available, else sentences
                    setList(ws.length ? ws : ss);
                    setCategory(ws.length ? 'words' : 'sentences');
                } else {
                    console.error("Invalid data format received for listening:", data);
                    setWordsSource([]);
                    setSentencesSource([]);
                    setList([]);
                }
            })
            .catch(err => console.error("Error fetching practice data:", err));
    }, [lang]);

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langMap[lang] || 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
        setHasPlayed(true);
    };

    const handleOptionSelect = (option) => {
        if (showResult) return;
        setSelectedOption(option);
    };

    const checkAnswer = () => {
        if (!selectedOption) return;
        setShowResult(true);
        if (selectedOption === list[index].text) {
            setScore(prev => prev + 1);
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

    if (!list.length) return (
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

                <div className="practice-card">
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
