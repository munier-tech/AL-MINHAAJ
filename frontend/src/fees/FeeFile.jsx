import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiSearch, FiXCircle, FiDollarSign, FiUsers, FiCalendar, FiPlus, FiCheck, FiX } from "react-icons/fi";
import { useFeeStore } from "../store/feeStore";
import useStudentsStore from "../store/studentsStore";
import useClassesStore from "../store/classesStore";

const FeeFile = () => {
  const [activeTab, setActiveTab] = useState("manage");
  
  // Individual fee management state
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [classStudents, setClassStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // Fee editing state
  const [editingStudent, setEditingStudent] = useState(null);
  const [feeForm, setFeeForm] = useState({
    amount: "",
    dueDate: "",
    note: "",
    paid: false
  });

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, paid, unpaid, no-record

  const {
    createFeeRecord,
    getStudentsByClass,
    updateFeeRecord,
    deleteFeeRecord,
    getAllFeeRecords,
    loading: feeLoading,
  } = useFeeStore();

  const { students, fetchStudents } = useStudentsStore();
  const { classes, fetchClasses } = useClassesStore();

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [fetchStudents, fetchClasses]);

  // Load students when class/month/year changes
  useEffect(() => {
    if (selectedClass) {
      loadClassStudents();
    }
  }, [selectedClass, selectedMonth, selectedYear]);

  const loadClassStudents = async () => {
    if (!selectedClass) return;
    
    setLoadingStudents(true);
    try {
      const response = await getStudentsByClass(
        selectedClass._id,
        selectedMonth,
        selectedYear
      );
      setClassStudents(response || []);
    } catch (error) {
      console.error("Error loading students:", error);
      setClassStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreateOrUpdateFee = async (student) => {
    if (!feeForm.amount || !feeForm.dueDate) {
      alert("Please fill in amount and due date");
      return;
    }

    try {
      const feeData = {
        student: student._id,
        amount: parseFloat(feeForm.amount),
        month: selectedMonth,
        year: selectedYear,
        dueDate: feeForm.dueDate,
        note: feeForm.note,
        paid: feeForm.paid,
        paidDate: feeForm.paid ? new Date().toISOString() : null
      };

      if (student.feeRecord) {
        // Update existing fee
        await updateFeeRecord(student.feeRecord._id, {
          amount: feeData.amount,
          dueDate: feeData.dueDate,
          note: feeData.note,
          paid: feeData.paid,
          paidDate: feeData.paidDate
        });
      } else {
        // Create new fee
        await createFeeRecord(feeData);
      }

      // Reset form and reload students
      setEditingStudent(null);
      setFeeForm({ amount: "", dueDate: "", note: "", paid: false });
      await loadClassStudents();
    } catch (error) {
      console.error("Error saving fee:", error);
    }
  };

  const handleEditFee = (student) => {
    setEditingStudent(student._id);
    if (student.feeRecord) {
      setFeeForm({
        amount: student.feeRecord.amount.toString(),
        dueDate: student.feeRecord.dueDate.split('T')[0],
        note: student.feeRecord.note || "",
        paid: student.feeRecord.paid
      });
    } else {
      setFeeForm({
        amount: "",
        dueDate: "",
        note: "",
        paid: false
      });
    }
  };

  const handleDeleteFee = async (feeId) => {
    if (!confirm("Are you sure you want to delete this fee record?")) return;
    
    try {
      await deleteFeeRecord(feeId);
      await loadClassStudents();
    } catch (error) {
      console.error("Error deleting fee:", error);
    }
  };

  const togglePaymentStatus = async (student) => {
    if (!student.feeRecord) return;
    
    try {
      await updateFeeRecord(student.feeRecord._id, {
        paid: !student.feeRecord.paid,
        paidDate: !student.feeRecord.paid ? new Date().toISOString() : null
      });
      await loadClassStudents();
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  // Filter students based on search and status
  const filteredStudents = classStudents.filter(student => {
    const matchesSearch = student.fullname.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "paid") return matchesSearch && student.feeRecord?.paid;
    if (filterStatus === "unpaid") return matchesSearch && student.feeRecord && !student.feeRecord.paid;
    if (filterStatus === "no-record") return matchesSearch && !student.feeRecord;
    
    return matchesSearch;
  });

  const getMonthName = (monthNum) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNum - 1];
  };

  const getStatusColor = (student) => {
    if (!student.feeRecord) return "bg-gray-100 text-gray-800";
    if (student.feeRecord.paid) return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusText = (student) => {
    if (!student.feeRecord) return "No Record";
    if (student.feeRecord.paid) return "Paid";
    return "Unpaid";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Individual Student Fee Management</h1>
          </div>
          <p className="mt-1 text-sm opacity-90">Set and manage individual student fees with precise control.</p>
        </div>

        {/* Class and Period Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Select Class and Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={selectedClass?._id || ""}
                onChange={(e) => {
                  const cls = classes.find(c => c._id === e.target.value);
                  setSelectedClass(cls);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input
                type="number"
                min="2020"
                max="2030"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={loadClassStudents}
                disabled={!selectedClass || loadingStudents}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingStudents ? "Loading..." : "Load Students"}
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        {selectedClass && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Students</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="no-record">No Record</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Students List */}
        {selectedClass && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {selectedClass.name} - {getMonthName(selectedMonth)} {selectedYear}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} 
                {filterStatus !== 'all' && ` (${filterStatus.replace('-', ' ')})`}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{student.fullname}</div>
                      </td>
                      <td className="px-6 py-4">
                        {editingStudent === student._id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={feeForm.amount}
                            onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Amount"
                          />
                        ) : (
                          <span className="text-gray-900">
                            {student.feeRecord ? `$${student.feeRecord.amount}` : '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingStudent === student._id ? (
                          <input
                            type="date"
                            value={feeForm.dueDate}
                            onChange={(e) => setFeeForm({...feeForm, dueDate: e.target.value})}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className="text-gray-900">
                            {student.feeRecord ? new Date(student.feeRecord.dueDate).toLocaleDateString() : '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingStudent === student._id ? (
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={feeForm.paid}
                              onChange={(e) => setFeeForm({...feeForm, paid: e.target.checked})}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">Paid</span>
                          </label>
                        ) : (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student)}`}>
                            {getStatusText(student)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {editingStudent === student._id ? (
                            <>
                              <button
                                onClick={() => handleCreateOrUpdateFee(student)}
                                disabled={feeLoading}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Save"
                              >
                                <FiCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingStudent(null);
                                  setFeeForm({ amount: "", dueDate: "", note: "", paid: false });
                                }}
                                className="p-1 text-gray-600 hover:text-gray-800"
                                title="Cancel"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditFee(student)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title={student.feeRecord ? "Edit Fee" : "Add Fee"}
                              >
                                {student.feeRecord ? <FiEdit2 className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
                              </button>
                              
                              {student.feeRecord && (
                                <>
                                  <button
                                    onClick={() => togglePaymentStatus(student)}
                                    className={`p-1 ${student.feeRecord.paid ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                                    title={student.feeRecord.paid ? "Mark as Unpaid" : "Mark as Paid"}
                                  >
                                    {student.feeRecord.paid ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteFee(student.feeRecord._id)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                    title="Delete Fee"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && !loadingStudents && (
              <div className="text-center py-8 text-gray-500">
                <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium">No students found</p>
                <p className="text-sm">
                  {searchQuery || filterStatus !== 'all' 
                    ? "Try adjusting your search or filter criteria."
                    : "Please select a class to view students."
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Note Input (when editing) */}
        {editingStudent && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Additional Note</h3>
            <textarea
              value={feeForm.note}
              onChange={(e) => setFeeForm({...feeForm, note: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Optional note about this fee..."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeFile;