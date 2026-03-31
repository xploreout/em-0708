import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import PastEvents from './components/PastEvents';
import MainPage from './components/MainPage';
import Announcements from './components/Announcements';
import Resources from './components/Resources';
import BasicsOfFaith from './components/BasicsOfFaith';
import PurposeDrivenLife from './components/PurposeDrivenLife';
import Header from './components/Header';
import Footer from './components/Footer';

function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route element={<Layout />}>
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/basicoffaith" element={<BasicsOfFaith />} />
            <Route path="/resources/purposedrivenlife" element={<PurposeDrivenLife />} />
            <Route path="/past-events" element={<PastEvents />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
