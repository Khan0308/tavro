import { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import ToolLayout from '../components/ToolLayout.jsx';
import { NotFoundPage } from './InfoPages.jsx';
import { getTool } from '../data/tools.js';
import { registry } from '../tools/registry.js';
import { toolInfo } from '../tools/info.js';
import { usePageMeta } from '../utils/usePageMeta.js';

export default function ToolPage() {
  const { slug } = useParams();
  const tool = getTool(slug);
  usePageMeta(tool ? `${tool.title}: free online tool` : 'Not found', tool ? `${tool.description} Free, no sign-up, runs in your browser.` : '');
  if (!tool) return <NotFoundPage />;
  const Component = tool.status === 'ready' ? registry[tool.slug] : null;
  return (
    <ToolLayout tool={tool}>
      {Component ? <Suspense fallback={<p role="status" className="muted">Loading tool…</p>}><Component /></Suspense> : (
        <div className="coming-soon">
          <h2>Coming soon</h2>
          <p>This tool is not built yet, so its action is disabled. {toolInfo[tool.slug]?.note}</p>
          <button type="button" className="btn btn-primary" disabled>Not available yet</button>
          <p><Link to="/tools">See tools that are ready</Link></p>
        </div>
      )}
    </ToolLayout>
  );
}
