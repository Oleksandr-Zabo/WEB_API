import React from 'react';
import '../../styles/common/LoadingSpinner.css';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-container">
      <div className="spinner">
        <div className="spinner-circle"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};
