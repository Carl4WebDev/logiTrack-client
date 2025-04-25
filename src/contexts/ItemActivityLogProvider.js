import React, { createContext, useContext, useState, useEffect } from "react";
import * as XLSX from "xlsx";

// Create the context
const ItemActivityLogContext = createContext();

// Provider component
export const ItemActivityLogProvider = ({ children, initialData = [] }) => {
  // State to manage table data
  const [itemActivityLogData, setItemActivityLogData] = useState([]);

  useEffect(() => {
    const fetchItemActivityLogs = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/item-activity-logs"
        ); // Your API endpoint
        const data = await response.json();
        const processed = data.map((log) => ({
          ...log,
          file_data: new Blob([new Uint8Array(log.file_data.data)], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          file_name: log.file_name || "file.xlsx",
        }));

        setItemActivityLogData(processed);
      } catch (err) {
        console.error("Failed to load item activity logs:", err);
      }
    };

    fetchItemActivityLogs();
  }, []);

  // handleSaveEdit function to update log data
  const handleSaveEdit = async (editedData) => {
    const formData = new FormData();

    // Append all editable fields
    formData.append("name", editedData.name);
    formData.append("description", editedData.description);
    formData.append("status", editedData.status);
    formData.append("createdBy", editedData.createdBy);

    // Only append file if it was changed
    if (editedData.file_data instanceof Blob) {
      formData.append("file_data", editedData.file_data, editedData.file_name);
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/item-activity-logs/${editedData.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update item activity log");
      }

      const updatedLog = await response.json();

      // Update state without reloading the page
      setItemActivityLogData((prev) =>
        prev.map((log) =>
          log.id === editedData.id
            ? {
                ...log,
                ...updatedLog,
                // Preserve the Blob if we didn't get it from the server
                file_data: updatedLog.file_data
                  ? new Blob([new Uint8Array(updatedLog.file_data.data)], {
                      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    })
                  : log.file_data,
              }
            : log
        )
      );

      return updatedLog;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleDelete = async (logId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/item-activity-logs/${logId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete item activity log.");
      }

      // Remove deleted log from state
      setItemActivityLogData((prevData) =>
        prevData.filter((log) => log.id !== logId)
      );

      console.log(`Item activity log with ID ${logId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting item activity log:", error);
    }
  };

  const handleDownload = (fileData, fileName) => {
    const url = URL.createObjectURL(fileData);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "default_filename.xlsx"; // Add fallback

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateNew = async (newLog) => {
    const formData = new FormData();

    // Append basic log details
    formData.append("name", newLog.name);
    formData.append("createdBy", newLog.createdBy);
    formData.append("description", newLog.description);
    formData.append("status", newLog.status);

    // Debug log
    console.log("Sending file_name:", newLog.file_name);

    // Append file data with its original name
    formData.append("file_data", newLog.file_data, newLog.file_name);

    try {
      const response = await fetch(
        "http://localhost:4000/api/item-activity-logs",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setItemActivityLogData((prev) => [...prev, newLog]);
        console.log("Item activity log uploaded!");
      } else {
        const err = await response.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong.");
    }
  };

  const saveExcelData = async (logId, excelData, fileName) => {
    try {
      // Convert data to Excel file
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const excelBuffer = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx",
      });

      // Prepare form data
      const formData = new FormData();
      formData.append("file_name", fileName);
      console.log(fileName);
      formData.append(
        "file_data",
        new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );

      // API call
      const response = await fetch(
        `http://localhost:4000/api/item-activity-logs/${logId}/excel`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save Excel data");
      }

      // Return updated log
      const updatedLog = await response.json();
      return {
        ...updatedLog,
        file_data: new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      };
    } catch (error) {
      console.error("Excel save error:", error);
      throw error;
    }
  };

  return (
    <ItemActivityLogContext.Provider
      value={{
        itemActivityLogData,
        setItemActivityLogData,
        handleSaveEdit,
        handleDownload,
        handleDelete,
        handleCreateNew,
        saveExcelData,
      }}
    >
      {children}
    </ItemActivityLogContext.Provider>
  );
};

export const useItemActivityLogContext = () =>
  useContext(ItemActivityLogContext);
