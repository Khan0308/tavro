import { Link } from 'react-router-dom';
import { Icon } from '../utils/icons.jsx';
import { tools } from '../data/tools.js';
export default function CategoryCard({ category }) {
  const n = tools.filter((t) => t.category === category.slug).length;
  return (
    <Link to={`/category/${category.slug}`} className="card category-card" data-cat={category.slug}>
      <span className="icon-chip"><Icon name={category.icon} /></span>
      <h3>{category.name}</h3>
      <p>{category.description}</p>
      <span className="muted small">{n} tools</span>
    </Link>
  );
}
