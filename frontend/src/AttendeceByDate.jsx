import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

const AttendanceByDate = () => {
  const [date, setDate] = useState("");
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const fetchAttendance = async () => {
    if (!date) {
      setError("Please select a date");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(
        `http://localhost:8000/attendance-by-date/?date=${date}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const data = await response.json();
      setAttendanceData(data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError("Failed to fetch attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderAttendanceTable = () => {
    if (!attendanceData.attendance || !attendanceData.attendance.length) {
      return (
        <div className="alert alert-info mt-4 d-flex align-items-center" role="alert">
          <i className="bi bi-info-circle-fill me-2"></i>
          <div>No attendance data found for this date.</div>
        </div>
      );
    }

    // Group data by period
    const periodData = {};
    for (const entry of attendanceData.attendance) {
      if (!periodData[entry.period]) {
        periodData[entry.period] = [];
      }
      periodData[entry.period].push(entry.name);
    }

    return (
      <div className="card border-0 shadow-sm mt-4 fade-in">
        <div className="card-header bg-white p-3 border-0">
          <h5 className="mb-0">
            <i className="bi bi-calendar-date me-2 text-primary"></i>
            Attendance for {date}
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: "120px" }}>Period</th>
                  <th>Students Present</th>
                  <th className="text-center" style={{ width: "120px" }}>Count</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((period) => (
                  <tr key={period}>
                    <td className="text-center fw-medium">Period {period}</td>
                    <td>
                      {periodData[period] && periodData[period].length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {periodData[period].map((name) => (
                            <span 
                              key={name} 
                              className="badge bg-light text-dark border border-1 p-2"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted fst-italic">No attendance recorded</span>
                      )}
                    </td>
                    <td className="text-center">
                      {periodData[period] ? (
                        <span className="badge bg-primary rounded-pill px-3 py-2">
                          {periodData[period].length}
                        </span>
                      ) : (
                        <span className="badge bg-light text-dark rounded-pill px-3 py-2">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
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
                    <i className="bi bi-calendar-week me-2"></i>
                    Attendance by Date
                  </h4>
                  <p className="text-muted mb-0 small">View attendance records for a specific date</p>
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

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="bi bi-search me-2 text-primary"></i>
                    Search Attendance
                  </h5>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-8">
                      <label htmlFor="dateInput" className="form-label">Select Date</label>
                      <input
                        type="date"
                        id="dateInput"
                        className="form-control form-control-lg"
                        value={date}
                        onChange={handleDateChange}
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

              {/* Attendance Table */}
              {!loading && date && renderAttendanceTable()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceByDate;
