import React, { createContext, useContext, useState, useEffect } from "react";
import * as XLSX from "xlsx";

// Create the context
const ItemSnapshotContext = createContext();

// Provider component
export const ItemSnapshotProvider = ({ children, initialData = [] }) => {
  // State to manage table data
  const [itemSnapshotsData, setItemSnapshotsData] = useState([]);

  useEffect(() => {
    const fetchItemSnapshots = async () => {
      try {
        const response = await fetch(
          "https://logitrack-serverz.onrender.com/api/item-snapshots"
        );
        const data = await response.json();
        const processed = data.map((itemSnapshot) => ({
          ...itemSnapshot,
          file_data: new Blob([new Uint8Array(itemSnapshot.file_data.data)], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          file_name: itemSnapshot.file_name || "file.xlsx",
        }));

        setItemSnapshotsData(processed);
      } catch (err) {
        console.error("Failed to load item snapshots:", err);
      }
    };

    fetchItemSnapshots();
  }, []);

  const handleSaveEdit = async (editedData) => {
    const formData = new FormData();

    formData.append("name", editedData.name);
    formData.append("description", editedData.description);
    formData.append("status", editedData.status);
    formData.append("createdBy", editedData.createdBy);

    if (editedData.file_data instanceof Blob) {
      formData.append("file_data", editedData.file_data, editedData.file_name);
    }

    try {
      const response = await fetch(
        `https://logitrack-serverz.onrender.com/api/item-snapshots/${editedData.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update item snapshot");
      }

      const updatedItemSnapshot = await response.json();

      setItemSnapshotsData((prev) =>
        prev.map((itemSnapshot) =>
          itemSnapshot.id === editedData.id
            ? {
                ...itemSnapshot,
                ...updatedItemSnapshot,
                file_data: updatedItemSnapshot.file_data
                  ? new Blob(
                      [new Uint8Array(updatedItemSnapshot.file_data.data)],
                      {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      }
                    )
                  : itemSnapshot.file_data,
              }
            : itemSnapshot
        )
      );

      return updatedItemSnapshot;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleDelete = async (itemSnapshotId) => {
    try {
      const response = await fetch(
        `https://logitrack-serverz.onrender.com/api/item-snapshots/${itemSnapshotId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete item snapshot.");
      }

      setItemSnapshotsData((prevData) =>
        prevData.filter((itemSnapshot) => itemSnapshot.id !== itemSnapshotId)
      );

      console.log(
        `Item snapshot with ID ${itemSnapshotId} deleted successfully.`
      );
    } catch (error) {
      console.error("Error deleting item snapshot:", error);
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

  const handleCreateNew = async (newItemSnapshot) => {
    const formData = new FormData();

    formData.append("name", newItemSnapshot.name);
    formData.append("createdBy", newItemSnapshot.createdBy);
    formData.append("description", newItemSnapshot.description);
    formData.append("status", newItemSnapshot.status);

    console.log("Sending file_name:", newItemSnapshot.file_name);

    formData.append(
      "file_data",
      newItemSnapshot.file_data,
      newItemSnapshot.file_name
    );

    try {
      const response = await fetch(
        "https://logitrack-serverz.onrender.com/api/item-snapshots",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setItemSnapshotsData((prev) => [...prev, newItemSnapshot]);
        console.log("Item snapshot uploaded!");
      } else {
        const err = await response.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong.");
    }
  };

  const saveExcelData = async (itemSnapshotId, excelData, fileName) => {
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
      console.log(fileName);
      formData.append(
        "file_data",
        new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );

      const response = await fetch(
        `https://logitrack-serverz.onrender.com/api/item-snapshots/${itemSnapshotId}/excel`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save Excel data");
      }

      const updatedItemSnapshot = await response.json();
      return {
        ...updatedItemSnapshot,
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
    <ItemSnapshotContext.Provider
      value={{
        itemSnapshotsData,
        setItemSnapshotsData,
        handleSaveEdit,
        handleDownload,
        handleDelete,
        handleCreateNew,
        saveExcelData,
      }}
    >
      {children}
    </ItemSnapshotContext.Provider>
  );
};

export const useItemSnapshotContext = () => useContext(ItemSnapshotContext);
