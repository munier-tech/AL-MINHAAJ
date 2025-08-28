import { useEffect, useState } from 'react'
import useClassesStore from '../../store/classesStore'
import axios from '../../config/axios'
import { LessonRecordsAPI } from '../../api/lessonRecords'
import { PlusCircle, ChevronDown, ChevronUp, Menu, X } from 'lucide-react'
import { toast } from 'react-toastify'
import PrintButton from '../common/PrintButton'

function QuranSection() {
  const { classes, fetchClasses } = useClassesStore()
  const [selectedClassId, setSelectedClassId] = useState('')
  const [month, setMonth] = useState(String(new Date().getMonth() + 1)) // 1-12
  const [year, setYear] = useState(String(new Date().getFullYear()))

  const [dailyLessonHint, setDailyLessonHint] = useState('')
  const [currentSurah, setCurrentSurah] = useState('')
  const [taxdiid, setTaxdiid] = useState('')
  const [studentStatus, setStudentStatus] = useState('dhexda_maraya')
  const [notes, setNotes] = useState('')

  const [records, setRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [saving, setSaving] = useState(false)

  const [students, setStudents] = useState([])
  const [studentRows, setStudentRows] = useState([])

  const [editingRecordId, setEditingRecordId] = useState(null)
  const [editingRows, setEditingRows] = useState([])
  
  // Mobile state management
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768)
  const [expandedRecords, setExpandedRecords] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('newEntry') // 'newEntry' or 'records'

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  useEffect(() => {
    if (selectedClassId) {
      loadClassStudents(selectedClassId)
      loadRecords(selectedClassId, month, year)
    }
  }, [selectedClassId, month, year])

  const loadRecords = async (classId, m, y) => {
    setLoadingRecords(true)
    try {
      const res = await LessonRecordsAPI.getQuranByClassMonth(classId, m, y)
      setRecords(res.data)
    } catch (e) { toast.error('Ku guuldareysatay helista diiwaannada bisha') } finally { setLoadingRecords(false) }
  }

  const loadClassStudents = async (classId) => {
    try {
      const res = await axios.get(`/classes/getStudents/${classId}`)
      const data = res.data
      setStudents(data.students || [])
      setStudentRows((data.students||[]).map(s => ({ student: s._id, dailyLessonHint: '', currentSurah: '', taxdiid: '', studentStatus: 'dhexda_maraya', notes: '' })))
    } catch (e) {
      toast.error('Ku guuldareysatay helista ardayda fasalka')
    }
  }

  const updateRow = (idx, key, value) => {
    setStudentRows(prev => prev.map((r, i) => i===idx ? { ...r, [key]: value } : r))
  }

  const saveRecord = async (e) => {
    e.preventDefault()
    if (!selectedClassId) return toast.error('Dooro Fasalka')
    setSaving(true)
    try {
      const payload = { classId: selectedClassId, dailyLessonHint: '', currentSurah: '', taxdiid: '', studentStatus: 'dhexda_maraya', notes: '', studentPerformances: studentRows }
      const res = await LessonRecordsAPI.createQuran(payload)
      setRecords(prev => [res.data, ...prev])
      setStudentRows(students.map(s => ({ student: s._id, dailyLessonHint: '', currentSurah: '', taxdiid: '', studentStatus: 'dhexda_maraya', notes: '' })))
      toast.success('Diiwaan la kaydiyay')
      // Switch to records view after saving on mobile
      if (isMobileView) setActiveTab('records')
    } catch (e) { toast.error('Kaydintu wey fashilantay') } finally { setSaving(false) }
  }

  const startEdit = (record) => {
    setEditingRecordId(record._id)
    setEditingRows((record.studentPerformances||[]).map(sp => ({
      student: sp.student?._id || sp.student,
      dailyLessonHint: sp.dailyLessonHint || '',
      currentSurah: sp.currentSurah || '',
      taxdiid: sp.taxdiid || '',
      studentStatus: sp.studentStatus || 'dhexda_maraya',
      notes: sp.notes || ''
    })))
  }
  
  const cancelEdit = () => { setEditingRecordId(null); setEditingRows([]) }
  
  const updateEditingRow = (idx, key, value) => {
    setEditingRows(prev => prev.map((r, i) => i===idx ? { ...r, [key]: value } : r))
  }
  
  const saveEdit = async (id) => {
    try {
      const res = await LessonRecordsAPI.update(id, { studentPerformances: editingRows })
      setRecords(prev => prev.map(r => r._id === id ? res.data : r))
      setEditingRecordId(null)
      setEditingRows([])
      toast.success('Diiwaan waa la cusbooneysiiyay')
    } catch (e) { toast.error('Cusbooneysiintu waa fashilantay') }
  }
  
  const removeRecord = async (id) => {
    if (!window.confirm('Ma hubtaa inaad tirtirto diiwaankan?')) return
    
    try {
      await LessonRecordsAPI.remove(id)
      setRecords(prev => prev.filter(r => r._id !== id))
      toast.success('Diiwaan waa la tirtiray')
    } catch (e) { toast.error('Tirtiristu waa fashilantay') }
  }

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }))
  }

  // Mobile tab navigation
  const MobileTabs = () => (
    <div className="md:hidden flex border-b mb-4">
      <button
        className={`flex-1 py-3 text-center font-medium ${activeTab === 'newEntry' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        onClick={() => setActiveTab('newEntry')}
      >
        Diiwaan Cusub
      </button>
      <button
        className={`flex-1 py-3 text-center font-medium ${activeTab === 'records' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        onClick={() => setActiveTab('records')}
      >
        Diiwaannada
      </button>
    </div>
  )

  // Render student performance rows for a record
  const renderStudentPerformances = (record, isEditing = false, rows = []) => {
    if (isMobileView && !expandedRecords[record._id] && !isEditing) {
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
        <div className={`${isMobileView ? 'min-w-[600px]' : ''}`}>
          <div className="grid grid-cols-6 font-semibold text-[11px] bg-gray-50 border-b px-2 py-1">
            <div className="col-span-1">Arday</div>
            <div>Cashar (bog)</div>
            <div>Suuro</div>
            <div>Taxdiid</div>
            <div>Xaalad</div>
            <div>Faallo</div>
          </div>
          <div className="max-h-80 overflow-auto divide-y">
            {(record.studentPerformances||[]).map((sp, idx) => (
              <div key={(sp.student && sp.student._id) || Math.random()} className="grid grid-cols-6 items-center gap-2 px-2 py-1 text-xs">
                <div className="col-span-1">
                  <div className="font-medium">{sp.student?.fullname || '-'}</div>
                  <div className="text-[10px] text-gray-500">{sp.student?.studentId || '-'}</div>
                </div>
                {isEditing ? (
                  <>
                    <input value={rows[idx]?.dailyLessonHint||''} onChange={e=>updateEditingRow(idx,'dailyLessonHint',e.target.value)} className="border rounded px-2 py-1 text-xs"/>
                    <input value={rows[idx]?.currentSurah||''} onChange={e=>updateEditingRow(idx,'currentSurah',e.target.value)} className="border rounded px-2 py-1 text-xs"/>
                    <input value={rows[idx]?.taxdiid||''} onChange={e=>updateEditingRow(idx,'taxdiid',e.target.value)} className="border rounded px-2 py-1 text-xs"/>
                    <select value={rows[idx]?.studentStatus||'dhexda_maraya'} onChange={e=>updateEditingRow(idx,'studentStatus',e.target.value)} className="border rounded px-2 py-1 text-xs">
                      <option value="gaadhay">Gaadhay</option>
                      <option value="dhexda_maraya">Dhexda maraya</option>
                      <option value="aad_uga_fog">Aad uga fog</option>
                    </select>
                    <input value={rows[idx]?.notes||''} onChange={e=>updateEditingRow(idx,'notes',e.target.value)} className="border rounded px-2 py-1 text-xs"/>
                  </>
                ) : (
                  <>
                    <div className="truncate">{sp.dailyLessonHint || '-'}</div>
                    <div className="truncate">{sp.currentSurah || '-'}</div>
                    <div className="truncate">{sp.taxdiid || '-'}</div>
                    <div className="truncate">{sp.studentStatus || '-'}</div>
                    <div className="truncate">{sp.notes || '-'}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        {isEditing && (
          <div className="flex justify-end gap-2 mt-2 p-2">
            <button onClick={() => saveEdit(record._id)} className="px-3 py-2 text-xs rounded bg-green-600 text-white">Kaydi</button>
            <button onClick={cancelEdit} className="px-3 py-2 text-xs rounded border">Jooji</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-3 md:p-4 space-y-6">
      <h2 className="text-xl font-semibold">Qur'aan - Diiwaanka Maalinlaha</h2>

      {/* Mobile Tabs */}
      {isMobileView && <MobileTabs />}

      {/* Filters Section - Always visible */}
      <div className="bg-white p-4 rounded shadow">
        <div className="md:hidden flex justify-between items-center mb-2">
          <h3 className="font-medium">Filitaanka</h3>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded border"
          >
            {showFilters ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        
        <div className={`${showFilters || !isMobileView ? 'block' : 'hidden'} md:block`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fasalka</label>
              <select value={selectedClassId} onChange={e=>setSelectedClassId(e.target.value)} className="border rounded px-3 py-2 text-sm md:text-base w-full">
                <option value="">Dooro Fasalka</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bisha</label>
              <select value={month} onChange={e=>setMonth(e.target.value)} className="border rounded px-3 py-2 text-sm md:text-base w-full">
                {Array.from({length:12}, (_,i)=>i+1).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sanadka</label>
              <input 
                type="number" 
                value={year} 
                onChange={e=>setYear(e.target.value)} 
                className="border rounded px-3 py-2 text-sm md:text-base w-full"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={()=>selectedClassId && loadRecords(selectedClassId, month, year)} 
                className="bg-indigo-600 text-white rounded px-3 py-2 text-sm md:text-base w-full h-[42px]"
              >
                Hel Taariikhda
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Record Form - Hidden on mobile when records tab is active */}
      <div className={`bg-white rounded p-4 shadow ${isMobileView && activeTab !== 'newEntry' ? 'hidden' : ''}`}>
        <h3 className="font-medium mb-3">Ku dar Diiwaan Maalinle (Arday walba)</h3>
        {students.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            {selectedClassId ? "Fasalkaan ma laha ardayda" : "Fasalka dooro si aad ugu darto diiwaan"}
          </p>
        ) : (
          <form onSubmit={saveRecord} className="space-y-3">
            <div className="hidden md:grid md:grid-cols-6 font-semibold text-sm border-b pb-2">
              <div className="col-span-1">Arday</div>
              <div>Cashar (bog)</div>
              <div>Suuro</div>
              <div>Taxdiid</div>
              <div>Xaalad</div>
              <div>Faallo</div>
            </div>
            <div className="max-h-80 overflow-auto divide-y">
              {students.map((s, idx) => (
                <div key={s._id} className="grid grid-cols-1 md:grid-cols-6 items-start gap-3 py-3 border-b md:border-none">
                  <div className="col-span-1">
                    <div className="font-medium text-sm">{s.fullname}</div>
                    <div className="text-xs text-gray-500">{s.studentId||'-'}</div>
                  </div>
                  
                  <div className="md:col-span-5 grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="col-span-1">
                      <label className="text-xs text-gray-500 block mb-1">Cashar (bog)</label>
                      <input 
                        value={studentRows[idx]?.dailyLessonHint||''} 
                        onChange={e=>updateRow(idx,'dailyLessonHint',e.target.value)} 
                        className="border rounded px-3 py-2 w-full text-sm"
                        placeholder="Cashar"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <label className="text-xs text-gray-500 block mb-1">Suuro</label>
                      <input 
                        value={studentRows[idx]?.currentSurah||''} 
                        onChange={e=>updateRow(idx,'currentSurah',e.target.value)} 
                        className="border rounded px-3 py-2 w-full text-sm"
                        placeholder="Suuro"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <label className="text-xs text-gray-500 block mb-1">Taxdiid</label>
                      <input 
                        value={studentRows[idx]?.taxdiid||''} 
                        onChange={e=>updateRow(idx,'taxdiid',e.target.value)} 
                        className="border rounded px-3 py-2 w-full text-sm"
                        placeholder="Taxdiid"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <label className="text-xs text-gray-500 block mb-1">Xaalad</label>
                      <select 
                        value={studentRows[idx]?.studentStatus||'dhexda_maraya'} 
                        onChange={e=>updateRow(idx,'studentStatus',e.target.value)} 
                        className="border rounded px-3 py-2 w-full text-sm"
                      >
                        <option value="gaadhay">Gaadhay</option>
                        <option value="dhexda_maraya">Dhexda maraya</option>
                        <option value="aad_uga_fog">Aad uga fog</option>
                      </select>
                    </div>
                    
                    <div className="col-span-1">
                      <label className="text-xs text-gray-500 block mb-1">Faallo</label>
                      <input 
                        value={studentRows[idx]?.notes||''} 
                        onChange={e=>updateRow(idx,'notes',e.target.value)} 
                        className="border rounded px-3 py-2 w-full text-sm"
                        placeholder="Faallo"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <button 
                disabled={saving || !selectedClassId} 
                type="submit" 
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4"/> Kaydi Diiwaanka
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Records Section - Hidden on mobile when new entry tab is active */}
      <div className={`bg-white rounded p-4 shadow ${isMobileView && activeTab !== 'records' ? 'hidden' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Diiwaannada Bisha</h3>
          {records.length > 0 && (
            <button 
              onClick={() => {
                const printContent = `
                  <html>
                    <head>
                      <title>Qur'aan - Diiwaannada Bisha (${classes.find(c=>c._id===selectedClassId)?.name || ''})</title>
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
                        <h2>Qur'aan - Diiwaannada Bisha (${classes.find(c=>c._id===selectedClassId)?.name || ''})</h2>
                        <p>Bil: ${month}/${year}</p>
                      </div>
                      
                      <table>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Taariikh</th>
                            <th>Arday</th>
                            <th>Cashar (bog)</th>
                            <th>Suuro</th>
                            <th>Taxdiid</th>
                            <th>Xaalad</th>
                            <th>Faallo</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${records.map((r, rIdx) => (r.studentPerformances||[]).map((sp, idx) => `
                            <tr>
                              <td>${rIdx + 1}.${idx + 1}</td>
                              <td>${new Date(r.date).toLocaleDateString()}</td>
                              <td>${sp.student?.fullname || '-'}</td>
                              <td>${sp.dailyLessonHint || ''}</td>
                              <td>${sp.currentSurah || ''}</td>
                              <td>${sp.taxdiid || ''}</td>
                              <td>${sp.studentStatus || ''}</td>
                              <td>${sp.notes || ''}</td>
                            </tr>
                          `).join('')).join('')}
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
              title="Print monthly records"
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Monthly Records
            </button>
          )}
        </div>
        {loadingRecords ? (
          <div className="text-sm text-gray-500 py-4 text-center">Diiwaanno ayaa soo degaya...</div>
        ) : records.length === 0 ? (
          <div className="text-sm text-gray-500 py-4 text-center">Lama helin diiwaanno</div>
        ) : (
          <div className="space-y-4">
            {records.map(r => (
              <div key={r._id} className="border rounded p-3 bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-600 gap-2">
                  <div>
                    <span className="font-medium">{new Date(r.date).toLocaleString()}</span>
                    <span className="text-xs text-gray-500 block">Fasal: {r.class?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PrintButton 
                      title={`Qur'aan - Diiwaan Maalinle (${r.class?.name || ''})`}
                      subtitle={`Taariikh: ${new Date(r.date).toLocaleDateString()} | Bil: ${month}/${year}`}
                    >
                      {`
                        <table>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Arday</th>
                              <th>Cashar (bog)</th>
                              <th>Suuro</th>
                              <th>Taxdiid</th>
                              <th>Xaalad</th>
                              <th>Faallo</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${(r.studentPerformances||[]).map((sp, idx) => `
                              <tr>
                                <td>${idx + 1}</td>
                                <td>${sp.student?.fullname || '-'}</td>
                                <td>${sp.dailyLessonHint || ''}</td>
                                <td>${sp.currentSurah || ''}</td>
                                <td>${sp.taxdiid || ''}</td>
                                <td>${sp.studentStatus || ''}</td>
                                <td>${sp.notes || ''}</td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                      `}
                    </PrintButton>
                    <button onClick={()=>startEdit(r)} className="text-indigo-600 text-xs px-2 py-1 bg-indigo-100 rounded">Tafatir</button>
                    <button onClick={()=>removeRecord(r._id)} className="text-red-600 text-xs px-2 py-1 bg-red-100 rounded">Tirtir</button>
                  </div>
                </div>
                
                {(r.quran?.dailyLessonHint || r.quran?.currentSurah || r.quran?.taxdiid || r.quran?.studentStatus) && (
                  <div className="mt-2 p-2 bg-white rounded border text-xs text-gray-700">
                    <div className="font-medium">Warbixinta Guud:</div>
                    <div>Cashar: {r.quran?.dailyLessonHint || '-'} | Suuro: {r.quran?.currentSurah || '-'} | Taxdiid: {r.quran?.taxdiid || '-'} | Xaalad: {r.quran?.studentStatus || '-'}</div>
                  </div>
                )}
                
                <div className="mt-3">
                  {renderStudentPerformances(r, editingRecordId === r._id, editingRows)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuranSection