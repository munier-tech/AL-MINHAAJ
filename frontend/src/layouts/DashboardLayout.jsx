import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Bell,
  UserCog,
  User2,
  Bookmark,
  FileText,
  ClipboardList,
  Shield,
  CreditCard,
  BarChart2,
  PlusCircle,
  Search,
  FileSearch,
  Clock,
  ClipboardCheck,
  FileBarChart2,
  Layers,
  BookKey,
  BookCheck,
  HeartPulse,
  Gavel,
  CalendarCheck,
  Wallet,
  PieChart,
  UserCircle,
  List,
  RefreshCw
} from 'lucide-react';
import { Transition } from '@headlessui/react';
import useAuthStore from '../store/authStore';

const menuItems = [
  {
    text: 'Dashboard',
    icon: Home,
    path: '/dashboard',
  },
  {
    text: 'Arday',
    icon: Users,
    path: '/students',
    subItems: [
      { text: 'dhamaan Ardayda', path: '/getAllStudents', icon: Users },
      { text: 'Ku biiri Arday Cusub', path: '/createStudent', icon: PlusCircle },
      { text: 'Xogta Arday Gaara', path: '/getOneStudent', icon: FileSearch },
    ]
  },
  {
    text: 'Macalimiinta',
    icon: GraduationCap,
    path: '/getAllTeachers',
        subItems: [
      { text: 'Dhamaan Macalimiinta', path: '/getAllTeachers', icon: Users },
      { text: 'Ku Biiri Macalin Cusub', path: '/addTeachers', icon: PlusCircle },
      { text: 'Xaadiriska Macilimiinta', path: '/createTeacherAttendance', icon: CalendarCheck },
      { text: 'Taarikhda Xaadiriska', path: '/GetTeacherAttendanceByDate', icon: Clock },
      { text: 'Mushaharka Macalimiinta', path: '/teacherSalaries', icon: DollarSign },
    ]
  },
  {
    text: 'Fasalada',
    icon: BookOpen,
    path: '/classes',
    subItems: [
      { text: 'Dhamaan Fasalada', path: '/getAll', icon: Layers },
      { text: 'Fasal cusub abuur', path: '/addClass', icon: PlusCircle },
    ]
  },
  {
    text: 'Imtixaanaadka',
    icon: ClipboardList,
    path: '/allExams',
    subItems: [
      { text: 'Dhamaan Imtixinaadka Class yada', path: '/allExams', icon: BookCheck },
      { text: 'Gali imtixaan Arday Khaasa', path: '/addExams', icon: PlusCircle },
      { text: 'Gali Imtixan Fasal', path: '/addClassExams', icon: PlusCircle },
    ]
  },
    {
    text: 'Maadooyinka',
    icon: BookKey,
    path: '/AllSubjects',
    subItems: [
      { text: 'Dhamaan Maadooyinka', path: '/AllSubjects', icon: BookOpen },
      { text: 'Abuur Maado Cusub', path: '/AddSubjects', icon: PlusCircle },
    ]
  },
  {
    text: "Qur'aan & Subci",
    icon: BookOpen,
    path: '/quran-subci',
    subItems: [
      { text: "Qur'aan Diiwaan", path: '/quran', icon: BookOpen },
      { text: 'Subci Diiwaan', path: '/subci', icon: BookOpen },
      { text: 'Maamul Xalqooyin', path: '/subci/manage', icon: Layers },
    ]
  },
  {
    text: 'Arimaha Ardayga',
    icon: User2,
    path: '/studentHealth',
        subItems: [
      { text: 'Xogta Caafimadka', path: '/studentHealth', icon: HeartPulse },
      { text: 'Xogta Imtixinaadka', path: '/studentExams', icon: BookCheck },
      { text: 'Xogta Anshaxa', path: '/studentdiscipline', icon: Gavel },
    ]
  },
  {
    text: 'Arimaha Fee ga',
    icon: User2,
    path: '/studentFees',
        subItems: [
      { text: 'Fee ga Ardayga', path: '/studentFees', icon: DollarSign },
      { text: 'Fee ga Qoyska', path: '/familyFees', icon: Wallet },
    ]
  },
  {
    text: 'Xaadiris',
    icon: CalendarCheck,
    path: '/attendance',
    subItems: [
      { text: 'Raadi Xaadiriska', path: '/AttendanceByDate', icon: FileSearch },
      { text: 'Abuur Xaadirska Fasalka', path: '/createAttendance', icon: ClipboardCheck },
    ]
  },
    {
    text: 'Dhaqaalaha',
    icon: DollarSign,
    path: '/finance',
    subItems: [
      { text: 'Maamulka Dhaqaalaha', path: '/finance', icon: DollarSign },
      { text: 'Ku dar Dhaqaale Cusub', path: '/finance/add', icon: PlusCircle },
      { text: 'Faahfaahinta Dhaqaalaha', path: '/finance/summary', icon: PieChart },
      { text: 'Eeg Dhammaan', path: '/finance/getAll', icon: List },
    ]
  },
  {
    text: 'Maamulka isticmaalayaasha',
    icon: UserCog,
    path: '/users',
    adminOnly: true,
    subItems: [
      { text: 'DHamaan isticmaalayaasha', path: '/getAllUsers', icon: Users },
      { text: 'Abuur isticmaale', path: '/signup', icon: PlusCircle },
    ]
  },
];

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeParent, setActiveParent] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  
  const mainContentRef = useRef(null);
  const childrenContainerRef = useRef(null);

  useEffect(() => {
    setSidebarOpen(false);
    
    if (childrenContainerRef.current) {
      childrenContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    const currentParent = menuItems.find(item => location.pathname.startsWith(item.path));
    if (currentParent && currentParent.subItems) {
      setActiveParent(currentParent.text);
    } else {
      setActiveParent(null);
    }

  }, [location.pathname]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setProfileDropdownOpen(false);
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    return true;
  });
  
  const SidebarContent = ({ onItemClick }) => (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
            <img src="/minhaaj.jpg" alt="Logo" className='h-8 w-8 rounded-full' />
<div className='grid'>
            <span className="text-xl font-bold text-white">MARAAKIS </span>
            <span className="text-xl font-bold text-white"> AL-MINHAAJ</span>
</div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-400 hover:text-white focus:outline-none"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          const isParentActive = activeParent === item.text;

          return (
            <div key={item.text}>
              <button
                onClick={() => {
                  if (item.subItems?.length > 0) {
                    setActiveParent(isParentActive ? null : item.text);
                  } else {
                    navigate(item.path);
                    if (onItemClick) onItemClick();
                  }
                }}
                className={`w-full flex items-center px-4 py-2.5 text-left rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3`} />
                <span className="text-sm">{item.text}</span>
                {item.subItems?.length > 0 && (
                  <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                    isParentActive ? 'rotate-180' : ''
                  }`} />
                )}
              </button>
              {item.subItems?.length > 0 && isParentActive && (
                <div className="ml-6 space-y-1 mt-1">
                  {item.subItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubItemActive = location.pathname === subItem.path;
                    return (
                      <button
                        key={subItem.text}
                        onClick={() => {
                          navigate(subItem.path);
                          if (onItemClick) onItemClick();
                        }}
                        className={`w-full flex items-center px-3 py-2 text-left text-sm rounded-lg transition-all duration-200 ${
                          isSubItemActive
                            ? 'bg-purple-700 text-white font-medium'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <SubIcon className={`w-4 h-4 mr-3`} />
                        {subItem.text}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-gray-700 flex items-center space-x-3">
        <UserCircle className="w-8 h-8 text-gray-400" />
        <div className="text-left">
          <p className="text-sm font-medium text-gray-200">{user?.username || ''}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role || ''}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-gray-100 antialiased">
      {/* Mobile sidebar */}
      <Transition
        show={sidebarOpen}
        enter="transition-transform ease-out duration-300"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition-transform ease-in duration-300"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        {(ref) => (
          <div ref={ref} className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 shadow-xl lg:hidden">
            <SidebarContent onItemClick={() => setSidebarOpen(false)} />
          </div>
        )}
      </Transition>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-6">
          <div className="flex items-center">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {menuItems.find(item => location.pathname.startsWith(item.path))?.text || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <Transition
                show={notificationsOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                {(ref) => (
                  <div
                    ref={ref}
                    className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
                        Notifications
                      </div>
                      <div className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm font-medium text-gray-900">New exam scheduled</p>
                        <p className="text-xs text-gray-500 mt-1">Math final exam on Friday</p>
                        <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm font-medium text-gray-900">New student registered</p>
                        <p className="text-xs text-gray-500 mt-1">Ahmed Mohamed joined Class 10</p>
                        <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                      </div>
                      <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 text-center">
                        <a href="#" className="text-xs font-medium text-purple-600 hover:text-purple-800">
                          View all
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </Transition>
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {user?.username?.charAt(0).toUpperCase() || ''}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <Transition
                show={profileDropdownOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                {(ref) => (
                  <div
                    ref={ref}
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <div className="py-1">
                      <div className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{user?.username || ''}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                       <p className="text-xs border px-2 font-bold py-1 w-fit rounded-xl my-1 bg-violet-800 text-white truncate">
                          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || ''}
                        </p>
                      </div>
                      <div className="border-t border-gray-100">
                      </div>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-red-600"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Transition>
          </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div ref={mainContentRef} className="flex-1 overflow-hidden">
          <main ref={childrenContainerRef} className="h-full overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
                          <footer className="mt-8 text-center text-sm text-gray-500">
                <p>AL-MINHAAJ Management System © {new Date().getFullYear()}</p>
                <p className="mt-1">Version 1.0.0 - Designed with passion for education</p>
              </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;