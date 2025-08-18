import { useEffect, useMemo, useState } from "react";
import { FiUsers, FiPlus, FiSearch, FiXCircle, FiDollarSign, FiCheck, FiTrash2 } from "react-icons/fi";
import useStudentsStore from "../store/studentsStore";
import { useFamilyFeeStore } from "../store/familyFeeStore";

const FamilyFees = () => {
  const { students, searchStudents } = useStudentsStore();
  const { 
    familyFees, 
    loading, 
    error, 
    createFamilyFee, 
    getAllFamilyFees, 
    processFamilyFeePayment,
    deleteFamilyFee 
  } = useFamilyFeeStore();

  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    familyName: "",
    paid: ""
  });

  const [form, setForm] = useState({
    familyName: "",
    selectedStudents: [],
    totalAmount: "",
    dueDate: "",
    note: ""
  });

  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [manualStudentName, setManualStudentName] = useState("");
  const [payment, setPayment] = useState({
    targetId: null,
    paidAmount: "",
    paymentMethod: "cash",
    note: ""
  });

  useEffect(() => {
    const params = {
      month: filters.month,
      year: filters.year,
    };
    if (filters.paid !== "") params.paid = filters.paid;
    if (filters.familyName) params.familyName = filters.familyName;
    getAllFamilyFees(params);
  }, [filters.month, filters.year, filters.paid, filters.familyName, getAllFamilyFees]);

  // Calculate totals
  const { totalPaid, totalRemaining } = useMemo(() => {
    let paid = 0;
    let remaining = 0;
    
    familyFees.forEach(fee => {
      paid += fee.paidAmount || 0;
      remaining += Math.max((fee.totalAmount || 0) - (fee.paidAmount || 0), 0);
    });
    
    return { totalPaid: paid, totalRemaining: remaining };
  }, [familyFees]);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    return searchStudents(studentSearchQuery);
  }, [students, studentSearchQuery, searchStudents]);

  // Get student name with proper fallbacks
  const getStudentDisplayInfo = (studentRef) => {
    if (studentRef.student) {
      // Registered student
      const student = students.find(s => s._id === studentRef.student);
      return {
        name: student ? student.fullname : studentRef.studentName || "Arday aan la garanayn",
        isRegistered: true
      };
    }
    // Manually added student
    return {
      name: studentRef.studentName || "Arday aan la garanayn",
      isRegistered: false
    };
  };

  const handleSelectStudent = (student) => {
    if (form.selectedStudents.find(s => s.student === student._id)) return;
    if (form.selectedStudents.length >= 15) {
      alert("Qoys kastaa ugu badnaan 15 arday");
      return;
    }
    setForm(prev => ({
      ...prev,
      selectedStudents: [...prev.selectedStudents, { 
        student: student._id, 
        studentName: student.fullname,
        isPaying: false 
      }]
    }));
    setStudentSearchQuery("");
  };

  const handleAddManualStudent = () => {
    if (!manualStudentName.trim()) return;
    if (form.selectedStudents.length >= 15) {
      alert("Qoys kastaa ugu badnaan 15 arday");
      return;
    }
    setForm(prev => ({
      ...prev,
      selectedStudents: [...prev.selectedStudents, { 
        student: null, 
        studentName: manualStudentName.trim(),
        isPaying: false 
      }]
    }));
    setManualStudentName("");
  };

  const handleRemoveStudent = (index) => {
    setForm(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setForm({ familyName: "", selectedStudents: [], totalAmount: "", dueDate: "", note: "" });
    setStudentSearchQuery("");
    setManualStudentName("");
  };

  const handleCreate = async () => {
    if (!form.familyName || form.selectedStudents.length === 0 || !form.totalAmount || !form.dueDate) {
      alert("Fadlan buuxi xogta qoyska, ardayda, qadarka iyo taariikhda");
      return;
    }
    try {
      await createFamilyFee({
        familyName: form.familyName,
        students: form.selectedStudents,
        totalAmount: Number(form.totalAmount),
        month: filters.month,
        year: filters.year,
        dueDate: form.dueDate,
        note: form.note
      });
      resetForm();
      await getAllFamilyFees({ month: filters.month, year: filters.year });
    } catch (err) {
      console.error("Khalad ayaa dhacay abuurista lacagta qoyska:", err);
    }
  };

  const handleProcessPayment = async () => {
    if (!payment.targetId || payment.paidAmount === "") return;
    try {
      await processFamilyFeePayment(payment.targetId, {
        paidAmount: Number(payment.paidAmount),
        paymentMethod: payment.paymentMethod,
        note: payment.note
      });
      setPayment({ targetId: null, paidAmount: "", paymentMethod: "cash", note: "" });
      await getAllFamilyFees({ month: filters.month, year: filters.year });
    } catch (err) {
      console.error("Khalad ayaa dhacay bixinta lacagta:", err);
    }
  };

  const months = [
    "Janaayo", "Febraayo", "Maarso", "Abriil", "Maajo", "Juun",
    "Luuliyo", "Agoosto", "Sebtembar", "Oktoobar", "Nofembar", "Diseembar"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold">Lacagta Qoyska</h1>
          </div>
          <p className="mt-1 text-sm opacity-90">Qoys hal mar uga bixi lacagta</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bisha</label>
              <select
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i+1} value={i+1}>{months[i]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sanadka</label>
              <input
                type="number"
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Magaca Qoyska</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.familyName}
                  onChange={(e) => setFilters(prev => ({ ...prev, familyName: e.target.value }))}
                  placeholder="Raadi magaca qoyska"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Xaaladda</label>
              <select
                value={filters.paid}
                onChange={(e) => setFilters(prev => ({ ...prev, paid: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Dhammaan</option>
                <option value="true">La bixiyey</option>
                <option value="false">Harsan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-green-800">Wadarta Lacagta La Bixiyey</h3>
                  <p className="text-2xl font-bold text-green-900">{totalPaid.toLocaleString()}$</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <FiCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-orange-800">Wadarta Lacagta Harsan</h3>
                  <p className="text-2xl font-bold text-orange-900">{totalRemaining.toLocaleString()}$</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-full">
                  <FiDollarSign className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Family Fee */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Abuur Lacag Qoys</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Magaca Qoyska</label>
              <input
                type="text"
                value={form.familyName}
                onChange={(e) => setForm(prev => ({ ...prev, familyName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Magaca qoyska"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wadarta Qadarka</label>
              <input
                type="number"
                value={form.totalAmount}
                onChange={(e) => setForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taariikhda Bixinta</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCreate}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiPlus className="inline mr-2" /> Kaydi
              </button>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Fiiro Gaar Ah</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="2"
              placeholder="Qoraal ikhtiyaari ah"
            />
          </div>

          {/* Students selector */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ku dar Arday (ugu badnaan 15)</label>
            
            {/* Student search input */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                placeholder="Raadi ardayga"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Manual student name input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={manualStudentName}
                onChange={(e) => setManualStudentName(e.target.value)}
                placeholder="Haddii aan la helin, ku qor magaca ardayga"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleAddManualStudent}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                <FiPlus className="inline mr-1" /> Ku dar
              </button>
            </div>

            {/* Search results */}
            {studentSearchQuery && (
              <div className="mb-4 border rounded-lg max-h-48 overflow-y-auto">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(st => (
                    <div 
                      key={st._id} 
                      className="p-3 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      onClick={() => handleSelectStudent(st)}
                    >
                      <div>
                        <div className="font-medium">{st.fullname}</div>
                        <div className="text-xs text-gray-500">{st.class?.name || 'N/A'}</div>
                      </div>
                      <FiPlus className="text-blue-500" />
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    Lama helin ardayga la raadinayo
                  </div>
                )}
              </div>
            )}

            {/* Selected students */}
            <div className="space-y-2">
              {form.selectedStudents.map((student, index) => {
                const displayInfo = getStudentDisplayInfo(student);
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{displayInfo.name}</span>
                      <span className={`ml-2 text-xs ${
                        displayInfo.isRegistered ? 'text-gray-500' : 'text-orange-500'
                      }`}>
                        ({displayInfo.isRegistered ? 'Diwaangani ah' : 'Galiyey qoraal ahaan'})
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(index)}
                      className="text-red-600 hover:text-red-800"
                      title="Ka saar"
                    >
                      <FiXCircle />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Family Fees List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Diiwaanada Lacagta Qoysaska</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qoys</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ardayda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wadarta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">La Bixiyey</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harsan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xaalad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ficil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {familyFees.map(fee => {
                  const remaining = Math.max((fee.totalAmount || 0) - (fee.paidAmount || 0), 0);
                  return (
                    <tr key={fee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{fee.familyName}</div>
                        <div className="text-xs text-gray-500">{months[fee.month - 1]} {fee.year}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {fee.students?.map((studentRef, index) => {
                            const displayInfo = getStudentDisplayInfo(studentRef);
                            return (
                              <span 
                                key={index} 
                                className={`px-2 py-0.5 text-xs rounded-full ${
                                  displayInfo.isRegistered ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'
                                }`}
                                title={displayInfo.isRegistered ? "Arday diwaangani ah" : "Arday qoraal ahaan lagu daray"}
                              >
                                {displayInfo.name}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">{fee.totalAmount?.toLocaleString()}</td>
                      <td className="px-6 py-4">{(fee.paidAmount || 0)?.toLocaleString()}</td>
                      <td className="px-6 py-4">{remaining?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          remaining === 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {remaining === 0 ? 'La bixiyey' : 'Harsan'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPayment({ 
                              targetId: fee._id, 
                              paidAmount: fee.paidAmount || "", 
                              paymentMethod: fee.paymentMethod || 'cash', 
                              note: fee.note || '' 
                            })}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Bixi/Qabso"
                          >
                            <FiDollarSign />
                          </button>
                          <button
                            onClick={async () => { 
                              if (confirm('Ma hubtaa inaad tirtirayso?')) { 
                                await deleteFamilyFee(fee._id); 
                                await getAllFamilyFees({ month: filters.month, year: filters.year }); 
                              } 
                            }}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Tirtir"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        {payment.targetId && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Qabso Bixinta Qoyska</h3>
                <button 
                  onClick={() => setPayment({ targetId: null, paidAmount: "", paymentMethod: "cash", note: "" })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiXCircle />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qadarka la Bixinayo (wadarta ilaa)</label>
                  <input
                    type="number"
                    value={payment.paidAmount}
                    onChange={(e) => setPayment(prev => ({ ...prev, paidAmount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Habka Bixinta</label>
                  <select
                    value={payment.paymentMethod}
                    onChange={(e) => setPayment(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiiro</label>
                  <textarea
                    value={payment.note}
                    onChange={(e) => setPayment(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="2"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setPayment({ targetId: null, paidAmount: "", paymentMethod: "cash", note: "" })}
                    className="px-4 py-2 bg-gray-200 rounded-lg"
                  >
                    Ka noqo
                  </button>
                  <button
                    onClick={handleProcessPayment}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FiCheck className="inline mr-1" /> Kaydi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyFees;