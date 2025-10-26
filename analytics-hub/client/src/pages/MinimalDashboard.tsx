/**
 * MINIMAL DASHBOARD
 * Ultra-simple dashboard without any hooks to test basic mounting
 */

import React from 'react';
import styled from 'styled-components';

const MinimalContainer = styled.div`
  padding: 40px;
  text-align: center;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

export function MinimalDashboard() {
  console.log('MinimalDashboard component mounted!');
  
  return (
    <MinimalContainer>
      <h1>Minimal Dashboard</h1>
      <p>This is a minimal dashboard with no hooks or complex logic.</p>
      <p>If you see this, basic component mounting works.</p>
      <div style={{ marginTop: '20px', padding: '20px', background: '#1a1a1a', borderRadius: '8px' }}>
        <h3>Static Content</h3>
        <p>Total Visitors: 0</p>
        <p>Total Sessions: 0</p>
        <p>Total Page Views: 0</p>
      </div>
    </MinimalContainer>
  );
}
