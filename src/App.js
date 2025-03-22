import React from 'react';
import Clipboard from './components/Clipboard';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="app dark:bg-gray-900 transition-colors duration-200">
        <Clipboard />
      </div>
    </ThemeProvider>
  );
}

export default App;