import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  FiSearch,
  FiUser,
  FiDollarSign,
  FiEdit2,
  FiCheck,
  FiX, FiActivity,
  FiBook,
  FiAlertTriangle
} from 'react-icons/fi';
import useStudentsStore from '../../store/studentsStore';
import useClassesStore from '../../store/classesStore';
import { useSubjectStore } from '../../store/subjectsStore';

// Somali translations
const translations = {
  search: {
    placeholder: "Raadi arday magaciisa",
    noResults: "Lama helin arday",
    age: "Da'da",
    class: "Fasalka"
  },
  student: {
    header: "Macluumaadka Ardayga",
    id: "Aqoonsi",
    class: "Fasalka",
    none: "Ma lahan",
    edit: "Wax ka beddel",
    cancel: "Jooji",
    save: "Kaydi"
  },
  tabs: {
    basic: "Macluumaadka aasaasiga ah",
    health: "Diiwaanka caafimaadka",
    exams: "Diiwaanka imtixaannada",
    discipline: "Anshaxa Ardayga",
    attendance: "Imaatinka"
  },
  health: {
    condition: "Xaalad",
    date: "Taariikh",
    note: "Qoraal",
    treated: "La daweeyay",
    pending: "Sugaya daaweyn",
    noRecords: "Lama hayo diiwaan caafimaad"
  },
  exams: {
    subject: "Qaybta",
    score: "Qiimaynta",
    grade: "Darajo",
    examType: "Nooca imtixaanka",
    date: "Taariikh",
    noRecords: "Lama hayo diiwaan imtixaan"
  },
  discipline: {
    type: "Nooca",
    description: "Sharaxaad",
    date: "Taariikh",
    resolved: "La xalliyay",
    pending: "Sugaya xallin",
    noRecords: "Lama hayo diiwaan dabeecad"
  },
  fee: {
    title: "Warbixinta lacagta",
    total: "Wadarta lacagta",
    paid: "Lacagta la bixiyay",
    balance: "Haraaga",
    status: "Xaaladda",
    noFee: "Lacag la'aan",
    paidFull: "La bixiyay",
    overpaid: "Dheeraad ayaa la bixiyay",
    pending: "lama dhameystirin",
    recordPayment: "Diiwaan geli bixinta",
    currentBalance: "Haraaga hadda",
    amount: "Qadarka ($)",
    confirm: "Xaqiiji",
    assignClass: "U qoondee fasalka"
  },
  buttons: {
    recordPayment: "Diiwaan geli bixinta",
    assignClass: "U qoondee fasalka",
    saveChanges: "Kaydi isbedelada",
    cancel: "Jooji"
  }
};

