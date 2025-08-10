import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  Phone,
  DollarSign,
  BookOpen,
  Loader2,
} from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import useStudentsStore from '../store/studentsStore'
import useClassesStore from '../store/classesStore'

const studentSchema = yup.object({
  fullname: yup.string().required('Full name is required'),
  age: yup.number().min(5, 'Age must be at least 5').max(25, 'Age cannot exceed 25'),
  gender: yup.string().required('Gender is required'),
  motherNumber: yup.string().required('Mother\'s number is required'),
  fatherNumber: yup.string().required('Father\'s number is required'),
  class: yup.string(),
})

function Students() {
  const {
    students,
    loading,
    creating,
    updating,
    deleting,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
  } = useStudentsStore()

  const { classes, fetchClasses } = useClassesStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(studentSchema),
    defaultValues: {
      fullname: '',
      age: '',
      gender: '',
      motherNumber: '',
      fatherNumber: '',
      class: '',
    },
  })

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [])

  const handleAddStudent = () => {
    setEditingStudent(null)
    reset()
    setShowDialog(true)
  }

  const handleEditStudent = (student) => {
    setEditingStudent(student)
    reset({
      fullname: student.fullname,
      age: student.age,
      gender: student.gender,
      motherNumber: student.motherNumber,
      fatherNumber: student.fatherNumber,
      class: student.class?._id || '',
    })
    setShowDialog(true)
  }

  const handleDeleteStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to delete ${studentName}?`)) {
      await deleteStudent(studentId)
    }
  }

  const onSubmit = async (data) => {
    const result = editingStudent 
      ? await updateStudent(editingStudent._id, data)
      : await createStudent(data)
    
    if (result.success) {
      setShowDialog(false)
      reset()
    }
  }

  const filteredStudents = searchTerm 
    ? searchStudents(searchTerm) 
    : students

  const getGenderBadge = (gender) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        gender === 'male' 
          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
          : 'bg-pink-100 text-pink-800 border border-pink-200'
      }`}>
        {gender}
      </span>
    )
  }

  const getFeeStatusBadge = (fee) => {
    const isPaid = fee?.paid >= fee?.total
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isPaid 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      }`}>
        <DollarSign className="w-3 h-3 mr-1" />
        {isPaid ? 'Paid' : 'Pending'}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-600 mt-1">Manage student records and information</p>
        </div>
        <button
          onClick={handleAddStudent}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{students.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Male Students</p>
              <p className="text-3xl font-bold text-gray-900">
                {students.filter(s => s.gender === 'male').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="card p-6 border-l-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Female Students</p>
              <p className="text-3xl font-bold text-gray-900">
                {students.filter(s => s.gender === 'female').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-pink-600" />
          </div>
        </div>
        
        <div className="card p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Fees</p>
              <p className="text-3xl font-bold text-gray-900">
                {students.filter(s => (s.fee?.paid || 0) < (s.fee?.total || 0)).length}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search students by name, class, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-2 text-gray-600">Loading students...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age & Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {student.fullname.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.fullname}</div>
                          <div className="text-sm text-gray-500">ID: {student._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.age} years</div>
                      {getGenderBadge(student.gender)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {student.class?.name || 'Not Assigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">M:</span>
                          <span className="ml-1">{student.motherNumber}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">F:</span>
                          <span className="ml-1">{student.fatherNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getFeeStatusBadge(student.fee)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student._id, student.fullname)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      {showDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button
                onClick={() => {
                  setShowDialog(false)
                  reset()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Controller
                    name="fullname"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`input-field ${errors.fullname ? 'border-red-300' : ''}`}
                        placeholder="Enter full name"
                      />
                    )}
                  />
                  {errors.fullname && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullname.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <Controller
                    name="age"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        className={`input-field ${errors.age ? 'border-red-300' : ''}`}
                        placeholder="Enter age"
                      />
                    )}
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className={`input-field ${errors.gender ? 'border-red-300' : ''}`}>
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    )}
                  />
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <Controller
                    name="class"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="input-field">
                        <option value="">Select class</option>
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mother's Phone Number
                  </label>
                  <Controller
                    name="motherNumber"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        className={`input-field ${errors.motherNumber ? 'border-red-300' : ''}`}
                        placeholder="Enter mother's phone"
                      />
                    )}
                  />
                  {errors.motherNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.motherNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Phone Number
                  </label>
                  <Controller
                    name="fatherNumber"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        className={`input-field ${errors.fatherNumber ? 'border-red-300' : ''}`}
                        placeholder="Enter father's phone"
                      />
                    )}
                  />
                  {errors.fatherNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.fatherNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDialog(false)
                    reset()
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="btn-primary flex items-center space-x-2"
                >
                  {(creating || updating) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{editingStudent ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{editingStudent ? 'Update' : 'Create'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Students