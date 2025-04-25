import React, { createContext, useContext, useState, useEffect } from "react";
import * as XLSX from "xlsx";

// Create the context
const DispatchOutputContext = createContext();

// Provider component
export const DispatchOutputProvider = ({ children, initialData = [] }) => {
  // State to manage table data
  const [dispatchOutputData, setDispatchOutputData] = useState([]);

  useEffect(() => {
    const fetchDispatchOutputs = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/dispatch-outputs"
        ); // Your API endpoint
        const data = await response.json();
        const processed = data.map((dispatchOutput) => ({
          ...dispatchOutput,
          file_data: new Blob([new Uint8Array(dispatchOutput.file_data.data)], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          file_name: dispatchOutput.file_name || "file.xlsx",
        }));

        setDispatchOutputData(processed);
      } catch (err) {
        console.error("Failed to load dispatch outputs:", err);
      }
    };

    fetchDispatchOutputs();
  }, []);

  // handleSaveEdit function to update dispatch output data
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
        `http://localhost:4000/api/dispatch-outputs/${editedData.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update dispatch output");
      }

      const updatedDispatchOutput = await response.json();

      // Update state without reloading the page
      setDispatchOutputData((prev) =>
        prev.map((dispatchOutput) =>
          dispatchOutput.id === editedData.id
            ? {
                ...dispatchOutput,
                ...updatedDispatchOutput,
                // Preserve the Blob if we didn't get it from the server
                file_data: updatedDispatchOutput.file_data
                  ? new Blob(
                      [new Uint8Array(updatedDispatchOutput.file_data.data)],
                      {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      }
                    )
                  : dispatchOutput.file_data,
              }
            : dispatchOutput
        )
      );

      return updatedDispatchOutput;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleDelete = async (dispatchOutputId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/dispatch-outputs/${dispatchOutputId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete dispatch output.");
      }

      // Remove deleted dispatch output from state
      setDispatchOutputData((prevData) =>
        prevData.filter(
          (dispatchOutput) => dispatchOutput.id !== dispatchOutputId
        )
      );

      console.log(
        `Dispatch output with ID ${dispatchOutputId} deleted successfully.`
      );
    } catch (error) {
      console.error("Error deleting dispatch output:", error);
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

  const handleCreateNew = async (newDispatchOutput) => {
    const formData = new FormData();

    // Append basic dispatch output details
    formData.append("name", newDispatchOutput.name);
    formData.append("createdBy", newDispatchOutput.createdBy);
    formData.append("description", newDispatchOutput.description);
    formData.append("status", newDispatchOutput.status);

    // Debug log
    console.log("Sending file_name:", newDispatchOutput.file_name);

    // ✅ Append file data with its original name
    // newDispatchOutput.file_data is a Blob, file_name is a string
    formData.append(
      "file_data",
      newDispatchOutput.file_data,
      newDispatchOutput.file_name
    );

    try {
      const response = await fetch(
        "http://localhost:4000/api/dispatch-outputs",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setDispatchOutputData((prev) => [...prev, newDispatchOutput]);
        console.log("Dispatch output uploaded!");
      } else {
        const err = await response.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong.");
    }
  };

  const saveExcelData = async (dispatchOutputId, excelData, fileName) => {
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
        `http://localhost:4000/api/dispatch-outputs/${dispatchOutputId}/excel`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save Excel data");
      }

      // Return updated dispatch output
      const updatedDispatchOutput = await response.json();
      return {
        ...updatedDispatchOutput,
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
    <DispatchOutputContext.Provider
      value={{
        dispatchOutputData,
        setDispatchOutputData,
        handleSaveEdit,
        handleDownload,
        handleDelete,
        handleCreateNew,
        saveExcelData,
      }}
    >
      {children}
    </DispatchOutputContext.Provider>
  );
};

export const useDispatchOutputContext = () => useContext(DispatchOutputContext);
