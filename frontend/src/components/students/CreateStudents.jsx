import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import useStudentsStore from '../../store/studentsStore';
import useClassesStore from '../../store/classesStore';
import { useHealthStore } from '../../store/healthStore';

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

const CreateStudent = () => {
  const navigate = useNavigate();
  const { createStudent, loading } = useStudentsStore();
  const { classes } = useClassesStore();
  const { addHealthRecord } = useHealthStore();

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

  const [healthData, setHealthData] = useState({
    date: '',
    condition: '',
    treated: false,
    note: ''
  });

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

  const handleHealthChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHealthData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { success, student } = await createStudent(formData);
      if (success) {
        // If health fields are provided, create health record immediately
        if (healthData.condition && healthData.date) {
          try {
            await addHealthRecord({
              student: student._id,
              date: healthData.date,
              condition: healthData.condition,
              treated: !!healthData.treated,
              note: healthData.note
            });
          } catch (err) {
            // Non-blocking: notify but continue navigation
            toast.error('Xogta caafimaadka lama kaydin, fadlan isku day mar kale.');
          }
        }
        toast.success('Ardayga si guul leh ayaa loo sameeyay');
        navigate('/getAllStudents');
      }
    } catch (error) {
      toast.error(error.message || 'Qalad ayaa ka dhacay ardayga sameynta');
    }
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="mb-6" variants={itemVariants}>
        <motion.button 
          onClick={() => navigate('/getAllStudents')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiArrowLeft /> Ku noqo Ardayda
        </motion.button>
      </motion.div>

      <motion.div 
        className="bg-white rounded-lg shadow overflow-hidden"
        variants={itemVariants}
        whileHover={{ boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="px-6 py-4 border-b bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-800">Ku dar Arday Cusub</h1>
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

            {/* Contact and Health Information */}
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

              {/* Embedded Health Section */}
              <div className="mt-6 border-t pt-4">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Xogta Caafimaadka (Ikhtiyaari)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taariikhda</label>
                    <input
                      type="date"
                      name="date"
                      value={healthData.date}
                      onChange={handleHealthChange}
                      className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Xaaladda</label>
                    <input
                      type="text"
                      name="condition"
                      value={healthData.condition}
                      onChange={handleHealthChange}
                      className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Geli xaaladda caafimaad"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiiro Gaar Ah</label>
                  <textarea
                    name="note"
                    value={healthData.note}
                    onChange={handleHealthChange}
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                    placeholder="Ku dar qoraallo faahfaahsan (ikhtiyaari)"
                  />
                </div>
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    name="treated"
                    checked={healthData.treated}
                    onChange={handleHealthChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">La daweeyey?</label>
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
              {loading ? 'Kaydaya...' : 'Kaydi Ardayga'}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateStudent;