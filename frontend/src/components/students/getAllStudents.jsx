import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiUser, FiFilter, FiSearch, FiPlus, FiX, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useClassesStore from '../../store/classesStore';
import useStudentsStore from '../../store/studentsStore';

const translations = {
  header: {
    title: "Maamulka Ardayda",
    subtitle: (count) => `${count} ${count === 1 ? 'arday' : 'arday'} ayaa la helay`,
  },
  buttons: {
    newStudent: "Arday Cusub",
    filter: "Filter",
    assignClass: "U Qoondee Fasalka",
    edit: "Wax Ka Badal",
    delete: "Tirtir",
    cancel: "Jooji",
    confirm: "Xaqiiji",
    save: "Kaydi",
  },
  table: {
    name: "Magaca",
    age: "Da'da",
    gender: "Jinsiga",
    class: "Fasalka",
    motherPhone: "Lambarka Hooyo",
    fatherPhone: "Lambarka Aabo",
    actions: "Ficilada",
  },
  dialogs: {
    assignTitle: "U Qoondee Ardayda Fasalka",
    deleteTitle: "Tirtir Ardayga",
    deleteMessage: "Ma hubtaa inaad rabto inaad tirtirto ardaygan?",
    editTitle: "Wax Ka Badal Ardayga",
  },
  stats: {
    totalStudents: "Wadarta Ardayda",
    maleStudents: "Ardayda Labka",
    femaleStudents: "Ardayda Dheddigga",
  },
  searchPlaceholder: "Raadi ardayga...",
};

