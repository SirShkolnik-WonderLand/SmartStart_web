/**
 * SIMPLE TEST DASHBOARD
 * Minimal dashboard component to test if the issue is with the complex Dashboard
 */

import React from 'react';
import styled from 'styled-components';

const TestContainer = styled.div`
  padding: 40px;
  text-align: center;
`;

export function TestDashboard() {
  console.log('TestDashboard component mounted!');
  
  return (
    <TestContainer>
      <h1>Test Dashboard</h1>
      <p>This is a simple test dashboard to verify component mounting works.</p>
      <p>If you see this, the issue is with the complex Dashboard component.</p>
    </TestContainer>
  );
}
