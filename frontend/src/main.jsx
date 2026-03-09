import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import './styles/index.css'

// Initialize Sentry for error monitoring
Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
        Sentry.feedbackIntegration({
            colorScheme: 'system',
            isNameRequired: true,
            isEmailRequired: true,
            buttonLabel: 'Report a Bug',
            submitButtonLabel: 'Send Report',
            formTitle: 'Report an Issue',
            messagePlaceholder: 'Describe what went wrong or what you expected to happen...',
        }),
    ],
    // Performance monitoring - capture 100% of transactions in dev, lower in production
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    // Session replay - capture 10% of sessions, 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.PROD ? 'production' : 'development',
    // Send default PII data (e.g., automatic IP address collection)
    sendDefaultPii: true,
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
