import React, { createContext, useContext, useState, useEffect } from "react";
import * as XLSX from "xlsx";

// Create the context
const ShipmentsContext = createContext();

// Provider component
export const ShipmentsProvider = ({ children, initialData = [] }) => {
  // State to manage table data
  const [shipmentsData, setShipmentsData] = useState([]);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await fetch(
          "https://logitrack-serverz.onrender.com/api/shipments"
        ); // Your API endpoint
        const data = await response.json();
        const processed = data.map((shipment) => ({
          ...shipment,
          file_data: new Blob([new Uint8Array(shipment.file_data.data)], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          file_name: shipment.file_name || "file.xlsx",
        }));

        setShipmentsData(processed);
      } catch (err) {
        console.error("Failed to load shipments:", err);
      }
    };

    fetchShipments();
  }, []);

  // handleSaveEdit function to update shipment data
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
        `https://logitrack-serverz.onrender.com/api/shipments/${editedData.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update shipment");
      }

      const updatedShipment = await response.json();

      // Update state without reloading the page
      setShipmentsData((prev) =>
        prev.map((shipment) =>
          shipment.id === editedData.id
            ? {
                ...shipment,
                ...updatedShipment,
                // Preserve the Blob if we didn't get it from the server
                file_data: updatedShipment.file_data
                  ? new Blob([new Uint8Array(updatedShipment.file_data.data)], {
                      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    })
                  : shipment.file_data,
              }
            : shipment
        )
      );

      return updatedShipment;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleDelete = async (shipmentId) => {
    try {
      const response = await fetch(
        `https://logitrack-serverz.onrender.com/api/shipments/${shipmentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete shipment.");
      }

      // Remove deleted shipment from state
      setShipmentsData((prevData) =>
        prevData.filter((shipment) => shipment.id !== shipmentId)
      );

      console.log(`Shipment with ID ${shipmentId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting shipment:", error);
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

  const handleCreateNew = async (newShipments) => {
    const formData = new FormData();

    // Append basic shipment details
    formData.append("name", newShipments.name);
    formData.append("createdBy", newShipments.createdBy);
    formData.append("description", newShipments.description);
    formData.append("status", newShipments.status);

    // Debug log
    console.log("Sending file_name:", newShipments.file_name);

    // ✅ Append file data with its original name
    // newShipments.file_data is a Blob, file_name is a string
    formData.append(
      "file_data",
      newShipments.file_data,
      newShipments.file_name
    );

    try {
      const response = await fetch(
        "https://logitrack-serverz.onrender.com/api/shipments",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setShipmentsData((prev) => [...prev, newShipments]);
        console.log("Shipment uploaded!");
      } else {
        const err = await response.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong.");
    }
  };
  const saveExcelData = async (shipmentId, excelData, fileName) => {
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
        `https://logitrack-serverz.onrender.com/api/shipments/${shipmentId}/excel`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save Excel data");
      }

      // Return updated shipment
      const updatedShipment = await response.json();
      return {
        ...updatedShipment,
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
    <ShipmentsContext.Provider
      value={{
        shipmentsData,
        setShipmentsData,
        handleSaveEdit,
        handleDownload,
        handleDelete,
        handleCreateNew,
        saveExcelData,
      }}
    >
      {children}
    </ShipmentsContext.Provider>
  );
};

export const useShipmentsContext = () => useContext(ShipmentsContext);
