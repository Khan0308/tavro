import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tools, searchTools } from '../data/tools.js';

// Global search: type to see matching tools, Enter opens the full results page.
export default function SearchBar({ large = false, id = 'global-search' }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const results = q.trim() ? searchTools(tools, q).slice(0, 6) : [];
  const submit = (e) => { e.preventDefault(); setOpen(false); navigate(`/tools?q=${encodeURIComponent(q.trim())}`); };
  return (
    <form className={`search ${large ? 'search-lg' : ''}`} role="search" onSubmit={submit}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <label htmlFor={id} className="sr-only">Search tools</label>
      <Search size={large ? 22 : 18} className="search-icon" aria-hidden="true" />
      <input id={id} type="search" value={q} autoComplete="off" placeholder="Search tools, e.g. JSON, QR, compress"
        onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} />
      {large && <button type="submit" className="btn btn-primary">Search</button>}
      {open && q.trim() && (
        <ul className="search-pop">
          {results.length ? results.map((t) => (
            <li key={t.slug}><a href={`/tools/${t.slug}`} onClick={(e) => { e.preventDefault(); setOpen(false); setQ(''); navigate(`/tools/${t.slug}`); }}>
              <strong>{t.title}</strong><span>{t.description}</span></a></li>
          )) : <li className="search-none">No tools match “{q}”.</li>}
        </ul>
      )}
    </form>
  );
}
