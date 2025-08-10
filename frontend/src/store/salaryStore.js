import { create } from "zustand";
import axios from "../config/axios";

export const useSalaryStore = create((set, get) => ({
  salaryRecords: [],
  teacherSalaryRecords: [],
  teachers: [],
  salaryStatistics: null,
  loading: false,
  error: null,

  // Create salary record for individual teacher
  createSalaryRecord: async (data) => {
    try {
      set({ loading: true });

      // Ensure numeric fields and compute totalAmount if not present
      const amount = Number(data.amount) || 0;
      const bonus = Number(data.bonus) || 0;
      const deductions = Number(data.deductions) || 0;
      const totalAmount = typeof data.totalAmount !== "undefined" ? Number(data.totalAmount) : (amount + bonus - deductions);

      const payload = {
        ...data,
        amount,
        bonus,
        deductions,
        totalAmount,
      };

      const res = await axios.post("/salaries/create", payload);
      set((state) => ({
        salaryRecords: [res.data.salaryRecord, ...state.salaryRecords],
        loading: false,
      }));
      return res.data.salaryRecord;
    } catch (err) {
      console.error("Error creating salary record:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  // Create salary records for all teachers
  createAllTeachersSalaries: async (data) => {
    try {
      set({ loading: true });
      const res = await axios.post("/salaries/create-all", data);
      set((state) => ({
        salaryRecords: [...res.data.salaryRecords, ...state.salaryRecords],
        loading: false,
      }));
      return res.data;
    } catch (err) {
      console.error("Error creating teacher salaries:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  // Get all teachers with optional salary records
  getAllTeachers: async (month, year) => {
    try {
      set({ loading: true });
      const params = new URLSearchParams();
      if (month) params.append("month", month);
      if (year) params.append("year", year);

      const res = await axios.get(`/salaries/teachers?${params}`);
      set({ teachers: res.data.teachers, loading: false });
      return res.data.teachers;
    } catch (err) {
      console.error("Error fetching teachers:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      return [];
    }
  },

  // Get all salary records with optional filters
  getAllSalaryRecords: async (filters = {}) => {
    try {
      set({ loading: true });
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });

      const res = await axios.get(`/salaries/getAll?${params}`);
      set({ salaryRecords: res.data.salaryRecords, loading: false });
      return res.data.salaryRecords;
    } catch (err) {
      console.error("Error fetching all salary records:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      return [];
    }
  },

  // Get salary records for a specific teacher
  getTeacherSalaryRecords: async (teacherId, year) => {
    try {
      set({ loading: true });
      const params = year ? `?year=${year}` : "";
      const res = await axios.get(`/salaries/teacher/${teacherId}${params}`);
      set({ teacherSalaryRecords: res.data.salaryRecords, loading: false });
      return res.data.salaryRecords;
    } catch (err) {
      console.error("Error fetching teacher salary records:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      return [];
    }
  },

  // Update salary record
  updateSalaryRecord: async (salaryId, updatedData) => {
    try {
      set({ loading: true });

      // Ensure numeric fields and recompute totalAmount if needed
      const amount = Number(updatedData.amount) || 0;
      const bonus = Number(updatedData.bonus) || 0;
      const deductions = Number(updatedData.deductions) || 0;
      const totalAmount = typeof updatedData.totalAmount !== "undefined" ? Number(updatedData.totalAmount) : (amount + bonus - deductions);

      const payload = { ...updatedData, amount, bonus, deductions, totalAmount };

      const res = await axios.put(`/salaries/update/${salaryId}`, payload);
      set((state) => ({
        salaryRecords: state.salaryRecords.map((rec) => (rec._id === salaryId ? res.data.salaryRecord : rec)),
        loading: false,
      }));
      return res.data.salaryRecord;
    } catch (err) {
      console.error("Error updating salary record:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  // Delete salary record
  deleteSalaryRecord: async (salaryId) => {
    try {
      set({ loading: true });
      await axios.delete(`/salaries/delete/${salaryId}`);
      set((state) => ({
        salaryRecords: state.salaryRecords.filter((rec) => rec._id !== salaryId),
        loading: false,
      }));
    } catch (err) {
      console.error("Error deleting salary record:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  // Get salary statistics
  getSalaryStatistics: async (month, year) => {
    try {
      set({ loading: true });
      const params = new URLSearchParams();
      if (month) params.append("month", month);
      if (year) params.append("year", year);

      const res = await axios.get(`/salaries/statistics?${params}`);
      set({ salaryStatistics: res.data.statistics, loading: false });
      return res.data.statistics;
    } catch (err) {
      console.error("Error fetching salary statistics:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      return null;
    }
  },

  // Clear errors
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      salaryRecords: [],
      teacherSalaryRecords: [],
      teachers: [],
      salaryStatistics: null,
      loading: false,
      error: null,
    }),
}));
