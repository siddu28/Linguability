import './Input.css'

function Input({
    label,
    type = 'text',
    id,
    placeholder,
    value,
    onChange,
    error,
    ...props
}) {
    return (
        <div className="input-wrapper">
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <input
                type={type}
                id={id}
                className={`input ${error ? 'input-error' : ''}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...props}
            />
            {error && <span className="input-error-message">{error}</span>}
        </div>
    )
}

export default Input
