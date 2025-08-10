import { create } from "zustand";
import axios from "../config/axios";

export const useDisciplineStore = create((set, get) => ({
  disciplineRecords: [],
  loading: false,
  error: null,

  // ✅ Create discipline
  createDiscipline: async (data) => {
    try {
      set({ loading: true });
      const res = await axios.post("/discipline/create", data);
      set((state) => ({
        disciplineRecords: [...state.disciplineRecords, res.data],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || "Create failed", loading: false });
    }
  },

  // ✅ Fetch all disciplines
  getAllDiscipline: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("/discipline/getAll");
      set({ disciplineRecords: res.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Fetch failed", loading: false });
    }
  },

  // ✅ Get one discipline by ID
  getDisciplineById: async (id) => {
    try {
      set({ loading: true });
      const res = await axios.get(`/discipline/${id}`);
      set({ loading: false });
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Fetch single failed", loading: false });
    }
  },

  // ✅ Update discipline
  updateDiscipline: async (id, updatedData) => {
    try {
      set({ loading: true });
      const res = await axios.put(`/discipline/${id}`, updatedData);
      set((state) => ({
        disciplineRecords: state.disciplineRecords.map((item) =>
          item._id === id ? res.data : item
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || "Update failed", loading: false });
    }
  },

  // ✅ Delete discipline
  deleteDiscipline: async (id) => {
    try {
      set({ loading: true });
      await axios.delete(`/discipline/${id}`);
      set((state) => ({
        disciplineRecords: state.disciplineRecords.filter((item) => item._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || "Delete failed", loading: false });
    }
  },
}));
