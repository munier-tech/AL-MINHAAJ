import { useState, useEffect } from 'react';
import { getTeacherAttendance } from '../../src/api/teacherAttendance';

export function useTeachers(from, to, teacherFilter = '') {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getTeacherAttendance(from, to, teacherFilter);
      setAttendance(data);
      setError(null);
    } catch (err) {
      setError(err);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [from, to, teacherFilter]);

  return { attendance, loading, error, refetch };
}