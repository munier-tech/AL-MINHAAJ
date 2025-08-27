import React, { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Trash2, Edit3, Save, UserPlus, UserMinus, Search, Menu, X } from 'lucide-react';

const SubcisManage = () => {
  // Mock data and state to simulate your actual implementation
  const [halaqas, setHalaqas] = useState([
    { _id: '1', name: 'Xalqada Koowaad', students: [{ _id: 's1', fullname: 'Cali Xasan', studentId: 'ST001' }], startingSurah: 'Al-Fatiha', taxdiid: 'Basic', description: 'Xalqad bilow ah' },
    { _id: '2', name: 'Xalqada Labaad', students: [{ _id: 's2', fullname: 'Aasha Maxamed', studentId: 'ST002' }, { _id: 's3', fullname: 'Cumar Cabdi', studentId: 'ST003' }], startingSurah: 'Al-Baqara', taxdiid: 'Intermediate', description: 'Xalqad dhexe' },
  ]);
  
  const [students, setStudents] = useState([
    { _id: 's1', fullname: 'Cali Xasan', studentId: 'ST001' },
    { _id: 's2', fullname: 'Aasha Maxamed', studentId: 'ST002' },
    { _id: 's3', fullname: 'Cumar Cabdi', studentId: 'ST003' },
    { _id: 's4', fullname: 'Safiya Axmed', studentId: 'ST004' },
    { _id: 's5', fullname: 'Maxamed Ibrahim', studentId: 'ST005' },
  ]);
  
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState({ name: '', startingSurah: '', taxdiid: '', description: '' });
  const [selected, setSelected] = useState(null);
  const [editingMeta, setEditingMeta] = useState(null);
  const [saving, setSaving] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list', 'create', 'details'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter halaqas based on search query
  const filtered = useMemo(() => {
    if (!query) return halaqas;
    return halaqas.filter(h => h.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, halaqas]);

  // Mock functions to simulate API calls
  const createHalaqa = async (e) => {
    e.preventDefault();
    if (!creating.name.trim()) return;
    setSaving(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const newHalaqa = {
        _id: String(Date.now()),
        ...creating,
        students: []
      };
      setHalaqas(prev => [newHalaqa, ...prev]);
      setCreating({ name: '', startingSurah: '', taxdiid: '', description: '' });
      setMobileView('list');
    } catch (e) {
      console.error('Creation failed', e);
    } finally {
      setSaving(false);
    }
  };

  const selectHalaqa = (h) => {
    setSelected(h);
    setEditingMeta({ 
      name: h.name, 
      startingSurah: h.startingSurah || '', 
      taxdiid: h.taxdiid || '', 
      description: h.description || '' 
    });
    setMobileView('details');
  };

  const saveMeta = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedHalaqa = { ...selected, ...editingMeta };
      setHalaqas(prev => prev.map(h => h._id === selected._id ? updatedHalaqa : h));
      setSelected(updatedHalaqa);
    } catch (e) {
      console.error('Update failed', e);
    } finally {
      setSaving(false);
    }
  };

  const deleteHalaqa = async (id) => {
    if (!window.confirm('Ma hubtaa inaad tirtirayso?')) return;
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setHalaqas(prev => prev.filter(h => h._id !== id));
      if (selected?._id === id) {
        setSelected(null);
        setMobileView('list');
      }
    } catch (e) {
      console.error('Deletion failed', e);
    }
  };

  const addStudent = async (sid) => {
    if (!selected) return;
    setSaving(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const studentToAdd = students.find(s => s._id === sid);
      if (studentToAdd) {
        const updatedHalaqa = {
          ...selected,
          students: [...selected.students, studentToAdd]
        };
        setHalaqas(prev => prev.map(h => h._id === selected._id ? updatedHalaqa : h));
        setSelected(updatedHalaqa);
      }
    } catch (e) {
      console.error('Adding student failed', e);
    } finally {
      setSaving(false);
    }
  };

  const removeStudent = async (sid) => {
    if (!selected) return;
    setSaving(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedHalaqa = {
        ...selected,
        students: selected.students.filter(s => s._id !== sid)
      };
      setHalaqas(prev => prev.map(h => h._id === selected._id ? updatedHalaqa : h));
      setSelected(updatedHalaqa);
    } catch (e) {
      console.error('Removing student failed', e);
    } finally {
      setSaving(false);
    }
  };

  const memberIds = new Set((selected?.students || []).map(s => s._id));

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Mobile Header with Navigation */}
      <div className="md:hidden flex items-center justify-between mb-4 bg-white p-3 rounded-lg shadow">
        <h2 className="text-xl font-semibold">Maamul Xalqooyin</h2>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-indigo-100 text-indigo-700"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mb-4 bg-white rounded-lg shadow p-3">
          <div className="flex flex-col space-y-2">
            <button 
              onClick={() => { setMobileView('list'); setIsMobileMenuOpen(false); }}
              className={`p-2 rounded-md text-left ${mobileView === 'list' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
            >
              Liiska Xalqooyinka
            </button>
            <button 
              onClick={() => { setMobileView('create'); setIsMobileMenuOpen(false); }}
              className={`p-2 rounded-md text-left ${mobileView === 'create' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
            >
              Abuur Xalqad
            </button>
            {selected && (
              <button 
                onClick={() => { setMobileView('details'); setIsMobileMenuOpen(false); }}
                className={`p-2 rounded-md text-left ${mobileView === 'details' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
              >
                Xogta Xalqada
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Create Halaqa Form - Hidden on mobile when not active */}
        <div className={`bg-white rounded-lg p-4 shadow ${mobileView !== 'create' ? 'hidden md:block' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Abuur Xalqad</h3>
            <button 
              onClick={() => setMobileView('list')}
              className="md:hidden text-gray-500 p-1"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={createHalaqa} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Magaca Xalqada</label>
              <input 
                value={creating.name} 
                onChange={e => setCreating(v => ({ ...v, name: e.target.value }))} 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Geli magaca xalqada"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Suurada laga bilaabayo</label>
              <input 
                value={creating.startingSurah} 
                onChange={e => setCreating(v => ({ ...v, startingSurah: e.target.value }))} 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Geli suurada"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taxdiid</label>
              <input 
                value={creating.taxdiid} 
                onChange={e => setCreating(v => ({ ...v, taxdiid: e.target.value }))} 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Geli taxdiidka"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sharaxaad</label>
              <input 
                value={creating.description} 
                onChange={e => setCreating(v => ({ ...v, description: e.target.value }))} 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Geli sharaxaada"
              />
            </div>
            <button 
              disabled={saving} 
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              <PlusCircle size={18} /> Abuur
            </button>
          </form>
        </div>

        {/* Halaqas List - Always visible on desktop, conditionally on mobile */}
        <div className={`bg-white rounded-lg p-4 shadow ${mobileView !== 'list' ? 'hidden md:block' : 'md:col-span-2'}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h3 className="font-medium">Dhamaan Xalqooyinka</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                placeholder="Raadi Xalqad..." 
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="divide-y max-h-[calc(100vh-220px)] overflow-auto">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-gray-500">
                {query ? 'Xalqad lama helin' : 'Ma jiro xalqooyin'}
              </div>
            ) : (
              filtered.map(h => (
                <div key={h._id} className={`flex items-center justify-between py-3 ${selected?._id === h._id ? 'bg-indigo-50' : ''}`}>
                  <button 
                    className="text-left flex-1 px-2"
                    onClick={() => selectHalaqa(h)}
                  >
                    <div className="font-medium">{h.name}</div>
                    <div className="text-sm text-gray-500">{h.students?.length || 0} arday</div>
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      className="text-amber-600 p-2 rounded-full hover:bg-amber-50"
                      onClick={() => selectHalaqa(h)}
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      className="text-red-600 p-2 rounded-full hover:bg-red-50"
                      onClick={() => deleteHalaqa(h._id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Show create button on mobile when in list view */}
          <button 
            onClick={() => setMobileView('create')}
            className="md:hidden mt-4 w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg"
          >
            <PlusCircle size={18} /> Abuur Xalqad Cusub
          </button>
        </div>

        {/* Selected Halaqa Details - Hidden on mobile when not active */}
        {selected && (
          <div className={`bg-white rounded-lg p-4 shadow ${mobileView !== 'details' ? 'hidden md:block' : 'md:col-span-2'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Xogta Xalqada</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const printContent = `
                      <html>
                        <head>
                          <title>Xogta Xalqada - ${selected?.name || ''}</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .info { margin-bottom: 20px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>Nidaamka Maamulka AL-MINHAAJ</h1>
                            <h2>Xogta Xalqada - ${selected?.name || ''}</h2>
                            <p>Ardayda iyo faahfaahinta - ${new Date().toLocaleDateString()}</p>
                          </div>
                          
                          <div class="info">
                            <h3>Xogta Guud ee Xalqada</h3>
                            <p><strong>Magaca:</strong> ${selected?.name || '-'}</p>
                            <p><strong>Suurada laga bilaabayo:</strong> ${editingMeta?.startingSurah || '-'}</p>
                            <p><strong>Taxdiid:</strong> ${editingMeta?.taxdiid || '-'}</p>
                            <p><strong>Faallo:</strong> ${editingMeta?.description || '-'}</p>
                          </div>
                          
                          <table>
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Magaca Ardayga</th>
                                <th>Lambarka Ardayga</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${(selected?.students || []).map((s, idx) => `
                                <tr>
                                  <td>${idx + 1}</td>
                                  <td>${s.fullname || '-'}</td>
                                  <td>${s.studentId || '-'}</td>
                                </tr>
                              `).join('')}
                            </tbody>
                          </table>
                          
                          <p style="margin-top: 30px; text-align: right; font-size: 12px; color: #666;">
                            La sameeyay: ${new Date().toLocaleDateString()} saacad ${new Date().toLocaleTimeString()}
                          </p>
                        </body>
                      </html>
                    `;
                    
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(printContent);
                    printWindow.document.close();
                    printWindow.print();
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  title="Print this report"
                >
                  <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Report
                </button>
                <button 
                  onClick={() => setMobileView('list')}
                  className="md:hidden text-gray-500 p-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Magaca</label>
                <input 
                  value={editingMeta.name} 
                  onChange={e => setEditingMeta(v => ({ ...v, name: e.target.value }))} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suurada laga bilaabayo</label>
                <input 
                  value={editingMeta.startingSurah} 
                  onChange={e => setEditingMeta(v => ({ ...v, startingSurah: e.target.value }))} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="Suurada laga bilaabayo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taxdiid</label>
                <input 
                  value={editingMeta.taxdiid} 
                  onChange={e => setEditingMeta(v => ({ ...v, taxdiid: e.target.value }))} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="Taxdiid"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Faalo</label>
                <input 
                  value={editingMeta.description} 
                  onChange={e => setEditingMeta(v => ({ ...v, description: e.target.value }))} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="Sharaxaad"
                />
              </div>
            </div>
            
            <div className="flex justify-end mb-6">
              <button 
                disabled={saving} 
                onClick={saveMeta} 
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                <Save size={18} /> Kaydi
              </button>
            </div>
            
            <h3 className="font-medium mb-3">Maaree Ardayda Xalqada</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Ardayda Xalqadan</h4>
                <div className="border rounded-lg divide-y max-h-64 overflow-auto">
                  {selected.students && selected.students.length > 0 ? (
                    selected.students.map(s => (
                      <div key={s._id} className="flex items-center justify-between p-3">
                        <div>
                          <div className="text-sm font-medium">{s.fullname}</div>
                          <div className="text-xs text-gray-500">{s.studentId || '-'}</div>
                        </div>
                        <button 
                          onClick={() => removeStudent(s._id)}
                          className="text-red-600 p-2 rounded-full hover:bg-red-50"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      Ardayda Xalqadan majiraan
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Dhamaan Ardayda</h4>
                <div className="border rounded-lg divide-y max-h-64 overflow-auto">
                  {studentsLoading ? (
                    <div className="p-3 text-sm text-gray-500 text-center">Soo degaya...</div>
                  ) : students.length > 0 ? (
                    students.map(s => (
                      <div key={s._id} className="flex items-center justify-between p-3">
                        <div>
                          <div className="text-sm font-medium">{s.fullname}</div>
                          <div className="text-xs text-gray-500">{s.studentId || '-'}</div>
                        </div>
                        <button 
                          disabled={memberIds.has(s._id)} 
                          onClick={() => addStudent(s._id)}
                          className="text-indigo-600 p-2 rounded-full hover:bg-indigo-50 disabled:text-gray-300 disabled:hover:bg-transparent"
                        >
                          <UserPlus size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      Ardayda majiraan
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcisManage;