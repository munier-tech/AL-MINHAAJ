import { useState, useEffect } from 'react';
import { FiBook, FiCalendar, FiUsers, FiAward, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import { useExamStore } from '../../store/examStore';
import useClassesStore from '../../store/classesStore';
import useStudentsStore from '../../store/studentsStore';
import { useSubjectStore } from '../../store/subjectsStore';

const CreateClassExam = () => {
  const { createClassExam, isLoading } = useExamStore();
  const { classes, fetchClasses } = useClassesStore();
  const { students, fetchStudentsByClass } = useStudentsStore();
  const { subjects, getAllSubjects } = useSubjectStore();

  const [formData, setFormData] = useState({
    examType: null,
    date: '',
    classId: null,
    subjectId: null,
    totalMarks: '',
  });

  const [studentMarks, setStudentMarks] = useState({});

  useEffect(() => {
    fetchClasses();
    getAllSubjects();
  }, []);

  useEffect(() => {
    if (formData.classId?.value) {
      fetchStudentsByClass(formData.classId.value).then((res) => {
        if (res?.success) {
          const initialMarks = {};
          res.students.forEach(student => {
            initialMarks[student._id] = '';
          });
          setStudentMarks(initialMarks);
        }
      });
    }
  }, [formData.classId]);

  const examTypeOptions = [
    { value: 'mid-term', label: 'Imtixan Shahri 1' },
    { value: 'final', label: 'Imtixan Yar' },
    { value: 'quiz', label: 'Imtixan Shahri 2' },
    { value: 'assignment', label: 'Imtixan Wayn' },
  ];

  const classOptions = classes.map(cls => ({
    value: cls._id,
    label: cls.name,
  }));

  const subjectOptions = subjects.map(sub => ({
    value: sub._id,
    label: sub.name,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name, selectedOption) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedOption,
    }));
  };

  const handleMarkChange = (studentId, value) => {
    if (value === '' || (!isNaN(value) && value >= 0)) {
      setStudentMarks(prev => ({
        ...prev,
        [studentId]: value === '' ? '' : Math.min(Number(value), Number(formData.totalMarks || Infinity))
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { examType, date, classId, subjectId, totalMarks } = formData;

    if (!examType?.value || !date || !classId?.value || !subjectId?.value || !totalMarks) {
      toast.error('Fadlan buuxi meelaha loo baahan yahay');
      return;
    }

    if (Object.values(studentMarks).some(mark => mark === '' || isNaN(mark))) {
      toast.error('Fadlan geli qiime sax ah ardayda oo dhan');
      return;
    }

    const marksList = Object.entries(studentMarks).map(([studentId, obtainedMarks]) => ({
      studentId,
      obtainedMarks: Number(obtainedMarks)
    }));

    try {
      const result = await createClassExam({
        examType: examType.value,
        date,
        classId: classId.value,
        subjectId: subjectId.value,
        totalMarks: Number(totalMarks),
        marksList,
      });

      if (result?.success) {
        toast.success("Imtixanka Fasalka si Fican Ayaa Loo Abuuray");
        setFormData({
          examType: null,
          date: '',
          classId: null,
          subjectId: null,
          totalMarks: '',
        });
        setStudentMarks({});
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      // Error toast is handled in the store
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center">
            <FiBook className="mr-2" />
            Abuur Imtixan Fasalka
          </h1>
          <p className="mt-1 text-blue-100">
            Deji xogta imtixanka mar keliya oo geli dhammaan dhibcaha ardayda fasalka
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700  items-center">
                <FiBook className="mr-2" /> Nooca Imtixanka <span className="text-red-500">*</span>
              </label>
              <Select
                options={examTypeOptions}
                value={formData.examType}
                onChange={(option) => handleSelect('examType', option)}
                placeholder="Dooro nooca imtixanka..."
                isClearable
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700  items-center">
                <FiCalendar className="mr-2" /> Taariikhda Imtixanka <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700  items-center">
                <FiUsers className="mr-2" /> Fasalka <span className="text-red-500">*</span>
              </label>
              <Select
                options={classOptions}
                value={formData.classId}
                onChange={(option) => handleSelect('classId', option)}
                placeholder="Dooro fasalka..."
                isClearable
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700  items-center">
                <FiBook className="mr-2" /> Mawduuca <span className="text-red-500">*</span>
              </label>
              <Select
                options={subjectOptions}
                value={formData.subjectId}
                onChange={(option) => handleSelect('subjectId', option)}
                placeholder="Dooro mawduuca..."
                isClearable
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700  items-center">
                <FiAward className="mr-2" /> Dhibcaha Guud <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalMarks"
                min="1"
                value={formData.totalMarks}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {students?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <FiUsers className="mr-2" />
                Dhibcaha Ardayda ({students.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Magaca Ardayga</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lambarka Roll</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dhibcaha Laga Helay</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map(student => (
                      <tr key={student._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{student.fullname}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.rollNumber || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={studentMarks[student._id] || ''}
                            onChange={(e) => handleMarkChange(student._id, e.target.value)}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                            min="0"
                            max={formData.totalMarks || ''}
                            required
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !students?.length}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading || !students?.length ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Abuurka...' : (
                <>
                  <FiSave className="mr-2" />
                  Gudbi Imtixanka
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassExam;