import { lazy, Suspense, useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Weddings from './pages/Weddings';
import WeddingDetail from './pages/WeddingDetail';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Venues from './pages/Venues';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import { Loading } from './components/State';

// Admin code is split into its own chunk so visitors never download it.
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const Enquiries = lazy(() => import('./admin/Enquiries'));
const ContentAdmin = lazy(() => import('./admin/ContentAdmin'));
const ServicesAdmin = lazy(() => import('./admin/Managers').then((m) => ({ default: m.ServicesAdmin })));
const CollectionsAdmin = lazy(() => import('./admin/Managers').then((m) => ({ default: m.CollectionsAdmin })));
const WeddingsAdmin = lazy(() => import('./admin/Managers').then((m) => ({ default: m.WeddingsAdmin })));
const GalleryAdmin = lazy(() => import('./admin/Managers').then((m) => ({ default: m.GalleryAdmin })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PublicLayout() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-white focus:p-3">Skip to content</a>
      <Header />
      <div id="main"><Outlet /></div>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="weddings" element={<Weddings />} />
            <Route path="weddings/:slug" element={<WeddingDetail />} />
            <Route path="collections" element={<Collections />} />
            <Route path="collections/:slug" element={<CollectionDetail />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:slug" element={<ServiceDetail />} />
            <Route path="venues" element={<Venues />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="services" element={<ServicesAdmin />} />
            <Route path="collections" element={<CollectionsAdmin />} />
            <Route path="weddings" element={<WeddingsAdmin />} />
            <Route path="gallery" element={<GalleryAdmin />} />
            <Route path="content" element={<ContentAdmin />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
