import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { AVATAR_OPTIONS } from '../context/SoundContext'
import './AvatarSelector.css'

function AvatarSelector({ currentAvatar, onSelect, onClose }) {
    const [selected, setSelected] = useState(currentAvatar || 'default')

    const handleConfirm = () => {
        onSelect(selected)
        onClose()
    }

    return (
        <div className="avatar-selector-overlay" onClick={onClose}>
            <div className="avatar-selector-modal" onClick={e => e.stopPropagation()}>
                <div className="avatar-selector-header">
                    <h3>Choose Your Avatar</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="avatar-grid">
                    {AVATAR_OPTIONS.map(avatar => (
                        <button
                            key={avatar.id}
                            className={`avatar-option ${selected === avatar.id ? 'selected' : ''}`}
                            onClick={() => setSelected(avatar.id)}
                            title={avatar.label}
                        >
                            <span className="avatar-emoji">{avatar.emoji}</span>
                            <span className="avatar-label">{avatar.label}</span>
                            {selected === avatar.id && (
                                <div className="selected-check">
                                    <Check size={14} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="avatar-selector-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="confirm-btn" onClick={handleConfirm}>
                        Save Avatar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AvatarSelector
