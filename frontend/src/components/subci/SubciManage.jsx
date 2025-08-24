import React, { useEffect, useMemo, useState } from 'react'
import useStudentsStore from '../../store/studentsStore'
import { HalaqaAPI } from '../../api/halaqa'
import { PlusCircle, Trash2, Edit3, Save, X, UserPlus, UserMinus, Search } from 'lucide-react'
import { toast } from 'react-toastify'

function SubciManage() {
	const { students, fetchStudents, loading: studentsLoading } = useStudentsStore()
	const [halaqas, setHalaqas] = useState([])
	const [query, setQuery] = useState('')
	const [creating, setCreating] = useState({ name: '', startingSurah: '', taxdiid: '', description: '' })
	const [selected, setSelected] = useState(null)
	const [editingMeta, setEditingMeta] = useState(null)
	const [saving, setSaving] = useState(false)

	useEffect(() => { fetchStudents(); loadAll() }, [])

	const loadAll = async () => {
		try {
			const res = await HalaqaAPI.getAll()
			setHalaqas(res.data)
		} catch {
			toast.error('Ku guuldareysatay inaad soo dejiso Xalqooyinka')
		}
	}

	const filtered = useMemo(() => {
		if (!query) return halaqas
		return halaqas.filter(h => h.name.toLowerCase().includes(query.toLowerCase()))
	}, [query, halaqas])

	const createHalaqa = async (e) => {
		e.preventDefault()
		if (!creating.name.trim()) return toast.error('Magaca Xalqada geli')
		setSaving(true)
		try {
			const res = await HalaqaAPI.create(creating)
			setHalaqas(prev => [res.data, ...prev])
			setCreating({ name: '', startingSurah: '', taxdiid: '', description: '' })
			toast.success('Xalqad la abuuray')
		} catch (e) { toast.error(e.response?.data?.message || 'Abuuris fashilantay') } finally { setSaving(false) }
	}

	const selectHalaqa = async (h) => {
		try {
			const res = await HalaqaAPI.getById(h._id)
			setSelected(res.data)
			setEditingMeta({ name: res.data.name, startingSurah: res.data.startingSurah||'', taxdiid: res.data.taxdiid||'', description: res.data.description||'' })
		} catch { toast.error('Xalqad lama helin') }
	}

	const saveMeta = async () => {
		if (!selected) return
		setSaving(true)
		try {
			const res = await HalaqaAPI.update(selected._id, editingMeta)
			setSelected(res.data)
			setHalaqas(prev => prev.map(h => h._id===res.data._id? res.data: h))
			toast.success('Xogta Xalqada waa la cusbooneysiiyay')
		} catch { toast.error('Cusbooneysiin fashilantay') } finally { setSaving(false) }
	}

	const deleteHalaqa = async (id) => {
		if (!confirm('Ma hubtaa inaad tirtirayso?')) return
		try {
			await HalaqaAPI.remove(id)
			setHalaqas(prev => prev.filter(h => h._id !== id))
			if (selected?._id === id) setSelected(null)
			toast.success('Xalqad la tirtiray')
		} catch { toast.error('Tirtiristu fashilantay') }
	}

	const addStudent = async (sid) => {
		if (!selected) return
		setSaving(true)
		try {
			const res = await HalaqaAPI.addStudents(selected._id, [sid])
			setSelected(res.data)
			setHalaqas(prev => prev.map(h => h._id===res.data._id? res.data: h))
		} catch { toast.error('Ku daristu fashilantay') } finally { setSaving(false) }
	}

	const removeStudent = async (sid) => {
		if (!selected) return
		setSaving(true)
		try {
			const res = await HalaqaAPI.removeStudent(selected._id, sid)
			setSelected(res.data)
			setHalaqas(prev => prev.map(h => h._id===res.data._id? res.data: h))
		} catch { toast.error('Ka saaristu fashilantay') } finally { setSaving(false) }
	}

	const memberIds = new Set((selected?.students||[]).map(s => s._id))
	const nonMembers = students.filter(s => !memberIds.has(s._id))

	return (
		<div className="p-4 space-y-6">
			<h2 className="text-xl font-semibold">Subci - Maamul Xalqooyin</h2>

			<div className="grid grid-cols-3 gap-4">
				<div className="col-span-1 bg-white rounded p-4 shadow">
					<h3 className="font-medium mb-2">Abuur Xalqad</h3>
					<form onSubmit={createHalaqa} className="space-y-2">
						<input value={creating.name} onChange={e=>setCreating(v=>({...v, name:e.target.value}))} className="w-full border rounded px-3 py-2" placeholder="Magaca Xalqada"/>
						<input value={creating.startingSurah} onChange={e=>setCreating(v=>({...v, startingSurah:e.target.value}))} className="w-full border rounded px-3 py-2" placeholder="Suurada laga bilaabayo"/>
						<input value={creating.taxdiid} onChange={e=>setCreating(v=>({...v, taxdiid:e.target.value}))} className="w-full border rounded px-3 py-2" placeholder="Taxdiid"/>
						<input value={creating.description} onChange={e=>setCreating(v=>({...v, description:e.target.value}))} className="w-full border rounded px-3 py-2" placeholder="Sharaxaad (ikhtiyaari)"/>
						<button disabled={saving} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded"><PlusCircle className="w-4 h-4"/> Abuur</button>
					</form>
				</div>

				<div className="col-span-2 bg-white rounded p-4 shadow">
					<div className="flex items-center justify-between mb-2">
						<h3 className="font-medium">Dhamaan Xalqooyinka</h3>
						<div className="relative w-64">
							<Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400"/>
							<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Raadi Xalqad" className="w-full border rounded pl-7 pr-2 py-2"/>
						</div>
					</div>
					<div className="divide-y max-h-80 overflow-auto">
						{filtered.map(h => (
							<div key={h._id} className={`flex items-center justify-between py-2 ${selected?._id===h._id?'bg-indigo-50':''}`}>
								<button className="text-left flex-1 px-2" onClick={()=>selectHalaqa(h)}>
									<div className="font-medium">{h.name}</div>
									<div className="text-xs text-gray-500">Arday: {h.students?.length||0}</div>
								</button>
								<div className="flex items-center gap-2 pr-2">
									<button className="text-amber-600 text-xs" onClick={()=>selectHalaqa(h)}><Edit3 className="w-4 h-4"/></button>
									<button className="text-red-600 text-xs" onClick={()=>deleteHalaqa(h._id)}><Trash2 className="w-4 h-4"/></button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{selected && (
				<div className="grid grid-cols-2 gap-4">
					<div className="bg-white rounded p-4 shadow">
						<h3 className="font-medium mb-2">Xogta Xalqada</h3>
						<div className="grid grid-cols-2 gap-2">
							<input value={editingMeta.name} onChange={e=>setEditingMeta(v=>({...v, name:e.target.value}))} className="border rounded px-3 py-2"/>
							<input value={editingMeta.startingSurah} onChange={e=>setEditingMeta(v=>({...v, startingSurah:e.target.value}))} className="border rounded px-3 py-2" placeholder="Suurada laga bilaabayo"/>
							<input value={editingMeta.taxdiid} onChange={e=>setEditingMeta(v=>({...v, taxdiid:e.target.value}))} className="border rounded px-3 py-2" placeholder="Taxdiid"/>
							<input value={editingMeta.description} onChange={e=>setEditingMeta(v=>({...v, description:e.target.value}))} className="border rounded px-3 py-2" placeholder="Sharaxaad"/>
						</div>
						<div className="flex justify-end mt-2">
							<button disabled={saving} onClick={saveMeta} className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded"><Save className="w-4 h-4"/> Kaydi</button>
						</div>
					</div>

					<div className="bg-white rounded p-4 shadow">
						<h3 className="font-medium mb-2">Maaree Ardayda Xalqada</h3>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<h4 className="font-medium text-sm mb-1">Ardayda Xalqadan</h4>
								<div className="border rounded max-h-64 overflow-auto divide-y">
									{(selected.students||[]).map(s => (
										<div key={s._id} className="flex items-center justify-between p-2">
											<div>
												<div className="text-sm font-medium">{s.fullname}</div>
												<div className="text-[11px] text-gray-500">{s.studentId||'-'}</div>
											</div>
											<button onClick={()=>removeStudent(s._id)} className="text-red-600"><UserMinus className="w-4 h-4"/></button>
										</div>
									))}
								</div>
							</div>
							<div>
								<h4 className="font-medium text-sm mb-1">Dhamaan Ardayda</h4>
								<div className="border rounded max-h-64 overflow-auto divide-y">
									{studentsLoading ? <div className="p-2 text-sm text-gray-500">Soo degaya...</div> : (
										students.map(s => (
											<div key={s._id} className="flex items-center justify-between p-2">
												<div>
													<div className="text-sm font-medium">{s.fullname}</div>
													<div className="text-[11px] text-gray-500">{s.studentId||'-'}</div>
												</div>
												<button disabled={memberIds.has(s._id)} onClick={()=>addStudent(s._id)} className="text-indigo-600 disabled:text-gray-300"><UserPlus className="w-4 h-4"/></button>
											</div>
										))
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default SubciManage