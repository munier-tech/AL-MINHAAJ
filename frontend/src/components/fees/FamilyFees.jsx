import React, { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiUsers, FiDollarSign, FiCalendar, FiCheck, FiX, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useFamilyFeeStore } from '../../store/familyFeeStore';
import useStudentsStore from '../../store/studentsStore';

const FamilyFees = () => {
  const { 
    familyFees,
    loading,
    createFamilyFee,
    getAllFamilyFees,
    processFamilyFeePayment,
    clearError
  } = useFamilyFeeStore();

  const { students, fetchStudents } = useStudentsStore();

  const [form, setForm] = useState({
    familyName: '',
    selectedStudentIds: [],
    totalAmount: '',
    paidAmount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    dueDate: new Date().toISOString().slice(0, 10),
    note: ''
  });

  const [search, setSearch] = useState('');
  const [payInputs, setPayInputs] = useState({});

  useEffect(() => {
    fetchStudents();
    getAllFamilyFees({ month: form.month, year: form.year });
    return () => clearError();
  }, [fetchStudents, getAllFamilyFees]);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(s =>
      s.fullname?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      String(s._id).toLowerCase().includes(q)
    );
  }, [students, search]);

  const toggleStudent = (id) => {
    setForm((prev) => {
      const has = prev.selectedStudentIds.includes(id);
      return {
        ...prev,
        selectedStudentIds: has
          ? prev.selectedStudentIds.filter(sid => sid !== id)
          : [...prev.selectedStudentIds, id]
      };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.familyName || form.selectedStudentIds.length === 0) {
      toast.error('Fadlan geli magaca qoyska iyo ugu yaraan hal arday');
      return;
    }
    if (!form.totalAmount) {
      toast.error('Fadlan geli wadarta lacagta');
      return;
    }

    const total = parseFloat(form.totalAmount) || 0;
    let paid = parseFloat(form.paidAmount || '0') || 0;
    if (paid < 0) paid = 0;
    if (paid > total) {
      toast.error('Lacagta la bixiyay kama badnaan karto wadarta');
      return;
    }

    const payload = {
      familyName: form.familyName,
      students: form.selectedStudentIds.map(id => ({ student: id, isPaying: true })),
      totalAmount: total,
      paidAmount: paid,
      month: Number(form.month),
      year: Number(form.year),
      dueDate: form.dueDate,
      note: form.note
    };

    try {
      await createFamilyFee(payload);
      toast.success('Diiwaanka lacagta qoyska waa la abuuray');
      setForm({
        familyName: '',
        selectedStudentIds: [],
        totalAmount: '',
        paidAmount: '',
        month: form.month,
        year: form.year,
        dueDate: new Date().toISOString().slice(0, 10),
        note: ''
      });
      await getAllFamilyFees({ month: form.month, year: form.year });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Khalad ayaa dhacay');
    }
  };

  const handleAddPayment = async (familyFeeId) => {
    const amount = parseFloat(payInputs[familyFeeId] || '0') || 0;
    if (amount <= 0) {
      toast.error('Fadlan geli qadarka saxda ah');
      return;
    }
    try {
      await processFamilyFeePayment(familyFeeId, { paidAmount: amount });
      toast.success('Lacag bixinta waa la cusboonaysiiyay');
      setPayInputs(prev => ({ ...prev, [familyFeeId]: '' }));
      await getAllFamilyFees({ month: form.month, year: form.year });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Khalad ayaa dhacay lacag bixinta');
    }
  };

  const remaining = (fee) => Math.max((fee.totalAmount || 0) - (fee.paidAmount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-2 flex items-center"><FiUsers className="mr-2 text-blue-600"/> Maareynta Lacagta Qoyska</h1>
          <p className="text-gray-600">Ku dar diiwaan lacag qoyska, oo ay ku jirto lacagta hore loo bixiyay (ikhtiyaari) si loo xisaabiyo waxa ka harsan.</p>
        </div>

        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center"><FiPlus className="mr-2"/> Ku dar Diiwaan Qoys</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Magaca Qoyska</label>
              <input className="w-full border rounded px-3 py-2" value={form.familyName} onChange={(e) => setForm({ ...form, familyName: e.target.value })} placeholder="Tusaale: Qoyska Maxamed"/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bisha</label>
                <select className="w-full border rounded px-3 py-2" value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sanadka</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wadarta ($)</label>
              <input type="number" step="0.01" className="w-full border rounded px-3 py-2" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} placeholder="Tusaale: 150"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lacag la bixiyay ($) - ikhtiyaari</label>
              <input type="number" step="0.01" className="w-full border rounded px-3 py-2" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} placeholder="Tusaale: 50"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FiCalendar className="mr-1"/> Taariikhda Bixinta</label>
              <input type="date" className="w-full border rounded px-3 py-2" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qoraal</label>
              <input className="w-full border rounded px-3 py-2" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Fiiro ikhtiyaari ah"/>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dooro Ardayda</label>
            <div className="flex items-center mb-2">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input className="w-full pl-10 border rounded px-3 py-2" placeholder="Raadi arday..." value={search} onChange={(e) => setSearch(e.target.value)}/>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2">
              {filteredStudents.map((s) => (
                <label key={s._id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.selectedStudentIds.includes(s._id)} onChange={() => toggleStudent(s._id)} />
                  <span className="font-medium">{s.fullname}</span>
                  {s.studentId && <span className="text-gray-500 text-xs">({s.studentId})</span>}
                  <span className="text-gray-500 text-xs ml-auto">{s.class?.name || 'Fasalka la\'aan'}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center">
              <FiPlus className="mr-2"/> Kaydi Diiwaanka
            </button>
            {form.totalAmount && (
              <div className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                <FiDollarSign className="mr-1"/>
                Haraaga: ${Math.max((parseFloat(form.totalAmount || '0') - parseFloat(form.paidAmount || '0')) || 0, 0)}
              </div>
            )}
          </div>
        </form>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center"><FiDollarSign className="mr-2"/> Diiwaannada Qoysaska (Bisha {form.month}/{form.year})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qoys</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Arday</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Wadarta</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">La bixiyay</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Haraaga</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Xaalad</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kudar Bixin</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {familyFees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{fee.familyName}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{fee.students?.length || 0}</td>
                    <td className="px-4 py-2">${fee.totalAmount || 0}</td>
                    <td className="px-4 py-2">${fee.paidAmount || 0}</td>
                    <td className="px-4 py-2 font-semibold">${remaining(fee)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${remaining(fee) === 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {remaining(fee) === 0 ? 'La bixiyay' : 'Harsan'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <input type="number" step="0.01" className="w-24 border rounded px-2 py-1 text-sm" placeholder="$"
                          value={payInputs[fee._id] || ''}
                          onChange={(e) => setPayInputs(prev => ({ ...prev, [fee._id]: e.target.value }))}
                        />
                        <button onClick={() => handleAddPayment(fee._id)} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 flex items-center">
                          <FiCheck className="mr-1"/> Kudar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyFees;