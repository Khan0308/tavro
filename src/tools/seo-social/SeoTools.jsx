import { useState } from 'react';
import { Field, TextArea, Output, ResetButton, ResultList, CopyButton, DownloadTextButton } from '../ui.jsx';
import { buildMeta, analyzeMeta, buildRobots, buildSitemap, isHttpUrl, youtubeTitles, youtubeDescription, hashtags, instagramBios } from '../../utils/logic.js';

const In = ({ id, label, value, set, hint, error, type = 'text', placeholder }) => <Field id={id} label={label} hint={hint} error={error}><input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => set(e.target.value)} aria-invalid={!!error} /></Field>;
const Count = ({ n, max }) => <span className={n > max ? 'error' : 'muted small'}>{n}/{max} characters</span>;
const META0 = { title: '', description: '', keywords: '', author: '', canonical: '', robots: 'index, follow', og: true, ogType: 'website', image: '' };

export function MetaGenerator() {
  const [f, setF] = useState(META0);
  const set = (k) => (v) => setF({ ...f, [k]: v });
  const urlErr = (v) => (v && !isHttpUrl(v) ? 'Enter a full URL starting with https://' : '');
  const out = f.title || f.description ? buildMeta(f) : '';
  return <div className="stack">
    <In id="mt" label="Page title" value={f.title} set={set('title')} hint="About 30 to 60 characters works well." /><Count n={f.title.length} max={60} />
    <TextArea id="md" label="Meta description" value={f.description} onChange={set('description')} rows={3} hint="About 70 to 160 characters." /><Count n={f.description.length} max={160} />
    <div className="row"><In id="mk" label="Keywords (optional)" value={f.keywords} set={set('keywords')} hint="Comma separated. Search engines mostly ignore them." /><In id="ma" label="Author (optional)" value={f.author} set={set('author')} /></div>
    <div className="row"><In id="mc" label="Canonical URL" value={f.canonical} set={set('canonical')} error={urlErr(f.canonical)} placeholder="https://example.com/page" />
      <Field id="mr" label="Robots"><select id="mr" value={f.robots} onChange={(e) => set('robots')(e.target.value)}><option value="index, follow">index, follow</option><option value="noindex, follow">noindex, follow</option><option value="index, nofollow">index, nofollow</option><option value="noindex, nofollow">noindex, nofollow</option><option value="">Do not add</option></select></Field></div>
    <label className="check"><input type="checkbox" checked={f.og} onChange={(e) => set('og')(e.target.checked)} /> Add Open Graph and Twitter Card tags</label>
    {f.og && <div className="row"><In id="mi" label="Social image URL" value={f.image} set={set('image')} error={urlErr(f.image)} placeholder="https://example.com/image.jpg" /><Field id="mo" label="Content type"><select id="mo" value={f.ogType} onChange={(e) => set('ogType')(e.target.value)}><option>website</option><option>article</option><option>product</option></select></Field></div>}
    <Output id="meta-out" label="HTML to paste in your <head>" value={out} filename="meta-tags.html" rows={10} />
    <div className="actions"><ResetButton onClick={() => setF(META0)} /></div></div>;
}

const BADGE = { pass: 'Good', warn: 'Check', fail: 'Missing' };
export function MetaAnalyzer() {
  const [html, setHtml] = useState(''); const [items, setItems] = useState(null);
  const run = () => setItems(html.trim() ? analyzeMeta(html) : []);
  const score = items?.length ? items.filter((i) => i.status === 'pass').length : 0;
  return <div className="stack">
    <p className="note"><strong>Why paste HTML?</strong> Browsers block this page from fetching other websites (CORS). Open your page, choose View Source, copy it, and paste it below.</p>
    <TextArea id="ma-in" label="Page HTML" value={html} onChange={(v) => { setHtml(v); setItems(null); }} rows={10} placeholder="<html>…</html>" />
    <div className="actions"><button type="button" className="btn btn-primary" onClick={run}>Analyze meta tags</button><ResetButton onClick={() => { setHtml(''); setItems(null); }} /></div>
    {items && !items.length && <p className="error" role="alert">Paste some HTML first.</p>}
    {items?.length > 0 && <><p className="result good" role="status">{score} of {items.length} checks passed.</p>
      <div className="table-wrap"><table className="compare"><thead><tr><th scope="col">Check</th><th scope="col">Status</th><th scope="col">Found</th><th scope="col">Notes</th></tr></thead><tbody>
        {items.map((i) => <tr key={i.label}><th scope="row">{i.label}</th><td><span className={`pill pill-${i.status}`}>{BADGE[i.status]}</span></td><td className="cell-wrap">{i.value || '—'}</td><td>{i.note}</td></tr>)}</tbody></table></div></>}</div>;
}

