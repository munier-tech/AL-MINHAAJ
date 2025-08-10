import { create } from 'zustand'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const useAttendanceStore = create((set, get) => ({
  // State
  attendance: [],
  selectedAttendance: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,

  // Actions
  fetchAttendance: async () => {
    set({ loading: true })
    try {
      const response = await axios.get('/attendance/getAll')
      set({ 
        attendance: response.data.attendance || [],
        loading: false 
      })
    } catch (error) {
      console.error('Error fetching attendance:', error)
      toast.error('Failed to fetch attendance records')
      set({ loading: false })
    }
  },

  fetchAttendanceById: async (id) => {
    set({ loading: true })
    try {
      const response = await axios.get(`/attendance/getById/${id}`)
      set({ 
        selectedAttendance: response.data.attendance,
        loading: false 
      })
      return { success: true, attendance: response.data.attendance }
    } catch (error) {
      console.error('Error fetching attendance:', error)
      toast.error('Failed to fetch attendance details')
      set({ loading: false })
      return { success: false, message: error.response?.data?.message }
    }
  },

  createAttendance: async (attendanceData) => {
    set({ creating: true })
    try {
      const response = await axios.post('/attendance/create', attendanceData)
      
      set(state => ({
        attendance: [...state.attendance, response.data.attendance],
        creating: false
      }))
      
      toast.success('Attendance record created successfully')
      return { success: true, attendance: response.data.attendance }
    } catch (error) {
      console.error('Error creating attendance:', error)
      const message = error.response?.data?.message || 'Failed to create attendance record'
      toast.error(message)
      set({ creating: false })
      return { success: false, message }
    }
  },

  updateAttendance: async (id, attendanceData) => {
    set({ updating: true })
    try {
      const response = await axios.put(`/attendance/update/${id}`, attendanceData)
      const updatedAttendance = response.data.attendance
      
      set(state => ({
        attendance: state.attendance.map(record => 
          record._id === id ? updatedAttendance : record
        ),
        selectedAttendance: state.selectedAttendance?._id === id ? updatedAttendance : state.selectedAttendance,
        updating: false
      }))
      
      toast.success('Attendance record updated successfully')
      return { success: true, attendance: updatedAttendance }
    } catch (error) {
      console.error('Error updating attendance:', error)
      const message = error.response?.data?.message || 'Failed to update attendance record'
      toast.error(message)
      set({ updating: false })
      return { success: false, message }
    }
  },

   getAttendanceClassByDate: async (classId, date) => {
    set({ loading: true });

    try {
      const response = await axios.get(`/attendance/get/${classId}/${date}`);
      set({ attendance: response.data.attendance, loading: false });
      return { success: true, attendance: response.data.attendance };
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to fetch attendance'
      );
      set({ attendance: null, loading: false });
      return { success: false, message: error?.response?.data?.message };
    }
  },

  deleteAttendance: async (id) => {
    set({ deleting: true })
    try {
      await axios.delete(`/attendance/delete/${id}`)
      
      set(state => ({
        attendance: state.attendance.filter(record => record._id !== id),
        selectedAttendance: state.selectedAttendance?._id === id ? null : state.selectedAttendance,
        deleting: false
      }))
      
      toast.success('Attendance record deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('Error deleting attendance:', error)
      const message = error.response?.data?.message || 'Failed to delete attendance record'
      toast.error(message)
      set({ deleting: false })
      return { success: false, message }
    }
  },

  fetchAttendanceByClass: async (classId) => {
    try {
      const response = await axios.get(`/attendance/class/${classId}`)
      return { success: true, attendance: response.data.attendance }
    } catch (error) {
      console.error('Error fetching class attendance:', error)
      const message = error.response?.data?.message || 'Failed to fetch class attendance'
      toast.error(message)
      return { success: false, message }
    }
  },

  fetchAttendanceByStudent: async (studentId) => {
    try {
      const response = await axios.get(`/attendance/student/${studentId}`)
      return { success: true, attendance: response.data.attendance }
    } catch (error) {
      console.error('Error fetching student attendance:', error)
      const message = error.response?.data?.message || 'Failed to fetch student attendance'
      toast.error(message)
      return { success: false, message }
    }
  },

  // Utility functions
  clearSelectedAttendance: () => set({ selectedAttendance: null }),
  
  getAttendanceStats: () => {
    const { attendance } = get()
    const today = new Date().toDateString()
    
    return {
      total: attendance.length,
      today: attendance.filter(record => 
        new Date(record.date).toDateString() === today
      ).length,
      present: attendance.filter(record => record.status === 'present').length,
      absent: attendance.filter(record => record.status === 'absent').length,
      late: attendance.filter(record => record.status === 'late').length,
    }
  },

  markBulkAttendance: async (attendanceRecords) => {
    set({ creating: true })
    try {
      const response = await axios.post('/attendance/bulk-create', { records: attendanceRecords })
      
      set(state => ({
        attendance: [...state.attendance, ...response.data.attendance],
        creating: false
      }))
      
      toast.success('Bulk attendance marked successfully')
      return { success: true, attendance: response.data.attendance }
    } catch (error) {
      console.error('Error marking bulk attendance:', error)
      const message = error.response?.data?.message || 'Failed to mark bulk attendance'
      toast.error(message)
      set({ creating: false })
      return { success: false, message }
    }
  },

  getAttendanceByDate: (date) => {
    const { attendance } = get()
    const targetDate = new Date(date).toDateString()
    return attendance.filter(record => 
      new Date(record.date).toDateString() === targetDate
    )
  },

  getAttendanceByDateRange: (startDate, endDate) => {
    const { attendance } = get()
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return attendance.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= start && recordDate <= end
    })
  },

  calculateAttendancePercentage: (studentId, startDate = null, endDate = null) => {
    const { attendance } = get()
    let studentAttendance = attendance.filter(record => record.student?._id === studentId)
    
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      studentAttendance = studentAttendance.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= start && recordDate <= end
      })
    }
    
    if (studentAttendance.length === 0) return 0
    
    const presentDays = studentAttendance.filter(record => 
      record.status === 'present' || record.status === 'late'
    ).length
    
    return Math.round((presentDays / studentAttendance.length) * 100)
  }
}))

export default useAttendanceStore