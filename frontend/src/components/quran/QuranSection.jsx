import React, { useEffect, useMemo, useState } from 'react'
import { HalaqaAPI } from '../../api/halaqa'
import { LessonRecordsAPI } from '../../api/lessonRecords'
import { Search, PlusCircle } from 'lucide-react'
import { toast } from 'react-toastify'

function QuranSection() {
	const [halaqas, setHalaqas] = useState([])
	const [query, setQuery] = useState('')
	const [selected, setSelected] = useState(null)

	// Form state for Quran record (Halaqa-level fields)
	const [dailyLessonHint, setDailyLessonHint] = useState('')
	const [currentSurah, setCurrentSurah] = useState('')
	const [taxdiid, setTaxdiid] = useState('')
	const [studentStatus, setStudentStatus] = useState('in_progress')
	const [notes, setNotes] = useState('')

	// Per-student inputs
	const [studentPerformances, setStudentPerformances] = useState([])
	const [records, setRecords] = useState([])
	const [loadingRecords, setLoadingRecords] = useState(false)
	const [saving, setSaving] = useState(false)

	useEffect(() => { loadHalaqas() }, [])

	const loadHalaqas = async () => {
		try {
			const res = await HalaqaAPI.getAll()
			setHalaqas(res.data)
		} catch (e) { toast.error('Failed to load Halaqas') }
	}

	const filtered = useMemo(() => {
		if (!query) return halaqas
		return halaqas.filter(h => h.name.toLowerCase().includes(query.toLowerCase()))
	}, [query, halaqas])

	const openHalaqa = async (name) => {
		try {
			const res = await HalaqaAPI.searchByName(name)
			setSelected(res.data)
			// initialize per-student state
			const init = (res.data.students||[]).map(s => ({ student: s._id, versesTaken: '', statusScore: 0, notes: '' }))
			setStudentPerformances(init)
			await loadRecords(res.data._id)
		} catch (e) { toast.error('Xalqad lama helin') }
	}

	const loadRecords = async (halaqaId) => {
		setLoadingRecords(true)
		try {
			const res = await LessonRecordsAPI.getByHalaqa(halaqaId)
			setRecords(res.data)
		} catch (e) { toast.error('Failed to fetch records') } finally { setLoadingRecords(false) }
	}

	const updateStudentPerf = (idx, key, value) => {
		setStudentPerformances(prev => prev.map((sp, i) => i===idx ? { ...sp, [key]: value } : sp))
	}

	const saveRecord = async (e) => {
		e.preventDefault()
		if (!selected?._id) return toast.error('Dooro Xalqad')
		setSaving(true)
		try {
			const payload = { halaqaId: selected._id, dailyLessonHint, currentSurah, taxdiid, studentStatus, notes, studentPerformances }
			const res = await LessonRecordsAPI.createQuran(payload)
			setRecords(prev => [res.data, ...prev])
			setDailyLessonHint(''); setCurrentSurah(''); setTaxdiid(''); setStudentStatus('in_progress'); setNotes('')
			setStudentPerformances((selected.students||[]).map(s => ({ student: s._id, versesTaken: '', statusScore: 0, notes: '' })))
			toast.success('Qur’an record la kaydiyay')
		} catch (e) { toast.error('Kaydintu wey fashilantay') } finally { setSaving(false) }
	}

	return (
		<div className="p-4 space-y-6">
			<h2 className="text-xl font-semibold">Qur’an - Records</h2>
			<div className="flex gap-3">
				{/* Left: Halaqa list and search */}
				<div className="w-1/3 bg-white rounded p-3 shadow">
					<div className="relative">
						<Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400"/>
						<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Raadi Xalqad" className="w-full border rounded pl-7 pr-2 py-2"/>
					</div>
					<div className="mt-3 divide-y">
						{filtered.map(h => (
							<button key={h._id} className={`w-full text-left py-2 px-2 rounded ${selected?._id===h._id?'bg-indigo-50':''}`} onClick={()=>openHalaqa(h.name)}>
								<div className="font-medium">{h.name}</div>
								<div className="text-xs text-gray-500">Arday: {h.students?.length||0}</div>
							</button>
						))}
					</div>
				</div>

				{/* Right: Two halves */}
				<div className="w-2/3 space-y-4">
					{/* Top: Halaqa record form */}
					<div className="bg-white rounded p-4 shadow">
						<h3 className="font-medium mb-3">Halka Xalqada</h3>
						<form onSubmit={saveRecord} className="grid grid-cols-2 gap-3">
							<input value={dailyLessonHint} onChange={e=>setDailyLessonHint(e.target.value)} placeholder="Daily Lesson Hint (add page refs)" className="border rounded px-3 py-2"/>
							<input value={currentSurah} onChange={e=>setCurrentSurah(e.target.value)} placeholder="Current Surah" className="border rounded px-3 py-2"/>
							<input value={taxdiid} onChange={e=>setTaxdiid(e.target.value)} placeholder="Taxdiid (Checkpoint)" className="border rounded px-3 py-2"/>
							<select value={studentStatus} onChange={e=>setStudentStatus(e.target.value)} className="border rounded px-3 py-2">
								<option value="reached">Reached</option>
								<option value="in_progress">In Progress</option>
								<option value="far_behind">Far Behind</option>
							</select>
							<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes/Comments" className="col-span-2 border rounded px-3 py-2"/>
							<div className="col-span-2 flex justify-end">
								<button disabled={saving || !selected} type="submit" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded">
									<PlusCircle className="w-4 h-4"/> Save Record
								</button>
							</div>
						</form>
					</div>

					{/* Bottom: Per-student */}
					<div className="bg-white rounded p-4 shadow">
						<h3 className="font-medium mb-3">Ardayda Xalqada</h3>
						<div className="grid grid-cols-1 gap-2 max-h-80 overflow-auto">
							{(selected?.students||[]).map((s, idx) => (
								<div key={s._id} className="grid grid-cols-6 gap-2 items-center">
									<div className="col-span-2">
										<div className="font-medium text-sm">{s.fullname}</div>
										<div className="text-xs text-gray-500">{s.studentId||'-'}</div>
									</div>
									<input value={studentPerformances[idx]?.versesTaken||''} onChange={e=>updateStudentPerf(idx,'versesTaken',e.target.value)} placeholder="Verses Taken" className="border rounded px-2 py-1"/>
									<input type="number" value={studentPerformances[idx]?.statusScore||0} onChange={e=>updateStudentPerf(idx,'statusScore',Number(e.target.value))} placeholder="Status (higher=worse)" className="border rounded px-2 py-1"/>
									<input value={studentPerformances[idx]?.notes||''} onChange={e=>updateStudentPerf(idx,'notes',e.target.value)} placeholder="Notes" className="col-span-2 border rounded px-2 py-1"/>
								</div>
							))}
						</div>
					</div>

					<div className="bg-white rounded p-4 shadow">
						<h3 className="font-medium mb-3">Diiwaannada Xalqadan</h3>
						{loadingRecords ? (
							<div className="text-sm text-gray-500">Loading records...</div>
						) : (
							<div className="space-y-2">
								{records.map(r => (
									<div key={r._id} className="border rounded p-3">
										<div className="text-sm text-gray-600">{new Date(r.date).toLocaleString()}</div>
										<div className="font-medium">{r.quran?.currentSurah || r.subci?.startingSurah}</div>
										<div className="text-xs text-gray-500">Hint: {r.quran?.dailyLessonHint} | Taxdiid: {r.quran?.taxdiid || r.subci?.taxdiid}</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default QuranSection