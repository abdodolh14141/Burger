import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import "../../styles/login.css";

export const Login = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = user;
    try {
      setLoading(true);
      const response = await axios.post("/api/login", {
        email,
        password,
      });

      if (response.success === false) {
        toast.error(response.data.message); // Consistent error message handling
      } else {
        setUser({ email: "", password: "" });
        toast.success("Login is successful");
        nav("/api/shopping", { replace: true });
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Error during login. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="containerLogin">
      <h1>Welcome to the Login Page</h1>
      <div className="formLogin">
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="Enter Email"
          />
          <input
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            placeholder="Enter Password"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <div className="toolLogin">
            <Link to={"/restPass"}>
              <p>Forgot Password?</p>
            </Link>
            <Link to={"/api/register"}>
              <p>Don't Have an Account? Sign Up</p>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
