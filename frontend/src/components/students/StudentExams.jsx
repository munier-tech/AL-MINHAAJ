import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useExamStore } from '../../store/examStore';
import useStudentsStore from '../../store/studentsStore';
import PrintButton from '../common/PrintButton';

const StudentExams = () => {
  // State-ka maxaliga ah (Local state)
  const [academicYear, setAcademicYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Zustand stores
  const { 
    loading, 
    error, 
    studentExams, 
    getStudentExamsByYear,
    clearMessages 
  } = useExamStore();

  const { 
    students, 
    fetchStudents,
    loading: loadingStudents 
  } = useStudentsStore();

  // Soo dejinta ardayda marka uu component-ku furmo (Fetch students on component mount)
  useEffect(() => {
    fetchStudents();
    return () => clearMessages();
  }, [fetchStudents, clearMessages]);

  // Si loo shaandheeyo ardayda iyadoo la eegayo raadinta (Filter students based on search query)
  const filteredStudents = students.filter(student => {
    if (!searchQuery) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      student.fullname?.toLowerCase().includes(searchLower) ||
      student._id?.toLowerCase().includes(searchLower) ||
      student.class?.name?.toLowerCase().includes(searchLower)
    );
  });

  // Hubinta foomka (Form validation)
  const validateForm = () => {
    const errors = {};
    if (!selectedStudent) errors.student = 'Fadlan dooro arday';
    if (!academicYear) {
      errors.academicYear = 'Sannadka waxbarashada waa loo baahan yahay';
    } else if (!/^\d{4}\/\d{4}$/.test(academicYear)) {
      errors.academicYear = 'Qaabku waa inuu ahaadaa YYYY/YYYY';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Shaqada marka foomka la gudbiyo (Handle form submission)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const requestData = {
        studentId: selectedStudent._id,
        academicYear: academicYear
      };

      await getStudentExamsByYear(requestData);
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  // Shaqada marka la doorto arday
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSearchQuery(`${student.fullname} (${student._id})`);
    setDropdownOpen(false);
    setFormErrors(prev => ({ ...prev, student: '' }));
  };

  // Shaqada nadiifinta doorashada (Clear selection)
  const clearSelection = () => {
    setSelectedStudent(null);
    setSearchQuery('');
    setFormErrors(prev => ({ ...prev, student: '' }));
    setDropdownOpen(false);
  };

  // Shaqada isbedelka raadinta
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value && !dropdownOpen) {
      setDropdownOpen(true);
    }
    if (!value) {
      clearSelection();
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Diiwaanka Imtixaanaadka Ardayga</h1>
        
        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          {/* Raadinta ardayga */}
          <div className="relative">
            <label htmlFor="studentSearch" className="block text-sm font-medium text-gray-700">
              Raadi Ardayga <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                id="studentSearch"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && setDropdownOpen(true)}
                className={`w-full px-3 py-2 border ${formErrors.student ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Ku raadi magac ama aqoonsi"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="absolute right-8 top-2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={18} />
                </button>
              )}
              <FiSearch className="absolute right-2 top-2.5 text-gray-400" />
            </div>
            {formErrors.student && (
              <p className="mt-1 text-sm text-red-600">{formErrors.student}</p>
            )}
            
            {/* Liiska hoos u dhaca ah (Dropdown menu) */}
            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {loadingStudents ? (
                  <div className="p-2 text-center text-gray-500">Ardayda ayaa la soo dejinayaa...</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-2 text-center text-gray-500">
                    {searchQuery ? "Lama helin arday u dhiganta" : "Bilaab raadinta"}
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <div
                      key={student._id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                      onClick={() => handleStudentSelect(student)}
                    >
                      <div className="font-medium">{student.fullname}</div>
                      <div className="text-xs text-gray-500">
                        Aqoonsi: {student._id} • Fasalka: {student.class?.name || 'Ma jiro'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sannadka Waxbarashada */}
          <div>
            <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">
              Sannadka Waxbarashada (YYYY/YYYY) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="academicYear"
              value={academicYear}
              onChange={(e) => {
                setAcademicYear(e.target.value);
                setFormErrors(prev => ({ ...prev, academicYear: '' }));
              }}
              className={`mt-1 block w-full px-3 py-2 border ${formErrors.academicYear ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder="tusaale, 2023/2024"
              required
            />
            {formErrors.academicYear && (
              <p className="mt-1 text-sm text-red-600">{formErrors.academicYear}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !selectedStudent || !academicYear}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Waa la raadinayaa...
              </>
            ) : (
              'Raadi Imtixaanaadka'
            )}
          </button>
        </form>

        {/* Xaalada Cillada */}
        {error && (
          <div className="text-center text-red-600 font-medium p-4 bg-red-50 rounded-md border border-red-200">
            Cillad: {error}
          </div>
        )}

        {/* Soo bandhigida Natiijooyinka */}
        {!loading && !error && (studentExams || []).length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Natiijooyinka Imtixaanka</h2>
              <PrintButton
                title="Diiwaanka Imtixaannada Ardayga"
                subtitle={`${selectedStudent?.fullname || 'Ma jiro'} - ${academicYear}`}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {`
                  <div class="info-section">
                    <div class="info-label">Macluumaadka Ardayga</div>
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-key">Magaca Ardayga:</span>
                        <span class="info-value">${selectedStudent?.fullname || 'Ma jiro'}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-key">Lambarka Ardayga:</span>
                        <span class="info-value">${selectedStudent?._id || 'Ma jiro'}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-key">Fasalka:</span>
                        <span class="info-value">${selectedStudent?.class?.name || 'Ma jiro'}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-key">Sannadka Waxbarashada:</span>
                        <span class="info-value">${academicYear}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-key">Wadarta Imtixaannada:</span>
                        <span class="info-value">${studentExams.length}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-key">Celceliska Dhibcaha:</span>
                        <span class="info-value">${studentExams.length > 0 ? Math.round((studentExams.reduce((sum, exam) => sum + (exam?.obtainedMarks || 0), 0) / studentExams.length)) : 0}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="summary-stats">
                    <div class="stat-item">
                      <div class="stat-number">${studentExams.filter(exam => {
                        const percentage = ((exam?.obtainedMarks || 0) / (exam?.totalMarks || 100)) * 100;
                        return percentage >= 90;
                      }).length}</div>
                      <div class="stat-label">Darajada A</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">${studentExams.filter(exam => {
                        const percentage = ((exam?.obtainedMarks || 0) / (exam?.totalMarks || 100)) * 100;
                        return percentage >= 80 && percentage < 90;
                      }).length}</div>
                      <div class="stat-label">Darajada B</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">${studentExams.filter(exam => {
                        const percentage = ((exam?.obtainedMarks || 0) / (exam?.totalMarks || 100)) * 100;
                        return percentage >= 70 && percentage < 80;
                      }).length}</div>
                      <div class="stat-label">Darajada C</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">${studentExams.filter(exam => {
                        const percentage = ((exam?.obtainedMarks || 0) / (exam?.totalMarks || 100)) * 100;
                        return percentage < 70;
                      }).length}</div>
                      <div class="stat-label">Ka Hooseeya C</div>
                    </div>
                  </div>
                  
                  <table>
                    <thead>
                      <tr>
                        <th>Mawduuca</th>
                        <th>Fasalka</th>
                        <th>Macalinka</th>
                        <th>Dhibcaha La Helay</th>
                        <th>Wadarta</th>
                        <th>Nooca Imtixaanka</th>
                        <th>Taariikhda</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(studentExams || []).map((exam) => `
                        <tr>
                          <td>${exam.subjectId?.name || 'Ma jiro'}</td>
                          <td>${exam.class?.name || 'Ma jiro'}</td>
                          <td>${exam.teacher?.name || 'Ma jiro'}</td>
                          <td>${exam.obtainedMarks || 'Ma jiro'}</td>
                          <td>${exam.totalMarks || 'Ma jiro'}</td>
                          <td>${exam.examType ? exam.examType.charAt(0).toUpperCase() + exam.examType.slice(1) : 'Ma jiro'}</td>
                          <td>${exam.date ? new Date(exam.date).toLocaleDateString() : 'Ma jiro'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `}
              </PrintButton>
            </div>
            {console.log('Rendering studentExams:', studentExams)}
            {(studentExams || []).map((exam) => (
              <div key={exam._id} className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-indigo-600">{exam.subjectId?.name || 'Ma jiro'}</span>
                  <span className="text-gray-600 text-sm">{exam.date ? new Date(exam.date).toLocaleDateString() : 'Ma jiro'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Fasalka:</span> {exam.class?.name || 'Ma jiro'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Dhibcaha:</span> {exam.obtainedMarks || 'Ma jiro'} / {exam.totalMarks || 'Ma jiro'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Nooca:</span> {exam.examType ? exam.examType.charAt(0).toUpperCase() + exam.examType.slice(1) : 'Ma jiro'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && selectedStudent && academicYear && (!studentExams || (studentExams || []).length === 0) && (
          <div className="text-center text-gray-500 p-4 bg-yellow-50 rounded-md border border-yellow-200">
            Lama helin diiwaanka imtixaanka ee ardayga iyo sannad waxbarasho ee la doortay.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExams;
