import React, { useState, useRef } from 'react';
import { GraduationCap, Upload, X, User, FileText, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useTeachersStore from '../../store/teachersStore';
import { motion, AnimatePresence } from 'framer-motion';

const CreateTeachers = ({ onClose }) => {
  const { createTeacher } = useTeachersStore();
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
    subject: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profileInputRef = useRef(null);
  const certInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'profile') {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setCertificate(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.number || !formData.email || !formData.subject) {
      toast.error('Fadlan buuxi goobaha loo baahan yahay');
      return;
    }

    setIsSubmitting(true);

    try {
      const teacherData = new FormData();
      teacherData.append('name', formData.name);
      teacherData.append('number', formData.number);
      teacherData.append('email', formData.email);
      teacherData.append('subject', formData.subject);
      
      if (profilePicture) {
        teacherData.append('profilePicture', profilePicture);
      }
      
      if (certificate) {
        teacherData.append('certificate', certificate);
      }

      await createTeacher(teacherData);
          } catch (error) {
      console.error('Khalad markii la abuurnayay macallinka:', error);
      toast.error(error.message || 'Khalad ayaa dhacay markii la aburayay macallinka');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = (type) => {
    if (type === 'profile') {
      setProfilePicture(null);
      setPreviewImage(null);
      if (profileInputRef.current) {
        profileInputRef.current.value = '';
      }
    } else {
      setCertificate(null);
      if (certInputRef.current) {
        certInputRef.current.value = '';
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white z-10 p-6 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Ku Dar Macallin Cusub</h2>
            </div>
            <motion.button 
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                whileFocus={{ scale: 1.02 }}
                className="space-y-1"
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">Magaca Buuxa</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </motion.div>

              <motion.div 
                whileFocus={{ scale: 1.02 }}
                className="space-y-1"
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">Lambarka Macallinka</label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </motion.div>

              <motion.div 
                whileFocus={{ scale: 1.02 }}
                className="space-y-1"
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">Iimaylka</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </motion.div>

              <motion.div 
                whileFocus={{ scale: 1.02 }}
                className="space-y-1"
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">Maadada</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <label className="block text-sm font-medium text-gray-700 mb-3">Sawirka Macallinka</label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {previewImage ? (
                      <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="relative"
                      >
                        <img 
                          src={previewImage} 
                          alt="Profile preview" 
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeFile('profile')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={profileInputRef}
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'profile')}
                      className="hidden"
                      id="profilePicture"
                    />
                    <motion.label
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      htmlFor="profilePicture"
                      className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-all duration-200"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {profilePicture ? 'Beddel Sawir' : 'Soo rar Sawir'}
                    </motion.label>
                    <p className="mt-2 text-xs text-gray-500">PNG, JPG (Ugu badnaan 5MB)</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <label className="block text-sm font-medium text-gray-700 mb-3">Shahaadada (PDF/Sawir)</label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {certificate ? (
                      <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="relative"
                      >
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-200 shadow-inner">
                          <FileText className="w-10 h-10 text-blue-400" />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeFile('certificate')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <FileText className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={certInputRef}
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'certificate')}
                      className="hidden"
                      id="certificate"
                    />
                    <motion.label
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      htmlFor="certificate"
                      className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-all duration-200"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {certificate ? 'Beddel Shahaado' : 'Soo rar Shahaado'}
                    </motion.label>
                    <p className="mt-2 text-xs text-gray-500">PDF, JPG (Ugu badnaan 10MB)</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <motion.button
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                disabled={isSubmitting}
              >
                Jooji
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 flex items-center shadow-md transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Diiwaan gelin...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Keydi Macallinka
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateTeachers;