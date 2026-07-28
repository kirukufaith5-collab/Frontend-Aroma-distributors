import React from 'react';

// Receive props passed down from FarmerDashboard
const Sidebar = ({ title, metrics, activeTab, onTabSelect }) => {
  return (
    <aside className="sidebar">
      {/* Farm Name / Title */}
      <h2>{title}</h2>

      {/* Metrics Summary Box */}
      <div className="metrics">
        <div className="metric-card">
          <small>{metrics[0]?.label}</small>
          <p>{metrics[0]?.value}</p>
        </div>
        <div className="metric-card">
          <small>{metrics[1]?.label}</small>
          <p>{metrics[1]?.value}</p>
        </div>
        <div className="metric-card">
          <small>{metrics[2]?.label}</small>
          <p>{metrics[2]?.value}</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav className="nav-menu">
        
        {/* Button 1: Log Harvest */}
        <button
          className={`nav-btn ${activeTab === 'harvest' ? 'active' : ''}`}
          onClick={() => onTabSelect('harvest')}
        >
          🌾 Log Harvest
        </button>

        {/* Button 2: Harvest Log History */}
        <button
          className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => onTabSelect('history')}
        >
         Harvest Log
        </button>

        {/* Button 3: Payout Statements */}
        <button
          className={`nav-btn ${activeTab === 'payouts' ? 'active' : ''}`}
          onClick={() => onTabSelect('payouts')}
        >
        Payout Statements
        </button>

      </nav>
    </aside>
  );
};

export default Sidebar;