import React, { useEffect, useMemo, useState } from 'react'
import useClassesStore from '../../store/classesStore'
import axios from '../../config/axios'
import { LessonRecordsAPI } from '../../api/lessonRecords'
import { Search, PlusCircle } from 'lucide-react'
import { toast } from 'react-toastify'

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

	return (
		<div className="p-4 space-y-6">
			<h2 className="text-xl font-semibold">Qur'aan - Diiwaanka Maalinlaha</h2>

			<div className="grid grid-cols-4 gap-3 bg-white p-4 rounded shadow">
				<select value={selectedClassId} onChange={e=>setSelectedClassId(e.target.value)} className="border rounded px-3 py-2">
					<option value="">Dooro Fasalka</option>
					{classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
				</select>
				<select value={month} onChange={e=>setMonth(e.target.value)} className="border rounded px-3 py-2">
					{Array.from({length:12}, (_,i)=>i+1).map(m => <option key={m} value={m}>{m}</option>)}
				</select>
				<input type="number" value={year} onChange={e=>setYear(e.target.value)} className="border rounded px-3 py-2"/>
				<button onClick={()=>selectedClassId && loadRecords(selectedClassId, month, year)} className="bg-indigo-600 text-white rounded px-3 py-2">Hel Taariikhda</button>
			</div>

			<div className="bg-white rounded p-4 shadow">
				<h3 className="font-medium mb-3">Ku dar Diiwaan Maalinle (Arday walba)</h3>
				<form onSubmit={saveRecord} className="space-y-3">
					<div className="grid grid-cols-6 font-semibold text-sm border-b pb-2">
						<div className="col-span-1">Arday</div>
						<div>Cashar (hint)</div>
						<div>Suuro</div>
						<div>Taxdiid</div>
						<div>Xaalad</div>
						<div>Faallo</div>
					</div>
					<div className="max-h-80 overflow-auto divide-y">
						{students.map((s, idx) => (
							<div key={s._id} className="grid grid-cols-6 items-center gap-2 py-2">
								<div className="col-span-1">
									<div className="font-medium text-sm">{s.fullname}</div>
									<div className="text-xs text-gray-500">{s.studentId||'-'}</div>
								</div>
								<input value={studentRows[idx]?.dailyLessonHint||''} onChange={e=>updateRow(idx,'dailyLessonHint',e.target.value)} className="border rounded px-2 py-1"/>
								<input value={studentRows[idx]?.currentSurah||''} onChange={e=>updateRow(idx,'currentSurah',e.target.value)} className="border rounded px-2 py-1"/>
								<input value={studentRows[idx]?.taxdiid||''} onChange={e=>updateRow(idx,'taxdiid',e.target.value)} className="border rounded px-2 py-1"/>
								<select value={studentRows[idx]?.studentStatus||'dhexda_maraya'} onChange={e=>updateRow(idx,'studentStatus',e.target.value)} className="border rounded px-2 py-1">
									<option value="gaadhay">Gaadhay</option>
									<option value="dhexda_maraya">Dhexda maraya</option>
									<option value="aad_uga_fog">Aad uga fog</option>
								</select>
								<input value={studentRows[idx]?.notes||''} onChange={e=>updateRow(idx,'notes',e.target.value)} className="border rounded px-2 py-1"/>
							</div>
						))}
					</div>
					<div className="flex justify-end">
						<button disabled={saving || !selectedClassId} type="submit" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded">
							<PlusCircle className="w-4 h-4"/> Kaydi Diiwaanka
						</button>
					</div>
				</form>
			</div>

			<div className="bg-white rounded p-4 shadow">
				<h3 className="font-medium mb-3">Diiwaannada Bisha</h3>
				{loadingRecords ? (
					<div className="text-sm text-gray-500">Diiwaanno ayaa soo degaya...</div>
				) : (
					<div className="space-y-2">
						{records.map(r => (
							<div key={r._id} className="border rounded p-3">
								<div className="text-sm text-gray-600">{new Date(r.date).toLocaleString()}</div>
								<div className="text-xs text-gray-500">Fasal: {r.class?.name}</div>
								<div className="text-xs">Guud: {r.quran?.dailyLessonHint} | {r.quran?.currentSurah} | {r.quran?.taxdiid} | {r.quran?.studentStatus}</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default QuranSection