import React, { useState } from "react";

const EmployeePage = () => {
  const [data, setData] = useState([
    {
      id: 1,
      name: "John Doe",
      position: "Manager",
      department: "Sales",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      position: "Developer",
      department: "IT",
      status: "Inactive",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    position: "Manager",
    department: "Sales",
    status: "Active",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 5;

  const positions = ["Manager", "Developer", "Designer"];
  const departments = ["Sales", "IT", "Marketing"];

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDelete = (id) => {
    setData((prevData) => prevData.filter((item) => item.id !== id));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === selectedEmployee.id ? selectedEmployee : item
      )
    );
    setIsModalOpen(false);
  };

  const handleAddEmployee = () => {
    const newId = data.length + 1;
    setData([...data, { id: newId, ...newEmployee }]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-4 w-full">
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search employee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 p-2 rounded w-1/3 mr-4"
        />

        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add New Employee
        </button>
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto">
        <table className="hidden md:table table-auto w-full border-collapse border border-gray-300 text-white">
          <thead>
            <tr>
              {[
                "Name",
                "Position",
                "Department",
                "Status",
                "Edit",
                "Delete",
              ].map((header) => (
                <th
                  key={header}
                  className="border border-gray-300 bg-gray-800 px-4 py-2 text-center"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, index) => (
              <tr key={index} className="border border-gray-300">
                <td className="p-2">{row.name}</td>
                <td>{row.position}</td>
                <td>{row.department}</td>
                <td className="text-center">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      row.status === "Active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    onClick={() => handleEdit(row)}
                  >
                    Edit
                  </button>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    onClick={() => handleDelete(row.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Edit Employee</h2>

            <input
              type="text"
              placeholder="Name"
              value={selectedEmployee?.name || ""}
              onChange={(e) =>
                setSelectedEmployee({
                  ...selectedEmployee,
                  name: e.target.value,
                })
              }
              className="w-full border border-gray-300 p-2 rounded mb-2"
            />

            <select
              value={selectedEmployee?.position || "Manager"}
              onChange={(e) =>
                setSelectedEmployee({
                  ...selectedEmployee,
                  position: e.target.value,
                })
              }
              className="w-full border border-gray-300 p-2 rounded mb-2"
            >
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>

            <select
              value={selectedEmployee?.department || "Sales"}
              onChange={(e) =>
                setSelectedEmployee({
                  ...selectedEmployee,
                  department: e.target.value,
                })
              }
              className="w-full border border-gray-300 p-2 rounded mb-4"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={selectedEmployee?.status || "Active"}
              onChange={(e) =>
                setSelectedEmployee({
                  ...selectedEmployee,
                  status: e.target.value,
                })
              }
              className="w-full border border-gray-300 p-2 rounded mb-4"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Add New Employee</h2>

            <input
              type="text"
              placeholder="Name"
              value={newEmployee.name}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, name: e.target.value })
              }
              className="w-full border border-gray-300 p-2 rounded mb-2"
            />

            <select
              value={newEmployee.position}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, position: e.target.value })
              }
              className="w-full border border-gray-300 p-2 rounded mb-2"
            >
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>

            <select
              value={newEmployee.department}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, department: e.target.value })
              }
              className="w-full border border-gray-300 p-2 rounded mb-4"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={newEmployee.status}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, status: e.target.value })
              }
              className="w-full border border-gray-300 p-2 rounded mb-4"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleAddEmployee}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile View (Card Layout) */}
      <div className="md:hidden">
        {currentData.map((employee) => (
          <div
            key={employee.id}
            className="border border-gray-300 p-4 rounded-lg mb-2 bg-gray-800 text-white"
          >
            <p>
              <strong>Name:</strong> {employee.name}
            </p>
            <p>
              <strong>Position:</strong> {employee.position}
            </p>
            <p>
              <strong>Department:</strong> {employee.department}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded ${
                  employee.status === "Active" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {employee.status}
              </span>
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700bg-green-500"
                onClick={() => handleEdit(employee)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                onClick={() => handleDelete(employee.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination Controls */}
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
          Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}
        </span>
        <button
          className={`px-3 py-1 rounded bg-blue-500 hover:bg-blue-700 text-white ${
            currentPage === Math.ceil(filteredData.length / itemsPerPage)
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage))
            )
          }
          disabled={
            currentPage === Math.ceil(filteredData.length / itemsPerPage)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmployeePage;
