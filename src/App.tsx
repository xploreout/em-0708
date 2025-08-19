import React from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Announcements from './components/Announcements';
import Resources from './components/Resources';
import NewcomerForm from './components/NewcomerForm';
import Footer from './components/Footer';
import PastEvents from './components/PastEvents';

function App() {
  return (
     <Router>
      <div className="min-h-screen">
        <Routes>
        <Route path="/" element={
            <>
              <Header />
              <main>
                <Hero />
                <Announcements />
                <Resources />
                <NewcomerForm/>
              </main>
              <Footer />
            </>
          } />
          <Route path="/past-events" element={<PastEvents />} />
           </Routes>
      </div>
     
    </Router>
  );
}

export default App;