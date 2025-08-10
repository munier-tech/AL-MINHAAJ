import { useEffect, useState } from 'react';
import useTeacherAttendanceStore from '../../store/teacherAttendanceStore';
import useTeachersStore from '../../store/teachersStore';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const tableRowVariants = {
  hidden: { x: -10, opacity: 0 },
  show: { x: 0, opacity: 1 }
};

const GetTeacherAttendanceByDate = () => {
  const { 
    attendanceRecords, 
    getAttendanceByDate, 
    loading, 
    error 
  } = useTeacherAttendanceStore();
  
  const { teachers, fetchTeachers } = useTeachersStore();
  
  const [dateRange, setDateRange] = useState({
    from: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    to: dayjs().format('YYYY-MM-DD')
  });
  const [selectedTeacher, setSelectedTeacher] = useState('');

  // Group records by date
  const groupedRecords = (attendanceRecords || []).reduce((acc, record) => {
    const dateKey = dayjs(record.date).format('YYYY-MM-DD');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(record);
    return acc;
  }, {});

  const handleSearch = () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error('Fadlan dooro taariikhda "laga bilaabo" iyo "ilaa"');
      return;
    }
    getAttendanceByDate({ from: dateRange.from, to: dateRange.to, teacherId: selectedTeacher || null });
  };

  const handleClearFilters = () => {
    setSelectedTeacher('');
    setDateRange({
      from: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
      to: dayjs().format('YYYY-MM-DD')
    });
    getAttendanceByDate({ 
      from: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
      to: dayjs().format('YYYY-MM-DD')
    });
  };

  useEffect(() => {
    fetchTeachers();
    // Load last 7 days by default
    getAttendanceByDate({ 
      from: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
      to: dayjs().format('YYYY-MM-DD')
    });
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="text-2xl font-bold text-gray-800"
        >
          Diiwaangelinta Imtixaanka Macallimiinta
        </motion.h2>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <div className="grid md:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Laga Bilaabo</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
              className="border border-gray-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500"
              max={dayjs().format('YYYY-MM-DD')}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ilaa</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
              className="border border-gray-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500"
              max={dayjs().format('YYYY-MM-DD')}
              min={dateRange.from}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Macallin</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Dhammaan Macallimiinta</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-end space-x-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Raadinaya...' : 'Raadi'}
            </button>
            <button
              onClick={handleClearFilters}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Tirtir
            </button>
          </motion.div>
        </div>
      </motion.div>

      {loading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center h-64"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
          ></motion.div>
        </motion.div>
      ) : (attendanceRecords || []).length === 0 ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-8 text-center"
        >
          <p className="text-gray-500 text-lg">Waxba lama helin diiwaangelin imtixaan ah oo ku habboon shuruudaha la dooranayay</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {Object.entries(groupedRecords).sort(([dateA], [dateB]) => dayjs(dateB).diff(dayjs(dateA))).map(([date, records]) => (
            <motion.div 
              key={date}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">
                  {dayjs(date).format('dddd, MMMM D, YYYY')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Macallin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xaaladda</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wakhti</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faallooyin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qofu Diiwaan Geliyay</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {records.map((record) => (
                        <motion.tr
                          key={record._id}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          whileHover={{ scale: 1.01 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <motion.div 
                                whileHover={{ scale: 1.1 }}
                                className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"
                              >
                                <span className="text-blue-600 font-medium">
                                  {record.teacher?.name?.charAt(0) || 'M'}
                                </span>
                              </motion.div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{record.teacher?.name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{record.teacher?.email || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.span 
                              whileHover={{ scale: 1.05 }}
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                record.status === 'present' ? 'bg-green-100 text-green-800' :
                                record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {record.status === 'present' ? 'jooga' : 
                               record.status === 'absent' ? 'Maqan' : 
                               'Daahay'}
                            </motion.span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {record.checkIn || '-'} {record.checkOut && `→ ${record.checkOut}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            {record.notes || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.recordedBy?.name || 'System'}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default GetTeacherAttendanceByDate;