import { create } from 'zustand'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const useUsersStore = create((set, get) => ({
  // State
  users: [],
  selectedUser: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,

  // Actions
  fetchUsers: async () => {
    set({ loading: true })
    try {
      const response = await axios.get('/auth/users')
      set({ 
        users: response.data.users || [],
        loading: false 
      })
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
      set({ loading: false })
    }
  },

  createUser: async (userData) => {
    set({ creating: true })
    try {
      const response = await axios.post('/auth/signUp', userData)
      
      // Add the new user to the local state
      set(state => ({
        users: [...state.users, response.data.user],
        creating: false
      }))
      
      toast.success('User created successfully')
      return { success: true, user: response.data.user }
    } catch (error) {
      console.error('Error creating user:', error)
      const message = error.response?.data?.message || 'Failed to create user'
      toast.error(message)
      set({ creating: false })
      return { success: false, message }
    }
  },

  updateUser: async (id, userData) => {
    set({ updating: true })
    try {
      const response = await axios.put(`/auth/users/${id}`, userData)
      const updatedUser = response.data.user
      
      set(state => ({
        users: state.users.map(user => 
          user._id === id ? updatedUser : user
        ),
        selectedUser: state.selectedUser?._id === id ? updatedUser : state.selectedUser,
        updating: false
      }))
      
      toast.success('User updated successfully')
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error('Error updating user:', error)
      const message = error.response?.data?.message || 'Failed to update user'
      toast.error(message)
      set({ updating: false })
      return { success: false, message }
    }
  },

  deleteUser: async (id) => {
    set({ deleting: true })
    try {
      await axios.delete(`/auth/users/${id}`)
      
      set(state => ({
        users: state.users.filter(user => user._id !== id),
        selectedUser: state.selectedUser?._id === id ? null : state.selectedUser,
        deleting: false
      }))
      
      toast.success('User deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('Error deleting user:', error)
      const message = error.response?.data?.message || 'Failed to delete user'
      toast.error(message)
      set({ deleting: false })
      return { success: false, message }
    }
  },

  // Utility functions
  clearSelectedUser: () => set({ selectedUser: null }),
  
  getUsersByRole: (role) => {
    const { users } = get()
    return users.filter(user => user.role === role)
  },

  searchUsers: (query) => {
    const { users } = get()
    return users.filter(user =>
      user.username?.toLowerCase().includes(query.toLowerCase()) ||
      user.email?.toLowerCase().includes(query.toLowerCase()) ||
      user.role?.toLowerCase().includes(query.toLowerCase())
    )
  },

  getTotalUsersByRole: () => {
    const { users } = get()
    return {
      admin: users.filter(user => user.role === 'admin').length,
      teacher: users.filter(user => user.role === 'teacher').length,
      user: users.filter(user => user.role === 'user').length,
      total: users.length
    }
  }
}))

export default useUsersStore