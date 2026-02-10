const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for development
        methods: ["GET", "POST"]
    }
})

const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Supabase client for persistence (optional, if needed by backend)
// We'll use this to save chat messages if we want backend-side persistence
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null

// Import routes
const lessonsRouter = require('./routes/lessons')

// Routes
app.use('/api/lessons', lessonsRouter)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Linguability API is running' })
})

// Socket.io Connection Handler
io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Join Room
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        console.log(`User ${userId} (${socket.id}) joined room ${roomId}`)
        socket.to(roomId).emit('user-connected', userId)
    })

    // WebRTC Signaling
    socket.on('call-user', (data) => {
        console.log(`Call from ${socket.id} to room ${data.roomId}`)
        socket.to(data.roomId).emit('call-made', {
            offer: data.offer,
            socket: socket.id,
            user: data.user // user ID of caller
        })
    })

    socket.on('make-answer', (data) => {
        console.log(`Answer from ${socket.id} to ${data.to}`)
        socket.to(data.to).emit('answer-made', {
            socket: socket.id,
            answer: data.answer
        })
    })

    socket.on('ice-candidate', (data) => {
        console.log(`ICE candidate from ${socket.id} to room ${data.roomId}`)
        socket.to(data.roomId).emit('ice-candidate-received', {
            candidate: data.candidate,
            socket: socket.id
        })
    })

    // Chat Messaging
    socket.on('send-message', async (data) => {
        const { roomId, userId, userName, content } = data
        console.log(`Message in ${roomId} from ${userName}: ${content}`)

        // Broadcast to everyone in the room including sender (for simplicity, or filter sender)
        io.in(roomId).emit('receive-message', {
            id: Date.now().toString(), // Temporary ID for client
            room_id: roomId,
            user_id: userId,
            user_name: userName,
            content: content,
            created_at: new Date().toISOString()
        })

        // Persist to Supabase if configured
        if (supabase) {
            try {
                const { error } = await supabase
                    .from('room_messages')
                    .insert({
                        room_id: roomId,
                        user_id: userId,
                        user_name: userName,
                        content: content
                    })

                if (error) console.error('Error saving message:', error)
            } catch (err) {
                console.error('Error persisting message:', err)
            }
        }
    })

    // Disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
        // Notify others in rooms they were in (socket.rooms is cleared on disconnect, difficult to track without custom map)
        // For simple WebRTC, the peer connection will detect closure eventually
    })
})

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Linguability Backend running on http://localhost:${PORT}`)
})
