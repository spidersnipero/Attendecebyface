import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setDetectedNames([]);
    setCheckedNames({});
    setError("");
    setSuccess("");
  };

  const handleUpload = async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
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
      setSuccess(`Successfully detected ${data.detected_names.length} students.`);

      // Auto-check detected names
      const updatedCheckedNames = {};
      data.detected_names.forEach((name) => {
        updatedCheckedNames[name] = true;
      });
      setCheckedNames(updatedCheckedNames);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Upload failed. Please try again.");
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
      setError("No names selected for attendance.");
      return;
    }

    if (!period) {
      setError("Please select a period before submitting attendance.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

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
      setSuccess(data.message || "Attendance marked successfully!");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      setError("Attendance submission failed. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-10 mx-auto">
          <div className="card dashboard-card shadow-lg">
            <div className="card-header bg-white p-4 border-0">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="mb-0 fw-bold text-primary">
                    <i className="bi bi-camera-fill me-2"></i>
                    Face Recognition Attendance
                  </h4>
                  <p className="text-muted mb-0 small">Take attendance using facial recognition</p>
                </div>
                <div className="d-flex">
                  <a href="/attendencebydate" className="btn btn-outline-primary me-2">
                    <i className="bi bi-calendar-date me-1"></i> By Date
                  </a>
                  <a href="/attendencebyname" className="btn btn-outline-primary">
                    <i className="bi bi-person me-1"></i> By Name
                  </a>
                </div>
              </div>
            </div>

            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              {success && (
                <div className="alert alert-success d-flex align-items-center" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <div>{success}</div>
                </div>
              )}

              <div className="row mb-4">
                {/* Period Selection Card */}
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">
                        <i className="bi bi-clock me-2 text-primary"></i>
                        Select Period
                      </h5>
                      <select 
                        value={period} 
                        onChange={(e) => setPeriod(e.target.value)} 
                        className="form-select form-select-lg"
                      >
                        <option value="">Select Period</option>
                        {[...Array(8)].map((_, index) => (
                          <option key={index + 1} value={index + 1}>
                            Period {index + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Image Upload Card */}
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">
                        <i className="bi bi-image me-2 text-primary"></i>
                        Upload Image
                      </h5>
                      <div className="mb-3">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          className="form-control"
                          id="imageInput"
                        />
                      </div>
                      <button 
                        onClick={handleUpload} 
                        disabled={loading} 
                        className="btn btn-primary w-100"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cloud-upload me-2"></i>
                            Upload & Process
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {image && (
                <div className="card mb-4 border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-3">
                      <i className="bi bi-image me-2 text-primary"></i>
                      Image Preview
                    </h5>
                    <div className="text-center">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt="Uploaded" 
                        className="img-fluid rounded" 
                        style={{ maxHeight: "300px" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Attendance Selection */}
              <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="bi bi-person-check me-2 text-primary"></i>
                    Select Attendance
                  </h5>
                  
                  <div className="row g-3">
                    {allNames.map((name) => (
                      <div key={name} className="col-lg-2 col-md-3 col-sm-4 col-6">
                        <div className={`attendance-item ${detectedNames.includes(name) ? 'bg-light' : ''}`}>
                          <div className="form-check attendance-checkbox">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`checkbox-${name}`}
                              checked={checkedNames[name] || false}
                              onChange={() => handleCheckboxChange(name)}
                            />
                            <label 
                              className={`form-check-label small ${detectedNames.includes(name) ? 'fw-bold' : ''}`} 
                              htmlFor={`checkbox-${name}`}
                            >
                              {name}
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button 
                  onClick={handleSubmitAttendance} 
                  disabled={submitting} 
                  className="btn btn-success btn-lg px-5"
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Submit Attendance
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
