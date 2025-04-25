import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const Accounts = () => {
  const { usersData, updateUserRole, deleteUser } = useAuth();

  // State for search and pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Filter users based on search query
  const filteredUsers = usersData.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.role?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUser = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // if (loading) return <div className="p-4 text-white">Loading users...</div>;
  // if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 w-full">
      <h1 className="text-2xl font-bold mb-4 text-white">User Accounts</h1>

      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 p-2 rounded w-1/3 mr-4 text-black"
        />
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this user?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => {
                  deleteUser(userToDelete);
                  setIsDeleteModalOpen(false);
                }}
              >
                Yes, Delete
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-gray-300 px-4 py-2">Full Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Role</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUser.map((user) => (
              <tr key={user._id} className="border border-gray-300 text-white">
                <td className="p-2">{user.full_name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2 text-center">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="border border-gray-300 p-1 rounded bg-white text-black"
                    disabled={user.id === currentUser?.id}
                  >
                    <option value="admin">Admin</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="driver">Driver</option>
                  </select>
                </td>
                <td className="p-2 text-center">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                    onClick={() => {
                      setUserToDelete(user.id);
                      setIsDeleteModalOpen(true);
                    }}
                    disabled={user.id === currentUser?.id}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredUsers.length > usersPerPage && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            className={`px-3 py-1 rounded bg-gray-500 hover:bg-gray-700 text-white ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-white">
            Page {currentPage} of{" "}
            {Math.ceil(filteredUsers.length / usersPerPage)}
          </span>
          <button
            className={`px-3 py-1 rounded bg-blue-500 hover:bg-blue-700 text-white ${
              currentPage === Math.ceil(filteredUsers.length / usersPerPage)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  Math.ceil(filteredUsers.length / usersPerPage)
                )
              )
            }
            disabled={
              currentPage === Math.ceil(filteredUsers.length / usersPerPage)
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Accounts;
