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

	const [dailyLessonNumber, setDailyLessonNumber] = useState(0)
	const [currentSurah, setCurrentSurah] = useState('')
	const [taxdiid, setTaxdiid] = useState('')
	const [studentStatus, setStudentStatus] = useState('dhexda_maraya')
	const [notes, setNotes] = useState('')

	const [students, setStudents] = useState([])
	const [studentPerformances, setStudentPerformances] = useState([])
	const [records, setRecords] = useState([])
	const [loadingRecords, setLoadingRecords] = useState(false)
	const [saving, setSaving] = useState(false)

	useEffect(() => { fetchClasses() }, [fetchClasses])

	useEffect(() => {
		if (selectedClassId) {
			loadClassStudents(selectedClassId)
			loadRecords(selectedClassId, month, year)
		}
	}, [selectedClassId, month, year])

	const loadClassStudents = async (classId) => {
		try {
			const res = await axios.get(`/classes/getStudents/${classId}`)
			const data = res.data
			setStudents(data.students || [])
			setStudentPerformances((data.students||[]).map(s => ({ student: s._id, versesTaken: '', statusScore: 0, notes: '' })))
		} catch (e) {
			toast.error('Ku guuldareysatay helista ardayda fasalka')
		}
	}

	const loadRecords = async (classId, m, y) => {
		setLoadingRecords(true)
		try {
			const res = await LessonRecordsAPI.getQuranByClassMonth(classId, m, y)
			setRecords(res.data)
		} catch (e) { toast.error('Ku guuldareysatay helista diiwaannada bisha') } finally { setLoadingRecords(false) }
	}

	const updateStudentPerf = (idx, key, value) => {
		setStudentPerformances(prev => prev.map((sp, i) => i===idx ? { ...sp, [key]: value } : sp))
	}

	const saveRecord = async (e) => {
		e.preventDefault()
		if (!selectedClassId) return toast.error('Dooro Fasalka')
		setSaving(true)
		try {
			const payload = { classId: selectedClassId, dailyLessonNumber, currentSurah, taxdiid, studentStatus, notes, studentPerformances }
			const res = await LessonRecordsAPI.createQuran(payload)
			setRecords(prev => [res.data, ...prev])
			setDailyLessonNumber(0); setCurrentSurah(''); setTaxdiid(''); setStudentStatus('dhexda_maraya'); setNotes('')
			setStudentPerformances(students.map(s => ({ student: s._id, versesTaken: '', statusScore: 0, notes: '' })))
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
				<h3 className="font-medium mb-3">Ku dar Diiwaan Cusub</h3>
				<form onSubmit={saveRecord} className="grid grid-cols-6 gap-2">
					<input type="number" value={dailyLessonNumber} onChange={e=>setDailyLessonNumber(Number(e.target.value))} placeholder="Casharka Maalinle (number)" className="border rounded px-3 py-2"/>
					<input value={currentSurah} onChange={e=>setCurrentSurah(e.target.value)} placeholder="Suuradda uu marayo" className="border rounded px-3 py-2 col-span-2"/>
					<input value={taxdiid} onChange={e=>setTaxdiid(e.target.value)} placeholder="Taxdiid" className="border rounded px-3 py-2"/>
					<select value={studentStatus} onChange={e=>setStudentStatus(e.target.value)} className="border rounded px-3 py-2">
						<option value="gaadhay">Gaadhay</option>
						<option value="dhexda_maraya">Dhexda maraya</option>
						<option value="aad_uga_fog">Aad uga fog</option>
					</select>
					<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Qoraallo/Faallooyin" className="col-span-2 border rounded px-3 py-2"/>
					<div className="col-span-6">
						<div className="grid grid-cols-6 font-semibold text-sm border-b pb-2">
							<div className="col-span-2">Arday</div>
							<div>Casharka Maalinle</div>
							<div>Suuradda</div>
							<div>Taxdiid</div>
							<div>Qoraal</div>
						</div>
						<div className="max-h-64 overflow-auto divide-y">
							{students.map((s, idx) => (
								<div key={s._id} className="grid grid-cols-6 items-center gap-2 py-2">
									<div className="col-span-2">
										<div className="font-medium text-sm">{s.fullname}</div>
										<div className="text-xs text-gray-500">{s.studentId||'-'}</div>
									</div>
									<input type="number" value={studentPerformances[idx]?.dailyLessonNumber||0} onChange={e=>updateStudentPerf(idx,'dailyLessonNumber',Number(e.target.value))} className="border rounded px-2 py-1"/>
									<input value={studentPerformances[idx]?.versesTaken||''} onChange={e=>updateStudentPerf(idx,'versesTaken',e.target.value)} className="border rounded px-2 py-1"/>
									<input value={studentPerformances[idx]?.taxdiid||''} onChange={e=>updateStudentPerf(idx,'taxdiid',e.target.value)} className="border rounded px-2 py-1"/>
									<input value={studentPerformances[idx]?.notes||''} onChange={e=>updateStudentPerf(idx,'notes',e.target.value)} className="border rounded px-2 py-1"/>
								</div>
							))}
						</div>
					</div>
					<div className="col-span-6 flex justify-end">
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
								<div className="text-xs">Cashar: {r.quran?.dailyLessonNumber} | Suuro: {r.quran?.currentSurah} | Taxdiid: {r.quran?.taxdiid} | Xaalad: {r.quran?.studentStatus}</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default QuranSection