import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import useClassesStore from '../../store/classesStore';

const CreateClass = () => {
  const { createClass } = useClassesStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    level: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Fadlan geli magaca fasalka';
    if (!formData.level.trim()) newErrors.level = 'Fadlan geli heerka fasalka';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await createClass(formData);
      if (result.success) {
        navigate('/getAll');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/classes')}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <FiArrowLeft className="mr-1" />
          Dib ugu laabo
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Abuur Fasalka Cusub</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Magaca Fasalka <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Geli magaca fasalka"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
              Heerka Fasalka <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.level ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Geli heerka fasalka (tusaale: dugsi dhexe, mid sare, ...)"
            />
            {errors.level && <p className="mt-1 text-sm text-red-500">{errors.level}</p>}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/getAll')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Jooji
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <FiSave className="mr-2" />
              {isSubmitting ? 'Abuuraya...' : 'Abuur Fasalka'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-700">Tilmaamaha Fasalka</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Magaca fasalka waa inuu ahaadaa mid gaar ah</li>
                <li>Geli heerka fasalka sida dugsi dhexe , sare ,  iwm</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClass;