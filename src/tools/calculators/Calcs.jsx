import { useState } from 'react';
import { Field, ResetButton } from '../ui.jsx';
import { toNumber } from '../../utils/validation.js';

export const num = (v) => toNumber(v);
export const fmt = (n, d = 2) => (Number.isFinite(n) ? Number(n.toFixed(d)).toLocaleString(undefined, { maximumFractionDigits: d }) : '');
export function NumInput({ id, label, value, set, hint, error, step = 'any' }) {
  return <Field id={id} label={label} hint={hint} error={error}><input id={id} type="number" inputMode="decimal" step={step} value={value} onChange={(e) => set(e.target.value)} aria-invalid={!!error} /></Field>;
}
export const Result = ({ children, formula }) => <div role="status" className="result good">{children}{formula && <p className="formula">{formula}</p>}</div>;
export const err = (v, { min } = {}) => (v === '' ? '' : Number.isNaN(num(v)) ? 'Enter a number.' : min !== undefined && num(v) < min ? `Must be ${min} or more.` : '');

export function PercentageCalculator() {
  const [mode, setMode] = useState('of'); const [a, setA] = useState(''); const [b, setB] = useState('');
  const x = num(a), y = num(b); const ready = a !== '' && b !== '' && !Number.isNaN(x) && !Number.isNaN(y);
  const cfg = {
    of: ['What is X% of Y?', 'Percentage (X)', 'Number (Y)', () => [fmt((x / 100) * y, 4), `${fmt(x, 4)}% × ${fmt(y, 4)} ÷ 100`]],
    is: ['X is what % of Y?', 'Part (X)', 'Whole (Y)', () => (y === 0 ? [null] : [`${fmt((x / y) * 100, 4)}%`, `${fmt(x, 4)} ÷ ${fmt(y, 4)} × 100`])],
    change: ['Percent change from X to Y', 'Old value (X)', 'New value (Y)', () => (x === 0 ? [null] : [`${fmt(((y - x) / Math.abs(x)) * 100, 4)}%`, `(${fmt(y, 4)} − ${fmt(x, 4)}) ÷ |${fmt(x, 4)}| × 100`])],
  }[mode];
  const [res, formula] = ready ? cfg[3]() : [];
  const reset = () => { setA(''); setB(''); };
  return <div className="stack">
    <Field id="pm" label="What do you want to find?"><select id="pm" value={mode} onChange={(e) => { setMode(e.target.value); reset(); }}><option value="of">What is X% of Y?</option><option value="is">X is what % of Y?</option><option value="change">Percent change from X to Y</option></select></Field>
    <div className="row"><NumInput id="pa" label={cfg[1]} value={a} set={setA} error={err(a)} /><NumInput id="pb" label={cfg[2]} value={b} set={setB} error={err(b)} /></div>
    {ready && res === null && <p className="error" role="alert">{mode === 'is' ? 'The whole (Y) cannot be 0.' : 'The old value (X) cannot be 0.'}</p>}
    {ready && res !== null && <Result formula={formula}>Result: <strong>{res}</strong></Result>}
    <div className="actions"><ResetButton onClick={reset} /></div></div>;
}
export function DiscountCalculator() {
  const [p, setP] = useState(''); const [d, setD] = useState('');
  const price = num(p), disc = num(d); const ready = p !== '' && d !== '' && !Number.isNaN(price) && !Number.isNaN(disc) && price >= 0 && disc >= 0 && disc <= 100;
  return <div className="stack"><div className="row">
    <NumInput id="dp" label="Original price" value={p} set={setP} error={err(p, { min: 0 })} />
    <NumInput id="dd" label="Discount (%)" value={d} set={setD} error={d !== '' && (disc < 0 || disc > 100) ? 'Enter 0 to 100.' : err(d)} /></div>
    {ready && <Result formula={`Savings = ${fmt(price)} × ${fmt(disc)} ÷ 100. Final price = price − savings.`}>You save <strong>{fmt(price * disc / 100)}</strong>. Final price: <strong>{fmt(price - price * disc / 100)}</strong></Result>}
    <div className="actions"><ResetButton onClick={() => { setP(''); setD(''); }} /></div></div>;
}
export function BmiCalculator() {
  const [unit, setUnit] = useState('metric'); const [h, setH] = useState(''); const [w, setW] = useState('');
  const hh = num(h), ww = num(w); const ready = h !== '' && w !== '' && hh > 0 && ww > 0;
  const bmi = ready ? (unit === 'metric' ? ww / ((hh / 100) ** 2) : (703 * ww) / (hh ** 2)) : NaN;
  const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy range' : bmi < 30 ? 'Overweight' : 'Obesity range';
  return <div className="stack">
    <Field id="bu" label="Units"><select id="bu" value={unit} onChange={(e) => { setUnit(e.target.value); setH(''); setW(''); }}><option value="metric">Metric (cm, kg)</option><option value="imperial">Imperial (inches, pounds)</option></select></Field>
    <div className="row"><NumInput id="bh" label={unit === 'metric' ? 'Height (cm)' : 'Height (inches)'} value={h} set={setH} error={h !== '' && !(hh > 0) ? 'Enter a height above 0.' : ''} />
      <NumInput id="bw" label={unit === 'metric' ? 'Weight (kg)' : 'Weight (pounds)'} value={w} set={setW} error={w !== '' && !(ww > 0) ? 'Enter a weight above 0.' : ''} /></div>
    {ready && <Result formula={unit === 'metric' ? 'BMI = weight (kg) ÷ height (m)²' : 'BMI = 703 × weight (lb) ÷ height (in)²'}>BMI: <strong>{fmt(bmi, 1)}</strong> ({cat})</Result>}
    <p className="muted small">BMI is a general screening number and does not account for muscle, age or body type. It is not medical advice.</p>
    <div className="actions"><ResetButton onClick={() => { setH(''); setW(''); }} /></div></div>;
}
