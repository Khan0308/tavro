import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { Field, ResetButton } from '../ui.jsx';
import { downloadBlob, downloadText } from '../../utils/fileHelpers.js';

function QrBase({ label, placeholder, hint, validate, defaultText = '' }) {
  const [text, setText] = useState(defaultText); const [size, setSize] = useState(256); const [fg, setFg] = useState('#0b1220'); const [bg, setBg] = useState('#ffffff'); const [ec, setEc] = useState('M');
  const [png, setPng] = useState(''); const [genErr, setGenErr] = useState('');
  const err = text.trim() && validate ? validate(text.trim()) : '';
  useEffect(() => {
    if (!text.trim() || err) { setPng(''); setGenErr(''); return; }
    QRCode.toDataURL(text.trim(), { width: size, margin: 2, errorCorrectionLevel: ec, color: { dark: fg, light: bg } })
      .then((u) => { setPng(u); setGenErr(''); })
      .catch(() => { setPng(''); setGenErr('This content is too long for a QR code. Shorten it or lower the error correction level.'); });
  }, [text, size, fg, bg, ec, err]);
  const saveSvg = async () => { try { downloadText(await QRCode.toString(text.trim(), { type: 'svg', margin: 2, errorCorrectionLevel: ec, color: { dark: fg, light: bg } }), 'qrcode.svg', 'image/svg+xml'); } catch { setGenErr('Could not create the SVG.'); } };
  const savePng = async () => { const b = await (await fetch(png)).blob(); downloadBlob(b, 'qrcode.png'); };
  return <div className="stack">
    <Field id="qt" label={label} hint={hint} error={err || genErr}><textarea id="qt" rows="3" value={text} placeholder={placeholder} onChange={(e) => setText(e.target.value)} aria-invalid={!!(err || genErr)} /></Field>
    <div className="row">
      <Field id="qs" label="Size"><select id="qs" value={size} onChange={(e) => setSize(Number(e.target.value))}>{[192, 256, 384, 512, 768].map((s) => <option key={s} value={s}>{s} px</option>)}</select></Field>
      <Field id="qe" label="Error correction" hint="Higher survives more damage but holds less."><select id="qe" value={ec} onChange={(e) => setEc(e.target.value)}><option value="L">Low</option><option value="M">Medium</option><option value="Q">Quartile</option><option value="H">High</option></select></Field>
      <Field id="qf" label="QR colour"><input id="qf" type="color" value={fg} onChange={(e) => setFg(e.target.value)} /></Field>
      <Field id="qb" label="Background"><input id="qb" type="color" value={bg} onChange={(e) => setBg(e.target.value)} /></Field></div>
    <div className="qr-box" aria-live="polite">{png ? <img src={png} alt="Generated QR code" width={Math.min(size, 320)} height={Math.min(size, 320)} /> : <p className="muted">Your QR code will appear here.</p>}</div>
    <p className="muted small">Keep strong contrast between the QR colour and background, with the QR darker, so phones can scan it.</p>
    <div className="actions"><button type="button" className="btn btn-primary" disabled={!png} onClick={savePng}><Download size={16} aria-hidden="true" />Download PNG</button>
      <button type="button" className="btn btn-soft" disabled={!png} onClick={saveSvg}><Download size={16} aria-hidden="true" />Download SVG</button><ResetButton onClick={() => setText('')} /></div></div>;
}
export const QrGenerator = () => <QrBase label="Text or link" placeholder="Anything: text, a link, contact info" />;
export const UrlToQr = () => <QrBase label="Web address" placeholder="https://example.com" hint="Include https:// at the start."
  validate={(v) => { try { const u = new URL(v); return ['http:', 'https:'].includes(u.protocol) ? '' : 'Use an http:// or https:// address.'; } catch { return 'Enter a full web address, like https://example.com.'; } }} />;
