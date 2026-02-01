import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { Volume2, ChevronRight, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import "./practice.css";

function ListeningPractice() {
    const [list, setList] = useState([]);
    const [index, setIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [hasPlayed, setHasPlayed] = useState(false);
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

    // Map language IDs to BCP 47 language tags
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
                if (Array.isArray(data)) {
                    // Shuffle options for each item
                    const shuffledData = data.map(item => ({
                        ...item,
                        shuffledOptions: shuffleArray([...item.options])
                    }));
                    setList(shuffledData);
                } else {
                    console.error("Invalid data format received");
                    setList([]);
                }
            })
            .catch(err => console.error("Error fetching practice data:", err));
    }, [lang]);

    // Shuffle array helper
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
        utterance.rate = 0.8; // Slightly slower for clarity
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
        setHasPlayed(true);
    };

    const handleOptionSelect = (option) => {
        if (showResult) return; // Prevent changing after result shown
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
        // Re-shuffle options
        setList(prev => prev.map(item => ({
            ...item,
            shuffledOptions: shuffleArray([...item.options])
        })));
    };

    if (!list.length) return (
        <div className="lessons-page">
            <Navbar />
            <main className="lessons-content">
                <p>Loading {langNames[lang]} listening practice...</p>
            </main>
        </div>
    );

    const current = list[index];
    const isCorrect = selectedOption === current.text;
    const isLastQuestion = index === list.length - 1;
    const isComplete = isLastQuestion && showResult;

    return (
        <div className="lessons-page">
            <Navbar />

            <main className="lessons-content">
                <div className="lessons-header">
                    <button className="back-btn" onClick={() => navigate(`/practice?lang=${lang}`)}>
                        <ArrowLeft size={16} /> Back to Practice
                    </button>
                    <h1 className="lessons-title">🎧 Listening Practice</h1>
                    <p className="lessons-subtitle">{langNames[lang]} • Question {index + 1} of {list.length}</p>
                </div>

                {/* Progress Bar */}
                <div className="listening-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${((index + (showResult ? 1 : 0)) / list.length) * 100}%` }}
                        />
                    </div>
                    <span className="progress-text">Score: {score}/{showResult ? index + 1 : index}</span>
                </div>

                {!isComplete ? (
                    <div className="listening-card">
                        {/* Audio Section */}
                        <div className="audio-section">
                            <p className="instruction">Listen carefully and select what you hear</p>
                            <button
                                onClick={() => speak(current.text)}
                                className="audio-play-btn"
                            >
                                <Volume2 size={32} />
                                <span>Play Audio</span>
                            </button>
                            {!hasPlayed && (
                                <p className="hint-text">Click to play the audio first</p>
                            )}
                        </div>

                        {/* Options Section */}
                        {hasPlayed && (
                            <div className="options-section">
                                <p className="options-label">Select what you heard:</p>
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
                                                <CheckCircle size={20} className="result-icon" />
                                            )}
                                            {showResult && selectedOption === option && option !== current.text && (
                                                <XCircle size={20} className="result-icon" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Result Message */}
                        {showResult && (
                            <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
                                {isCorrect ? (
                                    <>
                                        <CheckCircle size={24} />
                                        <span>Correct! Well done! 🎉</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={24} />
                                        <span>Not quite. The answer was: <strong>{current.text}</strong></span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            {!showResult ? (
                                <Button
                                    variant="primary"
                                    onClick={checkAnswer}
                                    disabled={!selectedOption}
                                    className="check-btn"
                                >
                                    Check Answer
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={next}
                                    className="next-btn"
                                >
                                    {isLastQuestion ? 'See Results' : 'Next Question'} <ChevronRight size={18} />
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Completion Screen */
                    <div className="completion-card">
                        <div className="completion-icon">🎉</div>
                        <h2>Practice Complete!</h2>
                        <div className="final-score">
                            <span className="score-number">{score}</span>
                            <span className="score-divider">/</span>
                            <span className="score-total">{list.length}</span>
                        </div>
                        <p className="score-message">
                            {score === list.length
                                ? "Perfect! You got all answers correct!"
                                : score >= list.length / 2
                                    ? "Good job! Keep practicing to improve."
                                    : "Keep practicing! You'll get better with time."}
                        </p>
                        <div className="completion-actions">
                            <Button variant="primary" onClick={restart}>
                                Practice Again
                            </Button>
                            <Button variant="secondary" onClick={() => navigate(`/practice`)}>
                                Back to Practice
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ListeningPractice;
