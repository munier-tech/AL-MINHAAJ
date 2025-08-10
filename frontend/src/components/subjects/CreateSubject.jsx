import { useEffect, useState } from "react";
import { FiBook, FiUser, FiSave, FiPlus } from "react-icons/fi";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { useSubjectStore } from "../../store/subjectsStore";
import useTeachersStore from "../../store/teachersStore";
import { Loader } from "lucide-react";

const CreateSubject = () => {
  const { createSubject, isLoading, error, successMessage, clearMessages } = useSubjectStore();
  const { teachers, fetchTeachers } = useTeachersStore();
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    teacher: null
  });

  const [errors, setErrors] = useState({
    name: "",
    teacher: ""
  });

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Handle API messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      clearMessages();
      resetForm();
    }
    if (error) {
      toast.error(error);
      clearMessages();
    }
  }, [successMessage, error, clearMessages]);

  const teacherOptions = teachers.map(teacher => ({
    value: teacher._id,
    label: teacher.name || "Unnamed Teacher"
  }));

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
        [name]: ""
      }));
    }
  };

  const handleTeacherSelect = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      teacher: selectedOption?.value || null
    }));
    if (errors.teacher) {
      setErrors(prev => ({
        ...prev,
        teacher: ""
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", teacher: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Subject name is required";
      valid = false;
    }

    if (!formData.teacher) {
      newErrors.teacher = "Please select a teacher";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      teacher: null
    });
    setErrors({
      name: "",
      teacher: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await createSubject({
        name: formData.name,
        code: formData.code,
        teacher: formData.teacher
      });
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <FiBook className="h-6 w-6" />
            <h2 className="text-xl font-bold">Abuur Maado Cusub</h2>
          </div>
          <p className="mt-1 text-indigo-100 text-sm">
            Buuxi dhamaan Qaybaha Hoose 
         </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Subject Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Magaca Maadada <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g. Mathematics"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Subject Code (Optional) */}
      

          {/* Teacher Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Macalinka <span className="text-red-500">*</span>
            </label>
            <Select
              options={teacherOptions}
              value={teacherOptions.find(opt => opt.value === formData.teacher)}
              onChange={handleTeacherSelect}
              placeholder="Select a teacher..."
              isClearable
              className={`react-select-container ${
                errors.teacher ? "border-red-500 rounded-lg" : ""
              }`}
              classNamePrefix="react-select"
            />
            {errors.teacher && (
              <p className="text-red-500 text-xs mt-1">{errors.teacher}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Abuur Maado 
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubject;