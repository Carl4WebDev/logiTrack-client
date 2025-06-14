import React, { useState, useEffect } from "react";
import ErrorModal from "../components/ErrorModal/ErrorModal";
const VehiclePage = () => {
  // ... existing state ...
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: "",
  });

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    id: "",
    type: "",
    plateNumber: "",
    status: "Active",
  });

  // Fetch vehicles from backend
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(
          "https://logitrack-serverz.onrender.com/api/vehicles"
        );
        if (!response.ok) throw new Error("Failed to fetch vehicles");
        const data = await response.json();
        setVehicles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Filtered vehicles based on search
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);
  const startIndex = (currentPage - 1) * vehiclesPerPage;
  const endIndex = startIndex + vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.id || !newVehicle.type || !newVehicle.plateNumber) {
      setErrorModal({
        isOpen: true,
        message: "Please fill in all fields.",
      });
      return;
    }

    try {
      const response = await fetch(
        "https://logitrack-serverz.onrender.com/api/vehicles",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newVehicle),
        }
      );

      if (!response.ok) throw new Error("Failed to add vehicle");

      const addedVehicle = await response.json();
      setVehicles([...vehicles, addedVehicle]);
      setIsModalOpen(false);
      setNewVehicle({ id: "", type: "", plateNumber: "", status: "Active" });
    } catch (err) {
      console.error("Error adding vehicle:", err);
      setErrorModal({
        isOpen: true,
        message: err.message || "Failed to add vehicle. Please try again.",
      });
    }
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  const handleUpdateVehicle = async () => {
    try {
      const response = await fetch(
        `https://logitrack-serverz.onrender.com/api/vehicles/${selectedVehicle.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedVehicle),
        }
      );

      if (!response.ok) throw new Error("Failed to update vehicle");

      const updatedVehicle = await response.json();
      setVehicles(
        vehicles.map((vehicle) =>
          vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
        )
      );
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error updating vehicle:", err);
      setErrorModal({
        isOpen: true,
        message: err.message || "Failed to update vehicle. Please try again.",
      });
    }
  };

  const handleDeleteClick = (vehicleId) => {
    setSelectedVehicle(vehicles.find((v) => v.id === vehicleId));
    setIsDeleteModalOpen(true);
  };

  const handleDeleteVehicle = async () => {
    try {
      const response = await fetch(
        `https://logitrack-serverz.onrender.com/api/vehicles/${selectedVehicle.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete vehicle");

      setVehicles(
        vehicles.filter((vehicle) => vehicle.id !== selectedVehicle.id)
      );
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      setErrorModal({
        isOpen: true,
        message: err.message || "Failed to delete vehicle. Please try again.",
      });
    }
  };

  if (loading) return <div className="p-5 text-white">Loading vehicles...</div>;
  if (error) return <div className="p-5 text-red-500">Error: {error}</div>;

  return (
    <div className="p-5 w-full">
      {/* Header and Controls */}
      <h2 className="text-3xl text-white font-bold">Vehicles</h2>
      <div className="flex flex-wrap justify-end items-center mb-4 w-full gap-2">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search vehicles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 w-full sm:w-1/3 border rounded bg-white "
        />

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setIsModalOpen(true)}
        >
          + New Vehicle
        </button>
      </div>

      {/* Table for Desktop */}
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse sm:table hidden">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-3 text-left">Vehicle ID</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Plate Number</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentVehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                className="border-b border-gray-700 text-white"
              >
                <td className="p-3">{vehicle.id}</td>
                <td className="p-3">{vehicle.type}</td>
                <td className="p-3">{vehicle.plateNumber}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      vehicle.status === "Active"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEditVehicle(vehicle)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(vehicle.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Column Layout for Small Screens */}
        <div className="flex flex-col gap-3 sm:hidden">
          {currentVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-gray-800 text-white rounded-lg p-4 border border-gray-700"
            >
              <p className="font-bold">ID: {vehicle.id}</p>
              <p>Type: {vehicle.type}</p>
              <p>Plate: {vehicle.plateNumber}</p>
              <p>
                Status:{" "}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    vehicle.status === "Active" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {vehicle.status}
                </span>
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditVehicle(vehicle)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(vehicle.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
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
            className={`px-3 py-1 rounded bg-gray-500 text-white ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={`px-3 py-1 rounded bg-blue-500 text-white ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-3/5 max-h-[80vh] p-6 rounded-lg overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Vehicle</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setIsModalOpen(false)}
              >
                ✖
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Vehicle ID</label>
                <input
                  type="text"
                  value={newVehicle.id}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, id: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  value={newVehicle.type}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, type: e.target.value })
                  }
                  placeholder="Enter vehicle type (e.g., Jetplane, Truck)"
                  className="border p-2 w-full rounded"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium">
                  Plate Number
                </label>
                <input
                  type="text"
                  value={newVehicle.plateNumber}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      plateNumber: e.target.value,
                    })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  value={newVehicle.status}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, status: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleAddVehicle}
              >
                Save
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {isEditModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-3/5 max-h-[80vh] p-6 rounded-lg overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Vehicle</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setIsEditModalOpen(false)}
              >
                ✖
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Vehicle ID</label>
                <input
                  type="text"
                  value={selectedVehicle.id}
                  readOnly
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  value={selectedVehicle.type}
                  onChange={(e) =>
                    setSelectedVehicle({
                      ...selectedVehicle,
                      type: e.target.value,
                    })
                  }
                  placeholder="Enter vehicle type"
                  className="border p-2 w-full rounded"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium">
                  Plate Number
                </label>
                <input
                  type="text"
                  value={selectedVehicle.plateNumber}
                  onChange={(e) =>
                    setSelectedVehicle({
                      ...selectedVehicle,
                      plateNumber: e.target.value,
                    })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  value={selectedVehicle.status}
                  onChange={(e) =>
                    setSelectedVehicle({
                      ...selectedVehicle,
                      status: e.target.value,
                    })
                  }
                  className="border p-2 w-full rounded"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleUpdateVehicle}
              >
                Update
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add the ErrorModal at the end */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        errorMessage={errorModal.message}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete vehicle {selectedVehicle.id}?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleDeleteVehicle}
              >
                Delete
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
    </div>
  );
};

export default VehiclePage;
