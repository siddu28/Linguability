import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import { ChevronRight, Mic, Headphones, BookOpen, Play } from "lucide-react";
import "./Lessons.css";  // Using Lessons CSS for consistent styling

export default function Practice() {
    const [selectedLanguage, setSelectedLanguage] = useState(null);

    const languages = [
        { id: 'english', name: 'English', flag: 'EN', flagColor: '#3B82F6', desc: 'Standard Practice' },
        { id: 'hindi', name: 'Hindi', flag: 'हि', flagColor: '#FF9933', desc: 'अभ्यास' },
        { id: 'tamil', name: 'Tamil', flag: 'த', flagColor: '#E91E8C', desc: 'பயிற்சி' },
        { id: 'telugu', name: 'Telugu', flag: 'తె', flagColor: '#10B981', desc: 'సాధన' }
    ];

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

    return (
        <div className="lessons-page">
            <Navbar />

            <main className="lessons-content">
                {!selectedLanguage ? (
                    <>
                        <div className="lessons-header">
                            <h1 className="lessons-title">Choose a Language</h1>
                            <p className="lessons-subtitle">Select a language to start practicing</p>
                        </div>

                        <div className="languages-grid">
                            {languages.map((lang) => (
                                <Card
                                    key={lang.id}
                                    className="language-card"
                                    onClick={() => setSelectedLanguage(lang)}
                                >
                                    <div
                                        className="language-flag"
                                        style={{
                                            backgroundColor: lang.flagColor,
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            color: 'white',
                                            marginBottom: '12px'
                                        }}
                                    >
                                        {lang.flag}
                                    </div>
                                    <h3 className="language-name">{lang.name}</h3>
                                    <p className="language-info">{lang.desc}</p>
                                    <Button variant="primary" className="start-language-btn">
                                        Select <ChevronRight size={18} />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="lessons-header">
                            <button
                                className="back-btn"
                                onClick={() => setSelectedLanguage(null)}
                            >
                                ← Back to Languages
                            </button>
                            <div className="header-content">
                                <div
                                    className="selected-flag"
                                    style={{
                                        backgroundColor: selectedLanguage.flagColor,
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: 'white'
                                    }}
                                >
                                    {selectedLanguage.flag}
                                </div>
                                <div>
                                    <h1 className="lessons-title">{selectedLanguage.name} Practice</h1>
                                    <p className="lessons-subtitle">Master your skills with focused exercises</p>
                                </div>
                            </div>
                        </div>

                        <div className="sections-container">
                            {practiceTypes.map((practice) => {
                                const Icon = practice.icon;
                                return (
                                    <div key={practice.id} className="lesson-section">
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

                                        <div style={{ marginTop: '16px' }}>
                                            <Link
                                                to={`/practice/${practice.id}?lang=${selectedLanguage.id}`}
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <Button variant="primary" icon={Play}>
                                                    Start Practice
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
