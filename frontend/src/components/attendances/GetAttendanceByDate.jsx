import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiCheck, FiX, FiClock, FiCalendar, FiChevronDown, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import useAttendanceStore from '../../store/attendanceStore';
import useClassesStore from '../../store/classesStore';
import PrintButton from '../common/PrintButton';

const AttendanceByDate = () => {
  const navigate = useNavigate();
  
  // Zustand stores
  const { 
    getAttendanceClassByDate, 
    updateAttendance, 
    deleteAttendance,
    loading,
    updating,
    deleting 
  } = useAttendanceStore();
  const { classes, fetchClasses } = useClassesStore();
  
  // Local state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [attendance, setAttendance] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedStatus, setEditedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  
  // Fetch classes on mount
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Find the selected class details
  const classDetails = classes.find(c => c._id === selectedClass);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedDate) return;
    
    try {
      const response = await getAttendanceClassByDate(selectedClass, selectedDate);
      if (response.success) {
        setAttendance(response.attendance);
      } else {
        setAttendance(null);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Khalad ayaa dhacay markii la soo dejiniyay xogta xaadiriska');
      setAttendance(null);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (studentId) => {
    if (!editedStatus) return;
    
    try {
      const updatedStudents = attendance.students.map(student => 
        student.student._id === studentId ? { ...student, status: editedStatus } : student
      );
      
      const updatedAttendance = {
        ...attendance,
        students: updatedStudents
      };
      
      await updateAttendance(attendance._id, updatedAttendance);
      setAttendance(updatedAttendance);
      setEditingId(null);
      toast.success('Xaaladda xaadiriska si guul leh ayaa loo cusbooneysiiyay');
    } catch (error) {
      toast.error('Khalad ayaa dhacay markii la cusbooneysiinayay xaadiriska');
      console.error('Error updating attendance:', error);
    }
  };

  // Handle delete attendance
  const handleDeleteAttendance = async () => {
    const confirmation = window.confirm('Ma hubtaa inaad rabto inaad tirtirto xaadiriska maalintan?');
    if (!confirmation) return;
    
    try {
      await deleteAttendance(attendance?._id);
      toast.success('Xaadiriska si guul leh ayaa loo tirtiray');
      setAttendance(null);
    } catch (error) {
      toast.error('Khalad ayaa dhacay markii la tirtirayay xaadiriska');
      console.error('Error deleting attendance:', error);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusMap = {
      present: { color: 'bg-green-100 text-green-800', icon: <FiCheck className="mr-1" /> },
      absent: { color: 'bg-red-100 text-red-800', icon: <FiX className="mr-1" /> },
      late: { color: 'bg-yellow-100 text-yellow-800', icon: <FiClock className="mr-1" /> }
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[status]?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusMap[status]?.icon}
        {status === 'present' ? 'Xaadir' : status === 'absent' ? 'Maqan' : status === 'Late' ? "Habsan" : 'Xaalad aan la garanayn'}
      </span>
    );
  };

  // Filter students based on search query
  const filteredStudents = attendance?.students?.filter(student => {
    if (!searchQuery.trim()) return true;
    return student.student?.fullname?.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  if (loading && !attendance) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/classes')}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <FiArrowLeft className="mr-1" />
          Dib ugu noqo fasalka
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Raadi Xaadiriska Fasalka
        </h1>
      </div>
      
      {/* Class and Date Selection Form */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-56 mb-8 p-6">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:flex md:space-x-4">
          {/* Class Dropdown */}
          <div className="relative w-full md:w-1/3">
            <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
              Dooro Fasalka
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classDetails?.name || 'Dooro Fasalka'}
                <FiChevronDown className="ml-2" />
              </button>
              
              {isClassDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {classes.map((cls) => (
                    <div
                      key={cls._id}
                      onClick={() => {
                        setSelectedClass(cls._id);
                        setIsClassDropdownOpen(false);
                      }}
                      className={`px-4 py-2 hover:bg-blue-50 cursor-pointer ${selectedClass === cls._id ? 'bg-blue-100' : ''}`}
                    >
                      {cls.name} - {cls.level}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Date Picker */}
          <div className="w-full md:w-1/3">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Dooro Taariikhda
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                max={dayjs().format('YYYY-MM-DD')}
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="w-full md:w-1/3 flex items-end">
            <button
              type="submit"
              disabled={!selectedClass || !selectedDate || loading}
              className="w-full md:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Raaditaanka...' : 'Raadi Xaadiriska'}
            </button>
          </div>
        </form>
      </div>

      {/* Attendance Results */}
      {attendance && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {classDetails?.name} - {dayjs(selectedDate).format('dddd, MMMM D, YYYY')}
                </h2>
                <p className="text-gray-600">
                  {attendance.students.filter(s => s.status === 'present').length} Xaadir, 
                  {' '}{attendance.students.filter(s => s.status === 'absent').length} Maqan, 
                  {' '}{attendance.students.filter(s => s.status === 'late').length} Habsan
                </p>
              </div>
              
              <div className="flex space-x-2">
                <PrintButton
                  title="Qoraal Xaadiriska"
                  subtitle={`${classDetails?.name} - ${dayjs(selectedDate).format('dddd, MMMM D, YYYY')}`}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {`
                    <div class="info-section">
                      <div class="info-label">Macluumaadka Fasalka</div>
                      <div class="info-grid">
                        <div class="info-item">
                          <span class="info-key">Fasalka:</span>
                          <span class="info-value">${classDetails?.name || 'Ma jiro'}</span>
                        </div>
                        <div class="info-item">
                          <span class="info-key">Taariikhda:</span>
                          <span class="info-value">${dayjs(selectedDate).format('dddd, MMMM D, YYYY')}</span>
                        </div>
                        <div class="info-item">
                          <span class="info-key">Wadarta Ardayda:</span>
                          <span class="info-value">${attendance.students.length}</span>
                        </div>
                        <div class="info-item">
                          <span class="info-key">Heerka Xaadiriska:</span>
                          <span class="info-value">${Math.round((attendance.students.filter(s => s.status === 'present').length / attendance.students.length) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="summary-stats">
                      <div class="stat-item">
                        <div class="stat-number">${attendance.students.filter(s => s.status === 'present').length}</div>
                        <div class="stat-label">Xaadir</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-number">${attendance.students.filter(s => s.status === 'absent').length}</div>
                        <div class="stat-label">Maqan</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-number">${attendance.students.filter(s => s.status === 'late').length}</div>
                        <div class="stat-label">Soo Daahay</div>
                      </div>
                    </div>
                    
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Magaca Ardayga</th>
                          <th>Xaaladda</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${filteredStudents.map((student, index) => `
                          <tr>
                            <td>${index + 1}</td>
                            <td>${student.student?.fullname || 'Ma jiro'}</td>
                            <td class="status-${student.status}">
                              ${student.status === 'present' ? 'Xaadir' : student.status === 'absent' ? 'Maqan' : 'Soo Daahay'}
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  `}
                </PrintButton>
                <button
                  onClick={handleDeleteAttendance}
                  disabled={deleting}
                  className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  <FiTrash2 className="mr-1" />
                  {deleting ? 'Tirtirka...' : 'Tirtir Xaadiriska'}
                </button>
              </div>
            </div>

            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Raadi ardayga..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Magaca</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xaaladda</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ficil</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        Ardayda aad raadineyso ma helin
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <tr key={student.student?._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.student?.fullname || 'Arday aan la garanayn'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingId === student.student?._id ? (
                            <select
                              value={editedStatus || student.status}
                              onChange={(e) => setEditedStatus(e.target.value)}
                              className="border border-gray-300 rounded-md px-2 py-1"
                            >
                              <option value="present">Xaadir</option>
                              <option value="absent">Maqan</option>
                              <option value="late">Habsan</option>
                            </select>
                          ) : (
                            <StatusBadge status={student.status} />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingId === student.student?._id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateStatus(student.student?._id)}
                                disabled={updating}
                                className="text-green-600 hover:text-green-900 flex items-center"
                              >
                                <FiCheck className="mr-1" />
                                Kaydi
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-red-600 hover:text-red-900 flex items-center"
                              >
                                <FiX className="mr-1" />
                                Jooji
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(student.student?._id);
                                setEditedStatus(student.status);
                              }}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <FiEdit2 className="mr-1" />
                              Wax ka beddel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceByDate;