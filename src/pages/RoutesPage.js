import React, { useState, useEffect } from "react";
import ErrorModal from "../components/ErrorModal/ErrorModal";

const RoutesPage = () => {
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: "",
  });

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const routesPerPage = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [newRoute, setNewRoute] = useState({
    id: "",
    address: "",
    dropPoint: "",
  });

  // Fetch routes from backend
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch(
          "https://logitrack-serverz.onrender.com/api/routes"
        );
        if (!response.ok) throw new Error("Failed to fetch routes");
        const data = await response.json();
        setRoutes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  // Filtered routes based on search
  const filteredRoutes = routes.filter(
    (route) =>
      route.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.dropPoint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRoutes.length / routesPerPage);
  const startIndex = (currentPage - 1) * routesPerPage;
  const endIndex = startIndex + routesPerPage;
  const currentRoutes = filteredRoutes.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleAddRoute = async () => {
    if (!newRoute.id || !newRoute.address || !newRoute.dropPoint) {
      setErrorModal({
        isOpen: true,
        message: "Please fill in all fields.",
      });
      return;
    }

    try {
      const response = await fetch(
        "https://logitrack-serverz.onrender.com/api/routes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: newRoute.id,
            address: newRoute.address,
            dropPoint: newRoute.dropPoint,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add route");
      }

      const addedRoute = await response.json();
      setRoutes([...routes, addedRoute]);
      setIsModalOpen(false);
      setNewRoute({ id: "", address: "", dropPoint: "" });
    } catch (err) {
      console.error("Error adding route:", err);
      setErrorModal({
        isOpen: true,
        message: err.message || "Failed to add route. Please try again.",
      });
    }
  };

  const handleEditRoute = (route) => {
    setSelectedRoute(route);
    setIsEditModalOpen(true);
  };

  const handleUpdateRoute = async () => {
    try {
      const response = await fetch(
        `https://logitrack-serverz.onrender.com/api/routes/${selectedRoute.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: selectedRoute.address,
            dropPoint: selectedRoute.dropPoint,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update route");
      }

      const updatedRoute = await response.json();
      setRoutes(
        routes.map((route) =>
          route.id === updatedRoute.id ? updatedRoute : route
        )
      );
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error updating route:", err);
      setErrorModal({
        isOpen: true,
        message: err.message || "Failed to update route. Please try again.",
      });
    }
  };

  const handleDeleteClick = (routeId) => {
    setSelectedRoute(routes.find((r) => r.id === routeId));
    setIsDeleteModalOpen(true);
  };

  const handleDeleteRoute = async () => {
    try {
      const response = await fetch(
        `https://logitrack-serverz.onrender.com/api/routes/${selectedRoute.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete route");
      }

      setRoutes(routes.filter((route) => route.id !== selectedRoute.id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Error deleting route:", err);
      setErrorModal({
        isOpen: true,
        message: err.message || "Failed to delete route. Please try again.",
      });
    }
  };

  if (loading) return <div className="p-5 text-white">Loading routes...</div>;
  if (error) return <div className="p-5 text-red-500">Error: {error}</div>;

  return (
    <div className="p-5 w-full">
      {/* Header and Controls */}
      <h2 className="text-3xl text-white font-bold">Routes</h2>
      <div className="flex flex-wrap justify-end items-center mb-4 w-full gap-2">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search routes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 w-full sm:w-1/3 border rounded bg-white"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setIsModalOpen(true)}
        >
          + New Route
        </button>
      </div>

      {/* Table for Desktop */}
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse sm:table hidden">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-3 text-left">Route ID</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-left">Drop Point</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRoutes.map((route) => (
              <tr
                key={route.id}
                className="border-b border-gray-700 text-white"
              >
                <td className="p-3">{route.id}</td>
                <td className="p-3">{route.address}</td>
                <td className="p-3">{route.dropPoint}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEditRoute(route)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(route.id)}
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
          {currentRoutes.map((route) => (
            <div
              key={route.id}
              className="bg-gray-800 text-white rounded-lg p-4 border border-gray-700"
            >
              <p className="font-bold">Route ID: {route.id}</p>
              <p>Address: {route.address}</p>
              <p>Drop Point: {route.dropPoint}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditRoute(route)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(route.id)}
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

      {/* Add Route Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-3/5 max-h-[80vh] p-6 rounded-lg overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Route</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setIsModalOpen(false)}
              >
                ✖
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium">Route ID</label>
                <input
                  type="text"
                  value={newRoute.id}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, id: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                  placeholder="Enter unique route ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Address</label>
                <input
                  type="text"
                  value={newRoute.address}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, address: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Drop Point</label>
                <input
                  type="text"
                  value={newRoute.dropPoint}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, dropPoint: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleAddRoute}
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

      {/* Edit Route Modal */}
      {isEditModalOpen && selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-3/5 max-h-[80vh] p-6 rounded-lg overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Route</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setIsEditModalOpen(false)}
              >
                ✖
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium">Route ID</label>
                <input
                  type="text"
                  value={selectedRoute.id}
                  readOnly
                  className="border p-2 w-full rounded bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Address</label>
                <input
                  type="text"
                  value={selectedRoute.address}
                  onChange={(e) =>
                    setSelectedRoute({
                      ...selectedRoute,
                      address: e.target.value,
                    })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Drop Point</label>
                <input
                  type="text"
                  value={selectedRoute.dropPoint}
                  onChange={(e) =>
                    setSelectedRoute({
                      ...selectedRoute,
                      dropPoint: e.target.value,
                    })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleUpdateRoute}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        errorMessage={errorModal.message}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete route {selectedRoute.id}?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleDeleteRoute}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
