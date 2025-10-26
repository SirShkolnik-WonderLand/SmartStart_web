/**
 * MINIMAL PAGES
 * Ultra-simple pages component without any hooks to test basic mounting
 */

import React from 'react';
import styled from 'styled-components';

const MinimalContainer = styled.div`
  padding: 40px;
  text-align: center;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

export function MinimalPages() {
  console.log('MinimalPages component mounted!');
  
  return (
    <MinimalContainer>
      <h1>Minimal Pages</h1>
      <p>This is a minimal pages component with no hooks or complex logic.</p>
      <p>If you see this, basic component mounting works for Pages route too.</p>
      <div style={{ marginTop: '20px', padding: '20px', background: '#1a1a1a', borderRadius: '8px' }}>
        <h3>Static Pages Data</h3>
        <p>Page 1: /home - 0 views</p>
        <p>Page 2: /about - 0 views</p>
        <p>Page 3: /contact - 0 views</p>
      </div>
    </MinimalContainer>
  );
}
