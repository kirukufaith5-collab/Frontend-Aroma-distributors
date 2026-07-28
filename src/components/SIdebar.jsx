import React from 'react';
import './Components.App.css';

export const Sidebar = ({ title, metrics, navItems, activeTab, onTabSelect }) => {
  return (
    <aside className="sidebar-container">
      <div>
        <h3 className="sidebar-title">{title}</h3>
        <div className="metrics-container">
          {metrics.map((m, idx) => (
            <div key={idx} className={m.highlight ? 'metric-card-highlight' : 'metric-card'}>
              <div className="metric-label">{m.label}</div>
              <div className="metric-value">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      <nav>
        <h3 className="sidebar-title">NAVIGATION</h3>
        <div className="nav-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabSelect(item.id)}
              className={activeTab === item.id ? 'nav-item-active' : 'nav-item'}
            >
              <span>{item.icon} {item.label}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
};