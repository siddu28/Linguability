import { ChevronDown } from 'lucide-react'
import './Select.css'

function Select({
    label,
    id,
    options = [],
    value,
    onChange,
    ...props
}) {
    return (
        <div className="select-wrapper">
            {label && <label htmlFor={id} className="select-label">{label}</label>}
            <div className="select-container">
                <select
                    id={id}
                    className="select"
                    value={value}
                    onChange={onChange}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown size={18} className="select-icon" />
            </div>
        </div>
    )
}

export default Select
