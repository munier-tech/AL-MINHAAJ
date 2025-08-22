import axios from '../config/axios'

export const LessonRecordsAPI = {
  createQuran: (payload) => axios.post('/lesson-records/quran', payload),
  createSubci: (payload) => axios.post('/lesson-records/subci', payload),
  getByHalaqa: (halaqaId) => axios.get(`/lesson-records/halaqa/${halaqaId}`),
  remove: (id) => axios.delete(`/lesson-records/delete/${id}`),
}

export default LessonRecordsAPI