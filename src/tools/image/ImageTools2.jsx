import { useEffect, useRef, useState } from 'react';
import { Field, ResetButton, Output } from '../ui.jsx';
import { useImageTool, Drop, Preview, Download_, draw, outName, extFor } from './ImageTools.jsx';
import { canvasToBlob } from '../../utils/fileHelpers.js';

const NAMES = { 'image/jpeg': 'JPG', 'image/png': 'PNG', 'image/webp': 'WebP' };
function Converter({ from, to }) {
  const t = useImageTool(); const [q, setQ] = useState(92);
  const wrongType = t.file && !from.includes(t.file.type);
  const go = () => t.run(async (img) => {
    const blob = await canvasToBlob(draw(img, img.naturalWidth, img.naturalHeight, to === 'image/jpeg' ? '#ffffff' : null), to, q / 100);
    return { blob, w: img.naturalWidth, h: img.naturalHeight };
  });
  return <div className="stack"><Drop onFile={t.pick} />
    {t.error && <p className="error" role="alert">{t.error}</p>}
    {wrongType && <p className="error" role="alert">This tool converts {from.map((f) => NAMES[f]).join('/')} images, but you chose a {NAMES[t.file.type]} file.</p>}
    {t.file && !wrongType && <>
      {to !== 'image/png' && <Field id="cq" label={`Quality: ${q}%`}><input id="cq" type="range" min="40" max="100" value={q} onChange={(e) => { setQ(Number(e.target.value)); t.clearResult(); }} /></Field>}
      <div className="actions"><button type="button" className="btn btn-primary" onClick={go} disabled={t.busy}>{t.busy ? 'Converting…' : `Convert to ${NAMES[to]}`}</button></div>
      <Preview t={t} /><Download_ t={t} name={outName(t.file.name, extFor(to))} /></>}
    {to === 'image/jpeg' && <p className="muted small">JPG has no transparency, so transparent areas become white.</p>}</div>;
}
export const JpgToPng = () => <Converter from={['image/jpeg']} to="image/png" />;
export const PngToJpg = () => <Converter from={['image/png']} to="image/jpeg" />;
export const WebpToJpg = () => <Converter from={['image/webp']} to="image/jpeg" />;
export const JpgToWebp = () => <Converter from={['image/jpeg']} to="image/webp" />;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export function ImageCropper() {
  const t = useImageTool(); const box = useRef(null); const drag = useRef(null);
  const [sel, setSel] = useState(null);
  useEffect(() => { if (t.dim) setSel({ x: 0, y: 0, w: t.dim.w, h: t.dim.h }); }, [t.dim]);
  const at = (e) => { const r = box.current.getBoundingClientRect(); const k = t.dim.w / r.width; return { x: clamp((e.clientX - r.left) * k, 0, t.dim.w), y: clamp((e.clientY - r.top) * k, 0, t.dim.h) }; };
  const down = (e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = at(e); t.clearResult(); };
  const move = (e) => { if (!drag.current) return; const p = at(e), s = drag.current; setSel({ x: Math.round(Math.min(s.x, p.x)), y: Math.round(Math.min(s.y, p.y)), w: Math.max(1, Math.round(Math.abs(p.x - s.x))), h: Math.max(1, Math.round(Math.abs(p.y - s.y))) }); };
  const up = () => { drag.current = null; };
  const set = (k) => (e) => { setSel({ ...sel, [k]: e.target.value === '' ? '' : Number(e.target.value) }); t.clearResult(); };
  const ok = sel && [sel.x, sel.y, sel.w, sel.h].every(Number.isInteger) && sel.w > 0 && sel.h > 0 && sel.x >= 0 && sel.y >= 0 && t.dim && sel.x + sel.w <= t.dim.w && sel.y + sel.h <= t.dim.h;
  const go = () => t.run(async (img) => {
    const c = document.createElement('canvas'); c.width = sel.w; c.height = sel.h; const x = c.getContext('2d');
    const type = t.file.type === 'image/png' ? 'image/png' : t.file.type; if (type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, sel.w, sel.h); }
    x.drawImage(img, sel.x, sel.y, sel.w, sel.h, 0, 0, sel.w, sel.h);
    return { blob: await canvasToBlob(c, type, 0.92), w: sel.w, h: sel.h };
  });
  return <div className="stack"><Drop onFile={t.pick} />
    {t.error && <p className="error" role="alert">{t.error}</p>}
    {t.file && sel && <>
      <p className="muted small">Drag on the image to choose the crop area, or type exact pixel values below.</p>
      <div className="crop-box" ref={box} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <img src={t.src} alt="Image to crop" draggable="false" />
        {ok && <div className="crop-sel" style={{ left: `${(sel.x / t.dim.w) * 100}%`, top: `${(sel.y / t.dim.h) * 100}%`, width: `${(sel.w / t.dim.w) * 100}%`, height: `${(sel.h / t.dim.h) * 100}%` }} />}
      </div>
      <div className="row">{[['x', 'Left (px)'], ['y', 'Top (px)'], ['w', 'Width (px)'], ['h', 'Height (px)']].map(([k, l]) => <Field key={k} id={`c-${k}`} label={l}><input id={`c-${k}`} type="number" min="0" value={sel[k]} onChange={set(k)} aria-invalid={!ok} /></Field>)}</div>
      {!ok && <p className="error" role="alert">The crop area must be whole numbers inside the image ({t.dim.w} × {t.dim.h}px).</p>}
      <div className="actions"><button type="button" className="btn btn-primary" onClick={go} disabled={!ok || t.busy}>Crop image</button><button type="button" className="btn btn-ghost" onClick={() => setSel({ x: 0, y: 0, w: t.dim.w, h: t.dim.h })}>Select whole image</button></div>
      {t.result && <Preview t={{ ...t, src: null }} />}
      <Download_ t={t} name={outName(t.file.name, `-cropped${extFor(t.file.type)}`)} /></>}</div>;
}

