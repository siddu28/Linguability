import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import { ChevronRight, Mic, Headphones, BookOpen, Play } from "lucide-react";
import "./Practice.css";

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
        <div className="practice-page">
            <Navbar />

            <main className="practice-content">
                {!selectedLanguage ? (
                    <>
                        <div className="practice-header">
                            <h1 className="practice-title">Choose a Language</h1>
                            <p className="practice-subtitle">Select a language to start practicing</p>
                        </div>

                        <div className="languages-grid">
                            {languages.map((lang) => (
                                <Card
                                    key={lang.id}
                                    className="language-card"
                                    onClick={() => setSelectedLanguage(lang)}
                                >
                                    <div
                                        className="language-flag-badge"
                                        style={{ backgroundColor: lang.flagColor }}
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
                        <div className="practice-header">
                            <button
                                className="back-btn"
                                onClick={() => setSelectedLanguage(null)}
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

                                        <div className="practice-action">
                                            <Link
                                                to={`/practice/${practice.id}?lang=${selectedLanguage.id}`}
                                                className="start-practice-link"
                                            >
                                                <Button variant="primary" icon={Play} className="start-practice-btn">
                                                    Start Practice
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
