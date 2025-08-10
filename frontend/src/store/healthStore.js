import { create } from "zustand";
import axios from "../config/axios"; // make sure this points to your axios instance

export const useHealthStore = create((set, get) => ({
  healthRecords: [],
  studentHealthRecords: [],
  loading: false,
  error: null,

  // ✅ Add Health Record
  addHealthRecord: async (data) => {
    try {
      set({ loading: true });
      const res = await axios.post("/health/create", data);
      set((state) => ({
        healthRecords: [res.data.healthRecord, ...state.healthRecords],
        loading: false,
      }));
    } catch (err) {
      console.error("Error adding health record:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  // ✅ Get All Health Records
  getAllHealthRecords: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("/health/getAll");
      set({ healthRecords: res.data.healthRecords, loading: false });
    } catch (err) {
      console.error("Error fetching all health records:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  // ✅ Get Health Records for One Student
getStudentHealthRecords: async (studentId) => {
  try {
    set({ loading: true });
    const res = await axios.get(`/health/getStudent/${studentId}`);
    set({ studentHealthRecords: res.data.studentHealthRecords, loading: false });
    return res.data.studentHealthRecords; // ✅ This line was missing!
  } catch (err) {
    console.error("Error fetching student health records:", err);
    set({ error: err.response?.data?.message || err.message, loading: false });
    return []; // ✅ Prevents undefined return
  }
},

  // ✅ Update Health Record
  updateHealthRecord: async (healthId, updatedData) => {
    try {
      set({ loading: true });
      const res = await axios.put(`/health/update/${healthId}`, updatedData);
      set((state) => ({
        healthRecords: state.healthRecords.map((rec) =>
          rec._id === healthId ? res.data.Health : rec
        ),
        loading: false,
      }));
    } catch (err) {
      console.error("Error updating health record:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  // ✅ Delete Health Record
  deleteHealthRecord: async (healthId) => {
    try {
      set({ loading: true });
      await axios.delete(`/health/delete/${healthId}`);
      set((state) => ({
        healthRecords: state.healthRecords.filter((rec) => rec._id !== healthId),
        loading: false,
      }));
    } catch (err) {
      console.error("Error deleting health record:", err);
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  // ✅ Clear Errors
  clearError: () => set({ error: null }),
}));
