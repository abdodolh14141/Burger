import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom"; // useNavigate removed as it's not used inside the component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import toast from "react-hot-toast";
import "../../../styles/navbar.css";

// Define the API endpoint (good practice to avoid hardcoding)
const AUTH_STATUS_URL = "/api/checkauth"; // Assuming an endpoint to check current status
const LOGOUT_URL = "/api/logout";
const USER_PROFILE_URL = "/api/profile"; // Renamed for clarity (not /api/user)

/**
 * Navbar component for navigation and user authentication status display.
 */
export const Navbar = () => {
  // Use a more descriptive state name, and default to null/undefined
  // null: haven't checked yet
  // true: logged in
  // false: logged out
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  // --- Authentication Status Check ---

  // Use useCallback to memoize the function, preventing unnecessary re-renders in dependent effects
  const checkAuthStatus = useCallback(async () => {
    // Only proceed if we haven't already determined the status (or if we need to re-check)
    if (isAuthenticated === null) {
      try {
        // Send a request to an endpoint that confirms if the user is logged in
        // A common pattern is to check for a valid session/cookie on the backend
        const res = await axios.get(AUTH_STATUS_URL);

        // Assuming the backend returns { isAuthenticated: true/false }
        // Adjust the condition based on your actual backend response structure
        const status = res.data?.isAuthenticated || false;
        setIsAuthenticated(status);
      } catch (error) {
        // Log errors but treat failures to reach the server as logged out for safety
        console.warn("Failed to check auth status:", error);
        setIsAuthenticated(false);
      }
    }
  }, [isAuthenticated]); // Reruns if isAuthenticated changes to ensure correct logic if needed

  // --- Logout Handler ---

  const handleLogout = async () => {
    try {
      const res = await axios.get(LOGOUT_URL);
      if (res.data.success) {
        setIsAuthenticated(false); // Update state immediately on success
        toast.success(
          res.data.message || "You have been logged out successfully."
        );
      } else {
        // Handle server response indicating failure even with a 200 status
        toast.error(res.data.message || "Logout failed on the server.");
      }
    } catch (error) {
      // Handle network errors or non-2xx status codes
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // --- Effect Hook ---

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  if (isAuthenticated === null) {
    return <nav className="navbar loading-navbar">Loading...</nav>;
  }

  // Use a constant for the logged-in state to improve readability
  const isLoggedIn = isAuthenticated;

  return (
    <nav className="navbar">
      <ul className="ContainerIcon">
        <li>
          {/* Use standard Arabic titles if the app supports RTL/Arabic, 
              but ensure consistency in the final app. Removed unnecessary `<p>` tag around Link content. */}
          <Link to="/shopping" title="Shopping" className="icon-link iconShop">
            Shopping
          </Link>
        </li>
        {/* Conditional rendering for Purchases link */}
        {isLoggedIn && (
          <li>
            <Link to="/Purchases" className="links" title="Purchases">
              Purchases
            </Link>
          </li>
        )}
      </ul>

      {/* Central Logo */}
      <Link to="/" className="logo">
        Burger-Big
      </Link>

      {/* Right-aligned Navigation Links */}
      <ul className="nav-links">
        {isLoggedIn ? (
          <>
            <li>
              {/* Corrected path and removed inline style redundancy. 
                  The link only renders if isLoggedIn is true, so the style is redundant. */}
              <Link
                to={USER_PROFILE_URL}
                className="icon-link iconUser links"
                title="User Profile"
              >
                <FontAwesomeIcon icon={faUser} />
              </Link>
            </li>
            <li>
              {/* Use the defined handler */}
              <button className="btnLogout" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link className="links" to="/api/login" title="Login">
                Login
              </Link>
            </li>
            <li>
              <Link className="links" to="/api/register" title="Register">
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};
