import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader, Loader2 } from 'lucide-react';
import useAuthStore from './store/authStore';
import DashboardLayout from './layouts/DashboardLayout';
import ThemeProvider from './components/ThemeProvider';

// Pages
import Login from './pages/Login';
import Signup from './pages/signUp';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';

// Components
import GetAllTeachers from './components/teachers/getTeachers';
import CreateTeachers from './components/teachers/createTeachers';
import GetAllStudents from './components/students/getAllStudents';
import CreateStudent from './components/students/CreateStudents';
import GetStudentById from './components/students/getStudentById';
import CreateTeacherAttendance from './components/teachers/createTeacherAttendance';
import GetTeacherAttendanceByDate from './components/teachers/getTeachersAttendance';
import GetAllClasses from './components/classes/getAllClasses';
import CreateClass from './components/classes/createClass';
import ClassDetails from './components/classes/classDetails';
import CreateAttendance from './components/attendances/CreateAttendance';
import GetAttendanceByDate from './components/attendances/GetAttendanceByDate';
import GetAllUser from './components/users/getAllUser';
import CreateExams from './components/exams/CreateExams';
import GetAllSubjects from './components/subjects/GetAllSubjects';
import NotFound from './pages/notFoundPage';
import CreateSubject from './components/subjects/CreateSubject';
import CreateClassExam from './components/exams/CreateClassExam';
import GetClassExams from './components/exams/GetClassExams';
import DisciplinePage from './components/discipline/CreateDiscipline';
import HealthFile from './health/HealthFile';
import FeeFile from './fees/FeeFile';
import SalaryFile from './salaries/SalaryFile';
import StudentExams from './components/students/StudentExams';
import SubciSection from './components/subci/SubciSection';
import QuranSection from './components/quran/QuranSection';
import SubciManage from './components/subci/SubciManage';

// Finance Components
import Finance from './components/finance/Finance';
import AddFinance from './components/finance/AddFinance';
import GetAllFinance from './components/finance/GetAllFinance';
import GetFinanceById from './components/finance/GetFinanceById';
import GenerateMonthlyFinance from './components/finance/GenerateMonthlyFinance';
import FinanceSummary from './components/finance/FinanceSummary';
import FamilyFees from './fees/FamilyFees';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthChecked } = useAuthStore();
  
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <DashboardLayout>{children}</DashboardLayout> : <Navigate to="/login" replace />;
};

// Admin Only Route Component
const AdminRoute = ({ children }) => {
  const { user, isAuthChecked } = useAuthStore();
  console.log('AdminRoute user:', user, 'isAuthChecked:', isAuthChecked);
  if (!isAuthChecked) {
    // Show loading spinner while checking auth
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-red-800">Lama Ogola</h3>
          <p className="mt-2 text-sm text-red-700">
            Uma lihid wax awooda inad wax ka ogaato xogta ku kaydsan pagekan.
          </p>
        </div>
      </div>
    );
  }
  return children;
};

// Public Route Component (no dashboard layout)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAuthChecked } = useAuthStore();
  
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  const { checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    init();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" size={25} />
          <p className="text-indigo-600 dark:text-indigo-400 font-semi-bold">Loading AL-MINHAAJ Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

      {/* Signup inside the dashboard (admin-only) */}
      <Route
        path="/signup"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Signup />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* Dashboard Overview */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <Dashboard />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/getAllStudents"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <GetAllStudents />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/createStudent"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <CreateStudent />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/getOneStudent"
        element={
          <ProtectedRoute>
            <GetStudentById />
          </ProtectedRoute>
        }
      />

      <Route
        path="/studentExams"
        element={
          <ProtectedRoute>
            <StudentExams />
          </ProtectedRoute>
        }
      />

      <Route
        path="/subci"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <SubciSection />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/subci/manage"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <SubciManage />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quran"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <QuranSection />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/addClass"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <CreateClass />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/getAll"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <GetAllClasses />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/createAttendance"
        element={
          <ProtectedRoute>
            <CreateAttendance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/AttendanceByDate"
        element={
          <ProtectedRoute>
            <GetAttendanceByDate />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/getAllUsers"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/addTeachers"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <CreateTeachers />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/getAllTeachers"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <GetAllTeachers />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/createTeacherAttendance"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <CreateTeacherAttendance />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/GetTeacherAttendanceByDate"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <GetTeacherAttendanceByDate />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* Placeholder Routes */}
      <Route
        path="/classes/:classId"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <ClassDetails/>
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/addExams"
        element={
          <ProtectedRoute>
            <CreateExams/>
          </ProtectedRoute>
        }
      />

      <Route
        path="/addClassExams"
        element={
          <ProtectedRoute>
            <CreateClassExam/>
          </ProtectedRoute>
        }
      />

      <Route
        path="/allExams"
        element={
          <ProtectedRoute>
            <GetClassExams/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/AllSubjects"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <GetAllSubjects/>
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/AddSubjects"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <CreateSubject/>
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/studentdiscipline"
        element={
          <ProtectedRoute>
            <DisciplinePage/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/studentHealth"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <HealthFile/>
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/studentFees"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <FeeFile/>
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/familyFees"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <FamilyFees/>
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacherSalaries"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <SalaryFile/>
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* Finance Routes */}
      <Route
        path="/finance"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Finance />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/finance/add"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <AddFinance />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/finance/getAll"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <GetAllFinance />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/finance/get/:financeId"
        element={
          <ProtectedRoute>
            <AdminRoute>
            <GetFinanceById />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/finance/generate-monthly"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <GenerateMonthlyFinance />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/finance/summary"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <FinanceSummary />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <ProtectedRoute>
            <NotFound/>
          </ProtectedRoute>
        }
      />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
