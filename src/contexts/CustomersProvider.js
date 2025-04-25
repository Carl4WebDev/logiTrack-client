import React, { createContext, useContext, useState, useEffect } from "react";
import * as XLSX from "xlsx";

// Create the context
const CustomersContext = createContext();

// Provider component
export const CustomersProvider = ({ children, initialData = [] }) => {
  // State to manage customer data
  const [customersData, setCustomersData] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/customers");
        const data = await response.json();
        const processed = data.map((customer) => ({
          ...customer,
          file_data: customer.file_data
            ? new Blob([new Uint8Array(customer.file_data.data)], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              })
            : null,
          file_name: customer.file_name || "customer_data.xlsx",
        }));

        setCustomersData(processed);
      } catch (err) {
        console.error("Failed to load customers:", err);
      }
    };

    fetchCustomers();
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
        `http://localhost:4000/api/customers/${editedData.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update customers");
      }

      const updatedCustomer = await response.json();

      // Update state without reloading the page
      setCustomersData((prev) =>
        prev.map((customer) =>
          customer.id === editedData.id
            ? {
                ...customer,
                ...updatedCustomer,
                // Preserve the Blob if we didn't get it from the server
                file_data: updatedCustomer.file_data
                  ? new Blob([new Uint8Array(updatedCustomer.file_data.data)], {
                      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    })
                  : customer.file_data,
              }
            : customer
        )
      );

      return updatedCustomer;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleDelete = async (customerId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/customers/${customerId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete customer.");
      }

      // Remove deleted customer from state
      setCustomersData((prevData) =>
        prevData.filter((customer) => customer.id !== customerId)
      );

      console.log(`Customer with ID ${customerId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const handleDownload = (fileData, fileName) => {
    if (!fileData) return;
    const url = URL.createObjectURL(fileData);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "customer_data.xlsx";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateNew = async (newCustomer) => {
    const formData = new FormData();

    // Append basic shipment details
    formData.append("name", newCustomer.name);
    formData.append("createdBy", newCustomer.createdBy);
    formData.append("description", newCustomer.description);
    formData.append("status", newCustomer.status);

    // Debug log
    console.log("Sending file_name:", newCustomer.file_name);

    // ✅ Append file data with its original name
    // newCustomer.file_data is a Blob, file_name is a string
    formData.append("file_data", newCustomer.file_data, newCustomer.file_name);

    try {
      const response = await fetch("http://localhost:4000/api/customers", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setCustomersData((prev) => [...prev, newCustomer]);
        console.log("customer uploaded!");
      } else {
        const err = await response.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong.");
    }
  };

  const saveExcelData = async (customerId, excelData, fileName) => {
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
      formData.append(
        "file_data",
        new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );

      // API call
      const response = await fetch(
        `http://localhost:4000/api/customers/${customerId}/excel`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save Excel data");
      }

      // Return updated customer
      const updatedCustomer = await response.json();
      return {
        ...updatedCustomer,
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
    <CustomersContext.Provider
      value={{
        customersData,
        setCustomersData,
        handleSaveEdit,
        handleDownload,
        handleDelete,
        handleCreateNew,
        saveExcelData,
      }}
    >
      {children}
    </CustomersContext.Provider>
  );
};

export const useCustomersContext = () => useContext(CustomersContext);
