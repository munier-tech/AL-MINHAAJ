import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import useStudentsStore from '../../store/studentsStore';
import useClassesStore from '../../store/classesStore';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedStudent, fetchStudentById, updateStudent, loading } = useStudentsStore();
  const { classes } = useClassesStore();

  const [formData, setFormData] = useState({
    fullname: '',
    age: '',
    gender: 'male',
    classId: '',
    motherNumber: '',
    fatherNumber: '',
    fee: {
      total: '',
      paid: ''
    }
  });

  useEffect(() => {
    const loadStudentData = async () => {
      await fetchStudentById(id);
    };
    loadStudentData();
  }, [id, fetchStudentById]);

  useEffect(() => {
    if (selectedStudent) {
      setFormData({
        fullname: selectedStudent.fullname || '',
        age: selectedStudent.age || '',
        gender: selectedStudent.gender || 'male',
        classId: selectedStudent.class?._id || '',
        motherNumber: selectedStudent.motherNumber || '',
        fatherNumber: selectedStudent.fatherNumber || '',
        fee: {
          total: selectedStudent.fee?.total || '',
          paid: selectedStudent.fee?.paid || ''
        }
      });
    }
  }, [selectedStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('fee.')) {
      const feeField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        fee: {
          ...prev.fee,
          [feeField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { success } = await updateStudent(id, formData);
      if (success) {
        toast.success('Ardayga si guul leh ayaa loo cusboonaysiiyay');
        navigate(`/students/${id}`);
      }
    } catch (error) {
      toast.error(error.message || 'Qalad ayaa ka dhacay cusboonaysiinta ardayga');
    }
  };

  if (!selectedStudent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div 
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="mb-6" variants={itemVariants}>
        <motion.button 
          onClick={() => navigate(`/students/${id}`)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiArrowLeft /> Ku noqo Ardayga
        </motion.button>
      </motion.div>

      <motion.div 
        className="bg-white rounded-lg shadow overflow-hidden"
        variants={itemVariants}
        whileHover={{ boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="px-6 py-4 border-b bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-800">Wax ka beddel Ardayga</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <h2 className="text-lg font-semibold text-gray-700">Macluumaadka Aasaasiga ah</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Magaca Dhan</label>
                <motion.input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Geli magaca dhameystiran"
                  required
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Da'da</label>
                  <motion.input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Geli da'da"
                    min="0"
                    required
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jinsiga</label>
                  <motion.select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <option value="male">Lab</option>
                    <option value="female">Dheddig</option>
                  </motion.select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fasalka</label>
                <motion.select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="">Dooro Fasalka</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </motion.select>
              </div>
            </motion.div>

            {/* Contact and Fee Information */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <h2 className="text-lg font-semibold text-gray-700">Macluumaadka Xiriirka</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lambarka Hooyo</label>
                <motion.input
                  type="tel"
                  name="motherNumber"
                  value={formData.motherNumber}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Geli lambarka hooyo"
                  required
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lambarka Aabo</label>
                <motion.input
                  type="tel"
                  name="fatherNumber"
                  value={formData.fatherNumber}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Geli lambarka aabo"
                  required
                  whileFocus={{ scale: 1.02 }}
                />
              </div>

              <h2 className="text-lg font-semibold text-gray-700 mt-6">Macluumaadka Lacagta</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wadarta Lacagta</label>
                  <motion.input
                    type="number"
                    name="fee.total"
                    value={formData.fee.total}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Geli wadarta lacagta"
                    min="0"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lacagta la Bixiyay</label>
                  <motion.input
                    type="number"
                    name="fee.paid"
                    value={formData.fee.paid}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Geli lacagta la bixiyay"
                    min="0"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="mt-8 flex justify-end"
            variants={itemVariants}
          >
            <motion.button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              <FiSave className="w-4 h-4" />
              {loading ? 'Cusboonaysiinaya...' : 'Kaydi Isbedelka'}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditStudent;