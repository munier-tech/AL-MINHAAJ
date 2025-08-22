import axios from '../config/axios'

export const LessonRecordsAPI = {
  createQuran: (payload) => axios.post('/lesson-records/quran', payload), // expects { classId, dailyLessonNumber, currentSurah, taxdiid, studentStatus, notes, studentPerformances }
  getQuranByClassMonth: (classId, month, year) => axios.get(`/lesson-records/quran/class/${classId}`, { params: { month, year } }),
  createSubci: (payload) => axios.post('/lesson-records/subci', payload),
  getByHalaqa: (halaqaId) => axios.get(`/lesson-records/halaqa/${halaqaId}`),
  remove: (id) => axios.delete(`/lesson-records/delete/${id}`),
}

export default LessonRecordsAPI