// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Loginpage";
import Dashboard from "./upload";
import AttendanceByDate from "./AttendeceByDate";
import AttendanceByName from "./AttendenceByName";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path = "/attendencebydate" element={<AttendanceByDate />} />
        <Route path = "/attendencebyname" element={<AttendanceByName />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </Router>
  </React.StrictMode>
);
