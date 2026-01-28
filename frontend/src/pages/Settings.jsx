import { useState, useEffect, useCallback } from 'react'
import { RotateCcw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserSettings, upsertUserSettings, getProfile, updateProfile } from '../lib/database'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import Toggle from '../components/Toggle'
import Select from '../components/Select'
import './Settings.css'

function Settings() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('accessibility')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const defaultSettings = {
        theme: 'light',
        font_size: 'medium',
        font_family: 'poppins',
        line_height: 'normal',
        letter_spacing: 'normal',
        reduce_motion: false,
        focus_mode: false,
        reading_ruler: false,
        text_to_speech: false,
        speech_rate: 1,
    }

    const [settings, setSettings] = useState(defaultSettings)
    const [learningChallenges, setLearningChallenges] = useState([])

    // Load settings from Supabase
    useEffect(() => {
        async function loadSettings() {
            if (!user?.id) return
            setLoading(true)

            try {
                // Load user settings
                const savedSettings = await getUserSettings(user.id)
                if (savedSettings) {
                    setSettings({
                        theme: savedSettings.theme || 'light',
                        font_size: savedSettings.font_size || 'medium',
                        font_family: savedSettings.font_family || 'poppins',
                        line_height: savedSettings.line_height || 'normal',
                        letter_spacing: savedSettings.letter_spacing || 'normal',
                        reduce_motion: savedSettings.reduce_motion || false,
                        focus_mode: savedSettings.focus_mode || false,
                        reading_ruler: savedSettings.reading_ruler || false,
                        text_to_speech: savedSettings.text_to_speech || false,
                        speech_rate: savedSettings.speech_rate || 1,
                    })
                }

                // Load learning challenges from profile
                const profile = await getProfile(user.id)
                if (profile?.learning_challenges) {
                    setLearningChallenges(profile.learning_challenges)
                }
            } catch (err) {
                console.error('Error loading settings:', err)
            } finally {
                setLoading(false)
            }
        }
        loadSettings()
    }, [user])

    // Save settings to Supabase (debounced)
    const saveSettings = useCallback(async (newSettings) => {
        if (!user?.id) return
        setSaving(true)
        try {
            await upsertUserSettings(user.id, newSettings)
        } catch (err) {
            console.error('Error saving settings:', err)
        } finally {
            setSaving(false)
        }
    }, [user])

    const handleSelectChange = (key) => (e) => {
        const newSettings = { ...settings, [key]: e.target.value }
        setSettings(newSettings)
        saveSettings(newSettings)
    }

    const handleToggleChange = (key) => () => {
        const newSettings = { ...settings, [key]: !settings[key] }
        setSettings(newSettings)
        saveSettings(newSettings)
    }

    const handleSliderChange = (e) => {
        const newSettings = { ...settings, speech_rate: parseFloat(e.target.value) }
        setSettings(newSettings)
        saveSettings(newSettings)
    }

    const resetToDefault = async () => {
        setSettings(defaultSettings)
        await saveSettings(defaultSettings)
    }

    // Save learning challenges to profile
    const handleChallengeToggle = async (challengeId) => {
        if (!user?.id) return

        const newChallenges = learningChallenges.includes(challengeId)
            ? learningChallenges.filter(id => id !== challengeId)
            : [...learningChallenges, challengeId]

        setLearningChallenges(newChallenges)

        try {
            await updateProfile(user.id, { learning_challenges: newChallenges })
        } catch (err) {
            console.error('Error saving challenges:', err)
        }
    }

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

    const challengeOptions = [
        { id: 'dyslexia', label: 'Dyslexia', description: 'Difficulty with reading, spelling, or writing' },
        { id: 'adhd', label: 'ADHD', description: 'Attention and focus challenges' },
        { id: 'auditory', label: 'Auditory Processing', description: 'Difficulty processing spoken information' },
        { id: 'visual', label: 'Visual Processing', description: 'Difficulty processing visual information' },
        { id: 'motor', label: 'Motor Difficulties', description: 'Challenges with fine motor skills' },
        { id: 'memory', label: 'Memory Challenges', description: 'Difficulty retaining information' },
    ]

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
                                        value={settings.font_size}
                                        onChange={handleSelectChange('font_size')}
                                    />

                                    <Select
                                        label="Font Family"
                                        id="fontFamily"
                                        options={fontFamilyOptions}
                                        value={settings.font_family}
                                        onChange={handleSelectChange('font_family')}
                                    />

                                    <Select
                                        label="Line Height"
                                        id="lineHeight"
                                        options={lineHeightOptions}
                                        value={settings.line_height}
                                        onChange={handleSelectChange('line_height')}
                                    />

                                    <Select
                                        label="Letter Spacing"
                                        id="letterSpacing"
                                        options={letterSpacingOptions}
                                        value={settings.letter_spacing}
                                        onChange={handleSelectChange('letter_spacing')}
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
                                        checked={settings.reduce_motion}
                                        onChange={handleToggleChange('reduce_motion')}
                                    />

                                    <Toggle
                                        id="focusMode"
                                        label="Focus Mode"
                                        description="Hide non-essential elements"
                                        checked={settings.focus_mode}
                                        onChange={handleToggleChange('focus_mode')}
                                    />

                                    <Toggle
                                        id="readingRuler"
                                        label="Reading Ruler"
                                        description="Highlight current line"
                                        checked={settings.reading_ruler}
                                        onChange={handleToggleChange('reading_ruler')}
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
                                checked={settings.text_to_speech}
                                onChange={handleToggleChange('text_to_speech')}
                            />

                            <div className="slider-wrapper">
                                <div className="slider-header">
                                    <label className="slider-label">Speech Rate</label>
                                    <span className="slider-value">{settings.speech_rate}x</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.1"
                                    value={settings.speech_rate}
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
                    <>
                        <div className="section-header-row">
                            <div>
                                <h2 className="section-title">Profile Settings</h2>
                                <p className="section-subtitle">Manage your account and learning preferences</p>
                            </div>
                        </div>

                        <div className="settings-grid">
                            {/* Learning Challenges */}
                            <Card className="settings-card challenges-card">
                                <h3 className="card-title">Learning Challenges</h3>
                                <p className="card-subtitle">
                                    Select any challenges you'd like support with.
                                    We'll suggest helpful accessibility features.
                                </p>

                                <div className="profile-challenges-list">
                                    {challengeOptions.map((challenge) => {
                                        const isChecked = learningChallenges.includes(challenge.id)
                                        return (
                                            <label key={challenge.id} className={`profile-challenge-item ${isChecked ? 'selected' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleChallengeToggle(challenge.id)}
                                                    className="profile-challenge-checkbox"
                                                />
                                                <div className="profile-challenge-content">
                                                    <span className="profile-challenge-label">{challenge.label}</span>
                                                    <span className="profile-challenge-description">{challenge.description}</span>
                                                </div>
                                            </label>
                                        )
                                    })}
                                </div>
                            </Card>

                            {/* Account Info Placeholder */}
                            <Card className="settings-card">
                                <h3 className="card-title">Account Information</h3>
                                <p className="card-subtitle">Your account details</p>
                                <div className="account-info">
                                    <div className="info-row">
                                        <span className="info-label">Email</span>
                                        <span className="info-value">{user?.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Member since</span>
                                        <span className="info-value">January 2026</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </>
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
