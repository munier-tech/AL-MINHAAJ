import { create } from "zustand";
import axios from "../config/axios";

export const useFamilyFeeStore = create((set, get) => ({
  familyFees: [],
  currentFamilyFee: null,
  familyFeeStatistics: null,
  loading: false,
  error: null,

  // Create family fee record
  createFamilyFee: async (data) => {
    try {
      set({ loading: true });
      const res = await axios.post("/family-fees/create", data);
      set((state) => ({
        familyFees: [res.data.familyFee, ...state.familyFees],
        loading: false,
      }));
      return res.data.familyFee;
    } catch (err) {
      console.error("Error creating family fee:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  // Get all family fee records with optional filters
  getAllFamilyFees: async (filters = {}) => {
    try {
      set({ loading: true });
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const res = await axios.get(`/family-fees/getAll?${params}`);
      set({ familyFees: res.data.familyFees, loading: false });
      return res.data.familyFees;
    } catch (err) {
      console.error("Error fetching family fees:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      return [];
    }
  },

  // Get family fee by ID
  getFamilyFeeById: async (id) => {
    try {
      set({ loading: true });
      const res = await axios.get(`/family-fees/${id}`);
      set({ currentFamilyFee: res.data.familyFee, loading: false });
      return res.data.familyFee;
    } catch (err) {
      console.error("Error fetching family fee:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      return null;
    }
  },

  // Update family fee record
  updateFamilyFee: async (id, updatedData) => {
    try {
      set({ loading: true });
      const res = await axios.put(`/family-fees/update/${id}`, updatedData);
      set((state) => ({
        familyFees: state.familyFees.map((fee) =>
          fee._id === id ? res.data.familyFee : fee
        ),
        currentFamilyFee: state.currentFamilyFee?._id === id ? res.data.familyFee : state.currentFamilyFee,
        loading: false,
      }));
      return res.data.familyFee;
    } catch (err) {
      console.error("Error updating family fee:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  // Process family fee payment
  processFamilyFeePayment: async (id, paymentData) => {
    try {
      set({ loading: true });
      const res = await axios.put(`/family-fees/payment/${id}`, paymentData);
      set((state) => ({
        familyFees: state.familyFees.map((fee) =>
          fee._id === id ? res.data.familyFee : fee
        ),
        currentFamilyFee: state.currentFamilyFee?._id === id ? res.data.familyFee : state.currentFamilyFee,
        loading: false,
      }));
      return res.data.familyFee;
    } catch (err) {
      console.error("Error processing family fee payment:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  // Delete family fee record
  deleteFamilyFee: async (id) => {
    try {
      set({ loading: true });
      await axios.delete(`/family-fees/delete/${id}`);
      set((state) => ({
        familyFees: state.familyFees.filter((fee) => fee._id !== id),
        currentFamilyFee: state.currentFamilyFee?._id === id ? null : state.currentFamilyFee,
        loading: false,
      }));
    } catch (err) {
      console.error("Error deleting family fee:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  // Get family fee statistics
  getFamilyFeeStatistics: async (month, year) => {
    try {
      set({ loading: true });
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      
      const res = await axios.get(`/family-fees/statistics?${params}`);
      set({ familyFeeStatistics: res.data.statistics, loading: false });
      return res.data.statistics;
    } catch (err) {
      console.error("Error fetching family fee statistics:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      return null;
    }
  },

  // Clear errors
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    familyFees: [],
    currentFamilyFee: null,
    familyFeeStatistics: null,
    loading: false,
    error: null,
  }),
}));