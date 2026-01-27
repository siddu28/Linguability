import './Toggle.css'

function Toggle({ label, description, checked, onChange, id }) {
    return (
        <div className="toggle-wrapper">
            <div className="toggle-content">
                <label htmlFor={id} className="toggle-label">{label}</label>
                {description && <p className="toggle-description">{description}</p>}
            </div>
            <label className="toggle">
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={onChange}
                />
                <span className="toggle-slider"></span>
            </label>
        </div>
    )
}

export default Toggle
