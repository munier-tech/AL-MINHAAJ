import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiUserPlus, FiUserX, FiSearch } from 'react-icons/fi';
import axios from '../../config/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useStudentsStore from '../../store/studentsStore';

const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { searchStudents, fetchStudents } = useStudentsStore();

  const [classData, setClassData] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningStudent, setAssigningStudent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [filteredAvailableStudents, setFilteredAvailableStudents] = useState([]);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [addStudentSearch, setAddStudentSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        await fetchStudents();

        const [classRes, studentsRes] = await Promise.all([
          axios.get(`/classes/getId/${classId}`),
          axios.get(`/classes/getStudents/${classId}`)
        ]);

        const allStudents = useStudentsStore.getState().students;

        setClassData(classRes.data.classData);
        setClassStudents(studentsRes.data.students || []);
        setFilteredStudents(studentsRes.data.students || []);

        const studentsNotInClass = allStudents.filter(
          student => !studentsRes.data.students.some(s => s._id === student._id)
        );
        setAvailableStudents(studentsNotInClass);
        setFilteredAvailableStudents(studentsNotInClass);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Khalad ayaa dhacay markii la soo dejiyay faahfaahinta fasalka');
        navigate('/classes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId, navigate]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(classStudents);
    } else {
      const filtered = classStudents.filter(student =>
        student.fullname.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, classStudents]);

  useEffect(() => {
    if (addStudentSearch.trim() === '') {
      setFilteredAvailableStudents(availableStudents);
    } else {
      const filtered = availableStudents.filter(student =>
        student.fullname.toLowerCase().includes(addStudentSearch.toLowerCase())
      );
      setFilteredAvailableStudents(filtered);
    }
  }, [addStudentSearch, availableStudents]);

  const handleAssignStudent = async (studentId) => {
    if (!studentId) return;

    try {
      setAssigningStudent(true);
      await axios.post(`/classes/${studentId}/${classId}`);
      toast.success('Arday si guul leh ayaa loogu daray fasalka');

      const studentsRes = await axios.get(`/classes/getStudents/${classId}`);
      setClassStudents(studentsRes.data.students || []);
      setFilteredStudents(studentsRes.data.students || []);

      const updatedAvailable = availableStudents.filter(s => s._id !== studentId);
      setAvailableStudents(updatedAvailable);
      setFilteredAvailableStudents(updatedAvailable);

      setShowStudentSelector(false);
      setAddStudentSearch('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Khalad ayaa dhacay markii la darayay ardayga');
    } finally {
      setAssigningStudent(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    const confirmation = window.confirm('Ma hubtaa inaad rabto inaad ka saarto ardaygan fasalka?');
    if (!confirmation) return;

    try {
      await axios.delete(`/classes/${studentId}/${classId}`);
      toast.success('Arday si guul leh ayaa laga saaray fasalka');

      const studentsRes = await axios.get(`/classes/getStudents/${classId}`);
      setClassStudents(studentsRes.data.students || []);
      setFilteredStudents(studentsRes.data.students || []);

      const removedStudent = classStudents.find(s => s._id === studentId);
      if (removedStudent) {
        const updatedAvailable = [...availableStudents, removedStudent];
        setAvailableStudents(updatedAvailable);
        setFilteredAvailableStudents(updatedAvailable);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Khalad ayaa dhacay markii la saarayay ardayga');
    }
  };

  const handleDeleteClass = async () => {
    const confirmation = window.confirm('Ma hubtaa inaad rabto inaad tirtirto fasalkan?');
    if (!confirmation) return;

    try {
      await axios.delete(`/classes/delete/${classId}`);
      toast.success('Fasalka si guul leh ayaa loo tirtiray');
      navigate('/classes');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Khalad ayaa dhacay markii la tirtirayay fasalka');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        />
      </div>
    );
  }

  if (!classData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Fasalka lama helin</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      {/* header and buttons */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="flex items-center mb-6"
      >
        <button
          onClick={() => navigate('/getAll')}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <FiArrowLeft className="mr-1" />
          Fasalka Dib ugu noqo
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Faahfaahinta Fasalka</h1>
      </motion.div>

      {/* main box */}
      <motion.div
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-md overflow-hidden mb-8"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{classData.name}</h2>
              <p className="text-gray-600">Heerka: {classData.level}</p>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/classes/update/${classId}`}
                className="flex items-center px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600"
              >
                <FiEdit2 className="mr-1" />
                Wax ka beddel
              </Link>
              <button
                onClick={handleDeleteClass}
                className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
              >
                <FiTrash2 className="mr-1" />
                Tirtir
              </button>
            </div>
          </div>

          {/* search and assign students */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-800">Raadi Arday</h3>
              <button
                onClick={() => {
                  setShowStudentSelector(!showStudentSelector);
                  setAddStudentSearch('');
                }}
                className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                <FiUserPlus className="mr-1" />
                {showStudentSelector ? 'Jooji' : 'Arday Ku dar'}
              </button>
            </div>

            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Geli magaca ardayga..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* addable students */}
            <AnimatePresence>
              {showStudentSelector && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 border border-gray-200 rounded-md overflow-hidden"
                >
                  <div className="p-4 bg-gray-50">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={addStudentSearch}
                        onChange={(e) => setAddStudentSearch(e.target.value)}
                        placeholder="Raadi ardayga aad rabto inaad ku dartid..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Magaca</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ficil</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAvailableStudents.length > 0 ? (
                          filteredAvailableStudents.map(student => (
                            <tr key={student._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.fullname}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={() => handleAssignStudent(student._id)}
                                  disabled={assigningStudent}
                                  className="text-blue-600 hover:text-blue-900 flex items-center"
                                >
                                  <FiUserPlus className="mr-1" />
                                  Ku dar Fasalka
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                              {addStudentSearch ? "Ardayda aad raadineyso ma helin" : "Ma jiraan ardayda lagu darikaro"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* student list */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Liiska Ardayda ({filteredStudents.length})</h3>
            {filteredStudents.length === 0 ? (
              <p className="text-gray-500 italic">
                {searchQuery ? "Ardayda aad raadineyso ma helin" : "Fasalkan ma laha arday"}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Magaca</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Da'da</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jinsiga</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ficil</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredStudents.map((student, index) => (
                        <motion.tr
                          key={student._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.fullname}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.age}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.gender}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRemoveStudent(student._id)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <FiUserX className="mr-1" />
                              Ka saar
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ClassDetails;