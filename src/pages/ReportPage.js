import React from "react";
import { useShipmentsContext } from "../contexts/ShipmentsProvider";
import { useCustomersContext } from "../contexts/CustomersProvider";
import { useSummaryContext } from "../contexts/SummaryProvider";
import { useDispatchOutputContext } from "../contexts/DispatchOutputProvider";
import { useDeliveryForwardContext } from "../contexts/DeliveryForwardProvider ";
import { useItemSnapshotContext } from "../contexts/ItemSnapshotProvider";
import { useItemActivityLogContext } from "../contexts/ItemActivityLogProvider";

import { useState, useMemo, useEffect } from "react";

const ReportPage = () => {
  const { shipmentsData } = useShipmentsContext();
  const { customersData } = useCustomersContext();
  const { summaryData } = useSummaryContext();
  const { dispatchOutputData } = useDispatchOutputContext();
  const { deliveryForwardData } = useDeliveryForwardContext();
  const { itemSnapshotsData } = useItemSnapshotContext();
  const { itemActivityLogData } = useItemActivityLogContext();

  const [combinedData, setCombinedData] = useState([]);

  useEffect(() => {
    const combined = [
      ...shipmentsData.map((item) => ({ ...item, type: "Shipment" })),
      ...customersData.map((item) => ({ ...item, type: "Customer" })),
      ...summaryData.map((item) => ({ ...item, type: "Summary" })),
      ...dispatchOutputData.map((item) => ({
        ...item,
        type: "Dispatch Output",
      })),
      ...deliveryForwardData.map((item) => ({
        ...item,
        type: "Delivery Forward Data",
      })),
      ...itemSnapshotsData.map((item) => ({ ...item, type: "Item Snapshots" })),
      ...itemActivityLogData.map((item) => ({
        ...item,
        type: "Item Activity Log",
      })),
    ];

    setCombinedData(combined);
  }, [
    shipmentsData,
    customersData,
    summaryData,
    dispatchOutputData,
    deliveryForwardData,
    itemSnapshotsData,
    itemActivityLogData,
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("none");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce effect
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Update your filteredData useMemo to include these basic sorts:
  const filteredData = useMemo(() => {
    let data = [...combinedData];

    // Filtering logic (keep your existing debounced search exactly the same)
    if (debouncedSearchTerm.trim()) {
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase().trim();
      data = data.filter((item) => {
        if (item.name?.toLowerCase().includes(lowerSearchTerm)) return true;
        if (item.type?.toLowerCase().includes(lowerSearchTerm)) return true;
        if (item.status?.toLowerCase().includes(lowerSearchTerm)) return true;
        return false;
      });
    }

    // Basic sorting options (add these cases to your existing switch statement)
    switch (sortOption) {
      case "date-newest":
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "date-oldest":
        data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "name-asc":
        data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        data.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "status":
        data.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
        break;
      default:
        // No sorting
        break;
    }

    return data;
  }, [combinedData, debouncedSearchTerm, sortOption]);

  return (
    <div className="p-4 min-w-full z-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl text-white font-bold">Reports</h2>
        <div className="relative group">
          <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-1">
            Sort Options <span>▼</span>
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded shadow-lg z-10 hidden group-hover:block">
            <div className="py-1">
              <button
                onClick={() => setSortOption("date-newest")}
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
              >
                Date (Newest First)
              </button>
              <button
                onClick={() => setSortOption("date-oldest")}
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
              >
                Date (Oldest First)
              </button>
              <button
                onClick={() => setSortOption("name-asc")}
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
              >
                Name (A-Z)
              </button>
              <button
                onClick={() => setSortOption("name-desc")}
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
              >
                Name (Z-A)
              </button>
              <button
                onClick={() => setSortOption("status")}
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
              >
                By Status
              </button>
              <button
                onClick={() => setSortOption("none")}
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 border-t border-gray-700"
              >
                Reset Sorting
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, type, or status..."
          className="w-full p-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Rest of your component remains exactly the same */}
      {/* Mobile Card Layout */}
      <div className="flex flex-col gap-3 md:hidden">
        {filteredData.length > 0 ? (
          filteredData.map((row) => (
            <div
              key={`${row.type}-${row.id}`}
              className="bg-gray-800 text-white rounded-lg p-4 border border-gray-700"
            >
              <p className="font-bold">ID: {row.id || "-"}</p>
              <p>Type: {row.type || "-"}</p>
              <p>Name: {row.name || "-"}</p>
              <p>Created: {row.createdAt || "-"}</p>
              <p>By: {row.createdBy || "-"}</p>
              <p className="flex items-center gap-1">
                Status:{" "}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    row.status === "completed"
                      ? "bg-green-500"
                      : row.status
                      ? "bg-red-500"
                      : "bg-gray-500"
                  }`}
                >
                  {row.status || "unknown"}
                </span>
              </p>
              <p className="truncate">File: {row.file_name || "-"}</p>
            </div>
          ))
        ) : (
          <div className="bg-gray-800 text-gray-400 rounded-lg p-4 border border-gray-700 text-center">
            {combinedData.length === 0
              ? "No data available"
              : "No matching data found"}
          </div>
        )}
      </div>

      {/* Table Layout */}
      <div className="hidden md:block relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3 text-left border-b border-gray-700">Type</th>
              <th className="p-3 text-left border-b border-gray-700">ID</th>
              <th className="p-3 text-left border-b border-gray-700">Name</th>
              <th className="p-3 text-left border-b border-gray-700">
                Created At
              </th>
              <th className="p-3 text-left border-b border-gray-700">
                Created By
              </th>
              <th className="p-3 text-left border-b border-gray-700">Status</th>
              <th className="p-3 text-left border-b border-gray-700">
                File Name
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr
                  key={`${row.type}-${row.id}`}
                  className="border-b border-gray-700 text-white hover:bg-gray-600 transition-colors"
                >
                  <td className="p-3 whitespace-nowrap">{row.type || "-"}</td>
                  <td className="p-3 whitespace-nowrap">{row.id || "-"}</td>
                  <td className="p-3 whitespace-nowrap">{row.name || "-"}</td>
                  <td className="p-3 whitespace-nowrap">
                    {row.createdAt || "-"}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {row.createdBy || "-"}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        row.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : row.status
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {row.status || "unknown"}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap truncate max-w-xs">
                    {row.file_name || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="p-4 text-center text-gray-400 bg-gray-800"
                >
                  {combinedData.length === 0
                    ? "No data available"
                    : "No matching data found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportPage;
