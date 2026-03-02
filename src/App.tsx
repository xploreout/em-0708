import React from 'react';

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import PastEvents from './components/PastEvents';
import MainPage from './components/MainPage';

function App() {
  return (
     <Router>
      <div className="min-h-screen">
        <Routes>
        <Route path="/" element={
            <MainPage />
          } />
          <Route path="/past-events" element={<PastEvents />} />
           </Routes>
      </div>
     
    </Router>
  );
}

export default App;