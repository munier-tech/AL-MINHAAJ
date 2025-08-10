import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useTeacherAttendanceStore from '../../store/teacherAttendanceStore';
import useTeachersStore from '../../store/teachersStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

const CreateTeacherAttendance = () => {
  const { teachers, fetchTeachers } = useTeachersStore();
  const { createAttendance, loading, success, error, clearStatus } = useTeacherAttendanceStore();

  const [formData, setFormData] = useState({
    teacherId: '',
    date: new Date(),
    status: 'present',
    checkIn: '',
    checkOut: '',
    notes: '',
  });

  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (success) {
      toast.success("Diiwaangelinta ayaa lagu guulaystey");
      clearStatus();
      setAttendanceRecords([...attendanceRecords, formData]);
      resetForm();
    } else if (error) {
      toast.error(error);
      clearStatus();
    }
  }, [success, error]);

  const resetForm = () => {
    setFormData({
      teacherId: '',
      date: new Date(),
      status: 'present',
      checkIn: '',
      checkOut: '',
      notes: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.teacherId) {
      return toast.error("Macallinka ayaa loo baahan yahay");
    }
    createAttendance({
      ...formData,
      date: formData.date.toISOString().split('T')[0]
    });
  };

  const handleBulkStatusChange = (status) => {
    if (!formData.teacherId) return;
    setFormData({ ...formData, status });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Maamulka Diiwaangelinta Macallimiinta</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Attendance Form */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="lg:col-span-1 bg-gray-50 p-6 rounded-lg"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Diiwaangelinta</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Macallin</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Xulo Macallin</option>
                    {(teachers || []).map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taariikhda</label>
                  <DatePicker
                    selected={formData.date}
                    onChange={(date) => setFormData({ ...formData, date })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    dateFormat="MMMM d, yyyy"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xaaladda</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handleBulkStatusChange('present')}
                      className={`py-1 px-2 rounded text-sm ${formData.status === 'present' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800'}`}
                    >
                      jooga
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handleBulkStatusChange('absent')}
                      className={`py-1 px-2 rounded text-sm ${formData.status === 'absent' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-100 text-gray-800'}`}
                    >
                      Maqan
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handleBulkStatusChange('late')}
                      className={`py-1 px-2 rounded text-sm ${formData.status === 'late' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-gray-100 text-gray-800'}`}
                    >
                      Daahay
                    </motion.button>
                  </div>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="present">jooga</option>
                    <option value="absent">Maqan</option>
                    <option value="late">Daahay</option>
                    <option value="on_leave">Fasax</option>
                  </select>
                </motion.div>

                {formData.status === 'present' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Soo Gal</label>
                      <input
                        type="time"
                        value={formData.checkIn}
                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ka Bax</label>
                      <input
                        type="time"
                        value={formData.checkOut}
                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faallooyin</label>
                  <textarea
                    placeholder="Faallooyin dheeraad ah (ikhtiyaari)"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !formData.teacherId}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading || !formData.teacherId ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="-ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </motion.svg>
                      Diyaarinaya...
                    </span>
                  ) : 'Diiwaangeli'}
                </motion.button>
              </form>
            </motion.div>

            {/* Recent Attendance Records */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-700">Diiwaangelinta Ugu Dambeysay</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taariikhda</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Macallin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xaaladda</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wakhti</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faallooyin</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <AnimatePresence>
                        {attendanceRecords.length > 0 ? (
                          attendanceRecords.map((record, index) => (
                            <motion.tr
                              key={index}
                              variants={tableRowVariants}
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              whileHover={{ scale: 1.01 }}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.date instanceof Date ? record.date.toLocaleDateString() : record.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"
                                  >
                                    <span className="text-blue-600 font-medium">
                                      {teachers.find(t => t._id === record.teacherId)?.name.charAt(0) || 'M'}
                                    </span>
                                  </motion.div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {teachers.find(t => t._id === record.teacherId)?.name || 'Macallin aan la aqoon'}
                                    </div>
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
                                  {record.status === 'present' ? 'Hagaag' : 
                                   record.status === 'absent' ? 'Maqan' : 
                                   'Daahay'}
                                </motion.span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.checkIn && `${record.checkIn} - ${record.checkOut || '--'}`}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {record.notes || '--'}
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                              Weli ma jiraan diiwaangelin. Diiwaangeli si aad u aragto halkan.
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateTeacherAttendance;