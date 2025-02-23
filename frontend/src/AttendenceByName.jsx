import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const AttendanceByName = () => {
  const [name, setName] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    if (!name.trim()) {
      alert("Please enter a student name.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/attendance-by-name/?name=${name}`);
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
    <div className="container mt-4">
      <h2 className="mb-3">Check Attendance by Student Name</h2>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter student name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={fetchAttendance} disabled={loading}>
          {loading ? "Fetching..." : "Get Attendance"}
        </button>
      </div>

      {attendanceData.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                {[...Array(8)].map((_, period) => (
                  <th key={period + 1}>Period {period + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  {[...Array(8)].map((_, period) => (
                    <td key={period + 1} className={record.periods[period + 1] === "Present" ? "table-success" : "table-danger"}>
                      {record.periods[period + 1]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceByName;
