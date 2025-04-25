import React, { createContext, useContext, useState, useEffect } from "react";
import * as XLSX from "xlsx";

// Create the context
const SummaryContext = createContext();

// Provider component
export const SummaryProvider = ({ children, initialData = [] }) => {
  // State to manage summary data
  const [summaryData, setSummaryData] = useState([]);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const response = await fetch(
          "https://logitrack-server-1.onrender.com/api/summary"
        );
        const data = await response.json();
        const processed = data.map((summary) => ({
          ...summary,
          file_data: summary.file_data
            ? new Blob([new Uint8Array(summary.file_data.data)], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              })
            : null,
          file_name: summary.file_name || "summary_data.xlsx",
        }));

        setSummaryData(processed);
      } catch (err) {
        console.error("Failed to load summaries:", err);
      }
    };

    fetchSummaries();
  }, []);

  // handleSaveEdit function to update summary data
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
        `https://logitrack-server-1.onrender.com/api/summary/${editedData.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update summary");
      }

      const updatedSummary = await response.json();

      // Update state without reloading the page
      setSummaryData((prev) =>
        prev.map((summary) =>
          summary.id === editedData.id
            ? {
                ...summary,
                ...updatedSummary,
                file_data: updatedSummary.file_data
                  ? new Blob([new Uint8Array(updatedSummary.file_data.data)], {
                      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    })
                  : summary.file_data,
              }
            : summary
        )
      );

      return updatedSummary;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleDelete = async (summaryId) => {
    try {
      const response = await fetch(
        `https://logitrack-server-1.onrender.com/api/summary/${summaryId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete summary.");
      }

      // Remove deleted summary from state
      setSummaryData((prevData) =>
        prevData.filter((summary) => summary.id !== summaryId)
      );

      console.log(`Summary with ID ${summaryId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting summary:", error);
    }
  };

  const handleDownload = (fileData, fileName) => {
    if (!fileData) return;
    const url = URL.createObjectURL(fileData);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "summary_data.xlsx";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateNew = async (newSummary) => {
    const formData = new FormData();

    formData.append("name", newSummary.name);
    formData.append("createdBy", newSummary.createdBy);
    formData.append("description", newSummary.description);
    formData.append("status", newSummary.status);

    console.log("Sending file_name:", newSummary.file_name);

    formData.append("file_data", newSummary.file_data, newSummary.file_name);

    try {
      const response = await fetch(
        "https://logitrack-server-1.onrender.com/api/summary",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setSummaryData((prev) => [...prev, newSummary]);
        console.log("summary uploaded!");
      } else {
        const err = await response.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong.");
    }
  };

  const saveExcelData = async (summaryId, excelData, fileName) => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const excelBuffer = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx",
      });

      const formData = new FormData();
      formData.append("file_name", fileName);
      formData.append(
        "file_data",
        new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );

      const response = await fetch(
        `https://logitrack-server-1.onrender.com/api/summary/${summaryId}/excel`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save Excel data");
      }

      const updatedSummary = await response.json();
      return {
        ...updatedSummary,
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
    <SummaryContext.Provider
      value={{
        summaryData,
        setSummaryData,
        handleSaveEdit,
        handleDownload,
        handleDelete,
        handleCreateNew,
        saveExcelData,
      }}
    >
      {children}
    </SummaryContext.Provider>
  );
};

export const useSummaryContext = () => useContext(SummaryContext);
