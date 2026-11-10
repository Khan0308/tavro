import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import SearchBar from './SearchBar.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="TAVRO home">
      <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2563eb" /><stop offset="1" stopColor="#7c3aed" /></linearGradient></defs><rect width="32" height="32" rx="9" fill="url(#lg)" /><path d="M9 10h14M16 10v13" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
      <span>TAVRO</span>
    </Link>
  );
}
const links = [['/', 'Home'], ['/tools', 'All Tools'], ['/tools#categories', 'Categories'], ['/about', 'About'], ['/contact', 'Contact']];

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const bar = useRef(null); const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => { const h = document.documentElement; const p = h.scrollHeight - h.clientHeight; if (bar.current) bar.current.style.width = `${p > 0 ? (h.scrollTop / p) * 100 : 0}%`; setScrolled(h.scrollTop > 8); };
    on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="progress" ref={bar} aria-hidden="true" />
      <div className="container header-row">
        <Logo />
        <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main">
          {links.map(([to, label]) => to.includes('#')
            ? <Link key={label} to="/tools" state={{ scrollTo: 'categories' }} onClick={close}>{label}</Link>
            : <NavLink key={to} to={to} end={to === '/'} onClick={close}>{label}</NavLink>)}
          {/* <div className="nav-search"><SearchBar id="nav-search" /></div> */}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <button type="button" className="icon-btn menu-btn" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
