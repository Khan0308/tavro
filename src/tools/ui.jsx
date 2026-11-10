import { useState } from 'react';
import { Copy, Check, Download, RotateCcw } from 'lucide-react';
import { downloadText } from '../utils/fileHelpers.js';

export function useCopy() {
  const [state, setState] = useState('idle');
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); setState('done'); }
    catch { setState('error'); }
    setTimeout(() => setState('idle'), 1800);
  };
  return [state, copy];
}
export function CopyButton({ text, disabled }) {
  const [s, copy] = useCopy();
  return <button type="button" className="btn btn-soft" disabled={disabled || !text} onClick={() => copy(text)}>
    {s === 'done' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
    {s === 'done' ? 'Copied' : s === 'error' ? 'Copy failed. Select and copy manually' : 'Copy'}</button>;
}
export const DownloadTextButton = ({ text, filename = 'TAVRO.txt', disabled }) =>
  <button type="button" className="btn btn-soft" disabled={disabled || !text} onClick={() => downloadText(text, filename)}><Download size={16} aria-hidden="true" />Download</button>;
export const ResetButton = ({ onClick }) => <button type="button" className="btn btn-ghost" onClick={onClick}><RotateCcw size={16} aria-hidden="true" />Reset</button>;

export function Field({ id, label, hint, error, children }) {
  return <div className="field"><label htmlFor={id}>{label}</label>{hint && <span className="hint" id={`${id}-h`}>{hint}</span>}{children}{error && <span className="error" role="alert">{error}</span>}</div>;
}
export function TextArea({ id, label, value, onChange, rows = 8, placeholder, hint, error }) {
  return <Field id={id} label={label} hint={hint} error={error}><textarea id={id} rows={rows} value={value} placeholder={placeholder} aria-invalid={!!error} aria-describedby={hint ? `${id}-h` : undefined} onChange={(e) => onChange(e.target.value)} /></Field>;
}
export function Output({ id = 'out', label = 'Result', value, filename, rows = 8 }) {
  return <div className="stack-sm">
    <Field id={id} label={label}><textarea id={id} rows={rows} readOnly value={value} placeholder="Your result will appear here" /></Field>
    <div className="actions"><CopyButton text={value} /><DownloadTextButton text={value} filename={filename} /></div></div>;
}
export const Stat = ({ label, value }) => <div className="stat"><span className="stat-v">{value}</span><span className="stat-l">{label}</span></div>;

// Generic text-in, text-out tool.
export function TransformTool({ fn, inputLabel = 'Your text', placeholder = 'Type or paste text here', actionLabel, filename, options }) {
  const [text, setText] = useState('');
  const [opt, setOpt] = useState(options?.[0]?.value);
  const out = text ? fn(text, opt) : '';
  return <div className="stack">
    <TextArea id="in" label={inputLabel} value={text} onChange={setText} placeholder={placeholder} />
    {options && <Field id="opt" label="Mode"><select id="opt" value={opt} onChange={(e) => setOpt(e.target.value)}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>}
    <Output value={out} filename={filename} />
    <div className="actions"><ResetButton onClick={() => setText('')} /></div>
  </div>;
}

// List of generated options, each with its own Copy button and optional length hint.
export function ResultList({ items, limit, unit = 'characters' }) {
  if (!items.length) return <p className="muted">Results will appear here.</p>;
  return <ul className="result-list">{items.map((it, i) => (
    <li key={i} className="result-item"><pre>{it.text}</pre>
      <div className="result-meta"><span className={limit && it.length > limit ? 'error' : 'muted small'}>{it.length} {unit}{limit && it.length > limit ? ` (over the ${limit} limit)` : ''}</span><CopyButton text={it.text} /></div></li>))}</ul>;
}
