import { useEffect, useState } from "react";
import {
  FiEdit,
  FiTrash2,
  FiBookOpen,
  FiSave,
  FiX,
  FiUser,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useSubjectStore } from "../../store/subjectsStore";
import Select from "react-select";
import useTeachersStore from "../../store/teachersStore";

const GetAllSubjects = () => {
  const {
    subjects,
    getAllSubjects,
    deleteSubject,
    updateSubject,
    isLoading,
    error,
    successMessage,
    clearMessages,
  } = useSubjectStore();

  const {
    teachers,
    fetchTeachers,
    isLoading: teachersLoading,
  } = useTeachersStore();

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    code: "",
    teacher: null,
  });

  useEffect(() => {
    getAllSubjects();
    fetchTeachers();
  }, [getAllSubjects, fetchTeachers]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      clearMessages();
    }
    if (error) {
      toast.error(error);
      clearMessages();
    }
  }, [successMessage, error, clearMessages]);

  const handleEditClick = (subject) => {
    setEditId(subject._id);
    const matchedTeacher = teachers.find(t => t._id === subject.teacher);
    setEditData({
      name: subject.name,
      code: subject.code || "",
      teacher: matchedTeacher || null,
    });
  };

  const handleUpdate = async () => {
    if (!editData.name.trim()) {
      toast.error("Subject name is required");
      return;
    }

    try {
      await updateSubject(editId, {
        name: editData.name,
        code: editData.code || "",
        teacher: editData.teacher?._id || "",
      });

      // Refresh data after update
      await getAllSubjects();
      
      // Reset edit state
      setEditId(null);
      setEditData({ name: "", code: "", teacher: null });
    } catch (error) {
      toast.error("Failed to update subject");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      await deleteSubject(id);
      await getAllSubjects(); // Refresh the list after deletion
    }
  };

  const teacherOptions = teachers.map((t) => ({
    value: t,
    label: t.fullname || t.name || `Teacher (${t._id.slice(-4)})`,
  }));

  const findTeacherName = (teacherId) => {
    if (!teacherId) return "Not assigned";
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher?.fullname || teacher?.name || "Unknown teacher";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold flex items-center text-gray-800 mb-4">
        <FiBookOpen className="mr-2 text-indigo-600" /> Maareynta Mawduucyada
      </h2>

      {isLoading || teachersLoading ? (
        <div className="text-center text-gray-500 py-20">
          Loading subjects...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-[50rem] min-h-32 bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Teacher</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(subjects || []).length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No subjects found.
                  </td>
                </tr>
              ) : (
                subjects.map((subject) => (
                  <tr key={subject._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {editId === subject.id ? (
                        <input
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              name: e.target.value,
                            })
                          }
                          className="w-full border px-2 py-1 rounded"
                        />
                      ) : (
                        subject.name
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editId === subject._id ? (
                        <Select
                          value={teacherOptions.find(
                            (opt) => opt.value._id === (editData.teacher?._id || editData.teacher)
                          )}
                          onChange={(option) =>
                            setEditData({
                              ...editData,
                              teacher: option?.value || null,
                            })
                          }
                          options={teacherOptions}
                          isClearable
                          placeholder="Select Teacher"
                          className="w-60"
                        />
                      ) : (
                        <div className="flex items-center text-sm">
                          <FiUser className="mr-2 text-gray-400" />
                          {findTeacherName(subject.teacher)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {editId === subject._id ? (
                        <div className="space-x-2">
                          <button
                            onClick={handleUpdate}
                            className="text-green-600 hover:text-green-800"
                          >
                            <FiSave className="inline" /> Save
                          </button>
                          <button
                            onClick={() => {
                              setEditId(null);
                              setEditData({
                                name: "",
                                code: "",
                                teacher: null,
                              });
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <FiX className="inline" /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="space-x-2">
                          <button
                            onClick={() => handleEditClick(subject)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <FiEdit className="inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(subject._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 className="inline" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GetAllSubjects;