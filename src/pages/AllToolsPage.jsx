import { useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ToolCard from '../components/ToolCard.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { categories } from '../data/categories.js';
import { tools, searchTools } from '../data/tools.js';
import { usePageMeta } from '../utils/usePageMeta.js';

export default function AllToolsPage() {
  usePageMeta('All Tools', 'Browse every TAVRO tool. Search and filter by category.');
  const [params, setParams] = useSearchParams();
  const { state } = useLocation();
  const q = params.get('q') || ''; const cat = params.get('category') || ''; const sort = params.get('sort') || 'az';
  const set = (k, v) => { const p = new URLSearchParams(params); v ? p.set(k, v) : p.delete(k); setParams(p, { replace: true }); };
  useEffect(() => { if (state?.scrollTo) document.getElementById(state.scrollTo)?.scrollIntoView(); }, [state]);
  const list = useMemo(() => {
    let l = searchTools(tools, q);
    if (cat) l = l.filter((t) => t.category === cat);
    return [...l].sort((a, b) => sort === 'popular' ? (Number(b.popular) - Number(a.popular)) || a.title.localeCompare(b.title) : a.title.localeCompare(b.title));
  }, [q, cat, sort]);
  const filtered = q || cat;
  return (
    <div className="container section">
      <h1>All tools</h1>
      <p className="lead">{tools.length} tools across {categories.length} categories. {tools.every((t) => t.status === 'ready') ? 'All of them are ready to use.' : `${tools.filter((t) => t.status === 'ready').length} are ready to use; the rest are marked Coming soon.`}</p>
      <div className="toolbar">
        <div className="field grow"><label htmlFor="q">Search tools</label><input id="q" type="search" value={q} onChange={(e) => set('q', e.target.value)} placeholder="Name, description or category" /></div>
        <div className="field"><label htmlFor="sort">Sort by</label><select id="sort" value={sort} onChange={(e) => set('sort', e.target.value)}><option value="az">A to Z</option><option value="popular">Popular</option></select></div>
      </div>
      <div className="chips" role="group" aria-label="Filter by category">
        <button type="button" className={`chip ${!cat ? 'active' : ''}`} aria-pressed={!cat} onClick={() => set('category', '')}>All</button>
        {categories.map((c) => <button key={c.slug} type="button" className={`chip ${cat === c.slug ? 'active' : ''}`} aria-pressed={cat === c.slug} onClick={() => set('category', c.slug)}>{c.name}</button>)}
        {filtered && <button type="button" className="chip chip-clear" onClick={() => setParams({}, { replace: true })}>Clear filters</button>}
      </div>
      <p className="muted" role="status">{list.length} {list.length === 1 ? 'tool' : 'tools'} shown</p>
      {list.length ? <div className="grid">{list.map((t) => <ToolCard key={t.slug} tool={t} />)}</div>
        : <EmptyState title="No tools match" action={<button type="button" className="btn btn-soft" onClick={() => setParams({}, { replace: true })}>Clear filters</button>}>Try a different word or remove a filter.</EmptyState>}
      <section id="categories" className="section"><h2>Categories</h2><div className="grid">{categories.map((c) => <CategoryCard key={c.slug} category={c} />)}</div></section>
    </div>
  );
}
