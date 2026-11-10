import { useState } from 'react';
import { TextArea, Output, ResetButton, Field } from '../ui.jsx';

function parseJson(text) {
  try { return { value: JSON.parse(text) }; }
  catch (e) {
    const m = /position (\d+)/.exec(e.message); let where = '';
    if (m) { const pos = Number(m[1]); const before = text.slice(0, pos).split('\n'); where = ` (line ${before.length}, column ${before[before.length - 1].length + 1})`; }
    return { error: `${e.message}${where}` };
  }
}
export function JsonFormatter() {
  const [t, setT] = useState(''); const [mode, setMode] = useState('2');
  const r = t.trim() ? parseJson(t) : null;
  const out = r?.value !== undefined ? (mode === 'min' ? JSON.stringify(r.value) : JSON.stringify(r.value, null, mode === 'tab' ? '\t' : Number(mode))) : '';
  return <div className="stack">
    <TextArea id="js" label="JSON input" value={t} onChange={setT} rows={10} placeholder='{"name":"TAVRO","tools":53}' error={r?.error ? `Invalid JSON: ${r.error}` : ''} />
    <Field id="jm" label="Output style"><select id="jm" value={mode} onChange={(e) => setMode(e.target.value)}><option value="2">Pretty, 2 spaces</option><option value="4">Pretty, 4 spaces</option><option value="tab">Pretty, tabs</option><option value="min">Minified</option></select></Field>
    <Output value={out} filename="formatted.json" rows={10} />
    <div className="actions"><ResetButton onClick={() => setT('')} /></div></div>;
}
export function JsonValidator() {
  const [t, setT] = useState(''); const r = t.trim() ? parseJson(t) : null;
  return <div className="stack">
    <TextArea id="jv" label="JSON to check" value={t} onChange={setT} rows={10} placeholder="Paste JSON here" />
    <div role="status" className={r ? (r.error ? 'result bad' : 'result good') : 'result'}>
      {!r ? 'Paste JSON above to check it.' : r.error ? `Invalid: ${r.error}` : 'Valid JSON.'}</div>
    <div className="actions"><ResetButton onClick={() => setT('')} /></div></div>;
}
const enc = (s) => { const b = new TextEncoder().encode(s); let bin = ''; b.forEach((x) => { bin += String.fromCharCode(x); }); return btoa(bin); };
const dec = (s) => { const bin = atob(s.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')); return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))); };
function Safe({ fn, label, placeholder, filename }) {
  const [t, setT] = useState(''); let out = ''; let err = '';
  if (t) { try { out = fn(t); } catch { err = label === 'decode' ? 'This is not valid input to decode. Check for missing or extra characters.' : 'Could not convert this input.'; } }
  return <div className="stack"><TextArea id="sf" label="Input" value={t} onChange={setT} placeholder={placeholder} error={err} />
    <Output value={out} filename={filename} /><div className="actions"><ResetButton onClick={() => setT('')} /></div></div>;
}
export const Base64Encoder = () => <Safe fn={enc} label="encode" placeholder="Text to encode (UTF-8 supported)" filename="encoded.txt" />;
export const Base64Decoder = () => <Safe fn={dec} label="decode" placeholder="Base64 text to decode" filename="decoded.txt" />;
export const UrlEncoder = () => <Safe fn={(s) => encodeURIComponent(s)} label="encode" placeholder="Text or URL part to encode" filename="encoded.txt" />;
export const UrlDecoder = () => <Safe fn={(s) => decodeURIComponent(s)} label="decode" placeholder="e.g. hello%20world%21" filename="decoded.txt" />;
