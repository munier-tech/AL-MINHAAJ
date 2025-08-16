import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Shield,
  GraduationCap,
  User,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  Crown,
} from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import useUsersStore from '../store/usersStore'
import useAuthStore from '../store/authStore'

const userSchema = yup.object({
  username: yup.string().required('Magaca isticmaalaha ayaa loo baahan yahay').min(3, 'Magaca isticmaalahu wuxuu noqon karaa ugu yaraan 3 xaraf'),
  email: yup.string().email('Geli email sax ah').required('Email ayaa loo baahan yahay'),
  password: yup.string().min(6, 'Furaha sirta ahu wuxuu noqon karaa ugu yaraan 6 xaraf').required('Furaha sirta ah ayaa loo baahan yahay'),
  role: yup.string().required('Doorka ayaa loo baahan yahay'),
})

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 }
  },
  hover: { 
    scale: 1.02,
    boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: { duration: 0.2 }
  }
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.2 }
  }
}

function UserManagement() {
  const { user: currentUser } = useAuthStore()
  const { 
    users, 
    loading, 
    creating, 
    updating,
    deleting,
    fetchUsers, 
    createUser, 
    updateUser,
    deleteUser,
    selectedUser,
    clearSelectedUser
  } = useUsersStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState('all')

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      password: 'placeholder', // Add default password to bypass validation
      role: 'user',
    },
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const onSubmitCreate = async (data) => {
    try {
      await createUser(data)
      toast.success('Isticmaalaha si guul leh ayaa loo sameeyay!')
      reset()
      setShowCreateForm(false)
    } catch (error) {
      toast.error('Qalad ayaa ka dhacay')
    }
  }

  const onSubmitUpdate = async (data) => {
    try {
      // Remove password if it's the placeholder
      if (data.password === 'placeholder') {
        delete data.password
      }
      
      await updateUser(selectedUser._id, data)
      toast.success('Isticmaalaha si guul leh ayaa loo cusboonaysiiyay!')
      setShowEditForm(false)
      clearSelectedUser()
    } catch (error) {
      toast.error('Qalad ayaa ka dhacay')
    }
  }

  const handleEditUser = (user) => {
    setValue('username', user.username)
    setValue('email', user.email)
    setValue('role', user.role)
    setValue('password', 'placeholder') // Set placeholder password
    useUsersStore.setState({ selectedUser: user })
    setShowEditForm(true)
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Ma hubtaa inaad rabto inaad tirtirto isticmaalahan?')) {
      try {
        await deleteUser(userId)
        toast.success('Isticmaalaha si guul leh ayaa loo tirtiray!')
      } catch (error) {
        toast.error('Qalad ayaa ka dhacay')
      }
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />
      case 'teacher':
        return <GraduationCap className="w-4 h-4 text-blue-600" />
      default:
        return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      teacher: 'bg-blue-100 text-blue-800 border-blue-200',
      user: 'bg-gray-100 text-gray-800 border-gray-200',
    }

    const roleNames = {
      admin: 'Maamul',
      teacher: 'Macallin',
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[role]}`}>
        {getRoleIcon(role)}
        <span className="ml-1">{roleNames[role]}</span>
      </span>
    )
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    
    return matchesSearch && matchesRole
  })

  const userStats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    teacher: users.filter(u => u.role === 'teacher').length,
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}


      {/* Stats Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6" variants={itemVariants}>
        <motion.div 
          className="bg-white rounded-lg shadow p-6"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{userStats.total}</h3>
              <p className="text-gray-600">Wadarta Isticmaalayaasha</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow p-6"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{userStats.admin}</h3>
              <p className="text-gray-600">Maamulayaal</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow p-6"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{userStats.teacher}</h3>
              <p className="text-gray-600">Macallimiin</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow p-6"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{userStats.user}</h3>
              <p className="text-gray-600">Isticmaalayaal Caadi ah</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div className="bg-white rounded-lg shadow p-6" variants={itemVariants}>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <motion.input
                type="text"
                placeholder="Raadi isticmaalaha magaciisa ama email-kiisa..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                whileFocus={{ scale: 1.02 }}
              />
            </div>
          </div>

          {/* Role Filter */}
          <motion.select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            whileFocus={{ scale: 1.02 }}
          >
            <option value="all">Dhammaan Doorarrka</option>
            <option value="admin">Maamul</option>
            <option value="teacher">Macallin</option>
            <option value="user">Isticmaale</option>
          </motion.select>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div className="bg-white rounded-lg shadow overflow-hidden" variants={itemVariants}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Liiska Isticmaalayaasha</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Soo dejinta...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Lama helin isticmaale</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Isticmaalaha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doorka
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    La sameeyay
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ficillada
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('so-SO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {currentUser?.role === 'admin' && user._id !== currentUser._id && (
                            <>
                              <motion.button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Ku dar Isticmaale Cusub</h3>
              </div>
              
              <form onSubmit={handleSubmit(onSubmitCreate)} className="p-6 space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Magaca Isticmaalaha
                  </label>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <motion.input
                        {...field}
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.username ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Geli magaca isticmaalaha"
                        whileFocus={{ scale: 1.02 }}
                      />
                    )}
                  />
                  {errors.username && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.username.message}
                    </motion.p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <motion.input
                        {...field}
                        type="email"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Geli emailka"
                        whileFocus={{ scale: 1.02 }}
                      />
                    )}
                  />
                  {errors.email && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Furaha Sirta ah
                  </label>
                  <div className="relative">
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <motion.input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.password ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Geli furaha sirta ah"
                          whileFocus={{ scale: 1.02 }}
                        />
                      )}
                    />
                    <motion.button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </motion.button>
                  </div>
                  {errors.password && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doorka
                  </label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <motion.select
                        {...field}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.role ? 'border-red-300' : 'border-gray-300'
                        }`}
                        whileFocus={{ scale: 1.02 }}
                      >
                        <option value="user">Isticmaale</option>
                        <option value="teacher">Macallin</option>
                        <option value="admin">Maamul</option>
                      </motion.select>
                    )}
                  />
                  {errors.role && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.role.message}
                    </motion.p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Jooji
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    whileHover={{ scale: creating ? 1 : 1.05 }}
                    whileTap={{ scale: creating ? 1 : 0.95 }}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sameynaya...
                      </>
                    ) : (
                      'Samee Isticmaalaha'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditForm && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Cusboonaysii Isticmaalaha</h3>
              </div>
              
              <form onSubmit={handleSubmit(onSubmitUpdate)} className="p-6 space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Magaca Isticmaalaha
                  </label>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <motion.input
                        {...field}
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.username ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Geli magaca isticmaalaha"
                        whileFocus={{ scale: 1.02 }}
                      />
                    )}
                  />
                  {errors.username && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.username.message}
                    </motion.p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <motion.input
                        {...field}
                        type="email"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Geli emailka"
                        whileFocus={{ scale: 1.02 }}
                      />
                    )}
                  />
                  {errors.email && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                {/* Password (Hidden but required for validation) */}
                <div className="hidden">
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <input type="hidden" {...field} />
                    )}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doorka
                  </label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <motion.select
                        {...field}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.role ? 'border-red-300' : 'border-gray-300'
                        }`}
                        whileFocus={{ scale: 1.02 }}
                      >
                        <option value="teacher">Macallin</option>
                        <option value="admin">Maamul</option>
                      </motion.select>
                    )}
                  />
                  {errors.role && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.role.message}
                    </motion.p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false)
                      clearSelectedUser()
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Jooji
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    whileHover={{ scale: updating ? 1 : 1.05 }}
                    whileTap={{ scale: updating ? 1 : 0.95 }}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Cusboonaysiinaayo...
                      </>
                    ) : (
                      'Cusboonaysii Isticmaalaha'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default UserManagement