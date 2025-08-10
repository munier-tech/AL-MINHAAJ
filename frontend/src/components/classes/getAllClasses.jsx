import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEye, FiEdit2, FiTrash2, FiUsers, FiSearch, FiChevronDown, FiX 
} from 'react-icons/fi';
import { BsBook } from 'react-icons/bs';
import useClassesStore from '../../store/classesStore';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const cardHover = {
  scale: 1.02,
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
};

const GetAllClass = () => {
  const {
    classes,
    loading,
    fetchClasses,
    deleteClass,
    updateClass,
    fetchClassById,
    updating
  } = useClassesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingClassId, setEditingClassId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    level: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDelete = async (classId) => {
    const confirmation = window.confirm('Ma hubtaa inaad tirtirayso fasalkan?');
    if (confirmation) {
      await deleteClass(classId);
    }
  };

  const startEditing = (cls) => {
    setEditingClassId(cls._id);
    setEditFormData({
      name: cls.name,
      level: cls.level
    });
  };

  const cancelEditing = () => {
    setEditingClassId(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitEdit = async (classId) => {
    await updateClass(classId, editFormData);
    setEditingClassId(null);
  };

  const filteredClasses = classes.filter(cls =>
    cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.level?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dhammaan Fasallada</h1>
          <p className="text-gray-600 mt-2">Liiska fasallada iyo macluumaadkooda</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="relative w-full md:w-64"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Raadi fasalka..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/addClass"
              className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 whitespace-nowrap shadow-md"
            >
              <FiPlus className="mr-2" />
              Abuur Fasalka Cusub
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {filteredClasses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <BsBook className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {searchQuery ? 
                    "Wax fasallo ah lama helin raadintaada" : 
                    "Ma jiro fasallo la heli karo"}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredClasses.map((cls) => (
              <motion.div
                key={cls._id}
                variants={itemVariants}
                whileHover={cardHover}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-shadow duration-300 flex flex-col"
              >
                <div className="p-6 flex-grow">
                  {editingClassId === cls._id ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Magaca</label>
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Heerka</label>
                        <input
                          type="text"
                          name="level"
                          value={editFormData.level}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{cls.name}</h3>
                          <p className="text-gray-500 mt-1">Heerka: {cls.level}</p>
                        </div>
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {cls.students?.length || 0} Arday
                        </motion.span>
                      </div>
                      <div className="mt-6 flex items-center text-gray-500">
                        <FiUsers className="mr-2" />
                        <span>Tirada ardayda: {cls.students?.length || 0}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  {editingClassId === cls._id ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex space-x-3"
                    >
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={cancelEditing}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <FiX className="mr-2" />
                        Jooji
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => submitEdit(cls._id)}
                        disabled={updating}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating ? 'Kaydinta...' : 'Kaydi'}
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex space-x-3"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to={`/classes/${cls._id}`}
                          className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <FiEye className="mr-2" />
                          Fiiri
                        </Link>
                      </motion.div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startEditing(cls)}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-yellow-500 text-yellow-600 rounded-md text-sm font-medium hover:bg-yellow-50"
                      >
                        <FiEdit2 className="mr-2" />
                        Wax ka beddel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(cls._id)}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-red-500 text-red-600 rounded-md text-sm font-medium hover:bg-red-50"
                      >
                        <FiTrash2 className="mr-2" />
                        Tirtir
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GetAllClass;