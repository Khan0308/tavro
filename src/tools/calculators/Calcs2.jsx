import { useState } from 'react';
import { Field, ResetButton } from '../ui.jsx';
import { NumInput, Result, num, fmt, err } from './Calcs.jsx';
import { ageInfo, dateDiff, emi, schedule, gst, margin, priceFromMargin } from '../../utils/logic.js';

const today = () => new Date().toISOString().slice(0, 10);
const D = ({ id, label, value, set, error }) => <Field id={id} label={label} error={error}><input id={id} type="date" value={value} onChange={(e) => set(e.target.value)} aria-invalid={!!error} /></Field>;
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

export function AgeCalculator() {
  const [dob, setDob] = useState(''); const [asOf, setAsOf] = useState(today());
  const r = dob ? ageInfo(dob, asOf) : null;
  return <div className="stack"><div className="row"><D id="dob" label="Date of birth" value={dob} set={setDob} error={r?.error && /birth/.test(r.error) ? r.error : ''} /><D id="asof" label="Age at (date)" value={asOf} set={setAsOf} error={r?.error && /"age at"|on or before/.test(r.error) ? r.error : ''} /></div>
    {r && !r.error && <Result formula="Years, months and days are counted on the calendar from the birth date to the chosen date.">
      <p className="big">{plural(r.y, 'year')}, {plural(r.m, 'month')}, {plural(r.d, 'day')}</p>
      <p>That is about {r.totalMonths.toLocaleString()} months or {r.totalDays.toLocaleString()} days.</p>
      <p>{r.daysToBirthday === 0 ? 'Happy birthday! It is the birthday today.' : `Next birthday in ${plural(r.daysToBirthday, 'day')} (${r.nextBirthday.toLocaleDateString(undefined, { timeZone: 'UTC', dateStyle: 'long' })}).`}</p></Result>}
    <div className="actions"><ResetButton onClick={() => { setDob(''); setAsOf(today()); }} /></div></div>;
}
export function DateDifference() {
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [inc, setInc] = useState(false);
  const r = a && b ? dateDiff(a, b, inc) : null;
  return <div className="stack"><div className="row"><D id="da" label="Start date" value={a} set={setA} /><D id="db" label="End date" value={b} set={setB} /></div>
    <label className="check"><input type="checkbox" checked={inc} onChange={(e) => setInc(e.target.checked)} /> Count the end date too (inclusive)</label>
    {r?.error && <p className="error" role="alert">{r.error}</p>}
    {r && !r.error && <Result formula="Calendar difference, using whole days. Dates are treated without time zones.">
      <p className="big">{r.days.toLocaleString()} {r.days === 1 ? 'day' : 'days'}</p>
      <p>{plural(r.y, 'year')}, {plural(r.m, 'month')}, {plural(r.d, 'day')} · {plural(r.weeks, 'week')} and {plural(r.remDays, 'day')}</p>{r.reversed && <p>Your dates were in reverse order, so they were swapped.</p>}</Result>}
    <div className="actions"><ResetButton onClick={() => { setA(''); setB(''); }} /></div></div>;
}

export function ProfitMargin() {
  const [mode, setMode] = useState('rev'); const [cost, setCost] = useState(''); const [v, setV] = useState('');
  const c = num(cost), x = num(v); const ready = cost !== '' && v !== '' && c >= 0 && Number.isFinite(c) && Number.isFinite(x);
  const m = ready && mode === 'rev' ? margin(c, x) : null; const price = ready && mode === 'pct' && x >= 0 && x < 100 ? priceFromMargin(c, x) : null;
  return <div className="stack">
    <Field id="pmm" label="What do you want to find?"><select id="pmm" value={mode} onChange={(e) => { setMode(e.target.value); setV(''); }}><option value="rev">Profit and margin from cost and selling price</option><option value="pct">Selling price for a target margin</option></select></Field>
    <div className="row"><NumInput id="pc" label="Cost" value={cost} set={setCost} error={err(cost, { min: 0 })} /><NumInput id="pv" label={mode === 'rev' ? 'Selling price' : 'Target margin (%)'} value={v} set={setV} error={err(v)} /></div>
    {m && (m.margin !== m.margin ? <p className="error" role="alert">Selling price must be above 0 to work out a margin.</p> : <Result formula="Profit = price − cost. Margin = profit ÷ price × 100. Markup = profit ÷ cost × 100.">Profit: <strong>{fmt(m.profit)}</strong> · Margin: <strong>{fmt(m.margin)}%</strong> · Markup: <strong>{m.markup === m.markup ? `${fmt(m.markup)}%` : 'n/a (cost is 0)'}</strong></Result>)}
    {ready && mode === 'pct' && price === null && <p className="error" role="alert">Target margin must be from 0 up to (but not including) 100.</p>}
    {price !== null && <Result formula="Selling price = cost ÷ (1 − margin ÷ 100)">Sell at <strong>{fmt(price)}</strong> to earn a {fmt(x)}% margin. Profit: <strong>{fmt(price - c)}</strong></Result>}
    <div className="actions"><ResetButton onClick={() => { setCost(''); setV(''); }} /></div></div>;
}

