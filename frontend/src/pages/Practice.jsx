import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllPracticeProgress } from "../lib/database";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import FocusModeToggle from '../components/FocusModeToggle';
import { useSettings } from '../context/SettingsContext';
import {
    ChevronRight, Mic, Headphones, BookOpen, Play,
    CheckCircle2, TrendingUp, Clock, Flame, Activity, BookMarked
} from "lucide-react";
import "./Practice.css";

export default function Practice() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [practiceProgress, setPracticeProgress] = useState([]);
    const { settings } = useSettings();
    const { user } = useAuth();

    const languages = [
        { id: 'english', name: 'English', flag: 'EN', flagColor: '#3B82F6', desc: 'Standard Practice' },
        { id: 'hindi', name: 'Hindi', flag: 'हि', flagColor: '#FF9933', desc: 'अभ्यास' },
        { id: 'tamil', name: 'Tamil', flag: 'த', flagColor: '#E91E8C', desc: 'பயிற்சி' },
        { id: 'telugu', name: 'Telugu', flag: 'తె', flagColor: '#10B981', desc: 'సాధన' }
    ];

    // Initialize state from URL params
    useEffect(() => {
        const langId = searchParams.get("lang");
        if (langId) {
            const lang = languages.find(l => l.id === langId);
            if (lang) {
                setSelectedLanguage(lang);
            }
        } else {
            setSelectedLanguage(null);
        }
    }, [searchParams]);

    // Load practice progress from Supabase
    useEffect(() => {
        async function loadProgress() {
            if (!user?.id) return;
            const data = await getAllPracticeProgress(user.id);
            setPracticeProgress(data || []);
        }
        loadProgress();
    }, [user?.id]);

    const handleLanguageSelect = (lang) => {
        setSearchParams({ lang: lang.id });
    };

    const handleBackToLanguages = () => {
        setSearchParams({});
    };

    const practiceTypes = [
        {
            id: 'pronunciation',
            title: 'Pronunciation',
            icon: Mic,
            desc: 'Perfect your accent with real-time feedback',
            color: '#E91E8C'
        },
        {
            id: 'listening',
            title: 'Listening',
            icon: Headphones,
            desc: 'Train your ears with diverse audio clips',
            color: '#3B82F6'
        },
        {
            id: 'vocabulary',
            title: 'Vocabulary',
            icon: BookOpen,
            desc: 'Expand your word bank with flashcards',
            color: '#10B981'
        }
    ];

    // ============ COMPUTED STATS ============
    const totalPracticed = practiceProgress.length;
    const totalCompleted = practiceProgress.filter(p => (p.completed_count || 0) > 0).length;
    const totalScore = practiceProgress.reduce((sum, p) => sum + (p.score || 0), 0);
    const totalItems = practiceProgress.reduce((sum, p) => sum + (p.completed_count || 0), 0);
    // Estimate time: ~2 min per practice session
    const totalMinutes = totalPracticed * 2 + totalItems;
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMins = totalMinutes % 60;

    // Get progress for a specific language + practice type
    const getPracticeTypeProgress = (langId, practiceType) => {
        const entry = practiceProgress.find(
            p => p.language === langId && p.practice_type === practiceType
        );
        return entry || null;
    };

    // Recent activity: most recent 3 practice sessions
    const recentActivity = practiceProgress
        .slice(0, 3)
        .map(p => {
            const langObj = languages.find(l => l.id === p.language);
            const typeObj = practiceTypes.find(t => t.id === p.practice_type);
            return {
                id: `${p.language}_${p.practice_type}`,
                language: langObj?.name || p.language,
                flag: langObj?.flag || '?',
                flagColor: langObj?.flagColor || '#666',
                type: typeObj?.title || p.practice_type,
                icon: typeObj?.icon || BookOpen,
                color: typeObj?.color || '#666',
                score: p.score || 0,
                completedCount: p.completed_count || 0,
                currentIndex: p.current_index || 0
            };
        });

    // Find recommended next practice
    const getNextPractice = () => {
        // First: find most recent in-progress
        if (practiceProgress.length > 0) {
            const recent = practiceProgress[0]; // Already ordered by updated_at DESC
            const langObj = languages.find(l => l.id === recent.language);
            const typeObj = practiceTypes.find(t => t.id === recent.practice_type);
            if (langObj && typeObj) {
                return {
                    language: langObj,
                    type: typeObj,
                    currentIndex: recent.current_index || 0,
                    completedCount: recent.completed_count || 0
                };
            }
        }
        return null;
    };
    const nextPractice = getNextPractice();

    // Per-language stats
    const getLanguageStats = (langId) => {
        const langProgress = practiceProgress.filter(p => p.language === langId);
        const practiced = langProgress.length;
        const items = langProgress.reduce((sum, p) => sum + (p.completed_count || 0), 0);
        return { practiced, items };
    };

    return (
        <div className={`practice-page ${settings.focusMode ? 'focus-mode-active' : ''}`}>
            <Navbar />
            <FocusModeToggle />
            <main className="practice-content">
                {!selectedLanguage ? (
                    <>
                        {/* Practice Stats Banner */}
                        <div className="practice-stats-banner">
                            <div className="practice-stat-card">
                                <div className="practice-stat-icon completed-icon">
                                    <CheckCircle2 size={22} />
                                </div>
                                <div className="practice-stat-info">
                                    <span className="practice-stat-value">{totalItems}</span>
                                    <span className="practice-stat-label">Items Practiced</span>
                                </div>
                            </div>
                            <div className="practice-stat-card">
                                <div className="practice-stat-icon progress-icon">
                                    <TrendingUp size={22} />
                                </div>
                                <div className="practice-stat-info">
                                    <span className="practice-stat-value">{totalScore}</span>
                                    <span className="practice-stat-label">Total Score</span>
                                </div>
                            </div>
                            <div className="practice-stat-card">
                                <div className="practice-stat-icon time-icon">
                                    <Clock size={22} />
                                </div>
                                <div className="practice-stat-info">
                                    <span className="practice-stat-value">
                                        {totalHours > 0 ? `${totalHours}h ${remainingMins}m` : `${remainingMins}m`}
                                    </span>
                                    <span className="practice-stat-label">Time Spent</span>
                                </div>
                            </div>
                            <div className="practice-stat-card">
                                <div className="practice-stat-icon streak-icon">
                                    <Flame size={22} />
                                </div>
                                <div className="practice-stat-info">
                                    <span className="practice-stat-value">{totalPracticed}</span>
                                    <span className="practice-stat-label">Sessions</span>
                                </div>
                            </div>
                        </div>

                        {/* Continue Where You Left Off */}
                        {nextPractice && (
                            <Link
                                to={`/practice/${nextPractice.type.id}?lang=${nextPractice.language.id}`}
                                className="practice-next-banner"
                            >
                                <div className="practice-next-left">
                                    <BookMarked size={20} />
                                    <div>
                                        <span className="practice-next-label">Continue where you left off</span>
                                        <span className="practice-next-title">
                                            {nextPractice.language.flag} {nextPractice.language.name} — {nextPractice.type.title}
                                        </span>
                                    </div>
                                </div>
                                <div className="practice-next-right">
                                    {nextPractice.completedCount > 0 && (
                                        <span className="practice-next-progress">
                                            {nextPractice.completedCount} done
                                        </span>
                                    )}
                                    <ChevronRight size={20} />
                                </div>
                            </Link>
                        )}

                        <div className="practice-header">
                            <h1 className="practice-title">Choose a Language</h1>
                            <p className="practice-subtitle">Select a language to start practicing</p>
                        </div>

                        <div className="languages-grid">
                            {languages.map((lang) => {
                                const stats = getLanguageStats(lang.id);
                                return (
                                    <Card
                                        key={lang.id}
                                        className="language-card"
                                        onClick={() => handleLanguageSelect(lang)}
                                    >
                                        <div
                                            className="language-flag-badge"
                                            style={{ backgroundColor: lang.flagColor }}
                                        >
                                            {lang.flag}
                                        </div>
                                        <h3 className="language-name">{lang.name}</h3>
                                        <p className="language-info">{lang.desc}</p>
                                        {stats.items > 0 && (
                                            <span className="language-practice-badge">
                                                {stats.items} items practiced
                                            </span>
                                        )}
                                        <Button variant="primary" className="start-language-btn">
                                            {stats.practiced > 0 ? 'Continue' : 'Select'} <ChevronRight size={18} />
                                        </Button>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Recent Activity Feed */}
                        {recentActivity.length > 0 && (
                            <div className="practice-activity-section">
                                <div className="practice-activity-header">
                                    <Activity size={20} />
                                    <h3>Recent Activity</h3>
                                </div>
                                <div className="practice-activity-list">
                                    {recentActivity.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.id} className="practice-activity-item">
                                                <div
                                                    className="practice-activity-icon"
                                                    style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)` }}
                                                >
                                                    <Icon size={18} />
                                                </div>
                                                <div className="practice-activity-details">
                                                    <span className="practice-activity-title">{item.type}</span>
                                                    <span className="practice-activity-meta">
                                                        {item.language} • {item.completedCount} items done
                                                    </span>
                                                </div>
                                                {item.score > 0 && (
                                                    <span className="practice-activity-badge">
                                                        Score: {item.score}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="practice-header">
                            <button
                                className="back-btn"
                                onClick={handleBackToLanguages}
                            >
                                ← Back to Languages
                            </button>
                            <div className="header-content">
                                <div
                                    className="selected-flag-badge"
                                    style={{ backgroundColor: selectedLanguage.flagColor }}
                                >
                                    {selectedLanguage.flag}
                                </div>
                                <div>
                                    <h1 className="practice-title">{selectedLanguage.name} Practice</h1>
                                    <p className="practice-subtitle">Master your skills with focused exercises</p>
                                </div>
                            </div>
                        </div>

                        <div className="practice-grid">
                            {practiceTypes.map((practice) => {
                                const Icon = practice.icon;
                                const progress = getPracticeTypeProgress(selectedLanguage.id, practice.id);
                                const completedCount = progress?.completed_count || 0;
                                const currentIndex = progress?.current_index || 0;
                                const score = progress?.score || 0;
                                return (
                                    <Card key={practice.id} className="practice-section">
                                        <div className="section-header">
                                            <div
                                                className="section-icon"
                                                style={{ background: `linear-gradient(135deg, ${practice.color}, ${practice.color}cc)` }}
                                            >
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <h2 className="section-title">{practice.title}</h2>
                                                <p className="section-description">{practice.desc}</p>
                                            </div>
                                        </div>

                                        {/* Per-Practice Progress */}
                                        {completedCount > 0 && (
                                            <div className="practice-type-progress">
                                                <div className="practice-type-stats">
                                                    <span className="practice-type-stat">
                                                        <CheckCircle2 size={14} />
                                                        {completedCount} done
                                                    </span>
                                                    {score > 0 && (
                                                        <span className="practice-type-stat score">
                                                            <TrendingUp size={14} />
                                                            Score: {score}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="practice-type-bar">
                                                    <div
                                                        className="practice-type-fill"
                                                        style={{
                                                            width: `${Math.min((completedCount / 20) * 100, 100)}%`,
                                                            background: `linear-gradient(90deg, ${practice.color}, ${practice.color}cc)`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="practice-action">
                                            <Link
                                                to={`/practice/${practice.id}?lang=${selectedLanguage.id}`}
                                                className="start-practice-link"
                                            >
                                                <Button variant="primary" icon={Play} className="start-practice-btn">
                                                    {completedCount > 0 ? 'Continue' : 'Start Practice'}
                                                </Button>
                                            </Link>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
