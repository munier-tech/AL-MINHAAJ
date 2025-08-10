import { useEffect, useState, useRef } from "react";
import { useDisciplineStore } from "../../store/disciplineStore";
import useStudentsStore from "../../store/studentsStore";
import { Edit, Trash2, Save, X } from "lucide-react";

const DisciplinePage = () => {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="flex border-b-2 border-gray-200 mb-6">
            <button
              className={`px-6 py-3 text-sm font-semibold transition-colors duration-300 ${
                activeTab === "create"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
              onClick={() => setActiveTab("create")}
            >
              Diiwaan Galin Anshaxa
            </button>
            <button
              className={`px-6 py-3 text-sm font-semibold transition-colors duration-300 ${
                activeTab === "view"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
              onClick={() => setActiveTab("view")}
            >
              Muuji Dhammaan Xogta
            </button>
          </div>

          {activeTab === "create" ? <CreateDisciplineTab /> : <ViewDisciplineTab />}
        </div>
      </div>
    </div>
  );
};

const CreateDisciplineTab = () => {
  const { createDiscipline, loading, error } = useDisciplineStore();
  const { students, fetchStudents } = useStudentsStore();

  const [formData, setFormData] = useState({
    student: "",
    date: "",
    reason: "",
    type: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const types = ["Wanaagsan", "Caadi", "xun", "aad u xun"];

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredStudents = students.filter((student) =>
    student.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const selectStudent = (student) => {
    setFormData({ ...formData, student: student._id });
    setSearchTerm(student.fullname);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student) {
      alert("Fadlan dooro arday");
      return;
    }

    await createDiscipline(formData);
    setFormData({
      student: "",
      date: "",
      reason: "",
      type: "",
    });
    setSearchTerm("");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Diiwaan Galin Anshaxa</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative" ref={dropdownRef}>
            <label htmlFor="student-search" className="block text-sm font-medium text-gray-700 mb-1">
              Arday
            </label>
            <input
              id="student-search"
              type="text"
              placeholder="Raadi arday..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              className="w-full border border-gray-400 px-3 py-2 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out"
            />
            {showDropdown && filteredStudents.length > 0 && (
              <div className="absolute z-20 w-full bg-white border border-gray-400 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                {filteredStudents.map((std) => (
                  <div
                    key={std._id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => selectStudent(std)}
                  >
                    {std.fullname}
                  </div>
                ))}
              </div>
            )}
            <input type="hidden" name="student" value={formData.student} />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Taariikhda
            </label>
            <input
              id="date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-3 py-2 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Sababta
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Geli sababta..."
            className="w-full border border-gray-400 px-3 py-2 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out"
          ></textarea>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Nooca
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full border border-gray-400 px-3 py-2 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            <option value="">Dooro nooca</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Kaydinaya..." : "Kaydi Xogta"}
        </button>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </form>
    </div>
  );
};

const ViewDisciplineTab = () => {
  const {
    disciplineRecords,
    loading,
    error,
    getAllDiscipline,
    deleteDiscipline,
    updateDiscipline,
  } = useDisciplineStore();
  const { students, fetchStudents } = useStudentsStore();

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    student: "",
    date: "",
    reason: "",
    type: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const types = ["Wanaagsan", "Caadi", "xun", "aad u xun"];

  useEffect(() => {
    getAllDiscipline();
    fetchStudents();
  }, [getAllDiscipline, fetchStudents]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStudentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Ma hubtaa inaad masaxdo xogtan?")) {
      await deleteDiscipline(id);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    setEditFormData({
      student: record.student._id,
      date: record.date.split("T")[0],
      reason: record.reason,
      type: record.type,
    });
    const student = students.find((s) => s._id === record.student._id);
    setStudentSearchTerm(student?.fullname || "");
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleStudentSearchChange = (e) => {
    setStudentSearchTerm(e.target.value);
    setShowStudentDropdown(true);
  };

  const selectEditStudent = (student) => {
    setEditFormData({ ...editFormData, student: student._id });
    setStudentSearchTerm(student.fullname);
    setShowStudentDropdown(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormData.student) {
      alert("Fadlan dooro arday");
      return;
    }

    await updateDiscipline(editingId, editFormData);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const filteredRecords = disciplineRecords.filter((record) => {
    if (!searchTerm) return true;
    const student = students.find((s) => s._id === record.student._id);
    return student?.fullname.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredStudents = students.filter((student) =>
    student.fullname.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dhammaan Xogta Anshaxa</h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Raadi arday..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-400 px-3 py-2 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out"
        />
      </div>

      {loading && !disciplineRecords.length ? (
        <p className="text-gray-600 text-center">Soo dejinta xogta...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : filteredRecords.length === 0 ? (
        <p className="text-gray-600 text-center">Lama helin xog anshax ah</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => {
            const student = students.find((s) => s._id === record.student._id);
            const studentName = student ? student.fullname : "Lama helin";

            return (
              <div key={record._id} className="bg-white rounded-lg shadow-md p-5 border border-gray-200">
                {editingId === record._id ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="relative" ref={dropdownRef}>
                      <label htmlFor="student-edit-search" className="block text-sm font-medium text-gray-700">Arday</label>
                      <input
                        id="student-edit-search"
                        type="text"
                        placeholder="Raadi arday..."
                        value={studentSearchTerm}
                        onChange={handleStudentSearchChange}
                        onFocus={() => setShowStudentDropdown(true)}
                        className="w-full border border-gray-400 px-3 py-2 rounded-md shadow-sm"
                      />
                      {showStudentDropdown && filteredStudents.length > 0 && (
                        <div className="absolute z-20 w-full bg-white border border-gray-400 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                          {filteredStudents.map((std) => (
                            <div
                              key={std._id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => selectEditStudent(std)}
                            >
                              {std.fullname}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700">Taariikhda</label>
                      <input
                        id="edit-date"
                        type="date"
                        name="date"
                        value={editFormData.date}
                        onChange={handleEditChange}
                        className="w-full border border-gray-400 px-3 py-2 rounded-md shadow-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-reason" className="block text-sm font-medium text-gray-700">Sababta</label>
                      <textarea
                        id="edit-reason"
                        name="reason"
                        value={editFormData.reason}
                        onChange={handleEditChange}
                        rows={2}
                        className="w-full border border-gray-400 px-3 py-2 rounded-md shadow-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700">Nooca</label>
                      <select
                        id="edit-type"
                        name="type"
                        value={editFormData.type}
                        onChange={handleEditChange}
                        className="w-full border border-gray-400 px-3 py-2 rounded-md shadow-sm"
                      >
                        {types.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="submit"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <Save className="h-4 w-4 mr-1" /> Kaydi
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <X className="h-4 w-4 mr-1" /> Jooji
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{studentName}</h3>
                        <p className="text-xs text-gray-500">
                          Taariikhda: {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                          title="Wax ka beddel"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          title="Tirtir"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">
                      <span className="font-semibold">Sababta:</span> {record.reason}
                    </p>
                    <div className="text-sm font-medium">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          record.type === "Wanaagsan"
                            ? "bg-green-100 text-green-800"
                            : record.type === "Caadi"
                            ? "bg-blue-100 text-blue-800"
                            : record.type === "xun"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.type}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DisciplinePage;