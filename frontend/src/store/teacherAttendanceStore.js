// useTeacherAttendanceStore.js
import { create } from 'zustand';
import axios from '../config/axios';
import toast from 'react-hot-toast';

const useTeacherAttendanceStore = create((set) => ({
  attendance: [],
  loading: false,
  error: null,
  success: false,

  createAttendance: async (data) => {
    set({ loading: true, error: null, success: false });
    try {
      const res = await axios.post('/teachersAttendance/create', data);
      set((state) => ({
        attendance: [res.data.data, ...state.attendance],
        success: true,
        loading: false
      }));
    } catch (error) {
      console.error('Create attendance error:', error);
      set({
        error: error.response?.data?.message || 'Failed to record attendance',
        loading: false
      });
    }
  },

  getAttendance: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await axios.get('/teachersAttendance/get', { params });
      set({ attendance: res.data.data, loading: false });
    } catch (error) {
      toast.error('Failed to load attendance');
      set({ loading: false });
    }
  },

  getAttendanceByDate: async (date, teacherId = null) => {
  set({ loading: true, error: null });
  try {
    // Validate date
    if (!date) {
      throw new Error('Date is required');
    }

    const params = { date };
    if (teacherId) params.teacherId = teacherId;

    const response = await axios.get('/teachersAttendance/get', { date ,  params });
    
    set({ 
      attendanceRecords: response.data.data,
      currentDate: date,
      loading: false 
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch attendance';
    
    toast.error(errorMessage);
    set({ 
      error: errorMessage,
      loading: false 
    });
    throw error;
  }
},

  updateAttendance: async (id, data) => {
    try {
      const res = await axios.put(`/teacher-attendance/update`, { id, ...data });
      set((state) => ({
        attendance: state.attendance.map((a) => (a._id === id ? res.data.data : a))
      }));
      toast.success('Attendance updated');
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  },

  deleteAttendance: async (id) => {
    try {
      await axios.delete(`/teacher-attendance/delete`, { data: { id } });
      set((state) => ({
        attendance: state.attendance.filter((a) => a._id !== id)
      }));
      toast.success('Attendance deleted');
    } catch (error) {
      toast.error('Failed to delete attendance');
    }
  },

  clearStatus: () => set({ success: false, error: null })
}));

export default useTeacherAttendanceStore;
