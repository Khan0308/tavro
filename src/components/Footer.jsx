import { Link } from 'react-router-dom';
import { Logo } from './Header.jsx';
import { categories } from '../data/categories.js';
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div><Logo /><p className="muted">Simple. Fast. Powerful. Free online tools that run in your browser.</p></div>
        <nav aria-label="Footer navigation"><h2>Explore</h2><ul>
          <li><Link to="/">Home</Link></li><li><Link to="/tools">All Tools</Link></li><li><Link to="/about">About</Link></li><li><Link to="/contact">Contact</Link></li></ul></nav>
        <nav aria-label="Footer categories"><h2>Categories</h2><ul>
          {categories.map((c) => <li key={c.slug}><Link to={`/category/${c.slug}`}>{c.name}</Link></li>)}</ul></nav>
        <nav aria-label="Legal"><h2>Legal</h2><ul>
          <li><Link to="/privacy-policy">Privacy Policy</Link></li><li><Link to="/terms">Terms of Use</Link></li></ul></nav>
      </div>
      <div className="container footer-bottom">© {new Date().getFullYear()} TAVRO. All rights reserved.</div>
    </footer>
  );
}
