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

	const [editingRecordId, setEditingRecordId] = useState(null)
	const [editingRows, setEditingRows] = useState([])

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
						<div>Cashar (bog)</div>
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
					<div className="text-sm text-gray-500">Diiwaanno ayaa soo degaya...</div>
				) : (
					<div className="space-y-2">
						{records.map(r => (
							<div key={r._id} className="border rounded p-3">
								<div className="flex items-center justify-between text-sm text-gray-600">
									<span>{new Date(r.date).toLocaleString()}</span>
									<div className="flex items-center gap-2">
										<button 
											onClick={() => {
												const printContent = `
													<html>
														<head>
															<title>Qur'aan - Diiwaan Maalinle (${r.class?.name || ''})</title>
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
																<h2>Qur'aan - Diiwaan Maalinle (${r.class?.name || ''})</h2>
																<p>Taariikh: ${new Date(r.date).toLocaleDateString()} | Bil: ${month}/${year}</p>
															</div>
															
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
											className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs"
											title="Print this record"
										>
											<svg className="mr-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
											</svg>
											Print
										</button>
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