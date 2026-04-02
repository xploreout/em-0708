import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import PastEvents from './components/PastEvents';
import MainPage from './components/MainPage';
import Events from './components/Events';
import BasicsOfFaith from './components/BasicsOfFaith';
import PurposeDrivenLife from './components/PurposeDrivenLife';
import AdultSmallGroup from './components/AdultSmallGroup';
import Youth from './components/Youth';
import Children from './components/Children';
import OtherResources from './components/OtherResources';
import Header from './components/Header';
import Footer from './components/Footer';
import PageNav from './components/PageNav';

function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <PageNav />
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
            <Route path="/events" element={<Events />} />
            <Route path="/resources/adult-small-group" element={<AdultSmallGroup />} />
            <Route path="/resources/youth" element={<Youth />} />
            <Route path="/resources/children" element={<Children />} />
            <Route path="/resources/other" element={<OtherResources />} />
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
