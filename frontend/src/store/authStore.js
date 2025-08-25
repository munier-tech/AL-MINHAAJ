import { create } from 'zustand'
import axios from '../config/axios' // Make sure this has withCredentials: true
import toast from 'react-hot-toast'

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // Check auth by verifying with the backend
 checkAuth: async () => {
    try {
      set({ isLoading: true })
      const response = await axios.get('/auth/WhoAmI')
      const { user } = response.data
      console.log('checkAuth user:', user)

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isAuthChecked: true // Mark auth as checked
      })

      return true
    } catch (error) {
      console.error('Auth check error:', error)
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isAuthChecked: true // Mark auth as checked even if failed
      })
      return false
    }
  },
  login: async (credentials) => {
    set({ isLoading: true })
    try {
      const response = await axios.post('/auth/login', credentials)
      const { user } = response.data
      console.log('login user:', user)

      if (!user?.role) {
        throw new Error('User role missing in response')
      }

      set({
        user,
        isAuthenticated: true,
        isLoading: false
      })

      toast.success('Login successful!')
      return { success: true, user }
    } catch (error) {
      console.error('Login error:', error)
      set({ isLoading: false })
      const message = error.response?.data?.message || error.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  },

  signup: async (userData) => {
  set({ isLoading: true })

  try {
    const response = await axios.post('/auth/signUp', userData)
    console.log('Signup response:', response) // Debugging
    
    // Handle different possible response structures
    const user = response.data.user || response.data
    
    if (!user) {
      console.error('User data missing in response:', response.data)
      throw new Error('User data missing in response')
    }

    // Do NOT override current logged-in admin
    const currentUser = get().user
    const isAdmin = currentUser?.role === 'admin'

    if (isAdmin) {
      set({
        createdUser: user,
        isLoading: false
      })
    } else {
      set({
        user,
        isAuthenticated: true,
        isLoading: false
      })
    }

    toast.success('Account created successfully!')
    return { success: true, user }
  } catch (error) {
    console.error('Signup error:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    set({ isLoading: false })
    toast.error(error.response?.data?.message || error.message || 'Signup failed')
    return { success: false }
  }
},

   fetchAllUsers: async () => {
    set({ userLoading: true });
    try {
      const response = await axios.get('/auth/');
      set({ users: response.data.users, userLoading: false });
      return { success: true, users: response.data.users };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      set({ userLoading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateUser: async (userId, userData) => {
    set({ userLoading: true });
    try {
      const response = await axios.put(`/auth/update/${userId}`, userData);
      const updatedUser = response.data.user;
      
      // Update in users list
      set(state => ({
        users: state.users.map(user => 
          user._id === userId ? updatedUser : user
        ),
        userLoading: false
      }));

      // Update current user if editing self
      if (get().user?._id === userId) {
        set({ user: updatedUser });
      }

      toast.success('User updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
      set({ userLoading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteUser: async (userId) => {
    set({ userLoading: true });
    try {
      await axios.delete(`/auth/delete/${userId}`);
      
      // Remove from users list
      set(state => ({
        users: state.users.filter(user => user._id !== userId),
        userLoading: false
      }));

      // Logout if deleting self
      if (get().user?._id === userId) {
        get().logout();
      }

      toast.success('User deleted successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
      set({ userLoading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  logout: async () => {
    try {
      await axios.post('/auth/logout') // Cookie is cleared on backend
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
      toast.success('Logged out successfully!')
    }
  }
}))

export default useAuthStore
