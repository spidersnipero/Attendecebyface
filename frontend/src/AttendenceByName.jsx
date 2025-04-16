import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

const AttendanceByName = () => {
  const [name, setName] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAttendance = async () => {
    if (!name.trim()) {
      setError("Please enter a student name or ID");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(
        `http://localhost:8000/attendance-by-name/?name=${encodeURIComponent(name.trim())}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const data = await response.json();
      setAttendanceData(data.attendance || []);
      
      if (data.attendance?.length === 0) {
        setError("No attendance records found for this student");
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError("Failed to fetch attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
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
                    <i className="bi bi-person-badge me-2"></i>
                    Attendance by Student
                  </h4>
                  <p className="text-muted mb-0 small">View attendance records for a specific student</p>
                </div>
                <div>
                  <a href="/dashboard" className="btn btn-outline-primary">
                    <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
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

              {/* Search Card */}
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="bi bi-search me-2 text-primary"></i>
                    Search Student Attendance
                  </h5>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-8">
                      <label htmlFor="nameInput" className="form-label">Student Name/ID</label>
                      <input
                        type="text"
                        id="nameInput"
                        className="form-control form-control-lg"
                        placeholder="Enter student name or ID"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <button
                        className="btn btn-primary btn-lg w-100"
                        onClick={fetchAttendance}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Fetching...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-search me-2"></i>
                            Get Attendance
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Results */}
              {attendanceData.length > 0 && (
                <div className="card border-0 shadow-sm mt-4 fade-in">
                  <div className="card-header bg-white p-3 border-0">
                    <h5 className="mb-0">
                      <i className="bi bi-calendar-check me-2 text-primary"></i>
                      Attendance Records for {name}
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th className="text-center" style={{ width: "120px" }}>Period</th>
                            <th className="text-center" style={{ width: "180px" }}>Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceData.map((record, index) => (
                            <tr key={index}>
                              <td className="text-center fw-medium">Period {record.period}</td>
                              <td className="text-center">{record.date}</td>
                              <td>
                                <span className="badge bg-success text-white px-3 py-2">
                                  <i className="bi bi-check-circle me-1"></i> Present
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="card-footer bg-white p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">
                        <i className="bi bi-info-circle me-1"></i>
                        Showing all attendance records
                      </span>
                      <span className="badge bg-primary rounded-pill px-3 py-2">
                        Total: {attendanceData.length} days
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceByName;
