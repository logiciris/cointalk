import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = '로딩 중...' }) => {
  return (
    <div 
      className="d-flex flex-column justify-content-center align-items-center" 
      style={{ 
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}
    >
      <Spinner animation="border" variant="primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p className="mt-3 text-muted">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
