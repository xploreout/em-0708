import { HashRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
import EmFeud from './components/EmFeud';
import EmFeudForm from './components/EmFeudForm';
import { AuthProvider } from './context/AuthContext';
import ScheduleCalendar from './components/schedule/ScheduleCalendar';
import PraiseTeam from './components/schedule/PraiseTeam';
import Worship from './components/schedule/Worship';
import AdminPanel from './components/schedule/AdminPanel';
import PastEvents from './components/PastEvents';
import MainPage from './components/MainPage';
import Events from './components/Events';
import BasicsOfFaith from './components/BasicsOfFaith';
import PurposeDrivenLife from './components/PurposeDrivenLife';
import AdultSmallGroup from './components/AdultSmallGroup';
import Youth from './components/Youth';
import Children from './components/Children';
import OtherResources from './components/OtherResources';
import About from './components/About';
import ImNew from './components/ImNew';
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
      <AuthProvider>
      <ScrollToTop />
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
            <Route path="/about" element={<About />} />
            <Route path="/im-new" element={<ImNew />} />
          </Route>
          <Route path="/games/emfeud" element={<EmFeud />} />
          <Route path="/games/emfeud/form" element={<EmFeudForm />} />
          <Route element={<Layout />}>
            <Route path="/schedule/calendar"    element={<ScheduleCalendar />} />
            <Route path="/schedule/praise-team" element={<PraiseTeam />} />
            <Route path="/schedule/worship"     element={<Worship />} />
            <Route path="/schedule/admin"       element={<AdminPanel />} />
          </Route>
        </Routes>
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
