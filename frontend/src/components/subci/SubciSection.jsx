import React, { useEffect, useMemo, useState } from 'react'
import { HalaqaAPI } from '../../api/halaqa'
import useStudentsStore from '../../store/studentsStore'
import { Search, PlusCircle, Trash2, UserPlus, X } from 'lucide-react'
import { toast } from 'react-toastify'

function SubciSection() {
	const { students, fetchStudents, loading: studentsLoading } = useStudentsStore()
	const [query, setQuery] = useState('')
	const [halaqas, setHalaqas] = useState([])
	const [selected, setSelected] = useState(null)
	const [creating, setCreating] = useState(false)
	const [newHalaqa, setNewHalaqa] = useState({ name: '', description: '', startingSurah: '', taxdiid: '' })
	const [saving, setSaving] = useState(false)
	const [removing, setRemoving] = useState(false)

	useEffect(() => {
		fetchStudents()
		loadAll()
	}, [])

	const loadAll = async () => {
		try {
			const res = await HalaqaAPI.getAll()
			setHalaqas(res.data)
		} catch (e) {
			toast.error('Failed to load Halaqas')
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
			if (selected?._id === id) setSelected(null)
			toast.success('Xalqad la tirtiray')
		} catch (e) { toast.error('Tirtiristu wey fashilantay') }
	}

	return (
		<div className="p-4 space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Subci - Maareynta Xalqooyinka</h2>
				<button className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded" onClick={() => setCreating(true)}>
					<PlusCircle className="w-4 h-4"/> Abuur Xalqad
				</button>
			</div>

			<div className="flex gap-3">
				<div className="w-1/3 bg-white rounded p-3 shadow">
					<div className="relative">
						<Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400"/>
						<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Raadi Xalqad" className="w-full border rounded pl-7 pr-2 py-2"/>
					</div>
					<div className="mt-3 divide-y">
						{filtered.map(h => (
							<div key={h._id} className={`flex items-center justify-between py-2 ${selected?._id===h._id?'bg-indigo-50':''}`}>
								<button className="text-left flex-1 px-2" onClick={()=>openHalaqa(h.name)}>
									<div className="font-medium">{h.name}</div>
									<div className="text-xs text-gray-500">Arday: {h.students?.length||0}</div>
								</button>
								<button className="text-red-600 hover:text-red-700 px-2" onClick={()=>deleteHalaqa(h._id)}>
									<Trash2 className="w-4 h-4"/>
								</button>
							</div>
						))}
					</div>
				</div>

				<div className="w-2/3 bg-white rounded p-4 shadow min-h-[320px]">
					{!selected ? (
						<div className="text-gray-500">Dooro Xalqad si aad u maamusho ardayda.</div>
					) : (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-lg font-semibold">{selected.name}</h3>
									<p className="text-sm text-gray-500">Taxdiid: {selected.taxdiid || '-'}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<h4 className="font-medium mb-2">Ardayga Xalqada</h4>
									<div className="border rounded divide-y max-h-64 overflow-auto">
										{(selected.students||[]).map(st => (
											<div key={st._id} className="flex items-center justify-between p-2">
												<div>
													<div className="font-medium text-sm">{st.fullname}</div>
													<div className="text-xs text-gray-500">{st.studentId||'-'}</div>
												</div>
												<button disabled={removing} onClick={()=>removeStudent(st._id)} className="text-red-600 hover:text-red-700">
													<X className="w-4 h-4"/>
												</button>
											</div>
										))}
									</div>
								</div>

								<div>
									<h4 className="font-medium mb-2 flex items-center gap-2"><UserPlus className="w-4 h-4"/> Ku dar arday</h4>
									<div className="border rounded">
										<div className="max-h-64 overflow-auto divide-y">
											{studentsLoading ? (
												<div className="p-2 text-sm text-gray-500">Loading...</div>
											) : (
												students.map(s => (
													<div key={s._id} className="flex items-center justify-between p-2">
														<div>
															<div className="font-medium text-sm">{s.fullname}</div>
															<div className="text-xs text-gray-500">{s.studentId||'-'}</div>
														</div>
														<button disabled={saving} onClick={()=>addStudents([s._id])} className="text-indigo-600 hover:text-indigo-700">
															<UserPlus className="w-4 h-4"/>
														</button>
													</div>
												))
											)}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
			</div>

			{creating && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center">
					<div className="bg-white rounded p-4 w-full max-w-md">
						<div className="flex items-center justify-between mb-3">
							<h3 className="font-semibold">Abuur Xalqad</h3>
							<button onClick={()=>setCreating(false)}><X className="w-5 h-5"/></button>
						</div>
						<form onSubmit={handleCreate} className="space-y-3">
							<input value={newHalaqa.name} onChange={e=>setNewHalaqa(v=>({...v, name:e.target.value}))} placeholder="Magaca Xalqada" className="w-full border rounded px-3 py-2"/>
							<input value={newHalaqa.description} onChange={e=>setNewHalaqa(v=>({...v, description:e.target.value}))} placeholder="Sharaxaad (ikhtiyaari)" className="w-full border rounded px-3 py-2"/>
							<input value={newHalaqa.startingSurah} onChange={e=>setNewHalaqa(v=>({...v, startingSurah:e.target.value}))} placeholder="Starting Surah" className="w-full border rounded px-3 py-2"/>
							<input value={newHalaqa.taxdiid} onChange={e=>setNewHalaqa(v=>({...v, taxdiid:e.target.value}))} placeholder="Taxdiid" className="w-full border rounded px-3 py-2"/>
							<div className="flex justify-end gap-2">
								<button type="button" onClick={()=>setCreating(false)} className="px-3 py-2 rounded border">Cancel</button>
								<button disabled={saving} type="submit" className="px-3 py-2 rounded bg-indigo-600 text-white">Save</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default SubciSection