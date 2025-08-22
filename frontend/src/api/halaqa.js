import axios from '../config/axios'

export const HalaqaAPI = {
  create: (data) => axios.post('/halaqas/create', data),
  getAll: () => axios.get('/halaqas/getAll'),
  searchByName: (name) => axios.get(`/halaqas/search`, { params: { name } }),
  getById: (id) => axios.get(`/halaqas/${id}`),
  update: (id, data) => axios.put(`/halaqas/update/${id}`, data),
  remove: (id) => axios.delete(`/halaqas/delete/${id}`),
  addStudents: (id, studentIds) => axios.post(`/halaqas/${id}/students`, { studentIds }),
  removeStudent: (id, studentId) => axios.delete(`/halaqas/${id}/students/${studentId}`),
}

export default HalaqaAPI