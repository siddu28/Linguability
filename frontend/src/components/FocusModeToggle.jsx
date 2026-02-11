import { Eye, EyeOff } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import './FocusModeToggle.css'

function FocusModeToggle() {
    const { settings, updateSetting } = useSettings()
    const isActive = settings.focusMode

    const toggle = () => {
        updateSetting('focusMode', !isActive)
    }

    return (
        <button
            className={`focus-mode-toggle ${isActive ? 'active' : ''}`}
            onClick={toggle}
            aria-label={isActive ? 'Disable Focus Mode' : 'Enable Focus Mode'}
            title={isActive ? 'Disable Focus Mode' : 'Enable Focus Mode'}
        >
            {isActive ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="focus-mode-label">Focus Mode</span>
            <span className={`focus-mode-switch ${isActive ? 'on' : ''}`}>
                <span className="focus-mode-knob" />
            </span>
        </button>
    )
}

export default FocusModeToggle
