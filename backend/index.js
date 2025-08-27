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
import cookieParser from "cookie-parser";

dotenv.config()
const app = express()

const PORT = process.env.PORT || 4000

// Configure CORS for different environments
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL, 'https://your-app-name.vercel.app'].filter(Boolean)
  : ['http://localhost:5173']

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests with no origin (e.g., curl, Postman)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}

app.use(cors(corsOptions));

app.use(express.json())
app.use(cookieParser()); // ✅ This makes req.cookies available
app.use(express.urlencoded({ extended: true }))

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API test endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'AL-MINHAAJ Management System API is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL || false,
    cors: {
      allowedOrigins: Array.isArray(corsOptions.origin) 
        ? corsOptions.origin.join(', ') 
        : corsOptions.origin,
      credentials: corsOptions.credentials
    }
  });
});

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL || false
  });
});

app.use("/api/auth", AuthRouter);
app.use("/api/teachers", TeacherRouter);
app.use("/api/students", StudentsRouter);
app.use("/api/classes", classRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/health", healthRouter);
app.use("/api/exams", examRouter);
app.use("/api/subjects", subjectsRouter);
app.use("/api/teachersAttendance", teachersAttendanceRouter);
app.use("/api/discipline", disciplineRouter);
app.use("/api/finance", financeRouter);
app.use("/api/fees", feeRouter);
app.use("/api/family-fees", familyFeeRouter);
app.use("/api/salaries", salaryRouter);
app.use("/api/halaqas", halaqaRouter);
app.use("/api/lesson-records", lessonRecordRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Connect to database immediately
connectDb().then(() => {
  console.log("Connected to MongoDB successfully");
}).catch(err => {
  console.error("Failed to connect to MongoDB:", err);
});

// Only start server if not in Vercel production environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Vercel: ${process.env.VERCEL || 'false'}`);
  });
} else {
  console.log('Running in Vercel serverless mode - no server startup needed');
}

// Export app for Vercel serverless
export default app;