const GetStudentById = () => {
  const {
    students,
    selectedStudent,
    fetchStudents,
    fetchStudentById,
    clearSelectedStudent,
    trackFeePayment,
    assignStudentToClass,
    updateStudent,
    searchStudents,
  } = useStudentsStore();

  const { classes, fetchClasses } = useClassesStore();
  const { subjects, getAllSubjects } = useSubjectStore();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [totalFee, setTotalFee] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    age: '',
    gender: '',
    class: '',
    motherNumber: '',
    fatherNumber: ''
  });
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Helper function to calculate grade with colors
  const getGradeDetails = (marks, total) => {
    const percentage = (marks / total) * 100;
    let grade, color, bgColor;
    
    if (percentage >= 90) {
      grade = 'A';
      color = 'text-green-800';
      bgColor = 'bg-green-100';
    } else if (percentage >= 80) {
      grade = 'B';
      color = 'text-blue-800';
      bgColor = 'bg-blue-100';
    } else if (percentage >= 70) {
      grade = 'C';
      color = 'text-yellow-800';
      bgColor = 'bg-yellow-100';
    } else if (percentage >= 60) {
      grade = 'D';
      color = 'text-orange-800';
      bgColor = 'bg-orange-100';
    } else {
      grade = 'F';
      color = 'text-red-800';
      bgColor = 'bg-red-100';
    }
    
    return { grade, color, bgColor, percentage };
  };

  // Data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchStudents(), fetchClasses(), getAllSubjects()]);
      } catch (error) {
        toast.error('Qalad ayaa ka dhacay markii la soo dejinnay xogta');
      }
    };
    loadInitialData();
    return () => clearSelectedStudent();
  }, [fetchStudents, fetchClasses, getAllSubjects, clearSelectedStudent]);

  // Search functionality
  useEffect(() => {
    setFilteredStudents(
      searchQuery.trim() === '' ? [] : searchStudents(searchQuery)
    );
  }, [searchQuery, students, searchStudents]);

  // Student selection handler
  const handleSelectStudent = async (id) => {
    setIsSelecting(true);
    try {
      const response = await fetchStudentById(id);
      if (response?.success && response.student) {
        setEditForm({
          fullname: response.student.fullname,
          age: response.student.age,
          gender: response.student.gender,
          class: response.student.class?._id || '',
          motherNumber: response.student.motherNumber || '',
          fatherNumber: response.student.fatherNumber || ''
        });
      }
    } catch (error) {
      toast.error('Qalad ayaa ka dhacay markii la soo dejinnay macluumaadka ardayga');
    } finally {
      setIsSelecting(false);
    }
  };

  // Action handlers
  const handleFeePayment = async () => {
    if (!totalFee || !paidAmount || isNaN(totalFee) || isNaN(paidAmount)) {
      toast.error('Fadlan geli qadarka saxda ah');
      return;
    }

    try {
      const { success } = await trackFeePayment(selectedStudent._id, {
        total: parseFloat(totalFee),
        paid: parseFloat(paidAmount),
      });

      if (success) {
        toast.success('Lacagta si guul leh ayaa loo diiwaan geliyay');
        setIsFeeModalOpen(false);
        setTotalFee('');
        setPaidAmount('');
        await fetchStudentById(selectedStudent._id);
      }
    } catch {
      toast.error('Qalad ayaa ka dhacay markii la diiwaan gelinayay lacagta');
    }
  };

  const handleAssignClass = async () => {
    if (!selectedClassId) {
      toast.error('Fadlan dooro fasalka');
      return;
    }

    try {
      const { success } = await assignStudentToClass(selectedStudent._id, selectedClassId);
      if (success) {
        toast.success('Fasalka si guul leh ayaa loo qoondeeyay');
        setIsAssignModalOpen(false);
        await fetchStudentById(selectedStudent._id);
      }
    } catch {
      toast.error('Qalad ayaa ka dhacay markii la qoondeynayay fasalka');
    }
  };

  const handleUpdateStudent = async () => {
    try {
      const { success } = await updateStudent(selectedStudent._id, editForm);
      if (success) {
        toast.success('Ardayga si guul leh ayaa loo cusboonaysiiyay');
        setIsEditing(false);
        await fetchStudentById(selectedStudent._id);
      }
    } catch {
      toast.error('Qalad ayaa ka dhacay markii la cusboonaysiinayay ardayga');
    }
  };

  // Helper functions
  const getFeeStatus = () => {
    const total = selectedStudent?.fee?.total || 0;
    const paid = selectedStudent?.fee?.paid || 0;
    const balance = total - paid;

    if (total === 0) return { status: translations.fee.noFee, color: 'bg-gray-100 text-gray-800' };
    if (balance < 0) return { status: translations.fee.overpaid, color: 'bg-purple-100 text-purple-800' };
    if (balance === 0) return { status: translations.fee.paidFull, color: 'bg-green-100 text-green-800' };
    return { status: translations.fee.pending, color: 'bg-red-100 text-red-800' };
  };

  // Helper function to get subject name by ID
  const getSubjectName = (exam) => {
    // First check if subjectId is already populated (has name property)
    if (exam.subjectId?.name) {
      return exam.subjectId.name;
    }
    
    // If subjectId is just an ID string, look it up in subjects array
    if (exam.subjectId && typeof exam.subjectId === 'string') {
      const subject = subjects.find(s => s._id === exam.subjectId);
      return subject?.name || `Subject ID: ${exam.subjectId}`;
    }
    
    // If subjectId is an object with _id but no name, look it up
    if (exam.subjectId?._id) {
      const subject = subjects.find(s => s._id === exam.subjectId._id);
      return subject?.name || exam.subjectId.name || `Subject ID: ${exam.subjectId._id}`;
    }
    
    // Fallback for null or undefined subjectId
    return "General Assessment";
  };

  const renderEmptyState = (message, icon) => (
    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
      {icon}
      <p className="mt-2">{message}</p>
    </div>
  );

  // Tab content components
  const BasicInfoTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-500 mb-1">Magaca oo dhan</label>
           {isEditing ? (
             <input
               className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
               value={editForm.fullname}
               onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
             />
           ) : (
             <div>
               <p className="text-lg font-medium">{selectedStudent.fullname}</p>
               {selectedStudent.studentId && (
                 <p className="text-xs text-gray-500 mt-1">ID: {selectedStudent.studentId}</p>
               )}
             </div>
           )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1">Da'da</label>
          {isEditing ? (
            <input
              type="number"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={editForm.age}
              onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
            />
          ) : (
            <p className="text-lg font-medium">{selectedStudent.age}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1">Jinsiga</label>
          {isEditing ? (
            <select
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={editForm.gender}
              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
            >
              <option value="male">Lab</option>
              <option value="female">Dheddig</option>
            </select>
          ) : (
            <p className="text-lg font-medium capitalize">
              {selectedStudent.gender === 'male' ? 'Lab' : 'Dheddig'}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1">Fasalka</label>
          {isEditing ? (
            <select
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={editForm.class}
              onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}
            >
              <option value="">{translations.student.none}</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.level})
                </option>
              ))}
            </select>
          ) : (
            <p className="text-lg font-medium">{selectedStudent.class?.name || translations.student.none}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1">Lambarka hooyo</label>
          {isEditing ? (
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={editForm.motherNumber}
              onChange={(e) => setEditForm({ ...editForm, motherNumber: e.target.value })}
            />
          ) : (
            <p className="text-lg font-medium">{selectedStudent.motherNumber}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1">Lambarka aabo</label>
          {isEditing ? (
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={editForm.fatherNumber}
              onChange={(e) => setEditForm({ ...editForm, fatherNumber: e.target.value })}
            />
          ) : (
            <p className="text-lg font-medium">{selectedStudent.fatherNumber}</p>
          )}
        </div>
      </div>
    </div>
  );

  const HealthRecordsTab = () => (
    <div className="space-y-4">
      {selectedStudent.healthRecords?.length > 0 ? (
        selectedStudent.healthRecords.map((record, index) => (
          <div key={index} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between">
              <h3 className="font-medium">{record.condition}</h3>
              <span className="text-sm text-gray-500">
                {new Date(record.date).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{record.note}</p>
            <div className="mt-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                record.treated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {record.treated ? translations.health.treated : translations.health.pending}
              </span>
            </div>
          </div>
        ))
      ) : (
        renderEmptyState(
          translations.health.noRecords,
          <FiActivity className="w-12 h-12" />
        )
      )}
    </div>
  );

  const ExamRecordsTab = () => {
    // Exam type translations
    const examTypeTranslations = {
      final: "Final",
      midterm: "Midterm",
      "mid-term": "Mid-term",
      quiz: "Quiz",
      assignment: "Assignment",
      test: "Test"
    };

    // Add debugging
    console.log("Selected student exam records:", selectedStudent.examRecords);

    return (
      <div className="space-y-4">
        {selectedStudent.examRecords?.length > 0 ? (
selectedStudent.examRecords.map((exam, index) => {
  // Handle different field name variations
  const obtainedMarks = exam.obtainedMarks || exam.marks || 0;
  const totalMarks = exam.totalMarks || exam.total || 0;
  
  const { grade, color, bgColor, percentage } = getGradeDetails(obtainedMarks, totalMarks);
            
            return (
              <div key={index} className="p-4 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{getSubjectName(exam)}</h3>
                    <div className="mt-1 text-sm text-gray-500">
                      {examTypeTranslations[exam.examType] || exam.examType}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(exam.date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      {translations.exams.score}: {obtainedMarks}/{totalMarks}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-sm font-medium text-gray-600">
                      {totalMarks > 0 ? percentage.toFixed(1) : '0.0'}%
                    </span>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${color}`}>
                    {translations.exams.grade}: {grade}
                  </span>
                </div>
                
                {exam.teacher && (
                  <div className="mt-2 text-xs text-gray-500">
                    Marked by: {exam.teacher.name || "Unknown Teacher"}
                  </div>
                )}
                
                {exam.academicYear && (
                  <div className="mt-1 text-xs text-gray-500">
                    Academic Year: {exam.academicYear}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          renderEmptyState(
            translations.exams.noRecords,
            <FiBook className="w-12 h-12" />
          )
        )}
      </div>
    );
  };

const DisciplineTab = () => (
  <div className="space-y-4">
    {selectedStudent.disciplineReports?.length > 0 ? (
      selectedStudent.disciplineReports.map((report, index) => (
        <div key={index} className="p-4 bg-white rounded-lg shadow">
          <div className="flex justify-between">
            <h3 className="font-medium">{report.type}</h3>
            <span className="text-sm text-gray-500">
              {new Date(report.date).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">{report.reason}</p>
          <div className="mt-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              report.type === 'Caadi' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-red-800'
            }`}>
              {report.type}
            </span>
          </div>
        </div>
      ))
    ) : (
      renderEmptyState(
        translations.discipline.noRecords,
        <FiAlertTriangle className="w-12 h-12" />
      )
    )}
  </div>
);

  // Main render/return for the component
  return (
    <div>
      {/* Search Section */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={translations.search.placeholder}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredStudents.length > 0 ? (
          <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-100 max-h-64 overflow-y-auto">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                onClick={() => handleSelectStudent(student._id)}
                className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 transition-colors"
              >
                <div className="font-medium">{student.fullname}</div>
                <div className="text-sm text-gray-500">
                  {student.class?.name || translations.student.none} • {translations.search.age}: {student.age}
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.trim() !== '' && (
          <div className="mt-2 text-center text-gray-500 py-4">
            {translations.search.noResults}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isSelecting && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-500">Soo dejinta macluumaadka ardayga...</p>
        </div>
      )}

      {/* Student Dashboard */}
      {!isSelecting && selectedStudent && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-blue-100 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedStudent.fullname}
              </h1>
              <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                <span>{translations.student.id}: {selectedStudent._id}</span>
                <span>•</span>
                <span>{translations.student.class}: {selectedStudent.class?.name || translations.student.none}</span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isEditing 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isEditing ? (
                <>
                  <FiX /> {translations.student.cancel}
                </>
              ) : (
                <>
                  <FiEdit2 /> {translations.student.edit}
                </>
              )}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {Object.entries(translations.tabs).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Tab Content */}
            {activeTab === 'basic' && <BasicInfoTab />}
            {activeTab === 'health' && <HealthRecordsTab />}
            {activeTab === 'exams' && <ExamRecordsTab />}
            {activeTab === 'discipline' && <DisciplineTab />}
            {/* Action Buttons (visible on basic tab) */}
            {activeTab === 'basic' && (
              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-4">
                <button
                  onClick={() => setIsFeeModalOpen(true)}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FiDollarSign /> {translations.buttons.recordPayment}
                </button>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FiUser /> {translations.buttons.assignClass}
                </button>
                {isEditing && (
                  <button
                    onClick={handleUpdateStudent}
                    className="ml-auto px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FiCheck /> {translations.student.save}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Fee Summary (visible on basic tab) */}
          {activeTab === 'basic' && (
            <div className="px-6 py-4 bg-gray-50 border-t">
              <h3 className="text-lg font-medium mb-3">{translations.fee.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500">{translations.fee.total}</p>
                  <p className="text-xl font-semibold">${selectedStudent.fee?.total || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500">{translations.fee.paid}</p>
                  <p className="text-xl font-semibold">${selectedStudent.fee?.paid || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500">{translations.fee.balance}</p>
                  <p className="text-xl font-semibold">
                    ${(selectedStudent.fee?.total || 0) - (selectedStudent.fee?.paid || 0)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500">{translations.fee.status}</p>
                  <span className={`px-3 py-1 text-sm rounded-full ${getFeeStatus().color}`}>
                    {getFeeStatus().status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-medium">{translations.fee.recordPayment}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ardayga
                </label>
                <p className="font-medium">{selectedStudent?.fullname}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.fee.currentBalance}
                </label>
                <p className="text-xl font-semibold">
                  ${(selectedStudent?.fee?.total || 0) - (selectedStudent?.fee?.paid || 0)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.fee.total}
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={translations.fee.amount}
                  value={totalFee}
                  onChange={(e) => setTotalFee(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.fee.paid}
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={translations.fee.amount}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                {translations.buttons.cancel}
              </button>
              <button
                onClick={handleFeePayment}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {translations.fee.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Class Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-medium">{translations.fee.assignClass}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ardayga
                </label>
                <p className="font-medium">{selectedStudent?.fullname}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fasalka hadda
                </label>
                <p className="font-medium">
                  {selectedStudent?.class?.name || translations.student.none}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dooro fasalka cusub
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- {translations.student.class} --</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} ({cls.level})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                {translations.buttons.cancel}
              </button>
              <button
                onClick={handleAssignClass}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {translations.fee.assignClass}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetStudentById;