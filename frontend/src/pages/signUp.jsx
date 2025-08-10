import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'

// Add role validation
const schema = yup.object({
  username: yup.string().required('Fadlan geli magacaaga'),
  email: yup
    .string()
    .email('Gali email sax ah')
    .required('Fadlan geli emailka'),
  password: yup
    .string()
    .min(6, 'Password-ku wuxuu noqon karaa ugu yaraan 6 xaraf')
    .required('Fadlan geli passwordka'),
  role: yup.string().oneOf(['admin', 'teacher'], 'Dooro mid ka mid ah').required('Dooro door')
})

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.08
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

function Signup() {
  const navigate = useNavigate()
  const { signup, isLoading, isAuthenticated, user } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    if (isAuthenticated) {
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data) => {
    const result = await signup(data)
    if (result.success) {
      if (user?.role === 'admin') {
        toast.success('User created successfully!')
        // Optionally clear form here or redirect
      } else {
        navigate('/dashboard') // for public users
      }
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
            Al-qiyam
          </motion.h2>
          <motion.p 
            className="mt-2 text-lg text-gray-600"
            variants={itemVariants}
          >
            Nidaamka Maamulka Machadka Al-Qiyam
          </motion.p>
          <motion.p 
            className="mt-2 text-sm text-gray-500"
            variants={itemVariants}
          >
            Samee akoon cusub
          </motion.p>
        </motion.div>

        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
          variants={formVariants}
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <motion.div variants={itemVariants}>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Magaca Isticmaalaha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <motion.input
                  {...register('username')}
                  type="text"
                  id="username"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Geli magacaaga isticmaalka"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              {errors.username && (
                <motion.p 
                  className="mt-2 text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.username.message}
                </motion.p>
              )}
            </motion.div>

            {/* Email */}
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
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
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

            {/* Password */}
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
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Samee furaha sirta ah"
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

            {/* Role Dropdown */}
            <motion.div variants={itemVariants}>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Doorka Shaqada
              </label>
              <motion.select
                {...register('role')}
                id="role"
                className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.role ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                whileFocus={{ scale: 1.02 }}
              >
                <option value="">Dooro Doorka</option>
                <option value="admin">Maamul</option>
                <option value="teacher">Macallin</option>
              </motion.select>
              {errors.role && (
                <motion.p 
                  className="mt-2 text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.role.message}
                </motion.p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center text-black py-3 px-4 border border-black rounded-lg shadow-sm text-sm font-medium bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              variants={itemVariants}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Akoon sameynaya...
                </>
              ) : (
                'Diiwaangeli'
              )}
            </motion.button>
          </form>

          <motion.div 
            className="text-center pt-4 border-t border-gray-200"
            variants={itemVariants}
          >
          </motion.div>
        </motion.div>

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

export default Signup