export function ImageRotator() {
  const t = useImageTool(); const [rot, setRot] = useState(0); const [fh, setFh] = useState(false); const [fv, setFv] = useState(false);
  const change = (fn) => { fn(); t.clearResult(); };
  const go = () => t.run(async (img) => {
    const w = img.naturalWidth, h = img.naturalHeight, swap = rot % 180 !== 0; const c = document.createElement('canvas'); c.width = swap ? h : w; c.height = swap ? w : h;
    const x = c.getContext('2d'); const type = t.file.type; if (type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
    x.translate(c.width / 2, c.height / 2); x.rotate((rot * Math.PI) / 180); x.scale(fh ? -1 : 1, fv ? -1 : 1); x.drawImage(img, -w / 2, -h / 2);
    return { blob: await canvasToBlob(c, type, 0.92), w: c.width, h: c.height };
  });
  const none = rot === 0 && !fh && !fv;
  return <div className="stack"><Drop onFile={(f) => { setRot(0); setFh(false); setFv(false); t.pick(f); }} />
    {t.error && <p className="error" role="alert">{t.error}</p>}
    {t.file && <>
      <div className="actions" role="group" aria-label="Transform">
        <button type="button" className="btn btn-soft" onClick={() => change(() => setRot((rot + 270) % 360))}>Rotate left 90°</button>
        <button type="button" className="btn btn-soft" onClick={() => change(() => setRot((rot + 90) % 360))}>Rotate right 90°</button>
        <button type="button" className="btn btn-soft" aria-pressed={fh} onClick={() => change(() => setFh(!fh))}>Flip horizontal</button>
        <button type="button" className="btn btn-soft" aria-pressed={fv} onClick={() => change(() => setFv(!fv))}>Flip vertical</button></div>
      <p className="muted small" role="status">Rotation: {rot}°{fh ? ', flipped horizontally' : ''}{fv ? ', flipped vertically' : ''}</p>
      <div className="actions"><button type="button" className="btn btn-primary" onClick={go} disabled={none || t.busy}>{none ? 'Choose a change first' : t.busy ? 'Applying…' : 'Apply changes'}</button></div>
      <Preview t={t} /><Download_ t={t} name={outName(t.file.name, `-rotated${extFor(t.file.type)}`)} /></>}</div>;
}

export function ImageToBase64() {
  const t = useImageTool(); const [full, setFull] = useState(true); const [data, setData] = useState('');
  useEffect(() => {
    setData(''); if (!t.file) return; let live = true; const fr = new FileReader();
    fr.onload = () => live && setData(String(fr.result)); fr.onerror = () => live && setData(''); fr.readAsDataURL(t.file);
    return () => { live = false; };
  }, [t.file]);
  const out = full ? data : data.split(',')[1] || '';
  return <div className="stack"><Drop onFile={t.pick} />
    {t.error && <p className="error" role="alert">{t.error}</p>}
    {t.file && <>
      <Preview t={t} />
      <label className="check"><input type="checkbox" checked={full} onChange={(e) => setFull(e.target.checked)} /> Include the data URL prefix (data:image/…;base64,)</label>
      <Output id="b64" label="Base64 output" value={out} filename={`${t.file.name.replace(/\.[^.]+$/, '')}-base64.txt`} rows={8} />
      <p className="muted small">Base64 is about 33% larger than the original file.</p>
      <div className="actions"><ResetButton onClick={t.reset} /></div></>}</div>;
}

export function BackgroundColorChanger() {
  const t = useImageTool(); const [color, setColor] = useState('#ffffff'); const [fmt, setFmt] = useState('image/png');
  const go = () => t.run(async (img) => {
    const c = draw(img, img.naturalWidth, img.naturalHeight, color);
    return { blob: await canvasToBlob(c, fmt, 0.92), w: c.width, h: c.height };
  });
  return <div className="stack"><Drop onFile={t.pick} />
    {t.error && <p className="error" role="alert">{t.error}</p>}
    {t.file && <>
      <div className="row"><Field id="bg" label="Background colour"><input id="bg" type="color" value={color} onChange={(e) => { setColor(e.target.value); t.clearResult(); }} /></Field>
        <Field id="bf" label="Output format"><select id="bf" value={fmt} onChange={(e) => { setFmt(e.target.value); t.clearResult(); }}><option value="image/png">PNG</option><option value="image/jpeg">JPG</option></select></Field></div>
      <p className="muted small">This fills transparent areas (for example in a PNG cut-out) with your colour. It does not remove backgrounds from photos.</p>
      <div className="actions"><button type="button" className="btn btn-primary" onClick={go} disabled={t.busy}>Apply colour</button></div>
      <Preview t={t} /><Download_ t={t} name={outName(t.file.name, `-bg${fmt === 'image/png' ? '.png' : '.jpg'}`)} /></>}</div>;
}
