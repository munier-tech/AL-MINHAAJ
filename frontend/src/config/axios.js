import axios from 'axios'
import toast from 'react-hot-toast'

// Get base URL from environment variables or default to localhost
// In production (Vercel), use relative path to same domain; in development, use localhost
const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:4000/api')

console.log('Environment:', import.meta.env.MODE)
console.log('Base URL:', BASE_URL)
console.log('VITE_REACT_APP_API_URL:', import.meta.env.VITE_REACT_APP_API_URL)

// Create and configure axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token


// Export the configured axios instance as default
export default axiosInstance