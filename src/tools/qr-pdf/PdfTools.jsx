import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Download, Trash2, Upload } from 'lucide-react';
import { zipSync } from 'fflate';
import { Field, ResetButton } from '../ui.jsx';
import { downloadBlob, formatBytes, canvasToBlob, loadImage } from '../../utils/fileHelpers.js';
import { mergePdfs, extractPages, splitAll, parseRanges, pageCount, imagesToPdf } from '../../utils/pdfOps.js';

const MAX_MB = 50;
const readBytes = async (f) => new Uint8Array(await f.arrayBuffer());
const isPdf = (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);

function Picker({ id, label, hint, accept, multiple, onFiles }) {
  return <Field id={id} label={label} hint={hint}>
    <label className="drop" htmlFor={id}><Upload aria-hidden="true" /><span>{multiple ? 'Select files' : 'Select a file'}</span></label>
    <input id={id} className="sr-only-file" type="file" accept={accept} multiple={multiple} onChange={(e) => { onFiles([...e.target.files]); e.target.value = ''; }} /></Field>;
}
function FileList({ files, setFiles }) {
  const move = (i, d) => { const a = [...files]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setFiles(a); };
  return <ol className="file-list">{files.map((f, i) => (
    <li key={f.id}><span className="grow"><strong>{i + 1}. {f.file.name}</strong> <span className="muted small">{formatBytes(f.file.size)}</span></span>
      <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${f.file.name} up`}><ArrowUp size={18} aria-hidden="true" /></button>
      <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === files.length - 1} aria-label={`Move ${f.file.name} down`}><ArrowDown size={18} aria-hidden="true" /></button>
      <button type="button" className="icon-btn" onClick={() => setFiles(files.filter((x) => x.id !== f.id))} aria-label={`Remove ${f.file.name}`}><Trash2 size={18} aria-hidden="true" /></button></li>))}</ol>;
}
let seq = 0;
function useFiles(accept, minOk) {
  const [files, setFiles] = useState([]); const [error, setError] = useState('');
  const add = (list) => {
    setError(''); const ok = []; const bad = [];
    list.forEach((f) => { if (!accept(f)) bad.push(`${f.name}: wrong file type.`); else if (f.size > MAX_MB * 1048576) bad.push(`${f.name}: larger than ${MAX_MB} MB.`); else ok.push({ id: ++seq, file: f }); });
    if (bad.length) setError(bad.join(' ')); setFiles((cur) => [...cur, ...ok]);
  };
  return { files, setFiles, error, setError, add, ok: files.length >= minOk };
}

export function PdfMerger() {
  const s = useFiles(isPdf, 2); const [busy, setBusy] = useState(false); const [done, setDone] = useState('');
  const go = async () => {
    setBusy(true); s.setError(''); setDone('');
    try { const bytes = await mergePdfs(await Promise.all(s.files.map((f) => readBytes(f.file)))); downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'merged.pdf'); setDone(`Merged ${s.files.length} files. Your download should start now.`); }
    catch (e) { s.setError(e.message); }
    setBusy(false);
  };
  return <div className="stack"><Picker id="pm" label="Choose PDF files" hint={`Add at least 2 PDFs, up to ${MAX_MB} MB each. Files stay on your device.`} accept="application/pdf,.pdf" multiple onFiles={(l) => { setDone(''); s.add(l); }} />
    {s.error && <p className="error" role="alert">{s.error}</p>}
    {s.files.length > 0 && <><p className="muted small">Files are merged in this order. Use the arrows to change it.</p><FileList files={s.files} setFiles={s.setFiles} /></>}
    {s.files.length === 1 && <p className="muted" role="status">Add one more PDF to merge.</p>}
    <div className="actions"><button type="button" className="btn btn-primary" disabled={!s.ok || busy} onClick={go}><Download size={16} aria-hidden="true" />{busy ? 'Merging…' : 'Merge and download'}</button><ResetButton onClick={() => { s.setFiles([]); s.setError(''); setDone(''); }} /></div>
    {done && <p role="status" className="result good">{done}</p>}</div>;
}

export function PdfSplitter() {
  const [file, setFile] = useState(null); const [total, setTotal] = useState(0); const [mode, setMode] = useState('range'); const [range, setRange] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState('');
  const pick = async (list) => {
    const f = list[0]; setError(''); setDone(''); setFile(null); setTotal(0); if (!f) return;
    if (!isPdf(f)) return setError('Choose a PDF file.'); if (f.size > MAX_MB * 1048576) return setError(`File is larger than ${MAX_MB} MB.`);
    try { setTotal(await pageCount(await readBytes(f))); setFile(f); } catch (e) { setError(e.message); }
  };
  const go = async () => {
    setError(''); setDone(''); setBusy(true);
    try {
      const buf = await readBytes(file); const base = file.name.replace(/\.pdf$/i, '');
      if (mode === 'range') {
        const r = parseRanges(range, total); if (r.error) throw new Error(r.error);
        downloadBlob(new Blob([await extractPages(buf, r.pages)], { type: 'application/pdf' }), `${base}-pages.pdf`); setDone(`Extracted ${r.pages.length} page${r.pages.length === 1 ? '' : 's'}.`);
      } else {
        const parts = await splitAll(buf); const z = {}; parts.forEach((b, i) => { z[`${base}-page-${i + 1}.pdf`] = b; });
        downloadBlob(new Blob([zipSync(z)], { type: 'application/zip' }), `${base}-pages.zip`); setDone(`Split into ${parts.length} PDFs inside a ZIP file.`);
      }
    } catch (e) { setError(e.message); }
    setBusy(false);
  };
  return <div className="stack"><Picker id="ps" label="Choose a PDF" hint={`Up to ${MAX_MB} MB. Your file stays on your device.`} accept="application/pdf,.pdf" onFiles={pick} />
    {error && <p className="error" role="alert">{error}</p>}
    {file && <>
      <p role="status"><strong>{file.name}</strong>: {total} page{total === 1 ? '' : 's'}</p>
      <Field id="smode" label="How to split"><select id="smode" value={mode} onChange={(e) => setMode(e.target.value)}><option value="range">Extract pages or ranges into one PDF</option><option value="all">Split every page into its own PDF (ZIP)</option></select></Field>
      {mode === 'range' && <Field id="srange" label="Pages" hint="Examples: 1-3, 5, 8-  (8- means page 8 to the end)"><input id="srange" type="text" value={range} onChange={(e) => setRange(e.target.value)} placeholder="1-3, 5" /></Field>}
      <div className="actions"><button type="button" className="btn btn-primary" disabled={busy || (mode === 'range' && !range.trim())} onClick={go}><Download size={16} aria-hidden="true" />{busy ? 'Working…' : 'Split and download'}</button><ResetButton onClick={() => { setFile(null); setTotal(0); setRange(''); setDone(''); setError(''); }} /></div></>}
    {done && <p role="status" className="result good">{done}</p>}</div>;
}

export function PdfToJpg() {
  const [file, setFile] = useState(null); const [scale, setScale] = useState('1.5'); const [pages, setPages] = useState([]); const [busy, setBusy] = useState(''); const [error, setError] = useState('');
  const urls = useRef([]); const clear = () => { urls.current.forEach((u) => URL.revokeObjectURL(u)); urls.current = []; setPages([]); };
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);
  const pick = (list) => { const f = list[0]; clear(); setError(''); setFile(null); if (!f) return; if (!isPdf(f)) return setError('Choose a PDF file.'); if (f.size > MAX_MB * 1048576) return setError(`File is larger than ${MAX_MB} MB.`); setFile(f); };
  const go = async () => {
    clear(); setError(''); setBusy('Loading PDF…');
    try {
      const pdfjs = await import('pdfjs-dist'); pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      const doc = await pdfjs.getDocument({ data: await readBytes(file) }).promise; const n = Math.min(doc.numPages, 100); const out = [];
      for (let i = 1; i <= n; i++) {
        setBusy(`Rendering page ${i} of ${n}…`);
        const page = await doc.getPage(i); const vp = page.getViewport({ scale: Number(scale) });
        if (vp.width * vp.height > 40e6) throw new Error('A page is too large to render at this quality. Choose a lower quality.');
        const c = document.createElement('canvas'); c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height); const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        const blob = await canvasToBlob(c, 'image/jpeg', 0.92); const url = URL.createObjectURL(blob); urls.current.push(url); out.push({ n: i, blob, url });
      }
      setPages(out); if (doc.numPages > n) setError(`Only the first ${n} pages were converted.`);
    } catch (e) { setError(e.name === 'PasswordException' ? 'This PDF is password-protected. Remove the password first.' : e.message || 'Could not read this PDF.'); }
    setBusy('');
  };
  const base = file?.name.replace(/\.pdf$/i, '') || 'page';
  const zip = async () => { const z = {}; for (const p of pages) z[`${base}-page-${p.n}.jpg`] = new Uint8Array(await p.blob.arrayBuffer()); downloadBlob(new Blob([zipSync(z)], { type: 'application/zip' }), `${base}-jpg.zip`); };
  return <div className="stack"><Picker id="pj" label="Choose a PDF" hint={`Up to ${MAX_MB} MB and 100 pages. Your file stays on your device.`} accept="application/pdf,.pdf" onFiles={pick} />
    {error && <p className="error" role="alert">{error}</p>}
    {file && <>
      <Field id="pq" label="Image quality"><select id="pq" value={scale} onChange={(e) => { setScale(e.target.value); clear(); }}><option value="1">Standard (72 dpi)</option><option value="1.5">Good (108 dpi)</option><option value="2">High (144 dpi)</option><option value="3">Very high (216 dpi)</option></select></Field>
      <div className="actions"><button type="button" className="btn btn-primary" onClick={go} disabled={!!busy}>{busy || 'Convert to JPG'}</button><ResetButton onClick={() => { clear(); setFile(null); setError(''); }} /></div></>}
    {busy && <p role="status" className="muted">{busy}</p>}
    {pages.length > 0 && <><div className="actions"><button type="button" className="btn btn-primary" onClick={zip}><Download size={16} aria-hidden="true" />Download all (ZIP)</button></div>
      <div className="thumbs">{pages.map((p) => <figure key={p.n}><img src={p.url} alt={`Page ${p.n} preview`} /><figcaption>Page {p.n} · {formatBytes(p.blob.size)} · <a href={p.url} download={`${base}-page-${p.n}.jpg`}>Download</a></figcaption></figure>)}</div></>}</div>;
}

export function JpgToPdf() {
  const s = useFiles((f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type), 1); const [size, setSize] = useState('fit'); const [busy, setBusy] = useState(false); const [done, setDone] = useState('');
  const go = async () => {
    setBusy(true); s.setError(''); setDone('');
    try {
      const items = [];
      for (const { file } of s.files) {
        if (file.type === 'image/webp') { const { img, url } = await loadImage(file); const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0); URL.revokeObjectURL(url); items.push({ bytes: new Uint8Array(await (await canvasToBlob(c, 'image/jpeg', 0.92)).arrayBuffer()), type: 'image/jpeg' }); }
        else items.push({ bytes: await readBytes(file), type: file.type });
      }
      downloadBlob(new Blob([await imagesToPdf(items, size)], { type: 'application/pdf' }), 'images.pdf'); setDone(`Created a PDF with ${items.length} page${items.length === 1 ? '' : 's'}.`);
    } catch (e) { s.setError(e.message || 'Could not build the PDF. One image may be damaged.'); }
    setBusy(false);
  };
  return <div className="stack"><Picker id="pi" label="Choose images" hint={`JPG, PNG or WebP, up to ${MAX_MB} MB each. Each image becomes one page.`} accept="image/jpeg,image/png,image/webp" multiple onFiles={(l) => { setDone(''); s.add(l); }} />
    {s.error && <p className="error" role="alert">{s.error}</p>}
    {s.files.length > 0 && <><FileList files={s.files} setFiles={s.setFiles} />
      <Field id="pz" label="Page size"><select id="pz" value={size} onChange={(e) => setSize(e.target.value)}><option value="fit">Same size as each image</option><option value="a4">A4 page with margins</option></select></Field></>}
    <div className="actions"><button type="button" className="btn btn-primary" disabled={!s.ok || busy} onClick={go}><Download size={16} aria-hidden="true" />{busy ? 'Creating…' : 'Create PDF'}</button><ResetButton onClick={() => { s.setFiles([]); s.setError(''); setDone(''); }} /></div>
    {done && <p role="status" className="result good">{done}</p>}</div>;
}
