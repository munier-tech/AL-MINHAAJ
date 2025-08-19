import { useState, useEffect } from 'react';
import { FiDollarSign, FiPlus, FiCalendar, FiTrendingUp, FiTrendingDown, FiCreditCard } from 'react-icons/fi';
import useFinanceStore from '../../store/financeStore';
import { Loader } from 'lucide-react';

const AddFinance = () => {
  const { addFinance, loading, clearMessages } = useFinanceStore();
  
  const [formData, setFormData] = useState({
    income: '',
    expenses: '',
    debt: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.income || formData.income <= 0) {
      newErrors.income = 'Fadlan gali dakhliga';
    }
    
    if (!formData.expenses || formData.expenses < 0) {
      newErrors.expenses = 'Fadlan gali kharashka';
    }
    
    if (!formData.debt || formData.debt < 0) {
      newErrors.debt = 'Fadlan gali Daynta';
    }
    
    if (!formData.date) {
      newErrors.date = 'Fadlan dooro taariikhda';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await addFinance({
      income: parseFloat(formData.income),
      expenses: parseFloat(formData.expenses),
      debt: parseFloat(formData.debt),
      date: formData.date
    });

    if (result.success) {
      setFormData({
        income: '',
        expenses: '',
        debt: '',
        date: new Date().toISOString().split('T')[0]
      });
      setErrors({});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FiDollarSign className="mr-3" />
              Ku dar Maaliyad Cusub
            </h1>
            <p className="text-green-100 mt-1">
              Geli macluumaadka Dhaqaale cusub
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Income */}
            <div>
              <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-2">
                <FiTrendingUp className="inline mr-2 text-green-600" />
                Dakhliga (Lacagta la soo galay)
              </label>
              <input
                type="number"
                id="income"
                name="income"
                value={formData.income}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.income ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Geli dakhliga"
                min="0"
                step="0.01"
              />
              {errors.income && (
                <p className="mt-1 text-sm text-red-600">{errors.income}</p>
              )}
            </div>

            {/* Expenses */}
            <div>
              <label htmlFor="expenses" className="block text-sm font-medium text-gray-700 mb-2">
                <FiTrendingDown className="inline mr-2 text-red-600" />
                Kharashka (Lacagta la bixiyay)
              </label>
              <input
                type="number"
                id="expenses"
                name="expenses"
                value={formData.expenses}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.expenses ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Geli kharashka"
                min="0"
                step="0.01"
              />
              {errors.expenses && (
                <p className="mt-1 text-sm text-red-600">{errors.expenses}</p>
              )}
            </div>

            {/* Debt */}
            <div>
              <label htmlFor="debt" className="block text-sm font-medium text-gray-700 mb-2">
                <FiCreditCard className="inline mr-2 text-orange-600" />
                Daynta (Deynta)
              </label>
              <input
                type="number"
                id="debt"
                name="debt"
                value={formData.debt}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.debt ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Geli qaansheega"
                min="0"
                step="0.01"
              />
              {errors.debt && (
                <p className="mt-1 text-sm text-red-600">{errors.debt}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="inline mr-2 text-blue-600" />
                Taariikhda
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ...
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-2" />
                    Ku dar Dhaqaale
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFinance;