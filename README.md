# AL-MINHAAJ Management System

A comprehensive school management system built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring modern UI with Material-UI.

## Features

### Backend (Completed)
- ✅ **Authentication System**: JWT-based authentication with role-based access control
- ✅ **Student Management**: CRUD operations, fee tracking, class assignment
- ✅ **Teacher Management**: Complete teacher profile management
- ✅ **Class Management**: Class creation, teacher assignment, student enrollment
- ✅ **Attendance System**: Attendance tracking and reporting
- ✅ **Finance Management**: Fee tracking and payment management
- ✅ **Security**: Rate limiting, CORS, helmet protection
- ✅ **Database**: MongoDB with Mongoose ODM

### Frontend (In Progress)
- ✅ **Modern React App**: Built with Vite for fast development
- ✅ **Material-UI**: Professional, responsive design
- ✅ **Authentication**: Login/logout with JWT integration
- ✅ **Dashboard**: Statistics overview and quick actions
- ✅ **Student Management**: Complete CRUD interface with data grid
- ✅ **State Management**: Zustand for efficient state handling
- ✅ **Form Validation**: React Hook Form with Yup validation
- ✅ **Responsive Design**: Mobile-first approach

### Coming Soon
- 🔄 **Teachers Management Page**: Complete teacher interface
- 🔄 **Classes Management Page**: Class administration
- 🔄 **Attendance Interface**: Visual attendance tracking
- 🔄 **Finance Dashboard**: Payment tracking and reports
- 🔄 **Reports & Analytics**: Data visualization with charts
- 🔄 **User Profile Management**: Account settings
- 🔄 **Export/Import**: Excel/CSV data handling

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **Redis** - Caching (configured)

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Material-UI (MUI)** - UI components
- **React Router** - Navigation
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Yup** - Validation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Project Structure

```
al-minhaaj-management-system/
├── backend/
│   ├── controllers/        # Business logic
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── middlewares/       # Custom middleware
│   ├── lib/               # Database connection
│   ├── helpers/           # Utility functions
│   └── index.js           # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd al-minhaaj-management-system
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Environment Setup**
Create `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/al-minhaaj-db
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
REDIS_URL=redis://localhost:6379
```

5. **Start the development servers**

**Option 1: Run both servers simultaneously (from backend directory)**
```bash
npm run dev:both
```

**Option 2: Run servers separately**

Backend (from backend directory):
```bash
npm run dev
```

Frontend (from frontend directory):
```bash
npm run dev
```

### Default URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api (coming soon)

## API Endpoints

### Authentication
- `POST /api/auth/signUp` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/WhoAmI` - Get current user
- `POST /api/auth/changePassword` - Change password

### Students
- `GET /api/students/getAll` - Get all students
- `GET /api/students/getId/:id` - Get student by ID
- `POST /api/students/create` - Create new student
- `PUT /api/students/update/:id` - Update student
- `DELETE /api/students/delete/:id` - Delete student
- `POST /api/students/:studentId/:classId` - Assign student to class
- `PATCH /api/students/track-fee/:id` - Track fee payment

### Teachers
- `GET /api/teachers/getAll` - Get all teachers
- `GET /api/teachers/getById/:id` - Get teacher by ID
- `POST /api/teachers/create` - Create new teacher
- `PUT /api/teachers/update/:id` - Update teacher
- `DELETE /api/teachers/delete/:id` - Delete teacher

### Classes
- `GET /api/classes/getAll` - Get all classes
- `GET /api/classes/getById/:id` - Get class by ID
- `POST /api/classes/create` - Create new class
- `PUT /api/classes/update/:id` - Update class
- `DELETE /api/classes/delete/:id` - Delete class

### Attendance
- `GET /api/attendance/getAll` - Get all attendance records
- `GET /api/attendance/getById/:id` - Get attendance by ID
- `POST /api/attendance/create` - Create attendance record
- `PUT /api/attendance/update/:id` - Update attendance
- `DELETE /api/attendance/delete/:id` - Delete attendance

## Development Recommendations

### Immediate Next Steps
1. **Complete remaining pages**: Teachers, Classes, Attendance, Finance
2. **Add data visualization**: Charts and graphs for analytics
3. **Implement real-time features**: WebSocket for live updates
4. **Add export functionality**: PDF reports, Excel exports
5. **Mobile responsiveness**: Ensure perfect mobile experience
6. **Testing**: Unit and integration tests
7. **Documentation**: API documentation with Swagger

### Performance Optimizations
1. **Frontend**: Implement React.lazy for code splitting
2. **Backend**: Add Redis caching for frequently accessed data
3. **Database**: Index optimization for better query performance
4. **Images**: Implement image compression and lazy loading

### Security Enhancements
1. **Input validation**: Comprehensive server-side validation
2. **Rate limiting**: API endpoint protection
3. **HTTPS**: SSL certificate implementation
4. **Environment variables**: Secure configuration management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email your-email@example.com or create an issue in the repository.

---

**AL-MINHAAJ Management System** - Empowering educational institutions with modern technology.