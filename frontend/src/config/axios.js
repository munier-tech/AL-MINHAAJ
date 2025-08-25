import axios from 'axios'
import toast from 'react-hot-toast'

// Resolve base URL safely across environments
// - In production: prefer relative '/api' unless an absolute non-localhost URL is provided
// - In development: use VITE_REACT_APP_API_URL or default to localhost
const ENV_API_URL = import.meta.env.VITE_REACT_APP_API_URL
const isProd = import.meta.env.PROD

let BASE_URL
if (isProd) {
  const isEnvUrlUsable = ENV_API_URL && !/^https?:\/\/localhost(?::\d+)?/i.test(ENV_API_URL)
  BASE_URL = isEnvUrlUsable ? ENV_API_URL : '/api'
} else {
  BASE_URL = ENV_API_URL || 'http://localhost:5000/api'
}

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