export function RobotsGenerator() {
  const [f, setF] = useState({ mode: 'allow', agent: '*', disallow: '', allow: '', sitemaps: '', crawlDelay: '' }); const set = (k) => (v) => setF({ ...f, [k]: v });
  const r = buildRobots(f);
  return <div className="stack">
    <Field id="rm" label="Rule"><select id="rm" value={f.mode} onChange={(e) => set('mode')(e.target.value)}><option value="allow">Allow everything</option><option value="block">Block everything</option><option value="custom">Custom paths</option></select></Field>
    <In id="ra" label="User-agent" value={f.agent} set={set('agent')} hint="* means all crawlers." />
    {f.mode === 'custom' && <div className="row"><TextArea id="rd" label="Disallow paths" value={f.disallow} onChange={set('disallow')} rows={4} hint="One per line, starting with /" placeholder={'/admin/\n/private/'} /><TextArea id="rl" label="Allow paths" value={f.allow} onChange={set('allow')} rows={4} hint="One per line, starting with /" placeholder="/admin/public/" /></div>}
    <TextArea id="rs" label="Sitemap URLs (optional)" value={f.sitemaps} onChange={set('sitemaps')} rows={2} hint="Full URLs, one per line" placeholder="https://example.com/sitemap.xml" />
    <In id="rc" label="Crawl-delay in seconds (optional)" value={f.crawlDelay} set={set('crawlDelay')} type="number" hint="Some crawlers ignore this." />
    {r.errors.map((e) => <p key={e} className="error" role="alert">{e}</p>)}
    <Output id="robots-out" label="robots.txt" value={r.errors.length ? '' : r.text} filename="robots.txt" rows={8} />
    <p className="muted small">Upload the file to the root of your site, for example https://example.com/robots.txt. Robots.txt asks crawlers to stay away; it does not hide pages from people.</p></div>;
}

