import React from 'react';
import InvoiceHierarchy from './components/InvoiceHierarchy';

// Simple test component to verify the hierarchy component renders
const TestHierarchy: React.FC = () => {
  return (
    <div>
      <h1>Testing Invoice Hierarchy Component</h1>
      <InvoiceHierarchy />
    </div>
  );
};

export default TestHierarchy;