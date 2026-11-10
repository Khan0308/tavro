import { Link } from 'react-router-dom';
import { Icon } from '../utils/icons.jsx';
import { getCategory } from '../data/categories.js';
export default function ToolCard({ tool }) {
  const soon = tool.status !== 'ready';
  return (
    <article className="card tool-card" data-cat={tool.category}>
      <div className="tool-card-top">
        <span className="icon-chip"><Icon name={tool.icon} /></span>
        <span className="badge">{getCategory(tool.category)?.name}</span>
      </div>
      <h3>{tool.title}</h3>
      <p>{tool.description}</p>
      <div className="tool-card-foot">
        <Link to={`/tools/${tool.slug}`} className="btn btn-soft" aria-label={`Open tool: ${tool.title}`}>Open tool</Link>
        {soon && <span className="badge badge-soon">Coming soon</span>}
      </div>
    </article>
  );
}
