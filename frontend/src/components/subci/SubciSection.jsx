import React, { useEffect, useMemo, useState } from 'react'
import { HalaqaAPI } from '../../api/halaqa'
import useStudentsStore from '../../store/studentsStore'
import { Search, PlusCircle, Trash2, UserPlus, X, Menu, ChevronLeft, Save, Edit3, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'react-toastify'
import { LessonRecordsAPI } from '../../api/lessonRecords'
import { Link } from 'react-router-dom'
import PrintButton from '../common/PrintButton'

function SubcisSection() {
  const { students, fetchStudents, loading: studentsLoading } = useStudentsStore()
  const [query, setQuery] = useState('')
  const [halaqas, setHalaqas] = useState([])
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newHalaqa, setNewHalaqa] = useState({ name: '', description: '', startingSurah: '', taxdiid: '' })
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [subciPerformances, setSubciPerformances] = useState([])
  const [records, setRecords] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingRows, setEditingRows] = useState([])
  const [mobileView, setMobileView] = useState('list') // 'list', 'detail', 'create'
  const [expandedRecords, setExpandedRecords] = useState({})
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchStudents()
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      const res = await HalaqaAPI.getAll()
      setHalaqas(res.data)
    } catch (e) {
      toast.error('Ku guuldareysatay inaad soo dejiso Xalqooyinka')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newHalaqa.name.trim()) return toast.error('Magaca Xalqada geli')
    setSaving(true)
    try {
      const res = await HalaqaAPI.create(newHalaqa)
      setHalaqas(prev => [res.data, ...prev])
      setNewHalaqa({ name: '', description: '', startingSurah: '', taxdiid: '' })
      setCreating(false)
      setMobileView('list')
      toast.success('Xalqad la abuuray')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Abuuristu wey fashilantay')
    } finally {
      setSaving(false)
    }
  }

  const filtered = useMemo(() => {
    if (!query) return halaqas
    return halaqas.filter(h => h.name.toLowerCase().includes(query.toLowerCase()))
  }, [query, halaqas])

  const openHalaqa = async (name) => {
    try {
      const res = await HalaqaAPI.searchByName(name)
      setSelected(res.data)
      setMobileView('detail')
    } catch (e) {
      toast.error('Xalqad lama helin')
    }
  }

  const addStudents = async (ids) => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await HalaqaAPI.addStudents(selected._id, ids)
      setSelected(res.data)
      setHalaqas(prev => prev.map(h => h._id === res.data._id ? res.data : h))
      toast.success('Arday la daray')
    } catch (e) {
      toast.error('Ku daristu wey fashilantay')
    } finally { setSaving(false) }
  }

  const removeStudent = async (studentId) => {
    if (!selected) return
    setRemoving(true)
    try {
      const res = await HalaqaAPI.removeStudent(selected._id, studentId)
      setSelected(res.data)
      setHalaqas(prev => prev.map(h => h._id === res.data._id ? res.data : h))
    } catch (e) {
      toast.error('Ka saaristu wey fashilantay')
    } finally { setRemoving(false) }
  }

  const deleteHalaqa = async (id) => {
    if (!confirm('Ma hubtaa inaad tirtirayso?')) return
    try {
      await HalaqaAPI.remove(id)
      setHalaqas(prev => prev.filter(h => h._id !== id))
      if (selected?._id === id) {
        setSelected(null)
        setMobileView('list')
      }
      toast.success('Xalqad la tirtiray')
    } catch (e) { toast.error('Tirtiristu wey fashilantay') }
  }

  useEffect(() => {
    if (selected?.students) {
      setSubciPerformances(selected.students.map(s => ({ student: s._id, versesTaken: 0, statusScore: 0, notes: '' })))
    }
  }, [selected])

  const autoJudge = (verses) => {
    const n = Number(verses)||0
    if (n <= 3) return 0
    if (n <= 6) return 1
    if (n <= 10) return 2
    return 3
  }

  const updateSubciPerf = (idx, key, value) => {
    setSubciPerformances(prev => prev.map((sp, i) => i===idx ? { 
      ...sp, 
      [key]: value, 
      statusScore: key==='versesTaken' ? autoJudge(value) : sp.statusScore 
    } : sp))
  }

  const saveSubciRecord = async () => {
    if (!selected?._id) return toast.error('Xulo Xalqad')
    try {
      await LessonRecordsAPI.createSubci({ 
        halaqaId: selected._id, 
        startingSurah: selected.startingSurah||'', 
        taxdiid: selected.taxdiid||'', 
        notes: '', 
        studentPerformances: subciPerformances 
      })
      toast.success('Diiwaan Subci waa la kaydiyay')
      setEditMode(false)
      // Reload records after saving
      loadRecords(selected._id)
    } catch (e) { toast.error('Kaydinta Subci waa fashilantay') }
  }

  const loadRecords = async (halaqaId) => {
    try {
      const res = await LessonRecordsAPI.getByHalaqa(halaqaId)
      setRecords(res.data)
    } catch { /* ignore */ }
  }

  useEffect(() => { 
    if (selected?._id) loadRecords(selected._id) 
  }, [selected?._id])

  const startEdit = (r) => {
    setEditingId(r._id)
    setEditingRows((r.studentPerformances||[]).map(sp => ({ 
      student: sp.student?._id || sp.student, 
      versesTaken: sp.versesTaken||0, 
      statusScore: sp.statusScore||0, 
      notes: sp.notes||'' 
    })))
  }
  
  const cancelEdit = () => { setEditingId(null); setEditingRows([]) }
  
  const updateRow = (idx, key, value) => { 
    setEditingRows(prev => prev.map((x,i) => i===idx ? { 
      ...x, 
      [key]: value,
      // Only auto-judge when editing versesTaken for new records
      statusScore: key==='versesTaken' && editingId === 'new' ? autoJudge(value) : x.statusScore
    } : x)) 
  }
  
  const saveEdit = async (id) => {
    try {
      const res = await LessonRecordsAPI.update(id, { studentPerformances: editingRows })
      setRecords(prev => prev.map(r => r._id===id ? res.data : r))
      setEditingId(null); 
      setEditingRows([])
      toast.success('Diiwaan Subcis waa la cusbooneysiiyay')
    } catch { toast.error('Cusbooneysiin fashilantay') }
  }
  
  const removeRecord = async (id) => {
    try {
      await LessonRecordsAPI.remove(id)
      setRecords(prev => prev.filter(r => r._id !== id))
      toast.success('Diiwaan waa la tirtiray')
    } catch { toast.error('Tirtiristu fashilantay') }
  }

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }))
  }

  // Function to get status text based on statusScore
  const getStatusText = (statusScore) => {
    const statusMap = ['Wanaagsan', 'Dhexdhexaad', 'Hoose', 'Aad u hooseeya']
    return statusMap[statusScore] || 'Wanaagsan'
  }

  const renderStudentPerformances = (record, isEditing = false, rows = []) => {
    if (isMobile && !expandedRecords[record._id] && !isEditing) {
      return (
        <button 
          onClick={() => toggleRecordExpansion(record._id)}
          className="w-full py-2 text-center text-indigo-600 flex items-center justify-center gap-2"
        >
          {expandedRecords[record._id] ? (
            <>
              <ChevronUp size={16} /> Muuji Kooban
            </>
          ) : (
            <>
              <ChevronDown size={16} /> Muuji Dhammaan Ardayda ({record.studentPerformances?.length || 0})
            </>
          )}
        </button>
      )
    }

    return (
      <div className="mt-2 border rounded overflow-x-auto">
        <div className={`${isMobile ? 'min-w-[500px]' : ''}`}>
          <div className="grid grid-cols-4 font-semibold text-xs bg-gray-50 border-b px-2 py-2">
            <div className="col-span-1">Arday</div>
            <div>Aayadaha</div>
            <div>Xaalad</div>
            <div>Faallo</div>
          </div>
          <div className="divide-y">
            {(record.studentPerformances || []).map((sp, idx) => (
              <div key={(sp.student && sp.student._id) || idx} className="grid grid-cols-4 items-center gap-2 px-2 py-3 text-sm">
                <div className="col-span-1">
                  <div className="font-medium">{sp.student?.fullname || '-'}</div>
                  <div className="text-xs text-gray-500">{sp.student?.studentId || '-'}</div>
                </div>
                {isEditing ? (
                  <>
                    <input 
                      type="number" 
                      value={rows[idx]?.versesTaken || 0} 
                      onChange={e => updateRow(idx, 'versesTaken', Number(e.target.value))} 
                      className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                    <div>
                      {getStatusText(rows[idx]?.statusScore || 0)}
                    </div>
                    <input 
                      value={rows[idx]?.notes || ''} 
                      onChange={e => updateRow(idx, 'notes', e.target.value)} 
                      className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </>
                ) : (
                  <>
                    <div>{sp.versesTaken || 0}</div>
                    <div>{getStatusText(sp.statusScore || 0)}</div>
                    <div className="truncate">{sp.notes || ''}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        {isEditing && (
          <div className="flex justify-end gap-2 mt-3 p-2">
            <button 
              onClick={() => saveEdit(record._id)} 
              className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm"
            >
              Kaydi
            </button>
            <button 
              onClick={cancelEdit} 
              className="px-3 py-2 rounded-lg border text-sm"
            >
              Jooji
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-3 md:p-4 max-w-6xl mx-auto">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center gap-3 mb-4">
        {mobileView !== 'list' && (
          <button 
            onClick={() => setMobileView('list')}
            className="p-2 rounded-full bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <h2 className="text-xl font-semibold flex-1">
          {mobileView === 'list' && 'Maareynta Xalqooyinka'}
          {mobileView === 'detail' && selected?.name}
          {mobileView === 'create' && 'Abuur Xalqad'}
        </h2>
      </div>

      {/* Halaqa List View (shown on mobile when in list mode, always on desktop) */}
      <div className={`bg-white rounded-lg p-4 shadow ${mobileView !== 'list' ? 'hidden md:block' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <button 
            onClick={() => setMobileView('create')}
            className="md:hidden inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg"
          >
            <PlusCircle size={18} /> Abuur Xalqad
          </button>
          
          <Link 
            to={"/subci/manage"} 
            className="hidden md:inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg"
          >
            <PlusCircle size={16} /> Abuur Xalqad
          </Link>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="Raadi Xalqad..." 
              className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        <div className="border rounded-lg divide-y max-h-[calc(100vh-220px)] overflow-auto">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              {query ? 'Xalqad lama helin' : 'Ma jiro xalqooyin'}
            </div>
          ) : (
            filtered.map(h => (
              <div key={h._id} className={`flex items-center justify-between p-3 ${selected?._id === h._id ? 'bg-indigo-50' : ''}`}>
                <button 
                  className="text-left flex-1"
                  onClick={() => openHalaqa(h.name)}
                >
                  <div className="font-medium">{h.name}</div>
                  <div className="text-sm text-gray-500">{h.students?.length || 0} arday</div>
                </button>
                <button 
                  className="text-red-600 p-2 rounded-full hover:bg-red-50"
                  onClick={() => deleteHalaqa(h._id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Halaqa Detail View (shown on mobile when in detail mode, always on desktop) */}
      {selected && (
        <div className={`bg-white rounded-lg p-4 shadow ${mobileView !== 'detail' ? 'hidden md:block' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-lg">{selected.name}</h3>
            <button 
              onClick={() => setEditMode(v => !v)} 
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
            >
              {editMode ? 'Dami Edit' : 'Fur Edit'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Suurada laga bilaabayo:</p>
              <p className="font-medium">{selected.startingSurah || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Taxdiid:</p>
              <p className="font-medium">{selected.taxdiid || '-'}</p>
            </div>
            <div className="md:col-span-2 space-y-1">
              <p className="text-sm text-gray-600">Faalo:</p>
              <p className="font-medium">{selected.description || '-'}</p>
            </div>
          </div>
          
          {editMode && (
            <div className="mb-6">
              <h4 className="font-medium mb-3">Diiwaanka Subciska</h4>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-5 font-semibold text-sm border-b pb-2 min-w-[500px]">
                  <div className="col-span-2">Arday</div>
                  <div>Aayadaha</div>
                  <div>Xaalad</div>
                  <div>Faallo</div>
                </div>
                <div className="divide-y min-w-[500px]">
                  {(selected.students || []).map((s, idx) => (
                    <div key={s._id} className="grid grid-cols-5 items-center gap-2 py-3">
                      <div className="col-span-2">
                        <div className="font-medium text-sm">{s.fullname}</div>
                        <div className="text-xs text-gray-500">{s.studentId || '-'}</div>
                      </div>
                      <input 
                        type="number" 
                        value={subciPerformances[idx]?.versesTaken || 0} 
                        onChange={e => updateSubciPerf(idx, 'versesTaken', Number(e.target.value))} 
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <div className="text-sm">
                        {getStatusText(subciPerformances[idx]?.statusScore || 0)}
                      </div>
                      <input 
                        value={subciPerformances[idx]?.notes || ''} 
                        onChange={e => updateSubciPerf(idx, 'notes', e.target.value)} 
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={saveSubciRecord} 
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  <Save size={16} /> Kaydi Subcis
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <h4 className="font-medium mb-3">Diiwaannada Subcis</h4>
            <div className="space-y-4">
              {records.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Ma jiro diiwaanno subcis
                </div>
              ) : (
                records.map(r => (
                  <div key={r._id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-sm text-gray-600 mb-3">
                      <span>{new Date(r.date).toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        <PrintButton 
                          title={`Diiwaan Subcis - ${selected?.name || ''}`}
                          subtitle={`Taariikh: ${new Date(r.date).toLocaleDateString()}`}
                        >
                          <div className="info-section">
                            <div className="info-label">Xogta Guud ee Xalqada</div>
                            <div className="info-grid">
                              <div className="info-item"><span className="info-key">Xalqada</span><span className="info-value">{selected?.name || '-'}</span></div>
                              <div className="info-item"><span className="info-key">Suurada laga bilaabayo</span><span className="info-value">{selected?.startingSurah || '-'}</span></div>
                              <div className="info-item"><span className="info-key">Taxdiid</span><span className="info-value">{selected?.taxdiid || '-'}</span></div>
                            </div>
                          </div>
                          <table>
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Arday</th>
                                <th>Aayadaha</th>
                                <th>Xaalad</th>
                                <th>Faallo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(r.studentPerformances || []).map((sp, idx) => (
                                <tr key={idx}>
                                  <td>{idx + 1}</td>
                                  <td>{sp.student?.fullname || sp.student?.name || '-'}</td>
                                  <td>{sp.versesTaken ?? '-'}</td>
                                  <td>{getStatusText(sp.statusScore || 0)}</td>
                                  <td>{sp.notes || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </PrintButton>
                        <button 
                          onClick={() => startEdit(r)} 
                          className="text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-50"
                        >
                          {editingId === r._id ? 'Dami' : 'Tafatir'}
                        </button>
                        <button 
                          onClick={() => removeRecord(r._id)} 
                          className="text-red-600 px-2 py-1 rounded-md hover:bg-red-50"
                        >
                          Tirtir
                        </button>
                      </div>
                    </div>
                    
                    {renderStudentPerformances(r, editingId === r._id, editingRows)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Halaqa Form (shown on mobile when in create mode) */}
      <div className={`bg-white rounded-lg p-4 shadow ${mobileView !== 'create' ? 'hidden' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Abuur Xalqad</h3>
          <button 
            onClick={() => setMobileView('list')}
            className="p-1 rounded-full bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Magaca Xalqada</label>
            <input 
              value={newHalaqa.name} 
              onChange={e => setNewHalaqa(v => ({ ...v, name: e.target.value }))} 
              placeholder="Geli magaca xalqada" 
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sharaxaad</label>
            <input 
              value={newHalaqa.description} 
              onChange={e => setNewHalaqa(v => ({ ...v, description: e.target.value }))} 
              placeholder="Sharaxaad (ikhtiyaari)" 
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suurada laga bilaabayo</label>
            <input 
              value={newHalaqa.startingSurah} 
              onChange={e => setNewHalaqa(v => ({ ...v, startingSurah: e.target.value }))} 
              placeholder="Geli suurada" 
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taxdiid</label>
            <input 
              value={newHalaqa.taxdiid} 
              onChange={e => setNewHalaqa(v => ({ ...v, taxdiid: e.target.value }))} 
              placeholder="Geli taxdiidka" 
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setMobileView('list')} 
              className="px-4 py-2 rounded-lg border"
            >
              Jooji
            </button>
            <button 
              disabled={saving} 
              type="submit" 
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50"
            >
              {saving ? 'Kaydinaya...' : 'Kaydi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubcisSection