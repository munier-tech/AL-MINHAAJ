import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'

const schema = yup.object({
  email: yup
    .string()
    .email('gali email sax ah ')
    .required('buuxi emailka'),
  password: yup
    .string()
    .min(6, 'password ku wuxuu noqon karaa ugu yaraan 6 xaraf')
    .required('buuxi passwordka'),
})

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
}

const formVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: 0.2 }
  }
}

function Login() {
  const navigate = useNavigate()
  const { login, isLoading, isAuthenticated } = useAuthStore()
  const [showPassword, setShowPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data) => {
    const result = await login(data)
    if (result.success) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center" variants={itemVariants}>
          <motion.div 
            className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Lock className="h-8 w-8 text-white" />
          </motion.div>
          <motion.h2 
            className="mt-6 text-3xl font-bold text-gray-900"
            variants={itemVariants}
          >
            Al-Qiyam
          </motion.h2>
          <motion.p 
            className="mt-2 text-lg text-gray-600"
            variants={itemVariants}
          >
            Nidaamka Maamulka Machadka Al-qiyam
          </motion.p>
          <motion.p 
            className="mt-2 text-sm text-gray-500"
            variants={itemVariants}
          >
            Geli macluumaadkaaga si aad u gasho akoonkaaga
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
          variants={formVariants}
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Cinwaanka Email-ka
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <motion.input
                  {...register('email')}
                  type="email"
                  id="email"
                  autoComplete="email"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.email 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Geli emailkaaga"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              {errors.email && (
                <motion.p 
                  className="mt-2 text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Furaha Sirta ah
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <motion.input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.password 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Geli furaha sirta ah"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </motion.button>
              </div>
              {errors.password && (
                <motion.p 
                  className="mt-2 text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center text-black py-3 px-4 border border-black rounded-lg shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              variants={itemVariants}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Gelaya...
                </>
              ) : (
                'Gal'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div 
            className="text-center pt-4 border-t border-gray-200"
            variants={itemVariants}
          >
            <p className="text-sm text-gray-600">
              Ma lihid akoon?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Diiwaangeli
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom Text */}
        <motion.p 
          className="text-center text-xs text-gray-500"
          variants={itemVariants}
        >
          Xoojinta hay'adaha waxbarashada teknoolojiyada casriga ah
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Login