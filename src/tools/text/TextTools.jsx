import { useState } from 'react';
import { TransformTool, TextArea, Stat, ResetButton, Output, Field } from '../ui.jsx';

const words = (t) => (t.trim() ? t.trim().split(/\s+/).length : 0);

export function WordCounter() {
  const [t, setT] = useState('');
  const chars = [...t].length; const sentences = (t.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).filter((s) => s.trim()).length;
  const paras = t.split(/\n\s*\n/).filter((p) => p.trim()).length; const w = words(t);
  return <div className="stack">
    <TextArea id="wc" label="Your text" value={t} onChange={setT} rows={10} placeholder="Type or paste text here" />
    <div className="stats"><Stat label="Words" value={w} /><Stat label="Characters" value={chars} /><Stat label="Sentences" value={sentences} /><Stat label="Paragraphs" value={paras} /><Stat label="Reading time" value={w ? `${Math.max(1, Math.round(w / 200))} min` : '0 min'} /></div>
    <p className="muted small">Reading time assumes about 200 words per minute. Sentences are counted by . ! and ? marks.</p>
    <div className="actions"><ResetButton onClick={() => setT('')} /></div></div>;
}
export function CharacterCounter() {
  const [t, setT] = useState('');
  const chars = [...t].length; const noSpaces = [...t.replace(/\s/g, '')].length; const lines = t ? t.split('\n').length : 0;
  return <div className="stack">
    <TextArea id="cc" label="Your text" value={t} onChange={setT} rows={10} placeholder="Type or paste text here" />
    <div className="stats"><Stat label="With spaces" value={chars} /><Stat label="Without spaces" value={noSpaces} /><Stat label="Lines" value={lines} /></div>
    <div className="actions"><ResetButton onClick={() => setT('')} /></div></div>;
}

const title = (s) => s.toLowerCase().replace(/(^|[\s\-_(])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
const sentence = (s) => s.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
const parts = (s) => s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
const caseFns = {
  upper: (s) => s.toUpperCase(), lower: (s) => s.toLowerCase(), title, sentence,
  camel: (s) => parts(s).map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w)).join(''),
  pascal: (s) => parts(s).map((w) => w[0].toUpperCase() + w.slice(1)).join(''),
  snake: (s) => parts(s).join('_'), kebab: (s) => parts(s).join('-'),
};
export const CaseConverter = () => <TransformTool fn={(s, m) => caseFns[m](s)} filename="converted.txt" options={[
  { value: 'upper', label: 'UPPERCASE' }, { value: 'lower', label: 'lowercase' }, { value: 'title', label: 'Title Case' },
  { value: 'sentence', label: 'Sentence case' }, { value: 'camel', label: 'camelCase' }, { value: 'pascal', label: 'PascalCase' },
  { value: 'snake', label: 'snake_case' }, { value: 'kebab', label: 'kebab-case' }]} />;
export const UppercaseConverter = () => <TransformTool fn={(s) => s.toUpperCase()} filename="uppercase.txt" />;
export const LowercaseConverter = () => <TransformTool fn={(s) => s.toLowerCase()} filename="lowercase.txt" />;
export const RemoveExtraSpaces = () => <TransformTool filename="cleaned.txt" fn={(s, m) => {
  let r = s.replace(/[ \t]+/g, ' ').split('\n').map((l) => l.trim()).join('\n');
  if (m === 'blank') r = r.replace(/\n{2,}/g, '\n');
  return r.trim();
}} options={[{ value: 'spaces', label: 'Collapse spaces and trim lines' }, { value: 'blank', label: 'Also remove blank lines' }]} />;
export const TextReverser = () => <TransformTool filename="reversed.txt" fn={(s, m) =>
  m === 'words' ? s.split(/(\s+)/).reverse().join('') : m === 'lines' ? s.split('\n').reverse().join('\n') : [...s].reverse().join('')}
  options={[{ value: 'chars', label: 'Reverse characters' }, { value: 'words', label: 'Reverse word order' }, { value: 'lines', label: 'Reverse line order' }]} />;

export function DuplicateLineRemover() {
  const [t, setT] = useState(''); const [ci, setCi] = useState(false);
  const lines = t ? t.split('\n') : []; const seen = new Set(); const kept = [];
  lines.forEach((l) => { const k = ci ? l.toLowerCase() : l; if (!seen.has(k)) { seen.add(k); kept.push(l); } });
  return <div className="stack">
    <TextArea id="dl" label="Your lines" value={t} onChange={setT} placeholder="One item per line" />
    <label className="check"><input type="checkbox" checked={ci} onChange={(e) => setCi(e.target.checked)} /> Ignore upper/lower case when comparing</label>
    <Output value={kept.join('\n')} filename="unique-lines.txt" />
    {t && <p className="muted" role="status">Removed {lines.length - kept.length} duplicate {lines.length - kept.length === 1 ? 'line' : 'lines'}.</p>}
    <div className="actions"><ResetButton onClick={() => setT('')} /></div></div>;
}
export const slugify = (s) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const TextToSlug = () => <TransformTool inputLabel="Title or phrase" placeholder="e.g. 10 Tips for Better Sleep!" fn={(s) => slugify(s)} filename="slug.txt" />;

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
export function LoremGenerator() {
  const [unit, setUnit] = useState('paragraphs'); const [n, setN] = useState('3'); const [start, setStart] = useState(true);
  const count = Number(n); const bad = !Number.isInteger(count) || count < 1 || count > 100;
  let out = '';
  if (!bad) {
    let i = 0; const next = () => WORDS[i++ % WORDS.length];
    const sent = () => { const len = 8 + (i % 7); const w = Array.from({ length: len }, next); return w[0][0].toUpperCase() + w[0].slice(1) + ' ' + w.slice(1).join(' ') + '.'; };
    const para = () => Array.from({ length: 4 }, sent).join(' ');
    if (unit === 'words') out = Array.from({ length: count }, next).join(' ');
    else if (unit === 'sentences') out = Array.from({ length: count }, sent).join(' ');
    else out = Array.from({ length: count }, para).join('\n\n');
    if (start && !out.startsWith('Lorem ipsum')) out = 'Lorem ipsum dolor sit amet ' + out.charAt(0).toLowerCase() + out.slice(1);
  }
  return <div className="stack">
    <div className="row">
      <Field id="ln" label="How many?" hint="1 to 100" error={bad ? 'Enter a whole number from 1 to 100.' : ''}><input id="ln" type="number" min="1" max="100" value={n} onChange={(e) => setN(e.target.value)} aria-invalid={bad} /></Field>
      <Field id="lu" label="Type"><select id="lu" value={unit} onChange={(e) => setUnit(e.target.value)}><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select></Field>
    </div>
    <label className="check"><input type="checkbox" checked={start} onChange={(e) => setStart(e.target.checked)} /> Start with “Lorem ipsum dolor sit amet”</label>
    <Output value={out} filename="lorem-ipsum.txt" rows={12} /></div>;
}
