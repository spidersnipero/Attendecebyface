import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
  const [image, setImage] = useState(null);
  const [detectedNames, setDetectedNames] = useState([]);
  const [period, setPeriod] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    if (!period) {
      alert("Please select a period before uploading.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await fetch(`http://localhost:8000/upload/?period=${period}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      console.log("Detected Names:", data.detected_names);
      setDetectedNames(data.detected_names);
      alert(data.message); // Display success message
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Upload failed. Try again.");
    }
    
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="text-center">Upload Image for Face Recognition</h2>

        {/* Period Selection */}
        <div className="mb-3">
          <label className="form-label">Select Period:</label>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)} 
            className="form-select"
          >
            <option value="">Select Period</option>
            {[...Array(8)].map((_, index) => (
              <option key={index + 1} value={index + 1}>
                Period {index + 1}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div className="mb-3">
          <label className="form-label">Upload an Image:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="form-control"
          />
        </div>

        {/* Upload Button */}
        <div className="text-center">
          <button 
            onClick={handleUpload} 
            disabled={loading} 
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>Uploading...
              </>
            ) : (
              "Upload & Mark Attendance"
            )}
          </button>
        </div>

        {/* Image Preview */}
        {image && (
          <div className="text-center mt-3">
            <h5>Preview:</h5>
            <img 
              src={URL.createObjectURL(image)} 
              alt="Uploaded" 
              className="img-fluid rounded shadow mt-2" 
              style={{ maxHeight: "250px" }}
            />
          </div>
        )}

        {/* Attendance List */}
        {detectedNames.length > 0 && (
          <div className="mt-4">
            <h4>Detected Names:</h4>
            <ul className="list-group">
              {detectedNames.map((name, index) => (
                <li key={index} className="list-group-item">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
