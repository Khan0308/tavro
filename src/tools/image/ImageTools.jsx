import { useEffect, useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { Field, ResetButton } from '../ui.jsx';
import { validateImage, formatBytes, downloadBlob, loadImage, canvasToBlob } from '../../utils/fileHelpers.js';

// Shared hook: pick a file, validate, load, keep result URL for preview/download.
export function useImageTool() {
  const [file, setFile] = useState(null); const [src, setSrc] = useState(null); const [dim, setDim] = useState(null);
  const [error, setError] = useState(''); const [result, setResult] = useState(null); const [busy, setBusy] = useState(false);
  const imgRef = useRef(null); const resRef = useRef(null);
  const revoke = (r) => r && URL.revokeObjectURL(r);
  const clearResult = () => { revoke(resRef.current); resRef.current = null; setResult(null); };
  const reset = () => { revoke(src); clearResult(); setFile(null); setSrc(null); setDim(null); setError(''); };
  const pick = async (f) => {
    clearResult(); setError('');
    const msg = validateImage(f); if (msg) { setError(msg); return; }
    try { const { img, url } = await loadImage(f); revoke(src); imgRef.current = img; setFile(f); setSrc(url); setDim({ w: img.naturalWidth, h: img.naturalHeight }); }
    catch (e) { setError(e.message); }
  };
  const run = async (fn) => {
    setBusy(true); setError('');
    try { const out = await fn(imgRef.current); revoke(resRef.current); const url = URL.createObjectURL(out.blob); resRef.current = url; setResult({ ...out, url }); }
    catch (e) { setError(e.message || 'Something went wrong while processing this image.'); }
    setBusy(false);
  };
  useEffect(() => () => { revoke(resRef.current); }, []); // eslint-disable-line
  return { file, src, dim, error, result, busy, pick, run, reset, clearResult };
}
export function Drop({ onFile }) {
  return <Field id="file" label="Choose an image" hint="JPG, PNG or WebP, up to 25 MB. Your file never leaves your device.">
    <label className="drop" htmlFor="file"><Upload aria-hidden="true" /><span>Select an image</span></label>
    <input id="file" className="sr-only-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { onFile(e.target.files[0]); e.target.value = ''; }} /></Field>;
}
export const outName = (name, ext) => name.replace(/\.[^.]+$/, '') + ext;
export const extFor = (t) => (t === 'image/png' ? '.png' : t === 'image/webp' ? '.webp' : '.jpg');

export function Preview({ t }) {
  return <div className="previews">
    {t.src && <figure><img src={t.src} alt="Original upload preview" /><figcaption>Original{t.file && `: ${formatBytes(t.file.size)}`}{t.dim && `, ${t.dim.w} × ${t.dim.h}px`}</figcaption></figure>}
    {t.result && <figure><img src={t.result.url} alt="Processed result preview" /><figcaption>Result: {formatBytes(t.result.blob.size)}{t.result.w && `, ${t.result.w} × ${t.result.h}px`}</figcaption></figure>}
  </div>;
}
export function Download_({ t, name }) {
  return <div className="actions"><button type="button" className="btn btn-primary" disabled={!t.result} onClick={() => downloadBlob(t.result.blob, name)}><Download size={16} aria-hidden="true" />Download</button><ResetButton onClick={t.reset} /></div>;
}
export const draw = (img, w, h, bg) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, h); } x.drawImage(img, 0, 0, w, h); return c; };

export function ImageCompressor() {
  const t = useImageTool(); const [q, setQ] = useState(70); const [fmt, setFmt] = useState('image/jpeg');
  const go = () => t.run(async (img) => {
    const blob = await canvasToBlob(draw(img, img.naturalWidth, img.naturalHeight, fmt === 'image/jpeg' ? '#ffffff' : null), fmt, q / 100);
    return { blob, w: img.naturalWidth, h: img.naturalHeight };
  });
  const saved = t.result && t.file ? Math.round((1 - t.result.blob.size / t.file.size) * 100) : null;
  return <div className="stack"><Drop onFile={t.pick} />
    {t.error && <p className="error" role="alert">{t.error}</p>}
    {t.file && <>
      <div className="row">
        <Field id="q" label={`Quality: ${q}%`} hint="Lower quality means a smaller file."><input id="q" type="range" min="10" max="95" value={q} onChange={(e) => { setQ(Number(e.target.value)); t.clearResult(); }} /></Field>
        <Field id="f" label="Output format"><select id="f" value={fmt} onChange={(e) => { setFmt(e.target.value); t.clearResult(); }}><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select></Field></div>
      <div className="actions"><button type="button" className="btn btn-primary" onClick={go} disabled={t.busy}>{t.busy ? 'Compressing…' : 'Compress image'}</button></div>
      <Preview t={t} />
      {t.result && <p role="status" className={`result ${saved > 0 ? 'good' : 'bad'}`}>{saved > 0 ? `Saved ${saved}%.` : 'The result is not smaller than the original. Try lower quality or a different format.'}</p>}
      <Download_ t={t} name={outName(t.file.name, extFor(fmt))} /></>}
    <p className="muted small">Output is JPG or WebP. Transparent areas become white in JPG. PNG is not offered because it is lossless.</p></div>;
}
export function ImageResizer() {
  const t = useImageTool(); const [w, setW] = useState(''); const [h, setH] = useState(''); const [lock, setLock] = useState(true);
  useEffect(() => { if (t.dim) { setW(String(t.dim.w)); setH(String(t.dim.h)); } }, [t.dim]);
  const ratio = t.dim ? t.dim.w / t.dim.h : 1;
  const onW = (v) => { setW(v); t.clearResult(); if (lock && Number(v) > 0) setH(String(Math.round(Number(v) / ratio))); };
  const onH = (v) => { setH(v); t.clearResult(); if (lock && Number(v) > 0) setW(String(Math.round(Number(v) * ratio))); };
  const W = Number(w), H = Number(h); const bad = !(Number.isInteger(W) && Number.isInteger(H) && W > 0 && H > 0 && W <= 8000 && H <= 8000);
  const go = () => t.run(async (img) => {
    const type = t.file.type === 'image/png' ? 'image/png' : t.file.type;
    const blob = await canvasToBlob(draw(img, W, H, type === 'image/jpeg' ? '#ffffff' : null), type, 0.92);
    return { blob, w: W, h: H };
  });
  return <div className="stack"><Drop onFile={t.pick} />
    {t.error && <p className="error" role="alert">{t.error}</p>}
    {t.file && <>
      <div className="row">
        <Field id="rw" label="Width (px)"><input id="rw" type="number" min="1" max="8000" value={w} onChange={(e) => onW(e.target.value)} aria-invalid={bad} /></Field>
        <Field id="rh" label="Height (px)"><input id="rh" type="number" min="1" max="8000" value={h} onChange={(e) => onH(e.target.value)} aria-invalid={bad} /></Field></div>
      <label className="check"><input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> Keep aspect ratio</label>
      {bad && <p className="error" role="alert">Enter whole numbers from 1 to 8000 for width and height.</p>}
      <div className="actions"><button type="button" className="btn btn-primary" onClick={go} disabled={t.busy || bad}>{t.busy ? 'Resizing…' : 'Resize image'}</button></div>
      <Preview t={t} /><Download_ t={t} name={outName(t.file.name, `-${W}x${H}${extFor(t.file.type)}`)} /></>}</div>;
}
