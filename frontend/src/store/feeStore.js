import { create } from "zustand";
import axios from "../config/axios";

export const useFeeStore = create((set, get) => ({
  feeRecords: [],
  studentFeeRecords: [],
  classStudents: [],
  feeStatistics: null,
  loading: false,
  error: null,

  // Create fee record for individual student
  createFeeRecord: async (data) => {
    try {
      set({ loading: true });
      const res = await axios.post("/fees/create", data);
      set((state) => ({
        feeRecords: [res.data.feeRecord, ...state.feeRecords],
        loading: false,
      }));
      return res.data.feeRecord;
    } catch (err) {
      console.error("Error creating fee record:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  // Create fee records for all students in a class
  createClassFees: async (data) => {
    try {
      set({ loading: true });
      const res = await axios.post("/fees/create-class", data);
      set((state) => ({
        feeRecords: [...res.data.feeRecords, ...state.feeRecords],
        loading: false,
      }));
      return res.data;
    } catch (err) {
      console.error("Error creating class fees:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  // Get students by class with optional fee records
  getStudentsByClass: async (classId, month, year) => {
    try {
      set({ loading: true });
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      
      const res = await axios.get(`/fees/students/class/${classId}?${params}`);
      set({ classStudents: res.data.students, loading: false });
      return res.data.students;
    } catch (err) {
      console.error("Error fetching students by class:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      return [];
    }
  },

  // Get all fee records with optional filters
  getAllFeeRecords: async (filters = {}) => {
    try {
      set({ loading: true });
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const res = await axios.get(`/fees/getAll?${params}`);
      set({ feeRecords: res.data.feeRecords, loading: false });
      return res.data.feeRecords;
    } catch (err) {
      console.error("Error fetching all fee records:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      return [];
    }
  },

  // Get fee records for a specific student
  getStudentFeeRecords: async (studentId, year) => {
    try {
      set({ loading: true });
      const params = year ? `?year=${year}` : '';
      const res = await axios.get(`/fees/student/${studentId}${params}`);
      set({ studentFeeRecords: res.data.feeRecords, loading: false });
      return res.data.feeRecords;
    } catch (err) {
      console.error("Error fetching student fee records:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      return [];
    }
  },

  // Update fee record
  updateFeeRecord: async (feeId, updatedData) => {
    try {
      set({ loading: true });
      const res = await axios.put(`/fees/update/${feeId}`, updatedData);
      set((state) => ({
        feeRecords: state.feeRecords.map((rec) =>
          rec._id === feeId ? res.data.feeRecord : rec
        ),
        loading: false,
      }));
      return res.data.feeRecord;
    } catch (err) {
      console.error("Error updating fee record:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  // Delete fee record
  deleteFeeRecord: async (feeId) => {
    try {
      set({ loading: true });
      await axios.delete(`/fees/delete/${feeId}`);
      set((state) => ({
        feeRecords: state.feeRecords.filter((rec) => rec._id !== feeId),
        loading: false,
      }));
    } catch (err) {
      console.error("Error deleting fee record:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  // Get fee statistics
  getFeeStatistics: async (month, year) => {
    try {
      set({ loading: true });
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      
      const res = await axios.get(`/fees/statistics?${params}`);
      set({ feeStatistics: res.data.statistics, loading: false });
      return res.data.statistics;
    } catch (err) {
      console.error("Error fetching fee statistics:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      return null;
    }
  },

  // Clear errors
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    feeRecords: [],
    studentFeeRecords: [],
    classStudents: [],
    feeStatistics: null,
    loading: false,
    error: null,
  }),
}));