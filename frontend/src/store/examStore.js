import {create} from "zustand";
import axios from "../config/axios"; 

export const useExamStore = create((set) => ({
  // State properties
  isLoading: false,
  loading: false, // Add this for consistency with component
  error: null,
  successMessage: null,
  exams: [], // Add this for getExamsByClassAndYear
  studentExams: [], // Add this for getStudentExamsByYear

  createExam: async (examData) => {
    set({ isLoading: true, error: null, successMessage: null });
    try {
      const response = await axios.post("/exams/create", examData);
      set({ isLoading: false, successMessage: response.data.message });
      return response.data.exam;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || error.message,
      });
      return null;
    }
  },

   createClassExam: async ({ examType, date, classId, subjectId, totalMarks, marksList }) => {
    try {
      set({ isLoading: true });

      const response = await axios.post("/exams/createClassExam", {
        examType,
        date,
        classId,
        subjectId,
        totalMarks,
        marksList, // [{ studentId, obtainedMarks }]
      });

      toast.success("Imtixanka Fasalka si Fican Ayaa Loo Abuuray ");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("createClassExam error:", error);
      toast.error(error.response?.data?.message || "Failed to create class exam");
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  getExamsByClassAndYear: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post("/exams/classExams", filters);
      set({ exams: res.data.exams, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch exams",
        loading: false,
      });
    }
  },

  getStudentExamsByYear: async ({ studentId, academicYear, examType, subjectId }) => {
    try {
      console.log('Starting getStudentExamsByYear with:', { studentId, academicYear, examType, subjectId });
      set({ loading: true, error: null });

      const res = await axios.post('/exams/student', {
        studentId,
        academicYear,
        examType,
        subjectId,
      });

      console.log('API Response:', res.data);
      console.log('Setting studentExams to:', res.data.data);
      
      const newState = { studentExams: res.data.data, loading: false };
      console.log('Setting new state:', newState);
      set(newState);
      
      // Verify the state was set correctly
      setTimeout(() => {
        console.log('State after setting:', useExamStore.getState());
      }, 100);
      
    } catch (error) {
      console.error('API Error:', error);
      set({
        error: error?.response?.data?.message || 'Failed to fetch exams',
        loading: false,
      });
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
}));
