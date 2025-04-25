import React, { createContext, useContext, useState, useEffect } from "react";
import * as XLSX from "xlsx";

// Create the context
const DeliveryForwardContext = createContext();

// Provider component
export const DeliveryForwardProvider = ({ children, initialData = [] }) => {
  // State to manage table data
  const [deliveryForwardData, setDeliveryForwardData] = useState([]);

  useEffect(() => {
    const fetchDeliveryForwards = async () => {
      try {
        const response = await fetch(
          "https://logitrack-server-1.onrender.com/api/delivery-forwards"
        );
        const data = await response.json();
        const processed = data.map((deliveryForward) => ({
          ...deliveryForward,
          file_data: new Blob(
            [new Uint8Array(deliveryForward.file_data.data)],
            {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }
          ),
          file_name: deliveryForward.file_name || "file.xlsx",
        }));

        setDeliveryForwardData(processed);
      } catch (err) {
        console.error("Failed to load delivery forwards:", err);
      }
    };

    fetchDeliveryForwards();
  }, []);

  // handleSaveEdit function to update delivery forward data
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
        `https://logitrack-server-1.onrender.com/api/delivery-forwards/${editedData.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update delivery forward");
      }

      const updatedDeliveryForward = await response.json();

      // Update state without reloading the page
      setDeliveryForwardData((prev) =>
        prev.map((deliveryForward) =>
          deliveryForward.id === editedData.id
            ? {
                ...deliveryForward,
                ...updatedDeliveryForward,
                // Preserve the Blob if we didn't get it from the server
                file_data: updatedDeliveryForward.file_data
                  ? new Blob(
                      [new Uint8Array(updatedDeliveryForward.file_data.data)],
                      {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      }
                    )
                  : deliveryForward.file_data,
              }
            : deliveryForward
        )
      );

      return updatedDeliveryForward;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleDelete = async (deliveryForwardId) => {
    try {
      const response = await fetch(
        `https://logitrack-server-1.onrender.com/api/delivery-forwards/${deliveryForwardId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete delivery forward.");
      }

      // Remove deleted delivery forward from state
      setDeliveryForwardData((prevData) =>
        prevData.filter(
          (deliveryForward) => deliveryForward.id !== deliveryForwardId
        )
      );

      console.log(
        `Delivery forward with ID ${deliveryForwardId} deleted successfully.`
      );
    } catch (error) {
      console.error("Error deleting delivery forward:", error);
    }
  };

  const handleDownload = (fileData, fileName) => {
    const url = URL.createObjectURL(fileData);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "default_filename.xlsx";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateNew = async (newDeliveryForward) => {
    const formData = new FormData();

    // Append basic delivery forward details
    formData.append("name", newDeliveryForward.name);
    formData.append("createdBy", newDeliveryForward.createdBy);
    formData.append("description", newDeliveryForward.description);
    formData.append("status", newDeliveryForward.status);

    console.log("Sending file_name:", newDeliveryForward.file_name);

    formData.append(
      "file_data",
      newDeliveryForward.file_data,
      newDeliveryForward.file_name
    );

    try {
      const response = await fetch(
        "https://logitrack-server-1.onrender.com/api/delivery-forwards",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setDeliveryForwardData((prev) => [...prev, newDeliveryForward]);
        console.log("Delivery forward uploaded!");
      } else {
        const err = await response.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong.");
    }
  };

  const saveExcelData = async (deliveryForwardId, excelData, fileName) => {
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
        `https://logitrack-server-1.onrender.com/api/delivery-forwards/${deliveryForwardId}/excel`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save Excel data");
      }

      // Return updated delivery forward
      const updatedDeliveryForward = await response.json();
      return {
        ...updatedDeliveryForward,
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
    <DeliveryForwardContext.Provider
      value={{
        deliveryForwardData,
        setDeliveryForwardData,
        handleSaveEdit,
        handleDownload,
        handleDelete,
        handleCreateNew,
        saveExcelData,
      }}
    >
      {children}
    </DeliveryForwardContext.Provider>
  );
};

export const useDeliveryForwardContext = () =>
  useContext(DeliveryForwardContext);
