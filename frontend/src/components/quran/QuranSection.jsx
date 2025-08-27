import React, { useEffect, useMemo, useState } from 'react'
import useClassesStore from '../../store/classesStore'
import axios from '../../config/axios'
import { LessonRecordsAPI } from '../../api/lessonRecords'
import { Search, PlusCircle, ChevronDown, ChevronUp, Menu, X } from 'lucide-react'
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

      {/* Filters Section */}
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
            <select value={selectedClassId} onChange={e=>setSelectedClassId(e.target.value)} className="border rounded px-3 py-2 text-sm md:text-base">
              <option value="">Dooro Fasalka</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select value={month} onChange={e=>setMonth(e.target.value)} className="border rounded px-3 py-2 text-sm md:text-base">
              {Array.from({length:12}, (_,i)=>i+1).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input 
              type="number" 
              value={year} 
              onChange={e=>setYear(e.target.value)} 
              className="border rounded px-3 py-2 text-sm md:text-base"
            />
            <button 
              onClick={()=>selectedClassId && loadRecords(selectedClassId, month, year)} 
              className="bg-indigo-600 text-white rounded px-3 py-2 text-sm md:text-base"
            >
              Hel Taariikhda
            </button>
          </div>
        </div>
      </div>

      {/* Add New Record Form */}
      <div className="bg-white rounded p-4 shadow">
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
                  
                  <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs text-gray-500 block mb-1 md:hidden">Cashar (bog)</label>
                      <input 
                        value={studentRows[idx]?.dailyLessonHint||''} 
                        onChange={e=>updateRow(idx,'dailyLessonHint',e.target.value)} 
                        className="border rounded px-2 py-2 w-full text-sm"
                        placeholder="Cashar"
                      />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs text-gray-500 block mb-1 md:hidden">Suuro</label>
                      <input 
                        value={studentRows[idx]?.currentSurah||''} 
                        onChange={e=>updateRow(idx,'currentSurah',e.target.value)} 
                        className="border rounded px-2 py-2 w-full text-sm"
                        placeholder="Suuro"
                      />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs text-gray-500 block mb-1 md:hidden">Taxdiid</label>
                      <input 
                        value={studentRows[idx]?.taxdiid||''} 
                        onChange={e=>updateRow(idx,'taxdiid',e.target.value)} 
                        className="border rounded px-2 py-2 w-full text-sm"
                        placeholder="Taxdiid"
                      />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs text-gray-500 block mb-1 md:hidden">Xaalad</label>
                      <select 
                        value={studentRows[idx]?.studentStatus||'dhexda_maraya'} 
                        onChange={e=>updateRow(idx,'studentStatus',e.target.value)} 
                        className="border rounded px-2 py-2 w-full text-sm"
                      >
                        <option value="gaadhay">Gaadhay</option>
                        <option value="dhexda_maraya">Dhexda maraya</option>
                        <option value="aad_uga_fog">Aad uga fog</option>
                      </select>
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs text-gray-500 block mb-1 md:hidden">Faallo</label>
                      <input 
                        value={studentRows[idx]?.notes||''} 
                        onChange={e=>updateRow(idx,'notes',e.target.value)} 
                        className="border rounded px-2 py-2 w-full text-sm"
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

			<div className="bg-white rounded p-4 shadow">
				<h3 className="font-medium mb-3">Diiwaannada Bisha</h3>
				{loadingRecords ? (
					<div className="text-sm text-gray-500">Diiwaanno ayaa soo degaya...</div>
				) : (
					<div className="space-y-2">
						{records.map(r => (
							<div key={r._id} className="border rounded p-3">
								<div className="flex items-center justify-between text-sm text-gray-600">
									<span>{new Date(r.date).toLocaleString()}</span>
									<div className="flex items-center gap-2">
										<button onClick={()=>startEdit(r)} className="text-indigo-600 text-xs">Tafatir</button>
										<button onClick={()=>removeRecord(r._id)} className="text-red-600 text-xs">Tirtir</button>
									</div>
								</div>
								<span className="text-xs text-gray-500">Fasal: {r.class?.name}</span>
								{(r.quran?.dailyLessonHint || r.quran?.currentSurah || r.quran?.taxdiid || r.quran?.studentStatus) && (
									<div className="mt-1 text-xs text-gray-700">Guud: {r.quran?.dailyLessonHint} | {r.quran?.currentSurah} | {r.quran?.taxdiid} | {r.quran?.studentStatus}</div>
								)}
								<div className="mt-2 border rounded">
									<div className="grid grid-cols-6 font-semibold text-[11px] bg-gray-50 border-b px-2 py-1">
										<div className="col-span-1">Arday</div>
										<div>Cashar (bog)</div>
										<div>Suuro</div>
										<div>Taxdiid</div>
										<div>Xaalad</div>
										<div>Faallo</div>
									</div>
									<div className="max-h-80 overflow-auto divide-y">
										{(r.studentPerformances||[]).map((sp, idx) => (
											<div key={(sp.student && sp.student._id) || Math.random()} className="grid grid-cols-6 items-center gap-2 px-2 py-1 text-xs">
												<div className="col-span-1">
													<div className="font-medium">{sp.student?.fullname || '-'}</div>
													<div className="text-[10px] text-gray-500">{sp.student?.studentId || '-'}</div>
												</div>
												{editingRecordId===r._id ? (
													<>
														<input value={editingRows[idx]?.dailyLessonHint||''} onChange={e=>updateEditingRow(idx,'dailyLessonHint',e.target.value)} className="border rounded px-2 py-1"/>
														<input value={editingRows[idx]?.currentSurah||''} onChange={e=>updateEditingRow(idx,'currentSurah',e.target.value)} className="border rounded px-2 py-1"/>
														<input value={editingRows[idx]?.taxdiid||''} onChange={e=>updateEditingRow(idx,'taxdiid',e.target.value)} className="border rounded px-2 py-1"/>
														<select value={editingRows[idx]?.studentStatus||'dhexda_maraya'} onChange={e=>updateEditingRow(idx,'studentStatus',e.target.value)} className="border rounded px-2 py-1">
															<option value="gaadhay">Gaadhay</option>
															<option value="dhexda_maraya">Dhexda maraya</option>
															<option value="aad_uga_fog">Aad uga fog</option>
														</select>
														<input value={editingRows[idx]?.notes||''} onChange={e=>updateEditingRow(idx,'notes',e.target.value)} className="border rounded px-2 py-1"/>
													</>
												) : (
													<>
														<div>{sp.dailyLessonHint || ''}</div>
														<div>{sp.currentSurah || ''}</div>
														<div>{sp.taxdiid || ''}</div>
														<div>{sp.studentStatus || ''}</div>
														<div>{sp.notes || ''}</div>
													</>
												)}
											</div>
										))}
									</div>
									{editingRecordId===r._id && (
										<div className="flex justify-end gap-2 mt-2">
											<button onClick={()=>saveEdit(r._id)} className="px-2 py-1 text-xs rounded bg-green-600 text-white">Kaydi</button>
											<button onClick={cancelEdit} className="px-2 py-1 text-xs rounded border">Jooji</button>
										</div>
									)}
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