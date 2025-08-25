import { useEffect, useState } from "react";
import { useExamStore } from "../../store/examStore";
import { useSubjectStore } from "../../store/subjectsStore";
import useClassesStore from "../../store/classesStore";
import { FiSearch, FiBook, FiUser, FiAward, FiCalendar } from "react-icons/fi";
import PrintButton from "../common/PrintButton";

// Somali translations
const translations = {
  title: "Natiijooyinka Imtixaannada Fasalka",
  searchTitle: "Raadi Natiijooyinka",
  selectClass: "Dooro Fasalka",
  selectYear: "Geli Sanadka Waxbarashada",
  selectSubject: "Dooro Mawduuca",
  selectExamType: "Dooro Nooca Imtixaanka",
  searchButton: "Raadi",
  loading: "Soo dejinta natiijooyinka...",
  noResults: "Natiijooyin lama helin",
  tableHeaders: {
    student: "Arday",
    obtained: "Qiimaha",
    total: "Wadarta",
    date: "Taariikhda",
    grade: "Darajada"
  },
  examTypes: {
    "mid-term": "Imtixaan Shahri 1",
    "final": "Imtixaan Yar",
    "quiz": "Imtixaan Shahri 2",
    "assignment": "Imtixaan Wayn"
  },
};

const GetClassExams = () => {
  const { exams, loading, error, getExamsByClassAndYear } = useExamStore();
  const { subjects, getAllSubjects } = useSubjectStore();
  const { classes, fetchClasses } = useClassesStore();

  const [form, setForm] = useState({
    classId: "",
    academicYear: "",
    subjectId: "",
    examType: "",
  });
  const [yearError, setYearError] = useState("");

  useEffect(() => {
    getAllSubjects();
    fetchClasses();
  }, [getAllSubjects, fetchClasses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Validate academic year format on change
    if (name === "academicYear") {
      const yearRegex = /^\d{4}\/\d{4}$/;
      if (!yearRegex.test(value) && value !== "") {
        setYearError("Fadlan geli qaabkan: yyyy/yyyy (tusaale: 2024/2025)");
      } else {
        setYearError("");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (yearError) {
      alert("Fadlan sax qaladka sanadka waxbarashada.");
      return;
    }
    getExamsByClassAndYear(form);
  };

  // Calculate grade with color
  const getGrade = (obtained, total) => {
    const percentage = (obtained / total) * 100;
    let grade, color;

    if (percentage >= 90) {
      grade = 'A';
      color = 'text-green-600';
    } else if (percentage >= 80) {
      grade = 'B';
      color = 'text-blue-600';
    } else if (percentage >= 70) {
      grade = 'C';
      color = 'text-yellow-600';
    } else if (percentage >= 60) {
      grade = 'D';
      color = 'text-orange-600';
    } else {
      grade = 'F';
      color = 'text-red-600';
    }

    return <span className={`font-bold ${color}`}>{grade}</span>;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700 flex items-center">
        <FiBook className="mr-2" /> {translations.title}
      </h1>

      {/* Search Form */}
      <div className="bg-indigo-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4 text-indigo-800 flex items-center">
          <FiSearch className="mr-2" /> {translations.searchTitle}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations.selectClass}
            </label>
            <select
              name="classId"
              value={form.classId}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">{translations.selectClass}</option>
              {(classes || []).map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.level})
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations.selectYear}
            </label>
            <input
              type="text"
              name="academicYear"
              value={form.academicYear}
              onChange={handleChange}
              placeholder="e.g., 2024/2025"
              className={`w-full p-2 border rounded-lg focus:ring-2 ${
                yearError ? "border-red-500 focus:ring-red-200" : "focus:ring-indigo-500 focus:border-indigo-500"
              }`}
              required
            />
            {yearError && (
              <p className="mt-1 text-sm text-red-600">{yearError}</p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations.selectSubject}
            </label>
            <select
              name="subjectId"
              value={form.subjectId}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">{translations.selectSubject}</option>
              {(subjects || []).map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations.selectExamType}
            </label>
            <select
              name="examType"
              value={form.examType}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">{translations.selectExamType}</option>
              {Object.entries(translations.examTypes).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={yearError !== ""}
            className={`md:col-span-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors ${
              yearError && "opacity-50 cursor-not-allowed"
            }`}
          >
            <FiSearch className="mr-2" /> {translations.searchButton}
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading && (
          <div className="p-4 text-center text-blue-600 flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {translations.loading}
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-red-600">
            {error}
          </div>
        )}

        {(exams || []).length > 0 ? (
          <div>
            <div className="flex justify-end mb-4">
              {(() => {
                const tableRows = (exams || []).map((exam) => {
                  const percentage = ((exam?.obtainedMarks || 0) / (exam?.totalMarks || 100)) * 100;
                  let grade = 'F';
                  if (percentage >= 90) grade = 'A';
                  else if (percentage >= 80) grade = 'B';
                  else if (percentage >= 70) grade = 'C';
                  else if (percentage >= 60) grade = 'D';

                  return '<tr>' +
                    '<td>' + (exam?.student?.fullname || "N/A") + '</td>' +
                    '<td>' + (exam?.student?.class?.name || "") + '</td>' +
                    '<td>' + (exam?.obtainedMarks ?? exam?.marks ?? "N/A") + '</td>' +
                    '<td>' + (exam?.totalMarks ?? exam?.total ?? "N/A") + '</td>' +
                    '<td class="grade-' + grade + '">' + grade + '</td>' +
                    '<td>' + (exam?.date ? new Date(exam.date).toLocaleDateString('so-SO') : "N/A") + '</td>' +
                    '</tr>';
                }).join('');

                return (
                  <PrintButton
                    title="Natiijooyinka Imtixaannada Fasalka"
                    subtitle={`${classes.find(c => c._id === form.classId)?.name || 'Ma jiro'} - ${form.academicYear} - ${subjects.find(s => s._id === form.subjectId)?.name || 'Ma jiro'} - ${translations.examTypes[form.examType] || 'Ma jiro'}`}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {`
                      <div class="info-section">
                        <div class="info-label">Macluumaadka Imtixaanka</div>
                        <div class="info-grid">
                          <div class="info-item">
                            <span class="info-key">Fasalka:</span>
                            <span class="info-value">${classes.find(c => c._id === form.classId)?.name || 'Ma jiro'}</span>
                          </div>
                          <div class="info-item">
                            <span class="info-key">Sannadka Waxbarashada:</span>
                            <span class="info-value">${form.academicYear}</span>
                          </div>
                          <div class="info-item">
                            <span class="info-key">Mawduuca:</span>
                            <span class="info-value">${subjects.find(s => s._id === form.subjectId)?.name || 'Ma jiro'}</span>
                          </div>
                          <div class="info-item">
                            <span class="info-key">Nooca Imtixaanka:</span>
                            <span class="info-value">${translations.examTypes[form.examType] || 'Ma jiro'}</span>
                          </div>
                          <div class="info-item">
                            <span class="info-key">Wadarta Ardayda:</span>
                            <span class="info-value">${exams.length}</span>
                          </div>
                          <div class="info-item">
                            <span class="info-key">Celceliska Dhibcaha:</span>
                            <span class="info-value">${exams.length > 0 ? Math.round((exams.reduce((sum, exam) => sum + (exam?.obtainedMarks || 0), 0) / exams.length)) : 0}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div class="summary-stats">
                        <div class="stat-item">
                          <div class="stat-number">${exams.filter(exam => {
                            const percentage = ((exam?.obtainedMarks || 0) / (exam?.totalMarks || 100)) * 100;
                            return percentage >= 90;
                          }).length}</div>
                          <div class="stat-label">Darajada A</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-number">${exams.filter(exam => {
                            const percentage = ((exam?.obtainedMarks || 0) / (exam?.totalMarks || 100)) * 100;
                            return percentage >= 80 && percentage < 90;
                          }).length}</div>
                          <div class="stat-label">Darajada B</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-number">${exams.filter(exam => {
                            const percentage = ((exam?.obtainedMarks || 0) / (exam?.totalMarks || 100)) * 100;
                            return percentage >= 70 && percentage < 80;
                          }).length}</div>
                          <div class="stat-label">Darajada C</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-number">${exams.filter(exam => {
                            const percentage = ((exam?.obtainedMarks || 0) / (exam?.totalMarks || 100)) * 100;
                            return percentage < 70;
                          }).length}</div>
                          <div class="stat-label">Ka Hooseeya C</div>
                        </div>
                      </div>
                      
                      <table>
                        <thead>
                          <tr>
                            <th>Magaca Ardayga</th>
                            <th>Fasalka</th>
                            <th>Dhibcaha La Helay</th>
                            <th>Wadarta</th>
                            <th>Darajada</th>
                            <th>Taariikhda</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${tableRows}
                        </tbody>
                      </table>
                    `}
                  </PrintButton>
                );
              })()}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FiUser className="inline mr-1" /> {translations.tableHeaders.student}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {translations.tableHeaders.obtained}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {translations.tableHeaders.total}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FiAward className="inline mr-1" /> {translations.tableHeaders.grade}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FiCalendar className="inline mr-1" /> {translations.tableHeaders.date}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(exams || []).map((exam) => (
                    <tr key={exam._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {exam?.student?.fullname || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {exam?.student?.class?.name || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam?.obtainedMarks ?? exam?.marks ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam?.totalMarks ?? exam?.total ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getGrade(exam?.obtainedMarks || 0, exam?.totalMarks || 100)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exam?.date ? new Date(exam.date).toLocaleDateString('so-SO') : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="p-8 text-center text-gray-500">
              <FiBook className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{translations.noResults}</h3>
              <p className="mt-1 text-sm text-gray-500">Fadlan dooro fasalka, mawduuca, iyo nooca imtixaanka</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GetClassExams;