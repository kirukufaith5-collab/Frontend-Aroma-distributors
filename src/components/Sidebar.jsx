import React from 'react';

// Displays key stats (metrics) and navigation options on the side panel
export default function Sidebar({ title, metrics = [], navItems = [], activeTab, onTabSelect }) {
  return (
    <aside className="sidebar-container">
      
      {/* Top Section: Metrics / Summary Cards */}
      <div>
        <h3 className="sidebar-title">{title}</h3>
        <div className="metrics-container">
          {/* Loop through metrics array and draw a card for each metric */}
          {metrics.map((item, index) => (
            <div 
              key={index} 
              className={item.highlight ? 'metric-card-highlight' : 'metric-card'}
            >
              <div className="metric-label">{item.label}</div>
              <div className="metric-value">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Page Navigation Links */}
      <nav>
        <h3 className="sidebar-title">NAVIGATION</h3>
        <div className="nav-menu">
          {/* Loop through navItems array to draw buttons */}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabSelect(item.id)} // Tells parent component which tab was clicked
              className={activeTab === item.id ? 'nav-item-active' : 'nav-item'}
            >
              <span>{item.icon} {item.label}</span>
              
              {/* Optional badge count (e.g. pending items indicator) */}
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </div>
      </nav>

    </aside>
  );
}