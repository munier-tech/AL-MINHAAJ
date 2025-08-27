import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { connectDb } from "./lib/connectdb.js"
import AuthRouter from "./routes/authRoute.js"
import TeacherRouter from "./routes/teacherRoute.js"
import StudentsRouter from "./routes/studentsRoute.js"
import attendanceRouter from "./routes/attendanceRoute.js"
import classRouter from "./routes/classRoute.js"
import healthRouter from "./routes/healthRouter.js"
import examRouter from "./routes/examRouter.js"
import subjectsRouter from "./routes/subjectsRoute.js"
import disciplineRouter from "./routes/disciplineRoute.js"
import teachersAttendanceRouter from "./routes/teachersAttendanceRoute.js"
import financeRouter from "./routes/financeRoute.js"
import feeRouter from "./routes/feeRoute.js"
import familyFeeRouter from "./routes/familyFeeRoute.js"
import salaryRouter from "./routes/salaryRoute.js"
import halaqaRouter from "./routes/halaqaRoute.js"
import lessonRecordRouter from "./routes/lessonRecordRoute.js"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"

dotenv.config()
const app = express()

// Basic CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

// Simple test endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'AL-MINHAAJ API is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL || false,
    mongoUri: process.env.MONGO_URI ? 'configured' : 'missing'
  })
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL || false,
    database: dbStatus,
    mongoUri: process.env.MONGO_URI ? 'configured' : 'missing'
  })
})

// Routes
app.use("/api/auth", AuthRouter)
app.use("/api/teachers", TeacherRouter)
app.use("/api/students", StudentsRouter)
app.use("/api/classes", classRouter)
app.use("/api/attendance", attendanceRouter)
app.use("/api/health", healthRouter)
app.use("/api/exams", examRouter)
app.use("/api/subjects", subjectsRouter)
app.use("/api/teachersAttendance", teachersAttendanceRouter)
app.use("/api/discipline", disciplineRouter)
app.use("/api/finance", financeRouter)
app.use("/api/fees", feeRouter)
app.use("/api/family-fees", familyFeeRouter)
app.use("/api/salaries", salaryRouter)
app.use("/api/halaqas", halaqaRouter)
app.use("/api/lesson-records", lessonRecordRouter)

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Something went wrong',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  })
})

// Try to connect to database but don't crash if it fails
if (process.env.MONGO_URI) {
  connectDb().then(() => {
    console.log("✅ MongoDB connected successfully")
  }).catch(err => {
    console.error("❌ MongoDB connection failed:", err.message)
    console.log("⚠️  Continuing without database connection...")
  })
} else {
  console.log("⚠️  No MONGO_URI found - skipping database connection")
}

// Only start server in development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
  })
} else {
  console.log("🌐 Running in Vercel serverless mode")
}

// Export for Vercel serverless
export default app