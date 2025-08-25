import { useState, useEffect } from "react";
import Select from "react-select";
import { useExamStore } from "../../store/examStore";
import { toast } from "react-hot-toast";
import { FiCalendar, FiBook, FiUser, FiAward, FiSave } from "react-icons/fi";
import useStudentsStore from "../../store/studentsStore";
import useTeachersStore from "../../store/teachersStore";
import { useSubjectStore } from "../../store/subjectsStore";
import useClassesStore from "../../store/classesStore";

const CreateExam = () => {
  const { createExam, isLoading, error, successMessage, clearMessages } = useExamStore();
  const { students, fetchStudents } = useStudentsStore();
  const { classes, fetchClasses } = useClassesStore();
  const { teachers, fetchTeachers } = useTeachersStore();
  const { subjects, getAllSubjects } = useSubjectStore();

  const [formData, setFormData] = useState({ 
    obtainedMarks: "", 
    totalMarks: "", 
    date: "", 
    examType: "" 
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchStudents(),
          fetchClasses(),
          getAllSubjects(),
          fetchTeachers()
        ]);
      } catch (err) {
        toast.error("Failed to initialize form data");
        console.error("Initialization error:", err);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (selectedStudent && selectedStudent.classId && Array.isArray(classes)) {
      const studentClass = classes.find(c => c._id === selectedStudent.classId);
      setSelectedClass(studentClass ? { value: studentClass._id, label: studentClass.name } : null);
    } else {
      setSelectedClass(null);
    }
  }, [selectedStudent, classes]);

  const studentOptions = Array.isArray(students)
    ? students.map(s => ({
        value: s._id,
        label: `${s.fullname || 'Unknown'} (${s.class?.name || 'No Class'})`,
        classId: s.class?._id || s.class
      }))
    : [];

  const subjectOptions = Array.isArray(subjects)
    ? subjects.map(sub => ({ value: sub._id, label: sub.name }))
    : [];

  const teacherOptions = Array.isArray(teachers)
    ? teachers.map(t => ({
        value: t._id,
        label: `${t.name || 'No Name'} (${t.subject?.name || 'No Subject'})`
      }))
    : [];

  const classOptions = Array.isArray(classes)
    ? classes.map(c => ({ value: c._id, label: c.name }))
    : [];

  const examTypeOptions = [
    { value: "mid-term", label: "Imtixan Shari 1" },
    { value: "final", label: "Imtixan Yar" },
    { value: "quiz", label: "Imtixan Shahri 2" },
    { value: "assignment", label: "Imtixan Wayn" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!selectedStudent || !selectedSubject || !selectedTeacher || 
        !formData.obtainedMarks || !formData.totalMarks || !formData.examType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.obtainedMarks) > parseFloat(formData.totalMarks)) {
      toast.error("Obtained marks cannot exceed total marks");
      return;
    }

    const payload = {
      student: selectedStudent.value,
      class: selectedClass?.value,
      teacher: selectedTeacher.value,
      subjectId: selectedSubject.value,
      obtainedMarks: Number(formData.obtainedMarks),
      totalMarks: Number(formData.totalMarks),
      date: formData.date || new Date().toISOString().split('T')[0],
      examType: formData.examType
    };

    try {
      await createExam(payload);
      if (!error) {
        setFormData({ obtainedMarks: "", totalMarks: "", date: "", examType: "" });
        setSelectedStudent(null);
        setSelectedSubject(null);
        setSelectedTeacher(null);
        setSelectedClass(null);
        toast.success("Exam created successfully!");
      }
    } catch (err) {
      console.error("Exam creation error:", err);
      toast.error(error || "Failed to create exam");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FiBook className="mr-2" /> Create New Exam Record
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700  items-center">
              <FiUser className="mr-1" /> Student <span className="text-red-500">*</span>
            </label>
            <Select
              options={studentOptions}
              value={selectedStudent}
              onChange={setSelectedStudent}
              placeholder="Select student..."
              isClearable
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700  items-center">
              <FiBook className="mr-1" /> Class
            </label>
            <Select
              options={classOptions}
              value={selectedClass}
              onChange={setSelectedClass}
              isDisabled={!selectedStudent}
              placeholder={selectedStudent ? "Auto-selected class" : "Select student first"}
              isClearable
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700  items-center">
              <FiBook className="mr-1" /> Subject <span className="text-red-500">*</span>
            </label>
            <Select
              options={subjectOptions}
              value={selectedSubject}
              onChange={setSelectedSubject}
              placeholder="Select subject..."
              isClearable
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700  items-center">
              <FiUser className="mr-1" /> Teacher <span className="text-red-500">*</span>
            </label>
            <Select
              options={teacherOptions}
              value={selectedTeacher}
              onChange={setSelectedTeacher}
              placeholder="Select teacher..."
              isClearable
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700  items-center">
              <FiAward className="mr-1" /> Obtained Marks <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="obtainedMarks"
              min="0"
              value={formData.obtainedMarks}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter obtained marks"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700  items-center">
              <FiAward className="mr-1" /> Total Marks <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="totalMarks"
              min="1"
              value={formData.totalMarks}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter total marks"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700  items-center">
              <FiCalendar className="mr-1" /> Exam Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700  items-center">
              <FiBook className="mr-1" /> Exam Type <span className="text-red-500">*</span>
            </label>
            <Select
              options={examTypeOptions}
              value={examTypeOptions.find(opt => opt.value === formData.examType)}
              onChange={(opt) => setFormData(prev => ({ ...prev, examType: opt.value }))}
              placeholder="Select exam type..."
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 rounded mt-4 hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center"
        >
          {isLoading ? (
            "Processing..."
          ) : (
            <>
              <FiSave className="inline-block mr-2" /> Create Exam
            </>
          )}
        </button>

        {error && <div className="text-red-500 mt-3 text-center">{error}</div>}
        {successMessage && <div className="text-green-500 mt-3 text-center">{successMessage}</div>}
      </form>
    </div>
  );
};

export default CreateExam;