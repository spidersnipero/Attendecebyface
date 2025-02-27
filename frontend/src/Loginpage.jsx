import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error message

    setTimeout(() => {
      if (username === "admin" && password === "password") {
        navigate("/dashboard");
      } else {
        setError("Invalid username or password.");
        setLoading(false);
      }
    }, 1000); // Simulate API delay
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "450px" }}>
        <div className="card-body">
          <h3 className="text-center mb-4 text-primary">Attendance Portal</h3>
          <p className="text-center text-muted mb-4">Please sign in to continue.</p>

          {error && (
            <div className="alert alert-danger py-2 text-center">
              <small>{error}</small>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Username Field */}
            <div className="row align-items-center mb-3">
              <div className="col-3">
                <label className="form-label fw-bold mb-0">Username</label>
              </div>
              <div className="col-9">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="row align-items-center mb-4">
              <div className="col-3">
                <label className="form-label fw-bold mb-0">Password</label>
              </div>
              <div className="col-9">
                <input
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              className="btn btn-primary w-100 btn-lg mb-3"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* Signup Link */}
            <div className="text-center">
              <small className="text-muted">
                Don't have an account? <a href="/signup">Sign up</a>
              </small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;