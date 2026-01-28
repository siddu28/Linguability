const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Import routes
const lessonsRouter = require('./routes/lessons')

// Routes
app.use('/api/lessons', lessonsRouter)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Linguability API is running' })
})

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Linguability Backend running on http://localhost:${PORT}`)
})
