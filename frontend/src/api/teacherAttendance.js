import axios from '../config/axios';

export const recordTeacherAttendance = async (data) => {
  const response = await axios.post('/teacher-attendance', data);
  return response.data;
};

export const getTeacherAttendance = async (from, to, teacherFilter = '') => {
  const params = { from, to };
  if (teacherFilter) params.teacherFilter = teacherFilter;
  
  const response = await axios.get('/api/teacher-attendance', { params });
  return response.data;
};