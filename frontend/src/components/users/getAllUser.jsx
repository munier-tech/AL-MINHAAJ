import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiEdit2, 
  FiTrash2, 
  FiUserPlus,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const GetAllUser = () => {
  const navigate = useNavigate();
  const {
    users,
    fetchAllUsers,
    updateUser,
    deleteUser,
    userLoading,
    user
  } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedUser, setEditedUser] = useState({
    username: '',
    email: '',
    role: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'username',
    direction: 'ascending'
  });

  // Fetch users on mount
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Handle search and sort
  const filteredUsers = (users || [])
    .filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Edit handlers
  const startEdit = (user) => {
    setEditingId(user._id);
    setEditedUser({
      username: user.username,
      email: user.email,
      role: user.role
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedUser({
      username: '',
      email: '',
      role: ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitEdit = async () => {
    if (!editedUser.username || !editedUser.email || !editedUser.role) {
      toast.error('Please fill all fields');
      return;
    }

    await updateUser(editingId, editedUser);
    setEditingId(null);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(userId);
    }
  };

  // Don't allow non-admins to access this page
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-red-800">Permission Denied</h3>
          <p className="mt-2 text-sm text-red-700">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={() => navigate('/signup')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FiUserPlus className="mr-2" />
          Add New User
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('username')}
                >
                  <div className="flex items-center">
                    Username
                    {sortConfig.key === 'username' && (
                      sortConfig.direction === 'ascending' ? 
                        <FiChevronUp className="ml-1" /> : 
                        <FiChevronDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {sortConfig.key === 'email' && (
                      sortConfig.direction === 'ascending' ? 
                        <FiChevronUp className="ml-1" /> : 
                        <FiChevronDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('role')}
                >
                  <div className="flex items-center">
                    Role
                    {sortConfig.key === 'role' && (
                      sortConfig.direction === 'ascending' ? 
                        <FiChevronUp className="ml-1" /> : 
                        <FiChevronDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userLoading && filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                (filteredUsers || []).map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === user._id ? (
                        <input
                          type="text"
                          name="username"
                          value={editedUser.username}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === user._id ? (
                        <input
                          type="email"
                          name="email"
                          value={editedUser.email}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === user._id ? (
                        <select
                          name="role"
                          value={editedUser.role}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1"
                        >
                          <option value="admin">Admin</option>
                          <option value="teacher">Teacher</option>
                          <option value="student">Student</option>
                        </select>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.role === 'teacher'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === user._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={submitEdit}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <FiCheck className="mr-1" /> Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <FiX className="mr-1" /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(user)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <FiEdit2 className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                            disabled={user._id === useAuthStore.getState().user?._id}
                          >
                            <FiTrash2 className="mr-1" /> Delete
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
      </div>
    </div>
  );
};

export default GetAllUser;