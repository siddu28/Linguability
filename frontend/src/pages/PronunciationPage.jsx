import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mic, Clock, Target, Volume2, CheckCircle2, XCircle, RotateCcw, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
    getPronunciationTestById,
    generatePronunciationWords
} from '../data/pronunciationData'
import { savePronunciationResult } from '../lib/database'
import Navbar from '../components/Navbar'
import PronunciationTest from '../components/PronunciationTest'
import Button from '../components/Button'
import './PronunciationPage.css'

function PronunciationPage() {
    const { testId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [testConfig, setTestConfig] = useState(null)
    const [words, setWords] = useState([])
    const [testState, setTestState] = useState('intro') // 'intro', 'active', 'complete'
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)

    // Load test configuration
    useEffect(() => {
        const config = getPronunciationTestById(testId)
        if (config) {
            setTestConfig(config)
        }
        setLoading(false)
    }, [testId])

    // Start test
    const handleStartTest = () => {
        const generatedWords = generatePronunciationWords(testId)
        setWords(generatedWords)
        setTestState('active')
    }

    // Handle test completion
    const handleTestComplete = async (testResult) => {
        setResult(testResult)
        setTestState('complete')

        // Save to database
        if (user?.id && testConfig) {
            try {
                await savePronunciationResult(user.id, {
                    testId: testId,
                    testTitle: testConfig.title,
                    score: testResult.score,
                    totalWords: testResult.totalWords,
                    passedWords: testResult.passedWords,
                    results: testResult.results,
                    completedAt: new Date().toISOString()
                })
            } catch (error) {
                console.error('Error saving pronunciation result:', error)
            }
        }
    }

    // Retry test
    const handleRetry = () => {
        const generatedWords = generatePronunciationWords(testId)
        setWords(generatedWords)
        setResult(null)
        setTestState('active')
    }

    if (loading) {
        return (
            <div className="pronunciation-page">
                <Navbar />
                <div className="pronunciation-page-content">
                    <div className="loading-state">Loading test...</div>
                </div>
            </div>
        )
    }

    if (!testConfig) {
        return (
            <div className="pronunciation-page">
                <Navbar />
                <div className="pronunciation-page-content">
                    <div className="error-state">
                        <h2>Test not found</h2>
                        <Button onClick={() => navigate('/assessments')}>
                            Back to Assessments
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="pronunciation-page">
            <Navbar />

            <div className="pronunciation-page-content">
                {/* Back Button */}
                <button
                    className="back-button"
                    onClick={() => navigate('/assessments')}
                >
                    <ArrowLeft size={20} />
                    <span>Back to Assessments</span>
                </button>

                {/* Intro Screen */}
                {testState === 'intro' && (
                    <div className="pronunciation-intro-card">
                        <div className="intro-badge speaking">
                            <Mic size={16} />
                            Speaking Test
                        </div>

                        <h1 className="intro-title">{testConfig.title}</h1>
                        <p className="intro-description">{testConfig.description}</p>

                        <div className="pronunciation-info-grid">
                            <div className="info-item">
                                <div className="info-icon">
                                    <Target size={20} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Words</span>
                                    <span className="info-value">{testConfig.wordsCount}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon">
                                    <Clock size={20} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Duration</span>
                                    <span className="info-value">{Math.floor(testConfig.duration / 60)} min</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Pass Score</span>
                                    <span className="info-value">{testConfig.passingScore}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="pronunciation-rules">
                            <h3>How it works:</h3>
                            <ul>
                                <li>🎧 Listen to the correct pronunciation first</li>
                                <li>🎤 Click "Start Recording" and speak clearly</li>
                                <li>📊 Get instant feedback on your pronunciation</li>
                                <li>✅ Score 60%+ to pass each word</li>
                            </ul>
                        </div>

                        <div className="microphone-note">
                            <Volume2 size={18} />
                            <span>Please allow microphone access when prompted</span>
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleStartTest}
                            fullWidth
                        >
                            <Mic size={20} />
                            Start Pronunciation Test
                        </Button>
                    </div>
                )}

                {/* Active Test */}
                {testState === 'active' && (
                    <PronunciationTest
                        words={words}
                        testConfig={testConfig}
                        onComplete={handleTestComplete}
                    />
                )}

                {/* Results Screen */}
                {testState === 'complete' && result && (
                    <div className="pronunciation-results-card">
                        <div className={`results-icon ${result.score >= testConfig.passingScore ? 'passed' : 'failed'}`}>
                            {result.score >= testConfig.passingScore ? (
                                <CheckCircle2 size={48} />
                            ) : (
                                <XCircle size={48} />
                            )}
                        </div>

                        <h2 className="results-title">
                            {result.score >= testConfig.passingScore
                                ? '🎉 Great Job!'
                                : '💪 Keep Practicing!'}
                        </h2>

                        <div className="results-score">
                            <span className="score-number">{result.score}%</span>
                            <span className="score-label">Overall Score</span>
                        </div>

                        <div className="results-stats">
                            <div className="stat-item">
                                <span className="stat-value">{result.passedWords}</span>
                                <span className="stat-label">Words Passed</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-value">{result.totalWords - result.passedWords}</span>
                                <span className="stat-label">Needs Practice</span>
                            </div>
                        </div>

                        {/* Words Review */}
                        <div className="words-review">
                            <h3>Word by Word Review</h3>
                            <div className="words-list">
                                {result.results.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`word-review-item ${item.score >= 60 ? 'passed' : 'failed'}`}
                                    >
                                        <div className="word-review-content">
                                            <span className="word-expected">{item.expected}</span>
                                            <span className="word-spoken">You said: "{item.spoken}"</span>
                                        </div>
                                        <div className={`word-score ${item.score >= 60 ? 'pass' : 'fail'}`}>
                                            {item.score}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="results-actions">
                            <Button
                                variant="outline"
                                onClick={handleRetry}
                            >
                                <RotateCcw size={18} />
                                Try Again
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/assessments')}
                            >
                                <Home size={18} />
                                Back to Assessments
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PronunciationPage
