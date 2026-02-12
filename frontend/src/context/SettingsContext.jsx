import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { getUserSettings, upsertUserSettings } from '../lib/database'

const SettingsContext = createContext(undefined)

// Default settings matching onboarding structure
const defaultSettings = {
    focusMode: false,
    textSize: 'medium', // small, medium, large, extra-large
    fontFamily: 'system', // system, opendyslexic, serif
    lineSpacing: 'normal', // compact, normal, relaxed, spacious
    letterSpacing: 'normal', // tight, normal, wide, extra-wide
    highContrast: false,
    readingSpeed: 'normal', // slow, normal, fast, very-fast
    screenReaderFriendly: false,
    textToSpeech: false
}

// CSS value mappings
const textSizeMap = { 'small': '0.875rem', 'medium': '1rem', 'large': '1.25rem', 'extra-large': '1.5rem' }
const lineSpacingMap = { 'compact': '1.4', 'normal': '1.6', 'relaxed': '1.8', 'spacious': '2.2' }
const letterSpacingMap = { 'tight': '-0.025em', 'normal': '0', 'wide': '0.05em', 'extra-wide': '0.1em' }
const fontFamilyMap = {
    'system': '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
    'opendyslexic': '"OpenDyslexic", "Comic Sans MS", sans-serif',
    'serif': 'Georgia, "Times New Roman", serif'
}
const readingSpeedMap = { 'very-slow': 0.5, 'slow': 0.75, 'normal': 1, 'fast': 1.25, 'very-fast': 1.5 }

// Map database fields to state fields
function mapDbToState(dbSettings) {
    if (!dbSettings) return defaultSettings
    return {
        focusMode: dbSettings.focus_mode ?? false,
        textSize: dbSettings.font_size ?? 'medium',
        fontFamily: dbSettings.font_family ?? 'system',
        lineSpacing: dbSettings.line_spacing ?? 'normal',
        letterSpacing: dbSettings.letter_spacing ?? 'normal',
        highContrast: dbSettings.high_contrast ?? false,
        readingSpeed: dbSettings.reading_speed ?? 'normal',
        screenReaderFriendly: dbSettings.screen_reader_friendly ?? false,
        textToSpeech: dbSettings.text_to_speech ?? false
    }
}

// Map state fields to database fields
function mapStateToDb(stateSettings) {
    return {
        focus_mode: stateSettings.focusMode,
        font_size: stateSettings.textSize,
        font_family: stateSettings.fontFamily,
        line_spacing: stateSettings.lineSpacing,
        letter_spacing: stateSettings.letterSpacing,
        high_contrast: stateSettings.highContrast,
        reading_speed: stateSettings.readingSpeed,
        screen_reader_friendly: stateSettings.screenReaderFriendly,
        text_to_speech: stateSettings.textToSpeech
    }
}

export function SettingsProvider({ children }) {
    const { user } = useAuth()
    const [settings, setSettings] = useState(defaultSettings)
    const [loading, setLoading] = useState(true)
    
    // Use ref to always have access to current settings in callbacks (avoid stale closures)
    const settingsRef = useRef(settings)
    useEffect(() => {
        settingsRef.current = settings
    }, [settings])

    // Load settings from database only when user ID changes (login/logout)
    // Using user?.id as dependency prevents reload when user metadata changes
    const userId = user?.id
    useEffect(() => {
        async function loadSettings() {
            if (!userId) {
                setSettings(defaultSettings)
                setLoading(false)
                return
            }

            try {
                const dbSettings = await getUserSettings(userId)
                setSettings(mapDbToState(dbSettings))
            } catch (err) {
                console.error('Error loading settings:', err)
                setSettings(defaultSettings)
            } finally {
                setLoading(false)
            }
        }
        loadSettings()
    }, [userId])

    // Apply CSS custom properties when settings change
    useEffect(() => {
        const root = document.documentElement
        root.style.setProperty('--user-font-size', textSizeMap[settings.textSize] || '1rem')
        root.style.setProperty('--user-font-family', fontFamilyMap[settings.fontFamily] || fontFamilyMap.system)
        root.style.setProperty('--user-line-spacing', lineSpacingMap[settings.lineSpacing] || '1.6')
        root.style.setProperty('--user-letter-spacing', letterSpacingMap[settings.letterSpacing] || '0')

        // Apply global classes
        if (settings.highContrast) {
            document.body.classList.add('high-contrast')
        } else {
            document.body.classList.remove('high-contrast')
        }

        if (settings.focusMode) {
            document.body.classList.add('focus-mode')
        } else {
            document.body.classList.remove('focus-mode')
        }
    }, [settings])

    // Update a single setting
    const updateSetting = useCallback(async (key, value) => {
        const newSettings = { ...settingsRef.current, [key]: value }
        setSettings(newSettings)

        if (user?.id) {
            try {
                await upsertUserSettings(user.id, mapStateToDb(newSettings))
            } catch (err) {
                console.error('Error saving setting:', err)
            }
        }
    }, [user])

    // Update multiple settings at once
    const updateSettings = useCallback(async (newSettings) => {
        // Use ref to get current settings (avoids stale closure)
        const merged = { ...settingsRef.current, ...newSettings }
        setSettings(merged)

        if (user?.id) {
            try {
                await upsertUserSettings(user.id, mapStateToDb(merged))
            } catch (err) {
                console.error('Error saving settings to DB:', err)
                // State is still updated even if DB save fails
            }
        }
    }, [user])

    // Reset to defaults
    const resetSettings = useCallback(async () => {
        setSettings(defaultSettings)
        if (user?.id) {
            try {
                await upsertUserSettings(user.id, mapStateToDb(defaultSettings))
            } catch (err) {
                console.error('Error resetting settings:', err)
            }
        }
    }, [user])

    // Refresh settings from database (called after onboarding)
    const refreshSettings = useCallback(async () => {
        if (!user?.id) return
        try {
            const dbSettings = await getUserSettings(user.id)
            setSettings(mapDbToState(dbSettings))
        } catch (err) {
            console.error('Error refreshing settings:', err)
        }
    }, [user])

    // Get computed CSS values
    const getStyleValues = useCallback(() => ({
        fontSize: textSizeMap[settings.textSize] || '1rem',
        fontFamily: fontFamilyMap[settings.fontFamily] || fontFamilyMap.system,
        lineHeight: lineSpacingMap[settings.lineSpacing] || '1.6',
        letterSpacing: letterSpacingMap[settings.letterSpacing] || '0'
    }), [settings])

    // Get speech rate value
    const getSpeechRate = useCallback(() => {
        return readingSpeedMap[settings.readingSpeed] || 1
    }, [settings])

    const value = useMemo(() => ({
        settings,
        loading,
        updateSetting,
        updateSettings,
        resetSettings,
        refreshSettings,
        getStyleValues,
        getSpeechRate,
        defaultSettings
    }), [settings, loading, updateSetting, updateSettings, resetSettings, refreshSettings, getStyleValues, getSpeechRate])

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
    const ctx = useContext(SettingsContext)
    if (!ctx) throw new Error('useSettings must be used within a SettingsProvider')
    return ctx
}
