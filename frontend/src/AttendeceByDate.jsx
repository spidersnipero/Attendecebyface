import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const AttendanceByDate = () => {
  const [date, setDate] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    if (!date) {
      alert("Please select a date.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/attendance-by-date/?date=${date}`);
      if (!response.ok) throw new Error("Failed to fetch attendance");

      const data = await response.json();
      console.log("Attendance Data:", data.attendance);
      setAttendanceData(data.attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      alert("Failed to fetch attendance. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="text-center">Check Attendance by Date</h2>

        {/* Date Picker */}
        <div className="row mt-3">
          <div className="col-md-6">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-md-6 text-center">
            <button 
              onClick={fetchAttendance} 
              disabled={loading} 
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>Fetching...
                </>
              ) : (
                "Get Attendance"
              )}
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        {attendanceData.length > 0 && (
          <div className="table-responsive mt-4">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Period</th>
                  <th>Students Present</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(7)].map((_, period) => {
                  const students = attendanceData
                    .filter((entry) => entry.period === period + 1)
                    .map((entry) => entry.name)
                    .join(", ");

                  return (
                    <tr key={period + 1}>
                      <td className="text-center">Period {period + 1}</td>
                      <td>{students || "No Attendance"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* No Data Message */}
        {!loading && attendanceData.length === 0 && date && (
          <p className="text-muted mt-3 text-center">No attendance data found for this date.</p>
        )}
      </div>
    </div>
  );
};

export default AttendanceByDate;
