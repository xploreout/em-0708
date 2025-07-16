import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Announcements from './components/Announcements';
import Resources from './components/Resources';
import NewcomerForm from './components/NewcomerForm';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Announcements />
      <Resources />
      <NewcomerForm />
      <Footer />
    </div>
  );
}

export default App;