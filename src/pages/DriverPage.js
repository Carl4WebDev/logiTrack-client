import React, { useState, useEffect } from "react";
import ErrorModal from "../components/ErrorModal/ErrorModal";

const DriverPage = () => {
  // ... existing state ...
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: "",
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: "",
    licenseNumber: "",
    vehicleAssigned: "",
    status: "Active",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/drivers");
        if (!response.ok) {
          throw new Error("Failed to fetch drivers");
        }
        const drivers = await response.json();
        setData(drivers);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const itemsPerPage = 5;

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/drivers/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete driver");
      setData(data.filter((driver) => driver.id !== id)); // Update state
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Error operation:", err);
      setErrorModal({
        isOpen: true,
        message:
          err.message || "Failed to perform operation. Please try again.",
      });
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleEdit = (driver) => {
    setSelectedDriver({
      ...driver,
      vehicleAssigned: driver.vehicleAssigned || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/drivers/${selectedDriver.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedDriver),
        }
      );
      if (!response.ok) throw new Error("Failed to update driver");
      const updatedDriver = await response.json();
      setData(
        data.map((driver) =>
          driver.id === updatedDriver.id ? updatedDriver : driver
        )
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error operation:", err);
      setErrorModal({
        isOpen: true,
        message:
          err.message || "Failed to perform operation. Please try again.",
      });
    }
  };

  const [formErrors, setFormErrors] = useState({
    name: false,
    licenseNumber: false,
    vehicleAssigned: false,
  });

  const validateForm = () => {
    const errors = {
      name: !newDriver.name,
      licenseNumber: !newDriver.licenseNumber,
      vehicleAssigned: !newDriver.vehicleAssigned,
    };
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleAddDriver = async () => {
    // Validate before submitting
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDriver),
      });

      if (!response.ok) throw new Error("Failed to add driver");

      const addedDriver = await response.json();
      setData([...data, addedDriver]);
      setIsAddModalOpen(false);
      setNewDriver({
        name: "",
        licenseNumber: "",
        vehicleAssigned: "",
        status: "Active",
      });
      setFormErrors({
        name: false,
        licenseNumber: false,
        vehicleAssigned: false,
      }); // Reset errors
    } catch (err) {
      console.error("Error adding driver:", err);
      setErrorModal({
        isOpen: true,
        message: err.message || "Failed to add driver. Please try again.",
      });
    }
  };

  const [vehicles, setVehicles] = useState([]);
  // Active Vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/vehicles-drivers"
        );
        if (!response.ok) throw new Error("Failed to fetch vehicles");
        const data = await response.json();
        setVehicles(data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      }
    };
    fetchVehicles();
  }, []);

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 w-full">
      <h2 className="text-3xl text-white font-bold">Drivers</h2>
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search driver..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 p-2 rounded w-1/3 mr-4"
        />

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add New Driver
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-white p-6 rounded w-96 pointer-events-auto">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this driver?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => handleDelete(driverToDelete)}
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

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-white p-6 rounded w-96 pointer-events-auto">
            <h2 className="text-lg font-bold mb-4">Edit Driver</h2>
            <input
              type="text"
              placeholder="Name"
              value={selectedDriver?.name || ""}
              onChange={(e) =>
                setSelectedDriver({ ...selectedDriver, name: e.target.value })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="License Number"
              value={selectedDriver?.licenseNumber || ""}
              onChange={(e) =>
                setSelectedDriver({
                  ...selectedDriver,
                  licenseNumber: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="Vehicle Assigned"
              value={selectedDriver?.vehicleAssigned || ""}
              onChange={(e) =>
                setSelectedDriver({
                  ...selectedDriver,
                  vehicleAssigned: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />

            <select
              value={selectedDriver?.vehicleAssigned || ""}
              onChange={(e) =>
                setSelectedDriver({
                  ...selectedDriver,
                  vehicleAssigned: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plateNumber} ({vehicle.type})
                </option>
              ))}
            </select>
            <select
              value={selectedDriver?.status || ""}
              onChange={(e) =>
                setSelectedDriver({
                  ...selectedDriver,
                  status: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded ml-2 hover:bg-gray-700"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
          <div className="bg-white p-6 rounded-lg w-96">
            {/* ... other modal content ... */}

            <div className="mb-4">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={newDriver.name}
                onChange={(e) =>
                  setNewDriver({ ...newDriver, name: e.target.value })
                }
                className={`border p-2 w-full rounded ${
                  formErrors.name ? "border-red-500" : ""
                }`}
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">Name is required</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">
                License Number
              </label>
              <input
                type="text"
                value={newDriver.licenseNumber}
                onChange={(e) =>
                  setNewDriver({ ...newDriver, licenseNumber: e.target.value })
                }
                className={`border p-2 w-full rounded ${
                  formErrors.licenseNumber ? "border-red-500" : ""
                }`}
              />
              {formErrors.licenseNumber && (
                <p className="text-red-500 text-xs mt-1">
                  License number is required
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">
                Vehicle Assigned
              </label>
              <select
                value={newDriver.vehicleAssigned}
                onChange={(e) =>
                  setNewDriver({
                    ...newDriver,
                    vehicleAssigned: e.target.value,
                  })
                }
                className={`border p-2 w-full rounded ${
                  formErrors.vehicleAssigned ? "border-red-500" : ""
                }`}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNumber} ({vehicle.type})
                  </option>
                ))}
              </select>
              {formErrors.vehicleAssigned && (
                <p className="text-red-500 text-xs mt-1">
                  Vehicle assignment is required
                </p>
              )}
            </div>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={handleAddDriver}
            >
              Add
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded ml-2"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Table for Larger Screens */}
      <div className="overflow-x-auto">
        <table className="hidden md:table table-auto w-full border-collapse border border-gray-300 text-white">
          <thead>
            <tr>
              {[
                "Name",
                "License Number",
                "Vehicle Assigned",
                "Status",
                "Edit",
                "Delete",
              ].map((header) => (
                <th
                  key={header}
                  className="border border-gray-300 bg-gray-800 px-4 py-2 min-w-[150px] text-center"
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
                <td>{row.licenseNumber}</td>
                <td>{row.vehicleAssigned}</td>
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
                    onClick={() => {
                      setDriverToDelete(row.id); // Set the driver to delete
                      setIsDeleteModalOpen(true); // Open the delete confirmation modal
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Column Display for Small Screens */}
        <div className="md:hidden flex flex-col gap-4">
          {currentData.map((row, index) => (
            <div
              key={index}
              className="border border-gray-300 p-4 rounded bg-gray-800 text-white"
            >
              <p>
                <strong>Name:</strong> {row.name}
              </p>
              <p>
                <strong>License Number:</strong> {row.licenseNumber}
              </p>
              <p>
                <strong>Vehicle Assigned:</strong> {row.vehicleAssigned}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded text-white ${
                    row.status === "Active" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {row.status}
                </span>
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                  onClick={() => handleEdit(row)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  onClick={() => {
                    setDriverToDelete(row.id); // Set the driver to delete
                    setIsDeleteModalOpen(true); // Open the delete confirmation modal
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Add the ErrorModal at the end */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        errorMessage={errorModal.message}
      />

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

export default DriverPage;
