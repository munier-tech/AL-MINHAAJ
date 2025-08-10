import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCalendar, FiCheck, FiX, FiClock, FiUsers } from 'react-icons/fi';
import { format } from 'date-fns';
import useClassesStore from '../../store/classesStore';
import useStudentsStore from '../../store/studentsStore';
import useAttendanceStore from '../../store/attendanceStore';
import { toast } from 'react-hot-toast';

// Somali translations
const translations = {
  heading: "Diiwaangelinta Imaatinka",
  selectClass: "Dooro Fasalka",
  selectDate: "Dooro Taariikhda",
  studentName: "Magaca Ardayga",
  age: "Da'da",
  gender: "Jinsiga",
  status: "Xaaladda",
  present: "Imaan",
  absent: "Ma Iman",
  late: "Daahid",
  submit: "Diiwaan Gelin",
  loading: "Soo dejineyn...",
  noClasses: "Ma jiro fasallo la heli karo",
  noStudents: "Fasalkan ma laha arday",
  success: "Imaatinka si guul leh ayaa loo diiwaangeliyay",
  error: "Qalad ayaa dhacay",
  creating: "Diiwaangelinta...",
  requiredFields: "Fadlan buuxi dhammaan goobaha loo baahan yahay"
};

const CreateAttendance = () => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Using stores
  const { classes, fetchClasses } = useClassesStore();
  const { students, fetchStudentsByClass } = useStudentsStore();
  const { createAttendance, creating } = useAttendanceStore();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchStudentsByClass(selectedClassId);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (students.length > 0) {
      setAttendanceRecords(
        students.map(student => ({
          student: student._id,
          status: 'present', // Default to present
          name: student.fullname,
          age: student.age,
          gender: student.gender
        }))
      );
    }
  }, [students]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.student === studentId ? { ...record, status } : record
      )
    );
  };

  const handleSubmit = async () => {
    if (!selectedClassId || !selectedDate || attendanceRecords.length === 0) {
      toast.error(translations.requiredFields);
      return;
    }

    try {
      const attendanceData = {
        classId: selectedClassId,
        date: selectedDate,
        students: attendanceRecords
      };

      const result = await createAttendance(attendanceData);
      
      if (result.success) {
        toast.success(translations.success);
        // Reset form
        setSelectedClassId('');
        setSelectedDate(new Date());
        setAttendanceRecords([]);
      }
    } catch (error) {
      toast.error(translations.error);
    }
  };

  const getGenderTranslation = (gender) => {
    return gender === 'male' ? 'Lab' : 'Dheddig';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{translations.heading}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.selectClass}
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{translations.selectClass}</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.selectDate}
            </label>
            <div className="relative">
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FiCalendar className="absolute right-3 top-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        {!selectedClassId && classes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {translations.noClasses}
          </div>
        )}

        {selectedClassId && students.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {translations.noStudents}
          </div>
        )}

        {students.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.studentName}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.age}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.gender}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.status}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record, index) => (
                  <motion.tr
                    key={record.student}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{record.age}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {getGenderTranslation(record.gender)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStatusChange(record.student, 'present')}
                          className={`px-3 py-1 rounded-md text-sm flex items-center ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <FiCheck className="mr-1" /> {translations.present}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStatusChange(record.student, 'absent')}
                          className={`px-3 py-1 rounded-md text-sm flex items-center ${
                            record.status === 'absent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <FiX className="mr-1" /> {translations.absent}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStatusChange(record.student, 'late')}
                          className={`px-3 py-1 rounded-md text-sm flex items-center ${
                            record.status === 'late'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <FiClock className="mr-1" /> {translations.late}
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {students.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={creating}
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 flex items-center ${
              creating ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {creating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {translations.creating}
              </>
            ) : (
              translations.submit
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default CreateAttendance;