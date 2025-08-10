import React, { useState, useEffect } from 'react';
import useTeachersStore from '../../store/teachersStore';
import { 
  GraduationCap, Mail, Phone, BookOpen, FileText, User, 
  Search, Edit, Trash2, Plus, ChevronLeft, ChevronRight,
  X, Save, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import CertificateViewer from '../CertificateViewer';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const cardVariants = {
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  }
};

const GetAllTeachers = () => {
  const { 
    teachers, 
    fetchTeachers, 
    deleteTeacher,
    updateTeacher,
    loading,
    deleting,
    updating
  } = useTeachersStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    number: '',
    email: '',
    subject: '',
    profilePicture: null,
    certificate: null,
    previewImage: null,
    certificatePreview: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 8;
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertificateViewer, setShowCertificateViewer] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.number?.includes(searchQuery)
  );

  // Pagination logic
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher);
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);

  const handleDelete = async (id) => {
    if (window.confirm('Ma hubtaa inaad rabto inaad tirtirto macallinkan?')) {
      const result = await deleteTeacher(id);
      if (result.success) {
        toast.success('Macallinka waa la tirtiray si guul leh');
      }
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher._id);
    setEditForm({
      name: teacher.name,
      number: teacher.number,
      email: teacher.email,
      subject: teacher.subject,
      profilePicture: null,
      certificate: null,
      previewImage: teacher.profilePicture,
      certificatePreview: teacher.certificate
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({
          ...prev,
          profilePicture: file,
          previewImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({
          ...prev,
          certificate: file,
          certificatePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (id) => {
    const formData = new FormData();
    formData.append('name', editForm.name);
    formData.append('number', editForm.number);
    formData.append('email', editForm.email);
    formData.append('subject', editForm.subject);
    
    if (editForm.profilePicture) {
      formData.append('profilePicture', editForm.profilePicture);
    }
    
    if (editForm.certificate) {
      formData.append('certificate', editForm.certificate);
    }

    const result = await updateTeacher(id, formData);
    if (result.success) {
      toast.success('Macallinka waa la cusboonaysiiyay si guul leh');
      setEditingTeacher(null);
    }
  };

  const cancelEdit = () => {
    setEditingTeacher(null);
  };

  const handleViewCertificate = (certificateUrl, teacherName) => {
    setSelectedCertificate({ url: certificateUrl, name: teacherName });
    setShowCertificateViewer(true);
  };

  const closeCertificateViewer = () => {
    setShowCertificateViewer(false);
    setSelectedCertificate(null);
  };

  if (loading && teachers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (teachers.length === 0 && !loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6"
      >
        <div className="text-center max-w-md">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Macalimiin lama helin</h3>
          <p className="mt-1 text-gray-500">Hadda ma jiraan macalimiin diiwaan gashan oo naga jira.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Xoghayaha Macalimiinta</h1>
            <p className="mt-2 text-lg text-gray-600">Kulaha kooxda macalimiinta noo howl gala</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Raadi macalimiin..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </motion.div>

        {filteredTeachers.length === 0 ? (
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-lg shadow p-8 text-center"
          >
            <p className="text-gray-600">Macalimiin ku habboon raadintaada lama helin</p>
          </motion.div>
        ) : (
          <>
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {currentTeachers.map((teacher) => (
                <motion.div 
                  key={teacher._id}
                  variants={itemVariants}
                  whileHover="hover"
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300"
                >
                  {editingTeacher === teacher._id ? (
                    <div className="p-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Magaca</label>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Iimaylka</label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefoonka</label>
                        <input
                          type="text"
                          name="number"
                          value={editForm.number}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qaybta</label>
                        <input
                          type="text"
                          name="subject"
                          value={editForm.subject}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sawirka</label>
                        <div className="flex items-center space-x-4">
                          {editForm.previewImage && editForm.previewImage !== 'no profile picture' ? (
                            <img 
                              src={editForm.previewImage} 
                              alt="Preview" 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <input
                            type="file"
                            id="profilePicture"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label 
                            htmlFor="profilePicture" 
                            className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            Beddel
                          </label>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shahaadada</label>
                        <input
                          type="file"
                          id="certificate"
                          accept=".pdf,.doc,.docx"
                          onChange={handleCertificateChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditSubmit(teacher._id)}
                          disabled={updating}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center"
                        >
                          {updating ? (
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Keydi
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={cancelEdit}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Jooji
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-center">
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="flex justify-center mb-3"
                        >
                          {teacher.profilePicture && teacher.profilePicture !== 'no profile picture' ? (
                            <img
                              src={teacher.profilePicture}
                              alt={teacher.name}
                              className="w-20 h-20 object-cover rounded-full border-4 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-white bg-opacity-20 flex items-center justify-center rounded-full border-4 border-white shadow-md">
                              <User className="text-white w-8 h-8" />
                            </div>
                          )}
                        </motion.div>
                        <h2 className="text-xl font-bold text-white">{teacher.name}</h2>
                        <p className="text-blue-100">Macallin {teacher.subject}</p>
                      </div>

                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <Mail className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-500">Iimaylka</p>
                              <p className="text-sm text-gray-900 break-all">{teacher.email}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <Phone className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-500">Telefoonka</p>
                              <p className="text-sm text-gray-900">{teacher.number || 'Lama siin'}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <BookOpen className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-500">Qaybta</p>
                              <p className="text-sm text-gray-900">{teacher.subject}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <FileText className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-500">Shahaadada</p>
                              {teacher.certificate && teacher.certificate !== 'no certificate' ? (
                                <button 
                                  onClick={() => handleViewCertificate(teacher.certificate, teacher.name)}
                                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                >
                                  Fiiri shahaadada
                                </button>
                              ) : (
                                <p className="text-sm text-gray-500 italic">Lama helin</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex space-x-3">
                          <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(teacher)}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Wax ka beddel
                          </motion.button>
                          <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(teacher._id)}
                            disabled={deleting}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center"
                          >
                            {deleting ? (
                              <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Tirtir
                          </motion.button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <motion.div 
                variants={itemVariants}
                className="mt-8 flex items-center justify-between"
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Hore
                </motion.button>
                
                <span className="text-sm text-gray-700">
                  Bogga {currentPage} ee {totalPages}
                </span>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xiga
                  <ChevronRight className="h-5 w-5 ml-1" />
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Certificate Viewer Modal */}
      {showCertificateViewer && selectedCertificate && (
        <CertificateViewer
          certificateUrl={selectedCertificate.url}
          teacherName={selectedCertificate.name}
          onClose={closeCertificateViewer}
        />
      )}
    </motion.div>
  );
};

export default GetAllTeachers;