import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const ExcelUploader = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState({
    message: "",
    error: false,
  });

  // Add these new states near your existing useState declarations
  const [editableData, setEditableData] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [responseData, setResponseData] = useState(null); // To store complete API response
  const [fileList, setFileList] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [loading, setLoading] = useState({
    upload: false,
    list: false,
    data: false,
    download: false,
  });

  useEffect(() => {
    if (responseData) {
      console.log("API Response:", {
        sheets: responseData.sheets,
        firstSheetData: responseData.data[responseData.sheets[0]],
        fullResponse: responseData,
      });
    }
  }, [responseData]);
  // Fetch list of uploaded files
  const fetchFileList = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const response = await axios.get("http://localhost:4000/api/excel/files");
      if (response.data.success) {
        setFileList(response.data.files);
      } else {
        setUploadStatus({
          message: response.data.error || "Failed to fetch files",
          error: true,
        });
      }
    } catch (error) {
      setUploadStatus({
        message: error.response?.data?.error || "Network error",
        error: true,
      });
      console.error("File list error:", error);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
    }
  };

  // Modify your existing fetchFileData function to initialize editableData
  const fetchFileData = async (fileId) => {
    setLoading((prev) => ({ ...prev, data: true }));
    setFileData([]);
    setEditableData([]);
    setSelectedFileId(fileId);

    try {
      const response = await axios.get(
        `http://localhost:4000/api/excel/data/${fileId}`
      );

      if (response.data.success) {
        setResponseData(response.data);
        const firstSheetData = response.data.data[response.data.sheets[0]];
        setFileData(firstSheetData);
        setEditableData(JSON.parse(JSON.stringify(firstSheetData))); // Deep copy
      } else {
        setUploadStatus({
          message: response.data.error || "Failed to parse file",
          error: true,
        });
      }
    } catch (error) {
      // ... keep your existing error handling ...
    } finally {
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  const toggleEditMode = () => {
    if (editMode && JSON.stringify(fileData) !== JSON.stringify(editableData)) {
      if (!window.confirm("You have unsaved changes. Discard them?")) return;
      setEditableData(JSON.parse(JSON.stringify(fileData))); // Reset to original
    }
    setEditMode(!editMode);
    setEditingCell(null);
  };

  const saveChanges = async () => {
    try {
      // Prepare changes
      const changes = [];
      editableData.forEach((row, rowIndex) => {
        Object.keys(row).forEach((key) => {
          const originalValue = fileData[rowIndex]?.[key];
          const newValue = row[key];

          if (originalValue !== newValue) {
            const columnIndex = Object.keys(row).indexOf(key);
            changes.push({ rowIndex, column: columnIndex, newValue });
          }
        });
      });

      if (changes.length === 0) {
        setUploadStatus({ message: "No changes to save", error: false });
        return;
      }

      setLoading((prev) => ({ ...prev, save: true }));

      const response = await axios.put(
        `http://localhost:4000/api/excel/update/${selectedFileId}`,
        { changes }
      );

      if (response.data.success) {
        setUploadStatus({
          message: "Changes saved successfully!",
          error: false,
        });
        setFileData([...editableData]); // Update the displayed data
        setEditMode(false); // Exit edit mode
      }
    } catch (error) {
      setUploadStatus({
        message: error.response?.data?.error || "Failed to save changes",
        error: true,
      });
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };
  // Add these new functions for editing functionality
  const handleCellChange = (rowIndex, key, value) => {
    const newData = [...editableData];
    newData[rowIndex][key] = value;
    setEditableData(newData);
  };

  // Download file
  const handleDownload = async (fileId, fileName) => {
    setLoading((prev) => ({ ...prev, download: true }));
    try {
      const response = await axios.get(
        `http://localhost:4000/api/excel/download/${fileId}`,
        { responseType: "blob" }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setUploadStatus({
        message: "Download started",
        error: false,
      });
    } catch (error) {
      setUploadStatus({
        message: error.response?.data?.error || "Download failed",
        error: true,
      });
      console.error("Download error:", error);
    } finally {
      setLoading((prev) => ({ ...prev, download: false }));
    }
  };

  // Load file list on component mount
  useEffect(() => {
    fetchFileList();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadProgress(0);
    setUploadStatus({ message: "", error: false });
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus({
        message: "Please select a file first",
        error: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("excelFile", file);

    try {
      setLoading((prev) => ({ ...prev, upload: true }));
      setUploadStatus({ message: "Uploading...", error: false });

      const response = await axios.post(
        "http://localhost:4000/api/excel/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response.data.success) {
        setUploadStatus({
          message: `Upload successful! File ID: ${response.data.fileId}`,
          error: false,
        });
        fetchFileList(); // Refresh the file list
      } else {
        setUploadStatus({
          message: response.data.error || "Upload failed",
          error: true,
        });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Upload failed. Please try again.";
      setUploadStatus({
        message: errorMsg,
        error: true,
      });
      console.error("Upload error:", error);
    } finally {
      setLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {fileData[0] &&
              Object.keys(fileData[0]).map((columnKey) => (
                <th
                  key={columnKey}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {columnKey}
                </th>
              ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {editableData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.entries(row).map(([cellKey, cellValue]) => (
                <td
                  key={`${rowIndex}-${cellKey}`}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    editMode ? "cursor-pointer hover:bg-gray-50" : ""
                  }`}
                  onClick={() =>
                    editMode && setEditingCell(`${rowIndex}-${cellKey}`)
                  }
                >
                  {editingCell === `${rowIndex}-${cellKey}` ? (
                    <input
                      type="text"
                      value={cellValue}
                      onChange={(e) =>
                        handleCellChange(rowIndex, cellKey, e.target.value)
                      }
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                      className="border p-1 w-full"
                    />
                  ) : (
                    <span>
                      {cellValue !== null && cellValue !== undefined
                        ? cellValue.toString()
                        : ""}
                    </span>
                  )}
                  ins
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Upload Excel File
        </h2>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <label className="block flex-grow">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              disabled={loading.upload}
            />
          </label>
          <button
            onClick={handleUpload}
            disabled={!file || loading.upload}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              !file || loading.upload
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading.upload ? "Uploading..." : "Upload"}
          </button>
        </div>

        {uploadProgress > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {uploadProgress}% complete
            </p>
          </div>
        )}

        {uploadStatus.message && (
          <p
            className={`mt-3 text-sm ${
              uploadStatus.error ? "text-red-600" : "text-green-600"
            }`}
          >
            {uploadStatus.message}
          </p>
        )}
      </div>

      {/* File List Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Uploaded Files</h2>
          <button
            onClick={fetchFileList}
            disabled={loading.list}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
          >
            {loading.list ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading.list ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : fileList.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fileList.map((file) => (
                  <tr key={file.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {file.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(file.uploaded_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => fetchFileData(file.id)}
                          disabled={loading.data}
                          className={`${
                            loading.data
                              ? "text-gray-400"
                              : "text-blue-600 hover:text-blue-900"
                          }`}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(file.id, file.name)}
                          disabled={loading.download}
                          className={`${
                            loading.download
                              ? "text-gray-400"
                              : "text-green-600 hover:text-green-900"
                          }`}
                        >
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Data Preview Section */}
      {selectedFileId && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Excel Data (File ID: {selectedFileId})
            </h2>
            {responseData?.sheets?.length > 1 && (
              <select
                onChange={(e) => setFileData(responseData.data[e.target.value])}
                className="px-3 py-1 border rounded"
              >
                {responseData.sheets.map((sheet) => (
                  <option key={sheet} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Edit Mode Controls */}
          <div className="flex justify-end space-x-4 mb-4">
            <button
              onClick={toggleEditMode}
              className={`px-4 py-2 rounded-md ${
                editMode
                  ? "bg-gray-200 text-gray-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {editMode ? "Cancel Editing" : "Edit Mode"}
            </button>

            {editMode && (
              <button
                onClick={saveChanges}
                disabled={loading.save}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  loading.save
                    ? "bg-gray-400"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading.save ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>

          {/* Table Rendering - Now using renderTable() */}
          {loading.data ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : fileData.length === 0 ? (
            <p className="text-gray-500">No data available</p>
          ) : (
            renderTable() // ← This is where we call the renderTable function
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;
