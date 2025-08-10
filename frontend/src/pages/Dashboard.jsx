import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Import motion from framer-motion
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  RefreshCw,
  Activity,
  Clock,
  UserPlus,
  BookMarked,
  CalendarCheck,
  Server,
  Gauge,
  Database,
  X
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useStudentsStore from '../store/studentsStore';
import useTeachersStore from '../store/teachersStore';
import useClassesStore from '../store/classesStore';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

// Variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// StatCard Component
const StatCard = ({ title, value, icon: Icon, color, trend, loading }) => {
  const colorMap = {
    blue: { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600' },
    purple: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600' },
    orange: { border: 'border-orange-500', bg: 'bg-orange-100', text: 'text-orange-600' }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${colorMap[color].border}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div> : value}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color].bg}`}>
          <Icon className={`w-6 h-6 ${colorMap[color].text}`} />
        </div>
      </div>
    </motion.div>
  );
};

// QuickActionCard Component
const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm p-5 transition-all duration-200 text-left w-full group border border-gray-100"
    >
      <div className="flex items-center space-x-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`p-3 rounded-lg ${colorMap[color]} group-hover:scale-105 transition-transform`}
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </motion.button>
  );
};

// RecentActivityItem Component
const RecentActivityItem = ({ icon: Icon, title, description, time, color }) => {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ x: 5 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className={`p-2 rounded-full ${colorMap[color]} mt-1`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
      <div className="flex items-center text-xs text-gray-400 whitespace-nowrap">
        <Clock className="w-3 h-3 mr-1" />
        {time}
      </div>
    </motion.div>
  );
};

// SystemStatusCard Component
const SystemStatusCard = ({ icon: Icon, title, status, statusColor, description }) => (
  <motion.div
    variants={itemVariants}
    className="bg-white rounded-xl shadow-sm p-6 text-center"
  >
    <div className={`w-16 h-16 ${statusColor === 'green' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
      <Icon className={`w-6 h-6 ${statusColor === 'green' ? 'text-green-600' : 'text-red-600'}`} />
    </div>
    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
    <p className={`text-sm font-medium ${statusColor === 'green' ? 'text-green-600' : 'text-red-600'} mb-2`}>
      {status}
    </p>
    <p className="text-xs text-gray-500">{description}</p>
  </motion.div>
);

