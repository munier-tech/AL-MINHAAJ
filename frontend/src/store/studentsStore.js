import { create } from 'zustand'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const useStudentsStore = create((set, get) => ({
  students: [],
  selectedStudent: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,

  fetchStudents: async () => {
    set({ loading: true });
    try {
      const response = await axios.get('/students/getAll');
      set({ students: response.data.students || [], loading: false });
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      set({ loading: false });
    }
  },
  
  fetchStudentsByClass: async (classId) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/students/class/${classId}`);
      set({ 
        students: response.data.students || [], 
        loading: false 
      });
      return { success: true, students: response.data.students };
    } catch (error) {
      console.error('Error fetching students by class:', error);
      toast.error('Failed to fetch students for this class');
      set({ loading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  fetchStudentById: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/students/getId/${id}`);
      set({ selectedStudent: response.data.student, loading: false });
      return { success: true, student: response.data.student };
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error('Failed to fetch student details');
      set({ loading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  createStudent: async (studentData) => {
    set({ creating: true });
    try {
      const response = await axios.post('/students/create', studentData);
      set(state => ({
        students: [...state.students, response.data.student],
        creating: false,
      }));
      const sid = response.data?.student?.studentId ? ` (ID: ${response.data.student.studentId})` : '';
      toast.success(`Student created successfully${sid}`);
      return { success: true, student: response.data.student };
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error(error.response?.data?.message || 'Failed to create student');
      set({ creating: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateStudent: async (id, studentData) => {
    set({ updating: true });
    try {
      const response = await axios.put(`/students/update/${id}`, studentData);
      const updatedStudent = response.data.student;
      set(state => ({
        students: state.students.map(student =>
          student._id === id ? updatedStudent : student
        ),
        selectedStudent: state.selectedStudent?._id === id ? updatedStudent : state.selectedStudent,
        updating: false,
      }));
      toast.success('Student updated successfully');
      return { success: true, student: updatedStudent };
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error(error.response?.data?.message || 'Failed to update student');
      set({ updating: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteStudent: async (id) => {
    set({ deleting: true });
    try {
      await axios.delete(`/students/delete/${id}`);
      set(state => ({
        students: state.students.filter(student => student._id !== id),
        selectedStudent: state.selectedStudent?._id === id ? null : state.selectedStudent,
        deleting: false,
      }));
      toast.success('Student deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error(error.response?.data?.message || 'fadlan khadka iska hubi')
      set({ deleting: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  assignStudentToClass: async (studentId, classId) => {
    try {
      const response = await axios.post(`/students/${studentId}/${classId}`);
      set(state => ({
        students: state.students.map(student =>
          student._id === studentId ? { ...student, class: response.data.class } : student
        )
      }));
      toast.success('Student assigned to class successfully');
      return { success: true };
    } catch (error) {
      console.error('Error assigning student to class:', error);
      toast.error(error.response?.data?.message || 'fadlan khadka iska hubi')
    }
  },

  trackFeePayment: async (id, feeData) => {
    try {
      const response = await axios.patch(`/students/track-fee/${id}`, feeData);
      set(state => ({
        students: state.students.map(student =>
          student._id === id ? { ...student, fee: response.data.fee } : student
        )
      }));
      toast.success('Fee payment tracked successfully');
      return { success: true };
    } catch (error) {
      console.error('Error tracking fee payment:', error);
      toast.error(error.response?.data?.message || 'Failed to track fee payment');
      return { success: false, message: error.response?.data?.message };
    }
  },

  clearSelectedStudent: () => set({ selectedStudent: null }),

  // <-- New searchStudents function -->
  searchStudents: (query) => {
    const { students } = get()
    const normalizedQuery = String(query || '').toLowerCase().trim()
    if (!normalizedQuery) return students

    return students.filter((student) => {
      const nameMatch = student.fullname?.toLowerCase().includes(normalizedQuery)
      const studentIdMatch = student.studentId?.toLowerCase().includes(normalizedQuery)
      const objectId = student._id ? String(student._id) : ''
      const objectIdMatch = objectId.toLowerCase().includes(normalizedQuery) ||
        objectId.slice(-6).toLowerCase().includes(normalizedQuery)
      const motherMatch = String(student.motherNumber || '').toLowerCase().includes(normalizedQuery)
      const fatherMatch = String(student.fatherNumber || '').toLowerCase().includes(normalizedQuery)
      const classMatch = student.class?.name?.toLowerCase().includes(normalizedQuery)
      const ageMatch = String(student.age ?? '').toLowerCase().includes(normalizedQuery)
      const genderMatch = student.gender?.toLowerCase().startsWith(normalizedQuery)

      return (
        nameMatch ||
        studentIdMatch ||
        objectIdMatch ||
        motherMatch ||
        fatherMatch ||
        classMatch ||
        ageMatch ||
        genderMatch
      )
    })
  },
}));

export default useStudentsStore;
