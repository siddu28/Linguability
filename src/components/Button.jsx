import './Button.css'

function Button({
    children,
    variant = 'primary',
    size = 'medium',
    icon: Icon,
    className = '',
    ...props
}) {
    return (
        <button
            className={`btn btn-${variant} btn-${size} ${className}`}
            {...props}
        >
            {Icon && <Icon size={18} />}
            {children}
        </button>
    )
}

export default Button
