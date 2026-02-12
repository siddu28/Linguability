import { RotateCcw } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import Toggle from '../components/Toggle'
import './Settings.css'

function Settings() {
    const { settings, updateSetting, resetSettings, loading } = useSettings()

    const handleToggle = (key) => () => {
        updateSetting(key, !settings[key])
    }

    const handleOptionSelect = (key, value) => {
        updateSetting(key, value)
    }

    if (loading) {
        return (
            <div className="settings-page">
                <Navbar />
                <main className="settings-content">
                    <div className="loading-message">Loading settings...</div>
                </main>
            </div>
        )
    }

    return (
        <div className="settings-page">
            <Navbar />

            <main className="settings-content">
                <div className="settings-header">
                    <div>
                        <h1 className="settings-title">Accessibility Settings</h1>
                        <p className="settings-subtitle">Customize your learning experience</p>
                    </div>
                    <Button variant="secondary" icon={RotateCcw} onClick={resetSettings}>
                        Reset to Default
                    </Button>
                </div>

                <div className="settings-grid">
                    {/* Visual Settings */}
                    <Card className="settings-card">
                        <h3 className="card-title">👁️ Visual Settings</h3>
                        <p className="card-subtitle">Adjust how content appears on screen</p>

                        <div className="settings-form">
                            {/* Text Size */}
                            <div className="setting-group">
                                <label className="setting-label">Text Size</label>
                                <div className="option-buttons">
                                    {[
                                        { id: 'small', label: 'Small' },
                                        { id: 'medium', label: 'Medium' },
                                        { id: 'large', label: 'Large' },
                                        { id: 'extra-large', label: 'XL' }
                                    ].map(option => (
                                        <button
                                            key={option.id}
                                            className={`option-btn ${settings.textSize === option.id ? 'active' : ''}`}
                                            onClick={() => handleOptionSelect('textSize', option.id)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font Family */}
                            <div className="setting-group">
                                <label className="setting-label">Font Style</label>
                                <div className="option-buttons">
                                    {[
                                        { id: 'system', label: 'Default' },
                                        { id: 'opendyslexic', label: 'Easy Read' },
                                        { id: 'serif', label: 'Serif' }
                                    ].map(option => (
                                        <button
                                            key={option.id}
                                            className={`option-btn ${settings.fontFamily === option.id ? 'active' : ''}`}
                                            onClick={() => handleOptionSelect('fontFamily', option.id)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Reading Settings */}
                    <Card className="settings-card">
                        <h3 className="card-title">📖 Reading Settings</h3>
                        <p className="card-subtitle">Customize text spacing and layout</p>

                        <div className="settings-form">
                            {/* Line Spacing */}
                            <div className="setting-group">
                                <label className="setting-label">Line Spacing</label>
                                <div className="option-buttons">
                                    {[
                                        { id: 'compact', label: 'Compact' },
                                        { id: 'normal', label: 'Normal' },
                                        { id: 'relaxed', label: 'Relaxed' },
                                        { id: 'spacious', label: 'Spacious' }
                                    ].map(option => (
                                        <button
                                            key={option.id}
                                            className={`option-btn ${settings.lineSpacing === option.id ? 'active' : ''}`}
                                            onClick={() => handleOptionSelect('lineSpacing', option.id)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Letter Spacing */}
                            <div className="setting-group">
                                <label className="setting-label">Letter Spacing</label>
                                <div className="option-buttons">
                                    {[
                                        { id: 'tight', label: 'Tight' },
                                        { id: 'normal', label: 'Normal' },
                                        { id: 'wide', label: 'Wide' },
                                        { id: 'extra-wide', label: 'Extra' }
                                    ].map(option => (
                                        <button
                                            key={option.id}
                                            className={`option-btn ${settings.letterSpacing === option.id ? 'active' : ''}`}
                                            onClick={() => handleOptionSelect('letterSpacing', option.id)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Toggles Row */}
                <div className="settings-grid">
                    <Card className="settings-card">
                        <h3 className="card-title">🎯 Focus & Display</h3>
                        <p className="card-subtitle">Reduce distractions and enhance visibility</p>

                        <div className="settings-toggles">
                            <Toggle
                                id="focusMode"
                                label="Focus Mode"
                                description="Reduce visual distractions"
                                checked={settings.focusMode}
                                onChange={handleToggle('focusMode')}
                            />

                            <Toggle
                                id="highContrast"
                                label="High Contrast"
                                description="Sharper text visibility"
                                checked={settings.highContrast}
                                onChange={handleToggle('highContrast')}
                            />

                            <Toggle
                                id="screenReaderFriendly"
                                label="Screen Reader Mode"
                                description="Optimized for assistive technology"
                                checked={settings.screenReaderFriendly}
                                onChange={handleToggle('screenReaderFriendly')}
                            />
                        </div>
                    </Card>

                    {/* Audio Settings */}
                    <Card className="settings-card">
                        <h3 className="card-title">🔊 Audio & Voice</h3>
                        <p className="card-subtitle">Text-to-speech preferences</p>

                        <div className="settings-toggles">
                            <Toggle
                                id="textToSpeech"
                                label="Text-to-Speech"
                                description="Read content aloud"
                                checked={settings.textToSpeech}
                                onChange={handleToggle('textToSpeech')}
                            />
                        </div>

                        <div className="setting-group" style={{ marginTop: '1rem' }}>
                            <label className="setting-label">Reading Speed</label>
                            <div className="option-buttons">
                                {[
                                    { id: 'very-slow', label: '0.5x' },
                                    { id: 'slow', label: '0.75x' },
                                    { id: 'normal', label: '1x' },
                                    { id: 'fast', label: '1.25x' },
                                    { id: 'very-fast', label: '1.5x' }
                                ].map(option => (
                                    <button
                                        key={option.id}
                                        className={`option-btn ${settings.readingSpeed === option.id ? 'active' : ''}`}
                                        onClick={() => handleOptionSelect('readingSpeed', option.id)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}

export default Settings
