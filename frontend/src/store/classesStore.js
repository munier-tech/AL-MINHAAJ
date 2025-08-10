import { create } from 'zustand'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const useClassesStore = create((set, get) => ({
  // State
  classes: [],
  selectedClass: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,

  // Actions
  fetchClasses: async () => {
    set({ loading: true })
    try {
      const response = await axios.get('/classes/getAll')
      set({ 
        classes: response.data.classes || [],
        loading: false 
      })
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast.error('Failed to fetch classes')
      set({ loading: false })
    }
  },

  fetchClassById: async (id) => {
    set({ loading: true })
    try {
      const response = await axios.get(`/classes/getId/${id}`)
      set({ 
        selectedClass: response.data.class,
        loading: false 
      })
      return { success: true, class: response.data.class }
    } catch (error) {
      console.error('Error fetching class:', error)
      toast.error('Failed to fetch class details')
      set({ loading: false })
      return { success: false, message: error.response?.data?.message }
    }
  },

  createClass: async (classData) => {
    set({ creating: true })
    try {
      const response = await axios.post('/classes/create', classData)
      
      set(state => ({
        classes: [...state.classes, response.data.class],
        creating: false
      }))
      
      toast.success('Class created successfully')
      return { success: true, class: response.data.class }
    } catch (error) {
      console.error('Error creating class:', error)
      const message = error.response?.data?.message || 'Failed to create class'
      toast.error(message)
      set({ creating: false })
      return { success: false, message }
    }
  },

  updateClass: async (id, classData) => {
    set({ updating: true })
    try {
      const response = await axios.put(`/classes/update/${id}`, classData)
      const updatedClass = response.data.class
      
      set(state => ({
        classes: state.classes.map(cls => 
          cls._id === id ? updatedClass : cls
        ),
        selectedClass: state.selectedClass?._id === id ? updatedClass : state.selectedClass,
        updating: false
      }))
      
      toast.success('Class updated successfully')
      return { success: true, class: updatedClass }
    } catch (error) {
      console.error('Error updating class:', error)
      const message = error.response?.data?.message || 'Failed to update class'
      toast.error(message)
      set({ updating: false })
      return { success: false, message }
    }
  },

  deleteClass: async (id) => {
    set({ deleting: true })
    try {
      await axios.delete(`/classes/delete/${id}`)
      
      set(state => ({
        classes: state.classes.filter(cls => cls._id !== id),
        selectedClass: state.selectedClass?._id === id ? null : state.selectedClass,
        deleting: false
      }))
      
      toast.success('Class deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('Error deleting class:', error)
      const message = error.response?.data?.message || 'Failed to delete class'
      toast.error(message)
      set({ deleting: false })
      return { success: false, message }
    }
  },

  assignTeacher: async (classId, teacherId) => {
    try {
      const response = await axios.post(`/classes/${classId}/assign-teacher/${teacherId}`)
      
      set(state => ({
        classes: state.classes.map(cls =>
          cls._id === classId 
            ? { ...cls, teacher: response.data.teacher }
            : cls
        )
      }))
      
      toast.success('Teacher assigned successfully')
      return { success: true }
    } catch (error) {
      console.error('Error assigning teacher:', error)
      const message = error.response?.data?.message || 'Failed to assign teacher'
      toast.error(message)
      return { success: false, message }
    }
  },

  getClassStudents: async (id) => {
    try {
      const response = await axios.get(`/classes/${id}/students`)
      return { success: true, students: response.data.students }
    } catch (error) {
      console.error('Error getting class students:', error)
      const message = error.response?.data?.message || 'Failed to get class students'
      toast.error(message)
      return { success: false, message }
    }
  },

  // Utility functions
  clearSelectedClass: () => set({ selectedClass: null }),
  
  searchClasses: (query) => {
    const { classes } = get()
    return classes.filter(cls =>
      cls.name?.toLowerCase().includes(query.toLowerCase()) ||
      cls.subject?.toLowerCase().includes(query.toLowerCase()) ||
      cls.teacher?.fullname?.toLowerCase().includes(query.toLowerCase())
    )
  },

  getClassesByTeacher: (teacherId) => {
    const { classes } = get()
    return classes.filter(cls => cls.teacher?._id === teacherId)
  },

  getTotalClasses: () => {
    const { classes } = get()
    return classes.length
  },

  getClassesStatistics: () => {
    const { classes } = get()
    return {
      total: classes.length,
      withTeacher: classes.filter(cls => cls.teacher).length,
      withoutTeacher: classes.filter(cls => !cls.teacher).length,
      active: classes.filter(cls => cls.isActive !== false).length,
      inactive: classes.filter(cls => cls.isActive === false).length,
    }
  }
}))

export default useClassesStore