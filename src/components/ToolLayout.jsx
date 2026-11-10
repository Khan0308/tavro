import { Link } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs.jsx';
import ToolCard from './ToolCard.jsx';
import { Icon } from '../utils/icons.jsx';
import { getCategory } from '../data/categories.js';
import { tools } from '../data/tools.js';
import { toolInfo } from '../tools/info.js';

export default function ToolLayout({ tool, children }) {
  const cat = getCategory(tool.category);
  const catTo = cat.to || `/category/${cat.slug}`;
  const info = toolInfo[tool.slug] || {};
  const related = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 3);
  const steps = info.steps || ['Enter your input or choose a file.', 'Adjust the options if you need to.', 'Copy or download the result.'];
  const faqs = [...(info.faq || []), { q: 'Is my data uploaded anywhere?', a: 'No. This tool runs in your browser and nothing you enter is sent to a server.' }];
  return (
    <div className="container tool-page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: cat.name, to: catTo }, { label: tool.title }]} />
      <header className="tool-head" data-cat={tool.category}>
        <span className="icon-chip icon-chip-lg"><Icon name={tool.icon} size={30} /></span>
        <div><h1>{tool.title}</h1><p className="lead">{tool.description}</p></div>
      </header>
      <section className="card tool-panel" aria-label={`${tool.title} tool`}>{children}</section>
      <section className="tool-info"><h2>How to use</h2><ol className="steps-list">{steps.map((s) => <li key={s}>{s}</li>)}</ol></section>
      {info.note && <p className="note"><strong>Note:</strong> {info.note}</p>}
      {related.length > 0 && <section><h2>Related tools</h2><div className="grid">{related.map((t) => <ToolCard key={t.slug} tool={t} />)}</div></section>}
      <section><h2>FAQ</h2>{faqs.map((f) => <details key={f.q} className="faq"><summary>{f.q}</summary><p>{f.a}</p></details>)}</section>
      <p><Link to={catTo}>More {cat.name.toLowerCase()}</Link></p>
    </div>
  );
}