// AddTeacherModal Component
const AddTeacherModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
    subject: '',
    profilePicture: null,
    certificate: null,
    previewImage: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
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
    setFormData(prev => ({ ...prev, certificate: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.number || !formData.email || !formData.subject) {
      toast.error('Fadlan buuxi dhammaan meelaha loo baahan yahay');
      return;
    }

    setIsLoading(true);
    
    try {
      const teacherData = new FormData();
      teacherData.append('name', formData.name);
      teacherData.append('number', formData.number);
      teacherData.append('email', formData.email);
      teacherData.append('subject', formData.subject);
      
      if (formData.profilePicture) {
        teacherData.append('profilePicture', formData.profilePicture);
      }
      
      if (formData.certificate) {
        teacherData.append('certificate', formData.certificate);
      }

      const result = await onCreate(teacherData);
      
      if (result.success) {
        toast.success('Macallinka si guul leh ayaa loo diiwaan geliyay');
        onClose();
        setFormData({
          name: '',
          number: '',
          email: '',
          subject: '',
          profilePicture: null,
          certificate: null,
          previewImage: null
        });
      }
    } catch (error) {
      toast.error('Khalad ayaa dhacay markii la abuurinayay macallinka');
      console.error('Error creating teacher:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -20 }}
        className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">Ku Dar Macallin Cusub</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Magaca Macallinka</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lambarka Macallinka</label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maadada</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sawirka Macallinka</label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {formData.previewImage ? (
                  <img 
                    src={formData.previewImage} 
                    alt="Preview" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <label htmlFor="profilePicture" className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                {formData.previewImage ? 'Beddel sawirka' : 'U soo rogo sawirka'}
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shaahadada (PDF/Word)</label>
            <input
              type="file"
              id="certificate"
              accept=".pdf,.doc,.docx"
              onChange={handleCertificateChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Jooji
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Ku daraya...' : 'Ku dar Macallinka'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// AddStudentModal Component
const AddStudentModal = ({ isOpen, onClose, onCreate, classes }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    age: '',
    gender: 'male',
    classId: '',
    motherNumber: '',
    fatherNumber: '',
    profilePicture: null,
    previewImage: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePicture: file,
          previewImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullname || !formData.age || !formData.gender) {
      toast.error('Fadlan buuxi dhammaan meelaha loo baahan yahay');
      return;
    }

    setIsLoading(true);
    
    try {
      const studentData = new FormData();
      studentData.append('fullname', formData.fullname);
      studentData.append('age', formData.age);
      studentData.append('gender', formData.gender);
      studentData.append('classId', formData.classId || '');
      studentData.append('motherNumber', formData.motherNumber || '');
      studentData.append('fatherNumber', formData.fatherNumber || '');
      
      if (formData.profilePicture) {
        studentData.append('profilePicture', formData.profilePicture);
      }

      const result = await onCreate(studentData);
      
      if (result.success) {
        toast.success('Ardayga si guul leh ayaa loo diiwaan geliyay');
        onClose();
        setFormData({
          fullname: '',
          age: '',
          gender: 'male',
          classId: '',
          motherNumber: '',
          fatherNumber: '',
          profilePicture: null,
          previewImage: null
        });
      }
    } catch (error) {
      toast.error('Khalad ayaa dhacay markii la abuurinayay ardayga');
      console.error('Error creating student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -20 }}
        className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">Ku Dar Arday Cusub</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Magaca Oo Dhan*</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Da'da</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="5"
              max="25"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jinsiga</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="male">Lab</option>
              <option value="female">Dheddig</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fasalka</label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Xulo Fasalka...</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - {cls.level}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lambarka Hooyada</label>
            <input
              type="text"
              name="motherNumber"
              value={formData.motherNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lambarka Aabaha</label>
            <input
              type="text"
              name="fatherNumber"
              value={formData.fatherNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sawirka Ardayga</label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {formData.previewImage ? (
                  <img 
                    src={formData.previewImage} 
                    alt="Preview" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <input
                  type="file"
                  id="profilePictureStudent"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <label htmlFor="profilePictureStudent" className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                {formData.previewImage ? 'Beddel sawirka' : 'U soo rogo sawirka'}
              </label>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Jooji
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Ku daraya...' : 'Ku dar Ardayga'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// AddClassModal Component
const AddClassModal = ({ isOpen, onClose, onCreate, teachers }) => {
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    teacher: '',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.level) {
      toast.error('Fadlan buuxi dhammaan meelaha loo baahan yahay');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await onCreate({
        name: formData.name,
        level: formData.level,
        teacher: formData.teacher || undefined
      });
      
      if (result.success) {
        toast.success('Fasalka si guul leh ayaa loo abuuray');
        onClose();
        setFormData({
          name: '',
          level: '',
          teacher: '',
          isActive: true
        });
      }
    } catch (error) {
      toast.error('Khalad ayaa dhacay markii la abuurinayay fasalka');
      console.error('Error creating class:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -20 }}
        className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">Abuur Fasalka Cusub</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Magaca Fasalka*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heerka</label>
            <input
              type="text"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Macallinka (Ikhtiyaar)</label>
            <select
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Xulo Macallin...</option>
              {teachers.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name} - {teacher.subject}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Fasalku waa firfircoon
            </label>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Jooji
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Abuuritaanka...' : 'Abuur Fasalka'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Main Dashboard Component
function Dashboard() {
  const { user } = useAuthStore();
  const { students, fetchStudents, loading: studentsLoading, createStudent } = useStudentsStore();
  const { teachers, fetchTeachers, loading: teachersLoading, createTeacher } = useTeachersStore();
  const { classes, fetchClasses, loading: classesLoading, createClass } = useClassesStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);

  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchStudents(),
        fetchTeachers(),
        fetchClasses(),
      ]);
    } catch (error) {
      console.error('Khalad ka dhacay markii la soo dejinaayo xogta dashboard-ka:', error);
      toast.error('Khalad ayaa ka dhacay markii la soo dejinaayo xogta');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateTeacher = async (teacherData) => {
    try {
      const result = await createTeacher(teacherData);
      if (result.success) {
        await fetchTeachers();
      }
      return result;
    } catch (error) {
      console.error('Error creating teacher:', error);
      return { success: false, message: error.message };
    }
  };

  const handleCreateStudent = async (studentData) => {
    try {
      const result = await createStudent(studentData);
      if (result.success) {
        await fetchStudents();
      }
      return result;
    } catch (error) {
      console.error('Error creating student:', error);
      return { success: false, message: error.message };
    }
  };

  const handleCreateClass = async (classData) => {
    try {
      const result = await createClass(classData);
      if (result.success) {
        await fetchClasses();
      }
      return result;
    } catch (error) {
      console.error('Error creating class:', error);
      return { success: false, message: error.message };
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen"
    >
      <AddTeacherModal 
        isOpen={isAddTeacherModalOpen}
        onClose={() => setIsAddTeacherModalOpen(false)}
        onCreate={handleCreateTeacher}
      />
      
      <AddStudentModal 
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onCreate={handleCreateStudent}
        classes={classes}
      />
      
      <AddClassModal 
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        onCreate={handleCreateClass}
        teachers={teachers}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Ku soo dhawoow, <span className="text-blue-600">{user?.username}</span>!
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Halkan waxa ku yaal waxyaabaha ka dhacaya Maamulka Al-Qayim maanta.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchAllData}
          disabled={isRefreshing}
          className="flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 shadow-sm transition-colors duration-200"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Cusboonaysii Xogta</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Wadarta Ardayda"
          value={students.length}
          icon={Users}
          color="blue"
          trend="+12% bishii la soo dhaafay"
          loading={studentsLoading}
        />
        <StatCard
          title="Wadarta Barayaasha"
          value={teachers.length}
          icon={GraduationCap}
          color="green"
          trend="+5% bishii la soo dhaafay"
          loading={teachersLoading}
        />
        <StatCard
          title="Wadarta Fasallada"
          value={classes.length}
          icon={BookOpen}
          color="purple"
          trend="+8% bishii la soo dhaafay"
          loading={classesLoading}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <h2 className="text-xl font-semibold text-gray-900">Ficilal Degdeg ah</h2>
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700">Nidaamka Online ah</span>
              </div>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <QuickActionCard
                title="Ku Dar Arday Cusub"
                description="Diiwaan geli arday cusub"
                icon={UserPlus}
                color="blue"
                onClick={() => setIsAddStudentModalOpen(true)}
              />
              <QuickActionCard
                title="Ku Dar Barre Cusub"
                description="Diiwaan geli bare cusub"
                icon={UserPlus}
                color="green"
                onClick={() => setIsAddTeacherModalOpen(true)}
              />
              <QuickActionCard
                title="Abuur Fasalka"
                description="Deji fasalka cusub"
                icon={BookMarked}
                color="purple"
                onClick={() => setIsAddClassModalOpen(true)}
              />
              <Link to="/createStudent" className="no-underline">
                <QuickActionCard
                  title="Diiwangeli Isticmaale"
                  description="Diwangalin"
                  icon={CalendarCheck}
                  color="orange"
                  onClick={() => {}}
                />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Waxqabadka Ugu Danbeeyay</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            <RecentActivityItem
              icon={Users}
              title="Arday Cusub oo Diiwaan Gashay"
              description="Axmed Cali waxa uu ku biiray Fasalka 10A"
              time="2h kahor"
              color="blue"
            />
            <RecentActivityItem
              icon={Calendar}
              title="Haddaha la Qoray"
              description="Fasalka 10A - 25/30 halkaa joogay"
              time="3h kahor"
              color="green"
            />
            <RecentActivityItem
              icon={BookOpen}
              title="Fasalka Cusub la Abuuro"
              description="Xisaab Fasalka 9aad"
              time="5h kahor"
              color="purple"
            />
            <RecentActivityItem
              icon={GraduationCap}
              title="Baraha Profile-ka la Cusboonaysiiyay"
              description="Xaawa waxay cusboonaysiisay profile-keeda"
              time="1d kahor"
              color="orange"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
