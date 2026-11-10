import { Link, useParams } from 'react-router-dom';
import ToolCard from '../components/ToolCard.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { NotFoundPage } from './InfoPages.jsx';
import { getCategory, categories } from '../data/categories.js';
import { tools } from '../data/tools.js';
import { usePageMeta } from '../utils/usePageMeta.js';

export default function CategoryPage() {
  const { slug } = useParams();
  const cat = getCategory(slug);
  usePageMeta(cat?.name, cat?.description);
  if (!cat) return <NotFoundPage />;
  const list = tools.filter((t) => t.category === slug);
  return (
    <div className="container section">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'All Tools', to: '/tools' }, { label: cat.name }]} />
      <h1>{cat.name}</h1><p className="lead">{cat.description}</p>
      <div className="grid">{list.map((t) => <ToolCard key={t.slug} tool={t} />)}</div>
      <h2>Other categories</h2>
      <div className="chips">{categories.filter((c) => c.slug !== slug).map((c) => <Link key={c.slug} className="chip" to={`/category/${c.slug}`}>{c.name}</Link>)}</div>
    </div>
  );
}
