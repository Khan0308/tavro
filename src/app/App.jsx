import { Routes, Route, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ScrollToTop from '../components/ScrollToTop.jsx';
import HomePage from '../pages/HomePage.jsx';
import AllToolsPage from '../pages/AllToolsPage.jsx';
import CategoryPage from '../pages/CategoryPage.jsx';
import ToolPage from '../pages/ToolPage.jsx';
import { AboutPage, ContactPage, PrivacyPage, TermsPage, NotFoundPage } from '../pages/InfoPages.jsx';

const pageName = (p) => (p === '/' ? 'home' : p === '/tools' ? 'tools' : p.startsWith('/category/') ? 'category' : p.startsWith('/tools/') ? 'tool' : p === '/about' ? 'about' : p === '/contact' ? 'contact' : ['/privacy-policy', '/terms'].includes(p) ? 'legal' : 'tool');

export default function App() {
  const { pathname } = useLocation();
  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollToTop />
      <Header />
      <main id="main" tabIndex={-1} data-page={pageName(pathname)}>
        <div key={pathname} className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools" element={<AllToolsPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}