export function SitemapGenerator() {
  const [t, setT] = useState(''); const [cf, setCf] = useState(''); const [pr, setPr] = useState(''); const [lm, setLm] = useState(false);
  const r = t.trim() ? buildSitemap(t, { changefreq: cf, priority: pr, lastmod: lm ? new Date().toISOString().slice(0, 10) : '' }) : null;
  return <div className="stack">
    <TextArea id="sm" label="Page URLs" value={t} onChange={setT} rows={8} hint="One full URL per line. Duplicates are removed." placeholder={'https://example.com/\nhttps://example.com/about'} />
    <div className="row"><Field id="scf" label="Change frequency"><select id="scf" value={cf} onChange={(e) => setCf(e.target.value)}><option value="">Do not include</option>{['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map((x) => <option key={x}>{x}</option>)}</select></Field>
      <Field id="spr" label="Priority"><select id="spr" value={pr} onChange={(e) => setPr(e.target.value)}><option value="">Do not include</option>{['1.0', '0.8', '0.6', '0.5', '0.3', '0.1'].map((x) => <option key={x}>{x}</option>)}</select></Field></div>
    <label className="check"><input type="checkbox" checked={lm} onChange={(e) => setLm(e.target.checked)} /> Add today's date as last modified</label>
    {r?.errors.map((e) => <p key={e} className="error" role="alert">{e}</p>)}
    {r && <p role="status" className="muted">{r.count} URL{r.count === 1 ? '' : 's'} included.</p>}
    <Output id="sitemap-out" label="sitemap.xml" value={r?.xml || ''} filename="sitemap.xml" rows={10} />
    <div className="actions"><ResetButton onClick={() => setT('')} /></div></div>;
}

export function YoutubeTitles() {
  const [f, setF] = useState({ topic: '', keyword: '', audience: '', number: '5' }); const set = (k) => (v) => setF({ ...f, [k]: v });
  const n = Number(f.number); const bad = !Number.isInteger(n) || n < 1 || n > 99;
  const items = f.topic.trim() && !bad ? youtubeTitles({ ...f, number: n }) : [];
  return <div className="stack">
    <p className="muted small">Titles are built from your input using common title patterns. Review and edit them to fit your video.</p>
    <In id="yt" label="Video topic" value={f.topic} set={set('topic')} placeholder="e.g. learn python" />
    <div className="row"><In id="yk" label="Main keyword (optional)" value={f.keyword} set={set('keyword')} /><In id="ya" label="Audience (optional)" value={f.audience} set={set('audience')} placeholder="beginners" /><In id="yn" label="Number for list titles" value={f.number} set={set('number')} type="number" error={bad ? 'Enter 1 to 99.' : ''} /></div>
    <ResultList items={items} limit={100} /></div>;
}

export function YoutubeDescription() {
  const [f, setF] = useState({ title: '', summary: '', cta: '', timestamps: '', links: '', hashtags: '', channel: '' }); const set = (k) => (v) => setF({ ...f, [k]: v });
  const r = f.title.trim() || f.summary.trim() ? youtubeDescription(f) : null;
  return <div className="stack">
    <In id="dt" label="Video title" value={f.title} set={set('title')} />
    <TextArea id="ds" label="What is the video about?" value={f.summary} onChange={set('summary')} rows={4} />
    <In id="dc" label="Call to action (optional)" value={f.cta} set={set('cta')} placeholder="Like and subscribe if this helped." />
    <div className="row"><TextArea id="dts" label="Timestamps (optional)" value={f.timestamps} onChange={set('timestamps')} rows={4} hint="One per line, like 0:00 Intro" /><TextArea id="dl" label="Links (optional)" value={f.links} onChange={set('links')} rows={4} hint="One per line" /></div>
    <div className="row"><In id="dh" label="Hashtags (optional)" value={f.hashtags} set={set('hashtags')} hint="Space or comma separated" /><In id="dch" label="Channel name (optional)" value={f.channel} set={set('channel')} /></div>
    {r?.errors.map((e) => <p key={e} className="error" role="alert">{e}</p>)}
    <Output id="yd-out" label="Description" value={r?.text || ''} filename="youtube-description.txt" rows={10} />
    {r && <p className={r.length > 5000 ? 'error' : 'muted small'}>{r.length}/5000 characters</p>}</div>;
}

export function HashtagGenerator() {
  const [t, setT] = useState(''); const [style, setStyle] = useState('lower'); const [max, setMax] = useState('20'); const [variants, setVariants] = useState(false);
  const m = Number(max); const bad = !Number.isInteger(m) || m < 1 || m > 30;
  const r = t.trim() && !bad ? hashtags(t, { style, max: m, variants }) : { tags: [] }; const text = r.tags.join(' ');
  return <div className="stack">
    <TextArea id="ht" label="Keywords or topics" value={t} onChange={setT} rows={4} hint="Separate topics with commas or new lines." placeholder="travel tips, street food, budget trips" />
    <div className="row"><Field id="hs" label="Style"><select id="hs" value={style} onChange={(e) => setStyle(e.target.value)}><option value="lower">#lowercase</option><option value="camel">#CamelCase (easier to read)</option></select></Field>
      <In id="hn" label="Max hashtags" value={max} set={setMax} type="number" error={bad ? 'Enter 1 to 30.' : ''} /></div>
    <label className="check"><input type="checkbox" checked={variants} onChange={(e) => setVariants(e.target.checked)} /> Add variations (tips, daily, love, community)</label>
    <Field id="hout" label={`Hashtags (${r.tags.length})`}><textarea id="hout" rows="4" readOnly value={text} placeholder="Your hashtags will appear here" /></Field>
    {r.limited && <p className="muted small">More tags were possible. Raise the maximum to see them.</p>}
    <div className="actions"><CopyButton text={text} /><DownloadTextButton text={text} filename="hashtags.txt" /><ResetButton onClick={() => setT('')} /></div>
    <p className="muted small">Instagram allows up to 30 hashtags per post. A smaller, relevant set often works better.</p></div>;
}

export function InstagramBio() {
  const [f, setF] = useState({ role: '', interests: '', location: '', cta: '', emoji: true }); const set = (k) => (v) => setF({ ...f, [k]: v });
  const items = f.role.trim() ? instagramBios(f) : [];
  return <div className="stack">
    <In id="ir" label="Who are you or what do you do?" value={f.role} set={set('role')} placeholder="e.g. travel photographer" />
    <In id="ii" label="Interests or topics (optional)" value={f.interests} set={set('interests')} hint="Separate with commas" placeholder="travel, coffee, film" />
    <div className="row"><In id="il" label="Location (optional)" value={f.location} set={set('location')} /><In id="ic" label="Call to action or link text (optional)" value={f.cta} set={set('cta')} placeholder="Book a shoot below" /></div>
    <label className="check"><input type="checkbox" checked={f.emoji} onChange={(e) => set('emoji')(e.target.checked)} /> Use emoji</label>
    <p className="muted small">Bios are built from your details using simple layouts. Instagram bios can be up to 150 characters.</p>
    <ResultList items={items} limit={150} /></div>;
}
