import React from 'react';
import './App.css';

export const Table = ({ columns = [], data = [], emptyMessage = 'No records found.' }) => {
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead className="custom-table-head">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="custom-table-th" style={{ width: col.width || 'auto' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="custom-table-td">
                    {/* Render via custom render function if provided, otherwise render property */}
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="custom-table-empty">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};