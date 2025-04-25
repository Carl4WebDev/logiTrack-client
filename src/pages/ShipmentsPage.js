import React, { useState, useContext } from "react";
import { useShipmentsContext } from "../contexts/ShipmentsProvider";
import { useAuth } from "../contexts/AuthContext";
import ErrorModal from "../components/ErrorModal/ErrorModal"; // Add this import
import * as XLSX from "xlsx";

const ShipmentsPage = () => {
  // Add error state
  const [error, setError] = useState({
    isOpen: false,
    message: "",
  });

  const { role, user } = useAuth();
  const {
    shipmentsData,
    setShipmentsData,
    handleSaveEdit,
    handleDownload,
    handleDelete,
    handleCreateNew,
    saveExcelData,
  } = useShipmentsContext();
  // State for modal visibility and form inputs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShipments, setNewShipments] = useState({
    name: "",
    description: "",
    createdAt: new Date().toISOString().split("T")[0],
    createdBy: "",
    updatedAt: new Date().toISOString().split("T")[0],
    updatedBy: user.role,
    status: "incomplete",
    file_name: "",
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the first file (if multiple files are selected, you can iterate)

    if (!file) {
      setErrors((prev) => ({ ...prev, file: "Please select a file." }));
      return;
    }

    // Get the file name
    const fileName = file.name;
    const validFileTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!validFileTypes.includes(file.type)) {
      setError({
        isOpen: true,
        message:
          "Invalid file type. Please upload an Excel file (.xlsx or .xls).",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError({
        isOpen: true,
        message: "File size exceeds 5MB. Please upload a smaller file.",
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (event) => {
      const fileBlob = new Blob([event.target.result], { type: file.type });

      // Set the file name and data to your state
      setNewShipments((prev) => ({
        ...prev,
        file_name: fileName, // Save the file name
        file_data: fileBlob,
      }));

      setErrors((prev) => ({ ...prev, file: "" })); // Clear error on valid file
    };
  };

  // Function to handle new data from the form inside ReusableTable
  const [errors, setErrors] = useState({
    name: "",
    createdBy: "",
    file: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Change this value if you want to modify items per page

  const [searchTerm, setSearchTerm] = useState("");
  const [modalSearchTerm, setModalSearchTerm] = useState(""); // For the modal

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ExcelViewer
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelTableData, setExcelTableData] = useState([]);
  const [excelFileName, setExcelFileName] = useState("");
  const [selectedExcelId, setSelectedExcelId] = useState(null);

  // Description modal
  const [selectedDescription, setSelectedDescription] = useState("");
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  // Delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null); // State to store the row to delete

  const handleSaveExcelData = async () => {
    try {
      const updatedShipment = await saveExcelData(
        selectedExcelId,
        excelTableData,
        excelFileName
      );

      // Update local state
      setShipmentsData((prev) =>
        prev.map((shipment) =>
          shipment.id === updatedShipment.id
            ? { ...shipment, ...updatedShipment }
            : shipment
        )
      );

      setIsExcelModalOpen(false);
    } catch (error) {
      setError({
        isOpen: true,
        message: `Error saving changes: ${error.message}`,
      });
    }
  };

  // Filter data based on search term and date range
  const filteredData = shipmentsData.filter((row) => {
    const matchesSearch = Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const createdAt = row.createdAt ? new Date(row.createdAt) : null;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matchesDateRange =
      (!start || (createdAt && createdAt >= start)) &&
      (!end || (createdAt && createdAt <= end));

    return matchesSearch && matchesDateRange;
  });

  // Calculate start and end index for the current page's data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Slice data to display only the current page's items
  const currentData = filteredData.slice(startIndex, endIndex);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleExcelCellChange = (rowIndex, key, value) => {
    const updatedData = [...excelTableData];
    updatedData[rowIndex][key] = value;
    setExcelTableData(updatedData);
  };

  return (
    <div className="p-5">
      {/* Title and Create Button */}
      <div className="flex justify-between items-center mb-4 ">
        <h2 className="text-3xl text-white font-bold">Shipments</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setIsModalOpen(true)}
        >
          + New Shipments
        </button>
      </div>

      {/* <ReusableTable
        data={shipmentsData}
        viewExcelFile={viewExcelFile}
        handleDownload={handleDownload}
        onEdit={handleSaveEdit}
        onDelete={handleDelete}
        setShipmentsData={setShipmentsData}
      /> */}

      {/* Modal for Adding New Shipments */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-3/5 max-h-[80vh] p-6 rounded-lg overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Shipments</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setIsModalOpen(false)}
              >
                ✖
              </button>
            </div>

            {/* Form (Two Columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newShipments.name}
                  onChange={(e) =>
                    setNewShipments({ ...newShipments, name: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Created By</label>
                <input
                  type="text"
                  name="createdBy"
                  value={newShipments.createdBy}
                  onChange={(e) =>
                    setNewShipments({
                      ...newShipments,

                      createdBy: e.target.value,
                    })
                  }
                  className="border p-2 w-full rounded"
                />
                {errors.createdBy && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.createdBy}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={newShipments.description}
                  onChange={(e) =>
                    setNewShipments({
                      ...newShipments,
                      description: e.target.value,
                    })
                  }
                  className="border p-2 w-full rounded h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={newShipments.status}
                  onChange={(e) =>
                    setNewShipments({ ...newShipments, status: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                >
                  <option value="completed">Completed</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>
            </div>

            {/* Upload Excel File */}
            <div className="mt-4">
              <label className="block text-sm font-medium">
                Upload Excel File
              </label>
              <input
                required
                type="file"
                accept=".xlsx, .xls"
                className="border p-2 w-full rounded"
                onChange={handleFileChange}
              />
            </div>

            {/* Buttons */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={async () => {
                  try {
                    await handleCreateNew(newShipments);
                    setIsModalOpen(false);
                    window.location.reload(); // 👈 force a full page reload
                    // State is already updated via context
                  } catch (err) {
                    setError({
                      isOpen: true,
                      message:
                        "Invalid file type. Please upload an Excel file (.xlsx or .xls).",
                    });
                  }
                }}
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

      <div className="p-4">
        {/* Search & Date Filters */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-4 mb-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <label className="flex items-center justify-center text-white w-full md:w-auto">
            Start Date:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded w-full md:w-auto"
          />

          <label className="flex items-center justify-center text-white w-full md:w-auto">
            End Date:
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded w-full md:w-auto"
          />
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-white p-6 rounded w-96 pointer-events-auto">
              <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
              <p>Are you sure you want to delete this row?</p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={() => {
                    handleDelete(rowToDelete); // Call the onDelete function
                    setIsDeleteModalOpen(false); // Close the modal
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

        {/* Table for Larger Screens */}
        <div className="overflow-x-auto hidden md:block">
          <table className="table-auto w-full border-collapse border border-gray-300 text-white">
            {/* Table Head */}
            <thead>
              <tr>
                {[
                  "Name",
                  "Description",
                  "Created At",
                  "Created By",
                  "Updated At",
                  "Updated By",
                  "Status",
                  "View",
                  "Download",
                  "Edit",
                  "Delete",
                ].map((header) => (
                  <th
                    key={header}
                    className="border border-gray-300 bg-gray-800 px-4 py-2 text-left"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((row, index) => (
                  <tr key={index} className="border border-gray-300">
                    <td className="p-2 text-wrap">{row.name}</td>
                    <td
                      className="p-2 max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                      onClick={() => {
                        setSelectedDescription(row.description);
                        setIsDescriptionModalOpen(true);
                      }}
                    >
                      {row.description?.length > 5
                        ? `${row.description.slice(0, 5)}...`
                        : row.description}
                    </td>

                    <td className=" text-wrap">{row.createdAt}</td>
                    <td className=" text-wrap">{row.createdBy}</td>
                    <td className=" text-wrap">{row.updatedAt}</td>
                    <td className=" text-wrap">{row.updatedBy}</td>
                    <td className="">
                      <span
                        className={`px-2 py-1 rounded text-white ${
                          row.status === "completed"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="">
                      <td className="">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          onClick={() => {
                            const reader = new FileReader();

                            reader.onload = (event) => {
                              try {
                                const workbook = XLSX.read(
                                  event.target.result,
                                  {
                                    type: "array",
                                    cellDates: true,
                                  }
                                );
                                const sheetName = workbook.SheetNames[0];
                                const sheet = workbook.Sheets[sheetName];
                                const jsonData = XLSX.utils.sheet_to_json(
                                  sheet,
                                  {
                                    raw: false,
                                  }
                                );

                                const formattedData = jsonData.map((row) => {
                                  const newRow = { ...row };
                                  Object.keys(newRow).forEach((key) => {
                                    if (newRow[key] instanceof Date) {
                                      newRow[key] =
                                        newRow[key].toLocaleDateString();
                                    }
                                  });
                                  return newRow;
                                });

                                setSelectedExcelId(row.id);
                                setExcelTableData(formattedData);
                                setExcelFileName(row.file_name);
                                setIsExcelModalOpen(true);
                              } catch (error) {
                                setError({
                                  isOpen: true,
                                  message: `Error deleting shipment: ${error.message}`,
                                });
                              }
                            };

                            reader.readAsArrayBuffer(row.file_data);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </td>
                    <td className="">
                      <button
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                        onClick={() =>
                          handleDownload(row.file_data, row.file_name)
                        }
                      >
                        {row.file_name}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                        onClick={() => {
                          setEditData(row);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        onClick={() => {
                          setRowToDelete(row.id); // Set the row to delete
                          setIsDeleteModalOpen(true); // Open the delete confirmation modal
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    className="px-4 py-3 text-center text-gray-500"
                  >
                    No matching data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Description modal */}
        {isDescriptionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded w-full max-w-md sm:max-w-lg md:w-96">
              <h2 className="text-lg font-bold mb-4">Full Description</h2>
              <p className="text-gray-700 break-words">{selectedDescription}</p>

              <div className="mt-4 flex justify-end">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => setIsDescriptionModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Excel Viewer Modal */}
        {isExcelModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-[90%] h-[90%] max-w-screen-lg max-h-[90vh] overflow-y-auto">
              {/* Editable File Name */}
              <div className="flex justify-end gap-2">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={handleSaveExcelData}
                >
                  Save
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => setIsExcelModalOpen(false)}
                >
                  Close
                </button>
              </div>

              {/* File name input */}
              <div className="mb-4 w-full">
                <label className="block mb-2 font-bold text-lg">
                  File Name:
                </label>
                <input
                  type="text"
                  value={excelFileName}
                  onChange={(e) => setExcelFileName(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                />
              </div>

              {/* Search Bar */}
              {excelTableData.length > 0 && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                </div>
              )}

              {/* Editable Excel Table */}
              {excelTableData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table-auto w-full border-collapse border border-gray-300 text-black">
                    <thead>
                      <tr>
                        {Object.keys(excelTableData[0]).map((header, index) => (
                          <th
                            key={index}
                            className="border border-gray-300 px-4 py-2 text-left min-w-[200px] whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {excelTableData
                        .filter((row) =>
                          Object.values(row)
                            .join(" ")
                            .toLowerCase()
                            .includes(modalSearchTerm.toLowerCase())
                        )
                        .map((row, rowIndex) => (
                          <tr key={rowIndex} className="border border-gray-300">
                            {Object.entries(row).map(
                              ([key, cell], cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="px-4 py-2 min-w-[200px] whitespace-nowrap"
                                >
                                  <input
                                    type="text"
                                    value={cell}
                                    onChange={(e) =>
                                      handleExcelCellChange(
                                        rowIndex,
                                        key,
                                        e.target.value
                                      )
                                    }
                                    className="border p-1 w-full"
                                  />
                                </td>
                              )
                            )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No data available.</p>
              )}
            </div>
          </div>
        )}
        {/* Column Layout for Mobile Screens */}
        <div className="block md:hidden space-y-4">
          {currentData.length > 0 ? (
            currentData.map((row, index) => (
              <div
                key={index}
                className="border p-4 rounded-lg shadow-md bg-gray-800 text-white"
              >
                <p>
                  <strong>Name:</strong> {row.name}
                </p>
                <p>
                  <strong>Description:</strong> {row.description}
                </p>
                <p>
                  <strong>Created At:</strong> {row.createdAt}
                </p>
                <p>
                  <strong>Created By:</strong> {row.createdBy}
                </p>
                <p>
                  <strong>Updated At:</strong> {row.updatedAt}
                </p>
                <p>
                  <strong>Updated By:</strong> {row.updatedBy}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      row.status === "completed" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {row.status}
                  </span>
                </p>
                <div className="flex flex-col md:flex-row gap-2 mt-2  overflow-visible">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm z-10 hover:bg-blue-700"
                    onClick={() => {
                      const reader = new FileReader();

                      reader.onload = (event) => {
                        try {
                          const workbook = XLSX.read(event.target.result, {
                            type: "array",
                            cellDates: true, // Enable parsing dates as JavaScript Date objects
                          });
                          const sheetName = workbook.SheetNames[0];
                          const sheet = workbook.Sheets[sheetName];
                          const jsonData = XLSX.utils.sheet_to_json(sheet, {
                            raw: false,
                          }); // Ensure dates are parsed as Date objects

                          // Format dates properly
                          const formattedData = jsonData.map((row) => {
                            const newRow = { ...row };
                            Object.keys(newRow).forEach((key) => {
                              if (newRow[key] instanceof Date) {
                                // Format the date as a readable string
                                newRow[key] = newRow[key].toLocaleDateString();
                              }
                            });
                            return newRow;
                          });

                          setSelectedExcelId(row.id);
                          setExcelTableData(formattedData); // Use formatted data
                          setExcelFileName(row.file_name);
                          setIsExcelModalOpen(true);
                        } catch (error) {
                          setError({
                            isOpen: true,
                            message: `Error deleting shipment: ${error.message}`,
                          });
                        }
                      };

                      reader.readAsArrayBuffer(row.file_data);
                    }}
                  >
                    View
                  </button>

                  <button
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    onClick={() => handleDownload(row.file_data)}
                  >
                    {row.file_name}
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    onClick={() => {
                      setEditData(row);
                      setIsEditModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    onClick={() => {
                      setRowToDelete(row.id); // Set the row to delete
                      setIsDeleteModalOpen(true); // Open the delete confirmation modal
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No matching data found</p>
          )}
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-3/5">
              <h2 className="text-xl font-bold mb-4">Edit Item</h2>

              {/* Name */}
              <input
                type="text"
                name="name"
                value={editData?.name || ""}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="border p-2 w-full rounded mb-2"
                placeholder="Name"
              />

              {/* Created By */}
              <input
                type="text"
                name="createdBy"
                value={editData?.createdBy || ""}
                onChange={(e) =>
                  setEditData({ ...editData, createdBy: e.target.value })
                }
                className="border p-2 w-full rounded mb-2 bg-gray-200"
                placeholder="Created By"
              />

              {/* Description */}
              <input
                type="text"
                name="description"
                value={editData?.description || ""}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                className="border p-2 w-full rounded mb-2"
                placeholder="Description"
              />

              {/* Status */}
              <select
                name="status"
                value={editData?.status || ""}
                onChange={(e) =>
                  setEditData({ ...editData, status: e.target.value })
                }
                className="border p-2 w-full rounded mb-2"
              >
                <option value="completed">Completed</option>
                <option value="incomplete">Incomplete</option>
              </select>

              {/* File Upload */}
              <input
                required
                type="file"
                name="file"
                onChange={(e) => {
                  const uploadedFile = e.target.files[0];
                  if (uploadedFile) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const newFileBlob = new Blob([event.target.result], {
                        type: uploadedFile.type,
                      });

                      // Set the file data as a Blob for backend usage
                      setEditData({
                        ...editData,
                        file_name: uploadedFile.name,
                        file_data: newFileBlob, // This is where you store the file content
                      });
                    };
                    reader.readAsArrayBuffer(uploadedFile); // Read the file as an ArrayBuffer
                  }
                }}
                className="border p-2 w-full rounded mb-2"
              />
              {editData?.file_name && (
                <p className="text-sm text-gray-500">{editData.file_name}</p>
              )}

              {/* Buttons */}
              <div className="flex justify-end">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={async () => {
                    try {
                      await handleSaveEdit(editData);
                      setIsEditModalOpen(false);
                      // State is automatically updated, no reload needed
                    } catch (error) {
                      setError({
                        isOpen: true,
                        message: `Error saving changes: ${error.message}`,
                      });
                    }
                  }}
                >
                  Save Changes
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded ml-2 hover:bg-gray-700"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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
            Page {currentPage} of{" "}
            {Math.ceil(filteredData.length / itemsPerPage)}
          </span>

          <button
            className={`px-3 py-1 rounded bg-blue-500 hover:bg-blue-700 text-white ${
              currentPage === Math.ceil(filteredData.length / itemsPerPage)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  Math.ceil(filteredData.length / itemsPerPage)
                )
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
      <ErrorModal
        isOpen={error.isOpen}
        onClose={() => setError({ ...error, isOpen: false })}
        errorMessage={error.message}
      />
    </div>
  );
};

export default ShipmentsPage;