export function LoanEmi() {
  const [p, setP] = useState(''); const [rate, setRate] = useState(''); const [ten, setTen] = useState(''); const [unit, setUnit] = useState('years');
  const P = num(p), R = num(rate), T = num(ten); const months = unit === 'years' ? Math.round(T * 12) : Math.round(T);
  const ready = p !== '' && rate !== '' && ten !== '' && P > 0 && R >= 0 && R <= 100 && months >= 1 && months <= 1200;
  const r = ready ? emi(P, R, months) : null; const rows = ready ? schedule(P, R, months, 12) : [];
  return <div className="stack">
    <div className="row"><NumInput id="lp" label="Loan amount" value={p} set={setP} error={p !== '' && !(P > 0) ? 'Enter an amount above 0.' : ''} />
      <NumInput id="lr" label="Interest rate (% per year)" value={rate} set={setRate} error={rate !== '' && !(R >= 0 && R <= 100) ? 'Enter 0 to 100.' : ''} /></div>
    <div className="row"><NumInput id="lt" label="Loan term" value={ten} set={setTen} error={ten !== '' && !(months >= 1 && months <= 1200) ? 'Term must be 1 to 1200 months (100 years).' : ''} />
      <Field id="lu" label="Term unit"><select id="lu" value={unit} onChange={(e) => setUnit(e.target.value)}><option value="years">Years</option><option value="months">Months</option></select></Field></div>
    {r && <><Result formula="EMI = P × r × (1+r)ⁿ ÷ ((1+r)ⁿ − 1), where r is the monthly rate and n the number of months.">Monthly EMI: <strong>{fmt(r.emi)}</strong><br />Total interest: <strong>{fmt(r.interest)}</strong> · Total payment: <strong>{fmt(r.total)}</strong></Result>
      <div className="table-wrap"><table className="compare"><caption className="sr-only">First {rows.length} months</caption><thead><tr><th scope="col">Month</th><th scope="col">Interest</th><th scope="col">Principal</th><th scope="col">Balance</th></tr></thead><tbody>
        {rows.map((x) => <tr key={x.month}><td>{x.month}</td><td>{fmt(x.interest)}</td><td>{fmt(x.principal)}</td><td>{fmt(x.balance)}</td></tr>)}</tbody></table></div>
      <p className="muted small">Estimate only. Real loans may add fees or use different rounding. Showing the first {rows.length} months.</p></>}
    <div className="actions"><ResetButton onClick={() => { setP(''); setRate(''); setTen(''); }} /></div></div>;
}

export function GstCalculator() {
  const [amt, setAmt] = useState(''); const [rate, setRate] = useState('18'); const [mode, setMode] = useState('add');
  const A = num(amt), R = num(rate); const ready = amt !== '' && A >= 0 && R >= 0 && R <= 100 && rate !== '';
  const r = ready ? gst(A, R, mode) : null;
  return <div className="stack">
    <Field id="gm" label="Calculation"><select id="gm" value={mode} onChange={(e) => setMode(e.target.value)}><option value="add">Add GST to an amount (amount excludes GST)</option><option value="remove">Remove GST from an amount (amount includes GST)</option></select></Field>
    <div className="row"><NumInput id="ga" label="Amount" value={amt} set={setAmt} error={err(amt, { min: 0 })} /><NumInput id="gr" label="GST rate (%)" value={rate} set={setRate} error={rate !== '' && !(R >= 0 && R <= 100) ? 'Enter 0 to 100.' : ''} /></div>
    <div className="chips" role="group" aria-label="Common rates">{[5, 12, 18, 28].map((x) => <button key={x} type="button" className={`chip ${R === x ? 'active' : ''}`} onClick={() => setRate(String(x))}>{x}%</button>)}</div>
    {r && <Result formula={mode === 'add' ? 'GST = amount × rate ÷ 100. Total = amount + GST.' : 'Net = amount ÷ (1 + rate ÷ 100). GST = amount − net.'}>Net amount: <strong>{fmt(r.net)}</strong> · GST: <strong>{fmt(r.gst)}</strong> · Total: <strong>{fmt(r.total)}</strong><br /><span className="small">Split for same-state sales: CGST {fmt(r.half)} + SGST {fmt(r.half)}</span></Result>}
    <p className="muted small">Works for any percentage tax such as GST or VAT. Check the rate that applies to your goods or services.</p>
    <div className="actions"><ResetButton onClick={() => { setAmt(''); setRate('18'); }} /></div></div>;
}
