import React from 'react';
import Clipboard from './components/Clipboard';
import { ThemeProvider } from './context/ThemeContext';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <ThemeProvider>
      <div className="app dark:bg-gray-900 transition-colors duration-200">
        <Clipboard />
        <Analytics/>
        <SpeedInsights/>
      </div>
    </ThemeProvider>
  );
}

export default App;