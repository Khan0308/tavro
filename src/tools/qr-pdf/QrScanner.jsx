import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff } from 'lucide-react';
import { Field, CopyButton, ResetButton } from '../ui.jsx';
import { validateImage, loadImage } from '../../utils/fileHelpers.js';
import { isHttpUrl } from '../../utils/logic.js';

export function QrScanner() {
  const video = useRef(null); const canvas = useRef(null); const stream = useRef(null); const raf = useRef(0);
  const [on, setOn] = useState(false); const [result, setResult] = useState(''); const [error, setError] = useState(''); const [note, setNote] = useState('');
  const stop = () => { cancelAnimationFrame(raf.current); stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; if (video.current) video.current.srcObject = null; setOn(false); };
  useEffect(() => stop, []); // stop camera when leaving the page
  const scanFrame = () => {
    const v = video.current; if (!v || !stream.current) return;
    if (v.readyState === v.HAVE_ENOUGH_DATA && v.videoWidth) {
      const c = canvas.current; c.width = v.videoWidth; c.height = v.videoHeight; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(v, 0, 0);
      const code = jsQR(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
      if (code?.data) { setResult(code.data); stop(); return; }
    }
    raf.current = requestAnimationFrame(scanFrame);
  };
  const start = async () => {
    setError(''); setResult(''); setNote('');
    if (!navigator.mediaDevices?.getUserMedia) return setError('Camera access is not available here. It needs a modern browser and a secure (https) page. You can upload an image instead.');
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.current.srcObject = stream.current; await video.current.play(); setOn(true); raf.current = requestAnimationFrame(scanFrame);
    } catch (e) {
      stop(); setError(e.name === 'NotAllowedError' ? 'Camera permission was denied. Allow camera access in your browser, or upload an image instead.' : e.name === 'NotFoundError' ? 'No camera was found on this device. Upload an image instead.' : 'Could not start the camera. Upload an image instead.');
    }
  };
  const fromFile = async (f) => {
    setError(''); setResult(''); setNote(''); const msg = validateImage(f); if (msg) return setError(msg);
    try {
      const { img, url } = await loadImage(f); const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0); URL.revokeObjectURL(url);
      const code = jsQR(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
      if (code?.data) setResult(code.data); else setNote('No QR code was found in this image. Try a clearer, closer picture with the whole code visible.');
    } catch (e) { setError(e.message); }
  };
  return <div className="stack">
    <div className="scan-box"><video ref={video} muted playsInline aria-label="Camera preview" className={on ? '' : 'hidden'} />{!on && <p className="muted"><CameraOff aria-hidden="true" /> Camera is off</p>}<canvas ref={canvas} className="hidden" /></div>
    <div className="actions">{!on ? <button type="button" className="btn btn-primary" onClick={start}><Camera size={16} aria-hidden="true" />Start camera</button> : <button type="button" className="btn btn-soft" onClick={stop}>Stop camera</button>}<ResetButton onClick={() => { stop(); setResult(''); setError(''); setNote(''); }} /></div>
    <p className="muted small">The camera starts only when you press Start, and the video never leaves your device.</p>
    <Field id="qf" label="Or upload an image with a QR code" hint="JPG, PNG or WebP"><input id="qf" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { fromFile(e.target.files[0]); e.target.value = ''; }} /></Field>
    {error && <p className="error" role="alert">{error}</p>}{note && <p className="result bad" role="status">{note}</p>}
    {result && <div className="result good" role="status"><strong>QR code found</strong><pre className="scan-out">{result}</pre>
      <div className="actions"><CopyButton text={result} />{isHttpUrl(result) && <a className="btn btn-soft" href={result} target="_blank" rel="noopener noreferrer">Open link (only if you trust it)</a>}</div></div>}</div>;
}
