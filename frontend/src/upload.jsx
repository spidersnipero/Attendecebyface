import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const allNames = [
  "231FA04002", "231FA04024", "231FA04030", "231FA04053", "231FA04085", "231FA04087", "231FA04088",
  "231FA04091", "231FA04094", "231FA04096", "231FA04097", "231FA04101", "231FA04109", "231FA04131",
  "231FA04144", "231FA04163", "231FA04164", "231FA04168", "231FA04169", "231FA04186", "231FA04192",
  "231FA04195", "231FA04222", "231FA04244", "231FA04245", "231FA04251", "231FA04252", "231FA04254",
  "231FA04257", "231FA04258", "231FA04266", "231FA04273", "231FA04329", "231FA04330", "231FA04331",
  "231FA04332", "231FA04335", "231FA04336", "231FA04341", "231FA04343", "231FA04360", "231FA04365",
  "231FA04374", "231FA04391", "231FA04408", "231FA04409", "231FA04607", "231FA04801", "231FA04F74",
  "231FA04F80", "231FA04F99", "231FA04G02", "231FA04G08", "231FA04G18", "231FA04G23", "231FA04625",
  "231FA04G31", "231FA04G37", "231FA04G40", "231FA04641", "231FA04645", "231FA04647", "231FA04G48",
  "231FA04G76", "241LA04001"
];

const Dashboard = () => {
  const [image, setImage] = useState(null);
  const [detectedNames, setDetectedNames] = useState([]);
  const [checkedNames, setCheckedNames] = useState({});
  const [period, setPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setDetectedNames([]);
    setCheckedNames({});
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await fetch("http://localhost:8000/uploadimage/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      setDetectedNames(data.detected_names);

      // Auto-check detected names
      const updatedCheckedNames = {};
      data.detected_names.forEach((name) => {
        updatedCheckedNames[name] = true;
      });
      setCheckedNames(updatedCheckedNames);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Upload failed. Try again.");
    }

    setLoading(false);
  };

  const handleCheckboxChange = (name) => {
    setCheckedNames((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSubmitAttendance = async () => {
    const selectedNames = Object.keys(checkedNames).filter((name) => checkedNames[name]);

    if (selectedNames.length === 0) {
      alert("No names selected for attendance.");
      return;
    }

    if (!period) {
      alert("Please select a period before submitting attendance.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/markattendance/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: selectedNames, period: parseInt(period) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to mark attendance");
      }

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert("Attendance submission failed. Try again.");
    }

    setSubmitting(false);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="text-center text-primary">Face Recognition Attendance</h2>

        {/* Period Selection */}
        <div className="mb-3">
          <label className="form-label fw-bold">Select Period:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="form-select">
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
          <label className="form-label fw-bold">Upload an Image:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
        </div>

        {/* Upload Button */}
        <div className="text-center">
          <button onClick={handleUpload} disabled={loading} className="btn btn-primary">
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null} Upload Image
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

        {/* Detected Names with Checkboxes in Grid (7 per row) */}
        {allNames.length > 0 && (
  <div className="mt-4">
    <h4 className="text-primary">Select Attendance:</h4>
    <div className="row row-cols-lg-7 row-cols-md-5 row-cols-sm-3 row-cols-2 g-2">
      {allNames.map((name) => (
        <div key={name} className="col text-center">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id={`checkbox-${name}`}
              checked={checkedNames[name] || false}
              onChange={() => handleCheckboxChange(name)}
            />
            <label className="form-check-label small text-dark" htmlFor={`checkbox-${name}`}>
              {name}
            </label>
          </div>
        </div>
      ))}
    </div>
  </div>
)}


        {/* Submit Attendance Button */}
        <div className="text-center mt-3">
          <button onClick={handleSubmitAttendance} disabled={submitting} className="btn btn-success">
            {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null} Submit Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
