import React from 'react';
import QuickBotMode from '../components/iso-studio/QuickBotMode';

function TestPage() {
  const handleComplete = () => {
    console.log('Quick Bot Mode completed!');
  };

  return (
    <div>
      <h1>Test Quick Bot Mode</h1>
      <QuickBotMode onComplete={handleComplete} />
    </div>
  );
}

export default TestPage;
