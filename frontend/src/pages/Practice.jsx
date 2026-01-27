import { Mic, Volume2, RefreshCw } from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import './Practice.css'

function Practice() {
    const practiceTypes = [
        { id: 'pronunciation', icon: Mic, title: 'Pronunciation Practice', description: 'Practice speaking', color: '#E91E8C' },
        { id: 'listening', icon: Volume2, title: 'Listening Practice', description: 'Improve listening', color: '#3B82F6' },
        { id: 'vocabulary', icon: RefreshCw, title: 'Vocabulary Review', description: 'Review words', color: '#22C55E' },
    ]

    return (
        <div className="practice-page">
            <Navbar />
            <main className="practice-content">
                <h1 className="practice-title">Practice</h1>
                <p className="practice-subtitle">Choose a practice type</p>
                <div className="practice-grid">
                    {practiceTypes.map(({ id, icon: Icon, title, description, color }) => (
                        <Card key={id} className="practice-card">
                            <div className="practice-icon" style={{ backgroundColor: `${color}15` }}>
                                <Icon size={28} style={{ color }} />
                            </div>
                            <h2>{title}</h2>
                            <p>{description}</p>
                            <Button variant="outline">Start Practice</Button>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default Practice
