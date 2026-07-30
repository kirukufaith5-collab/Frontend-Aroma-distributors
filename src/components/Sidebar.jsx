import React from 'react';

// Sidebar component for dashboard navigation and metrics summary
const Sidebar = ({ title, metrics = [], activeTab, onTabSelect }) => {
  return (
    <aside className="sidebar">
      {/* Title / Farm Name */}
      <h2>{title}</h2>

      {/* Dynamic Metrics Summary Box */}
      <div className="metrics">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <small>{metric.label}</small>
            <p>{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        <button
          className={`nav-btn ${activeTab === 'harvest' ? 'active' : ''}`}
          onClick={() => onTabSelect('harvest')}
        >
          Log Harvest
        </button>

        <button
          className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => onTabSelect('history')}
        >
           Harvest Log
        </button>

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