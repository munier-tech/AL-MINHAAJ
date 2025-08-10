import { create } from "zustand";
import axios from "../config/axios"; 

export const useSubjectStore = create((set) => ({
  subjects: [],
  subject: null,
  isLoading: false,
  error: null,
  successMessage: null,

  // ✅ Clear messages
  clearMessages: () => set({ error: null, successMessage: null }),

  // ✅ Create new subject
  createSubject: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axios.post("/subjects/create", data);
      set((state) => ({
        subjects: [...state.subjects, res.data.subject],
        successMessage: res.data.message,
        isLoading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to create subject",
        isLoading: false,
      });
    }
  },

  // ✅ Get all subjects
 // ✅ Get all subjects
getAllSubjects: async () => {
  try {
    set({ isLoading: true, error: null });
    const res = await axios.get("/subjects");

    console.log("Fetched subjects from backend:", res.data); // ✅ Add this log

    // Be sure to use the correct key: "subjects"
    set({ subjects: res.data.subjects, isLoading: false });
  } catch (err) {
    console.error("Failed to fetch subjects:", err);
    set({
      error: err.response?.data?.message || "Failed to fetch subjects",
      isLoading: false,
    });
  }
},


  // ✅ Get subject by ID
  getSubjectById: async (subjectId) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axios.get(`/api/subject/${subjectId}`);
      set({ subject: res.data.subject, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch subject",
        isLoading: false,
      });
    }
  },

  // ✅ Update subject
  updateSubject: async (subjectId, data) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axios.put(`/subjects/update/${subjectId}`, data);
      set((state) => ({
        subjects: state.subjects.map((s) =>
          s._id === subjectId ? res.data.subject : s
        ),
        successMessage: res.data.message,
        isLoading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update subject",
        isLoading: false,
      });
    }
  },

  // ✅ Delete subject
  deleteSubject: async (subjectId) => {
    try {
      set({ isLoading: true, error: null });
      await axios.delete(`/subjects/delete/${subjectId}`);
      set((state) => ({
        subjects: state.subjects.filter((s) => s._id !== subjectId),
        successMessage: "Subject deleted",
        isLoading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete subject",
        isLoading: false,
      });
    }
  },
}));
