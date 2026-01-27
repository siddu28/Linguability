import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import Toggle from '../components/Toggle'
import Select from '../components/Select'
import './Settings.css'

function Settings() {
    const [activeTab, setActiveTab] = useState('accessibility')

    const [settings, setSettings] = useState({
        // Visual Settings
        theme: 'light',
        fontSize: 'medium',
        fontFamily: 'poppins',
        lineHeight: 'normal',
        letterSpacing: 'normal',

        // Reading Aids
        reduceMotion: false,
        focusMode: false,
        readingRuler: false,

        // Audio Settings
        textToSpeech: false,
        speechRate: 1,
    })

    const tabs = [
        { id: 'accessibility', label: 'Accessibility', icon: '⚙️' },
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'language', label: 'Language', icon: '🌐' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
    ]

    const themeOptions = [
        { value: 'light', label: 'Default (Light)' },
        { value: 'dark', label: 'Dark' },
        { value: 'high-contrast', label: 'High Contrast' },
    ]

    const fontSizeOptions = [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
        { value: 'xlarge', label: 'Extra Large' },
    ]

    const fontFamilyOptions = [
        { value: 'poppins', label: 'Default (Poppins)' },
        { value: 'opendyslexic', label: 'OpenDyslexic' },
        { value: 'arial', label: 'Arial' },
        { value: 'verdana', label: 'Verdana' },
    ]

    const lineHeightOptions = [
        { value: 'compact', label: 'Compact (1.2)' },
        { value: 'normal', label: 'Normal (1.5)' },
        { value: 'relaxed', label: 'Relaxed (1.8)' },
        { value: 'loose', label: 'Loose (2.0)' },
    ]

    const letterSpacingOptions = [
        { value: 'normal', label: 'Normal' },
        { value: 'wide', label: 'Wide' },
        { value: 'wider', label: 'Wider' },
    ]

    const handleSelectChange = (key) => (e) => {
        setSettings({ ...settings, [key]: e.target.value })
    }

    const handleToggleChange = (key) => () => {
        setSettings({ ...settings, [key]: !settings[key] })
    }

    const handleSliderChange = (e) => {
        setSettings({ ...settings, speechRate: parseFloat(e.target.value) })
    }

    const resetToDefault = () => {
        setSettings({
            theme: 'light',
            fontSize: 'medium',
            fontFamily: 'poppins',
            lineHeight: 'normal',
            letterSpacing: 'normal',
            reduceMotion: false,
            focusMode: false,
            readingRuler: false,
            textToSpeech: false,
            speechRate: 1,
        })
    }

    return (
        <div className="settings-page">
            <Navbar />

            <main className="settings-content">
                <div className="settings-header">
                    <div>
                        <h1 className="settings-title">Settings</h1>
                        <p className="settings-subtitle">Customize your learning experience</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="settings-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'accessibility' && (
                    <>
                        <div className="section-header-row">
                            <div>
                                <h2 className="section-title">Accessibility Settings</h2>
                                <p className="section-subtitle">Customize your learning experience</p>
                            </div>
                            <Button variant="secondary" icon={RotateCcw} onClick={resetToDefault}>
                                Reset to Default
                            </Button>
                        </div>

                        <div className="settings-grid">
                            {/* Visual Settings */}
                            <Card className="settings-card">
                                <h3 className="card-title">Visual Settings</h3>
                                <p className="card-subtitle">Adjust how content appears on screen</p>

                                <div className="settings-form">
                                    <Select
                                        label="Theme"
                                        id="theme"
                                        options={themeOptions}
                                        value={settings.theme}
                                        onChange={handleSelectChange('theme')}
                                    />

                                    <Select
                                        label="Font Size"
                                        id="fontSize"
                                        options={fontSizeOptions}
                                        value={settings.fontSize}
                                        onChange={handleSelectChange('fontSize')}
                                    />

                                    <Select
                                        label="Font Family"
                                        id="fontFamily"
                                        options={fontFamilyOptions}
                                        value={settings.fontFamily}
                                        onChange={handleSelectChange('fontFamily')}
                                    />

                                    <Select
                                        label="Line Height"
                                        id="lineHeight"
                                        options={lineHeightOptions}
                                        value={settings.lineHeight}
                                        onChange={handleSelectChange('lineHeight')}
                                    />

                                    <Select
                                        label="Letter Spacing"
                                        id="letterSpacing"
                                        options={letterSpacingOptions}
                                        value={settings.letterSpacing}
                                        onChange={handleSelectChange('letterSpacing')}
                                    />
                                </div>
                            </Card>

                            {/* Reading Aids */}
                            <Card className="settings-card">
                                <h3 className="card-title">Reading Aids</h3>
                                <p className="card-subtitle">Tools to help with reading and focus</p>

                                <div className="settings-toggles">
                                    <Toggle
                                        id="reduceMotion"
                                        label="Reduce Motion"
                                        description="Minimize animations"
                                        checked={settings.reduceMotion}
                                        onChange={handleToggleChange('reduceMotion')}
                                    />

                                    <Toggle
                                        id="focusMode"
                                        label="Focus Mode"
                                        description="Hide non-essential elements"
                                        checked={settings.focusMode}
                                        onChange={handleToggleChange('focusMode')}
                                    />

                                    <Toggle
                                        id="readingRuler"
                                        label="Reading Ruler"
                                        description="Highlight current line"
                                        checked={settings.readingRuler}
                                        onChange={handleToggleChange('readingRuler')}
                                    />
                                </div>
                            </Card>
                        </div>

                        {/* Audio Settings */}
                        <Card className="settings-card audio-card">
                            <h3 className="card-title">Audio Settings</h3>
                            <p className="card-subtitle">Text-to-speech and audio preferences</p>

                            <Toggle
                                id="textToSpeech"
                                label="Text-to-Speech"
                                description="Read content aloud"
                                checked={settings.textToSpeech}
                                onChange={handleToggleChange('textToSpeech')}
                            />

                            <div className="slider-wrapper">
                                <div className="slider-header">
                                    <label className="slider-label">Speech Rate</label>
                                    <span className="slider-value">{settings.speechRate}x</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.1"
                                    value={settings.speechRate}
                                    onChange={handleSliderChange}
                                    className="slider"
                                />
                                <div className="slider-labels">
                                    <span>Slower (0.5x)</span>
                                    <span>Normal (1x)</span>
                                    <span>Faster (2x)</span>
                                </div>
                            </div>
                        </Card>
                    </>
                )}

                {activeTab === 'profile' && (
                    <Card className="placeholder-card">
                        <h3>Profile Settings</h3>
                        <p>Profile settings will be available here.</p>
                    </Card>
                )}

                {activeTab === 'language' && (
                    <Card className="placeholder-card">
                        <h3>Language Settings</h3>
                        <p>Language preferences will be available here.</p>
                    </Card>
                )}

                {activeTab === 'notifications' && (
                    <Card className="placeholder-card">
                        <h3>Notification Settings</h3>
                        <p>Notification preferences will be available here.</p>
                    </Card>
                )}
            </main>
        </div>
    )
}

export default Settings
