import { useState } from 'react';
import { TextArea, Output, ResetButton, Field, TransformTool } from '../ui.jsx';
import { formatHtml, minifyCss, encodeEntities, decodeEntities } from '../../utils/logic.js';

export const HtmlFormatter = () => <TransformTool inputLabel="HTML" placeholder="<div><p>Paste HTML here</p></div>" filename="formatted.html"
  fn={(s, m) => formatHtml(s, m === '4' ? 4 : 2)} options={[{ value: '2', label: 'Indent with 2 spaces' }, { value: '4', label: 'Indent with 4 spaces' }]} />;

const saved = (a, b) => (a ? Math.max(0, Math.round((1 - b / a) * 100)) : 0);
export function CssMinifier() {
  const [t, setT] = useState(''); const out = t.trim() ? minifyCss(t) : '';
  return <div className="stack">
    <TextArea id="css" label="CSS" value={t} onChange={setT} rows={10} placeholder="Paste CSS here" />
    <Output value={out} filename="styles.min.css" rows={8} />
    {out && <p role="status" className="result good">{t.length} → {out.length} characters (saved {saved(t.length, out.length)}%).</p>}
    <p className="muted small">Removes comments and extra whitespace. It does not rewrite or merge rules, so the result behaves the same.</p>
    <div className="actions"><ResetButton onClick={() => setT('')} /></div></div>;
}

export function JsMinifier() {
  const [t, setT] = useState(''); const [out, setOut] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [mangle, setMangle] = useState(true);
  const run = async () => {
    setErr(''); setOut(''); if (!t.trim()) return setErr('Paste some JavaScript first.');
    setBusy(true);
    try {
      const mod = await import('terser-browser'); const minify = mod.minify || mod.default?.minify;
      const r = await minify(t, { compress: true, mangle });
      setOut(r.code || '');
    } catch (e) { setErr(`Could not minify: ${e.message}${e.line ? ` (line ${e.line}, column ${e.col})` : ''}`); }
    setBusy(false);
  };
  return <div className="stack">
    <TextArea id="js" label="JavaScript" value={t} onChange={(v) => { setT(v); setOut(''); }} rows={10} placeholder="Paste JavaScript here" error={err} />
    <label className="check"><input type="checkbox" checked={mangle} onChange={(e) => setMangle(e.target.checked)} /> Shorten local variable names</label>
    <div className="actions"><button type="button" className="btn btn-primary" onClick={run} disabled={busy}>{busy ? 'Minifying…' : 'Minify JavaScript'}</button><ResetButton onClick={() => { setT(''); setOut(''); setErr(''); }} /></div>
    {out && <><Output value={out} filename="script.min.js" rows={8} /><p role="status" className="result good">{t.length} → {out.length} characters (saved {saved(t.length, out.length)}%).</p></>}
    <p className="muted small">Uses the Terser library in your browser. Plain scripts and modern syntax are supported. Test minified code before shipping.</p></div>;
}

export function HtmlEntities() {
  const [t, setT] = useState(''); const [mode, setMode] = useState('encode'); const [all, setAll] = useState(false);
  const out = t ? (mode === 'encode' ? encodeEntities(t, all) : decodeEntities(t)) : '';
  return <div className="stack">
    <TextArea id="he" label="Your text" value={t} onChange={setT} placeholder={mode === 'encode' ? '<p>Tom & "Jerry"</p>' : '&lt;p&gt;Tom &amp; Jerry&lt;/p&gt;'} />
    <Field id="hm" label="Mode"><select id="hm" value={mode} onChange={(e) => setMode(e.target.value)}><option value="encode">Encode (text to entities)</option><option value="decode">Decode (entities to text)</option></select></Field>
    {mode === 'encode' && <label className="check"><input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> Also encode non-ASCII characters (é, ©, emoji)</label>}
    <Output value={out} filename="entities.txt" /><div className="actions"><ResetButton onClick={() => setT('')} /></div></div>;
}