const GetAllStudents = () => {
  const navigate = useNavigate();
  const {
    students,
    loading,
    fetchStudents,
    deleteStudent,
    assignStudentToClass,
    searchStudents,
    updateStudent,
  } = useStudentsStore();
  const { classes, fetchClasses } = useClassesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [editForm, setEditForm] = useState({
    fullname: '',
    age: '',
    gender: '',
    class: '',
    motherNumber: '',
    fatherNumber: ''
  });
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [fetchStudents, fetchClasses]);

  const filteredStudents = searchQuery 
    ? searchStudents(searchQuery) 
    : selectedClass
    ? students.filter(student => student.class?._id === selectedClass)
    : students;

  const handleAssignClass = async () => {
    if (!currentStudent || !selectedClassId) {
      toast.error('Fadlan dooro fasalka');
      return;
    }
    
    try {
      const { success } = await assignStudentToClass(currentStudent._id, selectedClassId);
      if (success) {
        toast.success('Ardayga si guul leh ayaa loo qoondeeyay fasalka');
        setIsAssignDialogOpen(false);
        fetchStudents();
      }
    } catch (error) {
      toast.error('Qalad ayaa ka dhacay markii la qoondeynayay fasalka');
    }
  };

  const handleDeleteStudent = async () => {
    if (!currentStudent) return;
    
    try {
      const { success } = await deleteStudent(currentStudent._id);
      if (success) {
        toast.success('Ardayga si guul leh ayaa loo tirtiray');
        setIsDeleteDialogOpen(false);
        fetchStudents();
      }
    } catch (error) {
      toast.error('Qalad ayaa ka dhacay markii la tirtirayay ardayga');
    }
  };

  const handleEditStudent = async () => {
    try {
      const { success } = await updateStudent(currentStudent._id, editForm);
      if (success) {
        toast.success('Ardayga si guul leh ayaa loo cusboonaysiiyay');
        setIsEditDialogOpen(false);
        fetchStudents();
      }
    } catch (error) {
      toast.error('Qalad ayaa ka dhacay markii la cusboonaysiinayay ardayga');
    }
  };

  const openEditModal = (student) => {
    setCurrentStudent(student);
    setEditForm({
      fullname: student.fullname,
      age: student.age,
      gender: student.gender,
      class: student.class?._id || '',
      motherNumber: student.motherNumber || '',
      fatherNumber: student.fatherNumber || ''
    });
    setIsEditDialogOpen(true);
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="flex flex-col space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {translations.header.title}
            </h1>
            <p className="text-sm text-gray-500">
              {translations.header.subtitle(filteredStudents.length)}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={translations.searchPlaceholder}
                className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <button 
                className="flex items-center gap-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
                onClick={() => setShowFilter(!showFilter)}
              >
                <FiFilter className="w-4 h-4" />
                {translations.buttons.filter}
              </button>
              {showFilter && classes.length > 0 && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
                  <div className="py-1">
                    <button 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setSelectedClass('');
                        setShowFilter(false);
                      }}
                    >
                      Dhammaan Ardayda
                    </button>
                    {classes.map((cls) => (
                      <button
                        key={cls._id}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => {
                          setSelectedClass(cls._id);
                          setShowFilter(false);
                        }}
                      >
                        {cls.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              {translations.stats.totalStudents}
            </h3>
            <p className="text-2xl font-bold mt-1">{students.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              {translations.stats.maleStudents}
            </h3>
            <p className="text-2xl font-bold mt-1">
              {students.filter(s => s.gender === 'male').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              {translations.stats.femaleStudents}
            </h3>
            <p className="text-2xl font-bold mt-1">
              {students.filter(s => s.gender === 'female').length}
            </p>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b">
            <h2 className="text-lg font-semibold">Liiska Ardayda</h2>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => navigate('/createStudent')}
            >
              <FiPlus className="w-4 h-4" />
              {translations.buttons.newStudent}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.table.name}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.table.age}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.table.gender}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.table.class}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.table.motherPhone}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.table.fatherPhone}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {student.fullname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {student.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {student.gender === 'male' ? 'Lab' : 'Dheddig'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {student.class?.name || 'Fasalka La\'aan'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {student.motherNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {student.fatherNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentStudent(student);
                            setSelectedClassId(student.class?._id || '');
                            setIsAssignDialogOpen(true);
                          }}
                        >
                          <FiUser className="w-5 h-5" />
                        </button>

                        <button
                          className="text-yellow-600 hover:text-yellow-900 p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(student);
                          }}
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>

                        <button
                          className="text-red-600 hover:text-red-900 p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentStudent(student);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assign Class Modal */}
        {isAssignDialogOpen && currentStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {translations.dialogs.assignTitle}
                </h3>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dooro Fasalka
                  </label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                  >
                    <option value="">Dooro Fasalka</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAssignClass}
                >
                  {translations.buttons.confirm}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsAssignDialogOpen(false)}
                >
                  {translations.buttons.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {isEditDialogOpen && currentStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {translations.dialogs.editTitle}
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Magaca
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-md p-2"
                      value={editForm.fullname}
                      onChange={(e) => setEditForm({...editForm, fullname: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Da'da
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded-md p-2"
                      value={editForm.age}
                      onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jinsiga
                    </label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={editForm.gender}
                      onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                    >
                      <option value="">Dooro Jinsiga</option>
                      <option value="male">Lab</option>
                      <option value="female">Dheddig</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fasalka
                    </label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={editForm.class}
                      onChange={(e) => setEditForm({...editForm, class: e.target.value})}
                    >
                      <option value="">Dooro Fasalka</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lambarka Hooyo
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-md p-2"
                      value={editForm.motherNumber}
                      onChange={(e) => setEditForm({...editForm, motherNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lambarka Aabo
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-md p-2"
                      value={editForm.fatherNumber}
                      onChange={(e) => setEditForm({...editForm, fatherNumber: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleEditStudent}
                >
                  {translations.buttons.save}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  {translations.buttons.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteDialogOpen && currentStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {translations.dialogs.deleteTitle}
                </h3>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    {translations.dialogs.deleteMessage}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteStudent}
                >
                  {translations.buttons.delete}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  {translations.buttons.cancel}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default GetAllStudents;