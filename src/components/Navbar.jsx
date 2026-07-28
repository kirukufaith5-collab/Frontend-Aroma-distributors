import React from 'react';
import "../App.css"; // Imports basic styling for the navigation bar

// A component that displays the top bar with project title and user info
export default function Navbar({ title = 'Aroma Distributors', user }) {
  
  // Log out function to clear session and redirect back to login page
  const handleLogout = () => {
    localStorage.clear(); // Remove stored user data/tokens
    window.location.href = '/login'; // Redirect browser to login route
    //Window.location.href is used to force the browser to redirect to a new page.
  };

  return (
    <header className="navbar-container">
      {/* Brand logo & app title */}
      <div className="navbar-brand">
        🌱 {title}
      </div>

      {/* User profile & Logout button */}
      <div className="navbar-user-info">
        {/* Only display username and role if a user object exists */}
        {user?.username && (
          <span className="navbar-username">
            [{user.role}] {user.username}
          </span>
        )}
        <button onClick={handleLogout} className="navbar-logout-btn">
          ↳ LOGOUT
        </button>
      </div>
    </header>
  );
}