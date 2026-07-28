import React from 'react';
import ".components/App.css";

export const Navbar = ({ title = 'Aroma Distributors', user = null }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <header className="navbar-container">
      <div className="navbar-brand">
        <span>🌱</span>
        <span>{title}</span>
      </div>

      <div className="navbar-user-info">
        {user && user.username && (
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
};
export default Navbar;