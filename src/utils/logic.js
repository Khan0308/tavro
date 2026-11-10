// Pure logic for tools (no React). Tested in src/tests/logic.test.js.

/* ---------- dates & calculators ---------- */
const dim = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
export function parseDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return null;
  const [y, m, d] = s.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d ? t : null;
}
export const daysBetween = (a, b) => Math.round((b - a) / 864e5);
export function diffYMD(a, b) { // a <= b
  let y = b.getUTCFullYear() - a.getUTCFullYear(), m = b.getUTCMonth() - a.getUTCMonth(), d = b.getUTCDate() - a.getUTCDate();
  if (d < 0) { m--; d += dim(b.getUTCFullYear(), b.getUTCMonth() - 1); }
  if (m < 0) { y--; m += 12; }
  return { y, m, d };
}
export function ageInfo(dobStr, asOfStr) {
  const dob = parseDate(dobStr), asOf = parseDate(asOfStr);
  if (!dob) return { error: 'Enter a valid date of birth.' };
  if (!asOf) return { error: 'Enter a valid "age at" date.' };
  if (dob > asOf) return { error: 'Date of birth must be on or before the "age at" date.' };
  const ymd = diffYMD(dob, asOf);
  let next = Date.UTC(asOf.getUTCFullYear(), dob.getUTCMonth(), dob.getUTCDate());
  if (next < asOf.getTime()) next = Date.UTC(asOf.getUTCFullYear() + 1, dob.getUTCMonth(), dob.getUTCDate());
  return { ...ymd, totalDays: daysBetween(dob, asOf), totalMonths: ymd.y * 12 + ymd.m, daysToBirthday: Math.round((next - asOf.getTime()) / 864e5), nextBirthday: new Date(next) };
}
export function dateDiff(aStr, bStr, inclusive) {
  const a = parseDate(aStr), b = parseDate(bStr);
  if (!a || !b) return { error: 'Enter two valid dates.' };
  const [s, e] = a <= b ? [a, b] : [b, a]; const days = daysBetween(s, e) + (inclusive ? 1 : 0);
  return { ...diffYMD(s, e), days, weeks: Math.floor(days / 7), remDays: days % 7, reversed: a > b };
}
export function emi(principal, annualRate, months) {
  const r = annualRate / 12 / 100; const n = months;
  const m = r === 0 ? principal / n : (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  return { emi: m, total: m * n, interest: m * n - principal };
}
export function schedule(principal, annualRate, months, limit = 12) {
  const r = annualRate / 12 / 100; const m = emi(principal, annualRate, months).emi; let bal = principal; const rows = [];
  for (let i = 1; i <= Math.min(limit, months); i++) {
    const interest = bal * r; const princ = m - interest; bal = Math.max(0, bal - princ);
    rows.push({ month: i, interest, principal: princ, balance: i === months ? 0 : bal });
  }
  return rows;
}
export function gst(amount, rate, mode) {
  if (mode === 'add') { const g = (amount * rate) / 100; return { net: amount, gst: g, total: amount + g, half: g / 2 }; }
  const net = amount / (1 + rate / 100); return { net, gst: amount - net, total: amount, half: (amount - net) / 2 };
}
export const margin = (cost, revenue) => ({ profit: revenue - cost, margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : NaN, markup: cost > 0 ? ((revenue - cost) / cost) * 100 : NaN });
export const priceFromMargin = (cost, m) => cost / (1 - m / 100);

/* ---------- code tools ---------- */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'pre', 'textarea']);
const dedent = (t) => { const ls = t.replace(/^\s*\n|\s+$/g, '').split('\n'); const ind = Math.min(...ls.filter((l) => l.trim()).map((l) => /^\s*/.exec(l)[0].length), 1e9); return ls.map((l) => l.slice(Number.isFinite(ind) && ind < 1e9 ? ind : 0)); };
export function formatHtml(src, size = 2) {
  const s = src.trim(); const re = /<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z][^>]*>|[^<]+|</g; const toks = []; let m;
  while ((m = re.exec(s))) {
    const t = m[0];
    if (t.startsWith('<!')) toks.push({ k: 'c', s: t });
    else if (t.startsWith('</')) toks.push({ k: 'close', s: t.replace(/\s+/g, ' '), name: /^<\/([\w:-]+)/.exec(t)?.[1].toLowerCase() });
    else if (t[0] === '<' && t.length > 1) {
      const name = /^<([a-zA-Z][\w:-]*)/.exec(t)[1].toLowerCase(); const tag = t.replace(/\s+/g, ' ').replace(/ \/>$/, ' />');
      if (VOID.has(name) || /\/>$/.test(t)) toks.push({ k: 'void', s: tag });
      else if (RAW.has(name)) {
        const rest = s.slice(re.lastIndex); const cm = new RegExp(`</${name}\\s*>`, 'i').exec(rest);
        if (cm) { toks.push({ k: 'raw', s: tag, name, inner: rest.slice(0, cm.index), close: cm[0] }); re.lastIndex += cm.index + cm[0].length; } else toks.push({ k: 'open', s: tag, name });
      } else toks.push({ k: 'open', s: tag, name });
    } else { const x = t.replace(/\s+/g, ' ').trim(); if (x) toks.push({ k: 'text', s: x }); }
  }
  const out = []; let depth = 0; const pad = (d = depth) => ' '.repeat(size * Math.max(d, 0));
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.k === 'open' && toks[i + 1]?.k === 'text' && toks[i + 2]?.k === 'close' && toks[i + 2].name === t.name) { out.push(pad() + t.s + toks[i + 1].s + toks[i + 2].s); i += 2; }
    else if (t.k === 'open') { out.push(pad() + t.s); depth++; }
    else if (t.k === 'close') { depth--; out.push(pad() + t.s); }
    else if (t.k === 'raw') {
      if (t.name === 'pre' || t.name === 'textarea') out.push(pad() + t.s + t.inner + t.close);
      else { out.push(pad() + t.s); if (t.inner.trim()) dedent(t.inner).forEach((l) => out.push(l.trim() ? pad(depth + 1) + l : '')); out.push(pad() + t.close); }
    } else out.push(pad() + t.s);
  }
  return out.join('\n');
}
export function minifyCss(src) {
  const strs = [];
  let s = src.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\/\*[\s\S]*?\*\//g, (_, str) => (str ? `\u0000${strs.push(str) - 1}\u0000` : ''));
  s = s.replace(/\s+/g, ' ').replace(/\s*([{};,])\s*/g, '$1').replace(/([{;])\s*([\w-]+)\s*:(?=[^{}]*[;}])/g, '$1$2:').replace(/:\s+/g, ':').replace(/\s*!\s*important/gi, '!important').replace(/;}/g, '}').trim();
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => strs[i]);
}
export const encodeEntities = (s, all) => {
  const r = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  return all ? [...r].map((c) => (c.codePointAt(0) > 126 ? `&#${c.codePointAt(0)};` : c)).join('') : r;
};
export const decodeEntities = (s) => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; };

/* ---------- SEO ---------- */
const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const isHttpUrl = (v) => { try { return ['http:', 'https:'].includes(new URL(v).protocol); } catch { return false; } };
export function buildSitemap(text, { changefreq = '', priority = '', lastmod = '' } = {}) {
  const errors = []; const seen = new Set(); const urls = [];
  text.split('\n').map((l) => l.trim()).filter(Boolean).forEach((l, i) => {
    if (!isHttpUrl(l)) { errors.push(`Line ${i + 1}: "${l.slice(0, 60)}" is not a full http(s) URL.`); return; }
    if (!seen.has(l)) { seen.add(l); urls.push(l); }
  });
  if (urls.length > 50000) errors.push('A sitemap file can hold at most 50,000 URLs.');
  const body = urls.map((u) => `  <url>\n    <loc>${xml(u)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}${changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : ''}${priority ? `\n    <priority>${priority}</priority>` : ''}\n  </url>`).join('\n');
  return { errors, count: urls.length, xml: urls.length ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n` : '' };
}
export function buildRobots({ mode, agent = '*', disallow = '', allow = '', sitemaps = '', crawlDelay = '' }) {
  const errors = []; const lines = [`User-agent: ${agent.trim() || '*'}`];
  const list = (t, label) => t.split('\n').map((l) => l.trim()).filter(Boolean).forEach((p) => { if (!/^[/*]/.test(p)) errors.push(`${label} path "${p}" must start with /`); else lines.push(`${label}: ${p}`); });
  if (mode === 'block') lines.push('Disallow: /'); else if (mode === 'allow') lines.push('Disallow:'); else { list(disallow, 'Disallow'); list(allow, 'Allow'); if (lines.length === 1) lines.push('Disallow:'); }
  if (crawlDelay !== '') { if (!(Number(crawlDelay) >= 0 && Number.isFinite(Number(crawlDelay)))) errors.push('Crawl-delay must be a number of 0 or more.'); else lines.push(`Crawl-delay: ${crawlDelay}`); }
  const sm = sitemaps.split('\n').map((l) => l.trim()).filter(Boolean); sm.forEach((u) => { if (!isHttpUrl(u)) errors.push(`Sitemap "${u}" must be a full http(s) URL.`); });
  const text = lines.join('\n') + (sm.length ? '\n\n' + sm.filter(isHttpUrl).map((u) => `Sitemap: ${u}`).join('\n') : '') + '\n';
  return { text, errors };
}
export function buildMeta(f) {
  const t = []; const add = (s) => t.push(s);
  if (f.title) add(`<title>${attr(f.title)}</title>`);
  if (f.description) add(`<meta name="description" content="${attr(f.description)}">`);
  if (f.keywords) add(`<meta name="keywords" content="${attr(f.keywords)}">`);
  if (f.author) add(`<meta name="author" content="${attr(f.author)}">`);
  if (f.robots) add(`<meta name="robots" content="${attr(f.robots)}">`);
  if (f.canonical) add(`<link rel="canonical" href="${attr(f.canonical)}">`);
  if (f.og) {
    add(`<meta property="og:type" content="${attr(f.ogType || 'website')}">`);
    const ot = f.ogTitle || f.title, od = f.ogDescription || f.description;
    if (ot) add(`<meta property="og:title" content="${attr(ot)}">`);
    if (od) add(`<meta property="og:description" content="${attr(od)}">`);
    if (f.canonical) add(`<meta property="og:url" content="${attr(f.canonical)}">`);
    if (f.image) add(`<meta property="og:image" content="${attr(f.image)}">`);
    add(`<meta name="twitter:card" content="${f.image ? 'summary_large_image' : 'summary'}">`);
    if (ot) add(`<meta name="twitter:title" content="${attr(ot)}">`);
    if (od) add(`<meta name="twitter:description" content="${attr(od)}">`);
    if (f.image) add(`<meta name="twitter:image" content="${attr(f.image)}">`);
  }
  return t.join('\n');
}
export function analyzeMeta(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html'); const items = [];
  const meta = (sel) => doc.querySelector(sel)?.getAttribute('content')?.trim() || '';
  const push = (label, value, status, note) => items.push({ label, value, status, note });
  const title = doc.querySelector('title')?.textContent.trim() || '';
  push('Title', title, !title ? 'fail' : title.length < 30 || title.length > 60 ? 'warn' : 'pass', !title ? 'Missing. Add a <title>.' : `${title.length} characters. Aim for about 30 to 60.`);
  const desc = meta('meta[name="description" i]');
  push('Meta description', desc, !desc ? 'fail' : desc.length < 70 || desc.length > 160 ? 'warn' : 'pass', !desc ? 'Missing. Add a meta description.' : `${desc.length} characters. Aim for about 70 to 160.`);
  const canon = doc.querySelector('link[rel="canonical" i]')?.getAttribute('href') || '';
  push('Canonical URL', canon, canon ? 'pass' : 'warn', canon ? 'Found.' : 'No canonical link. Add one if the page can be reached by several URLs.');
  const robots = meta('meta[name="robots" i]');
  push('Robots meta', robots, /noindex/i.test(robots) ? 'warn' : 'pass', /noindex/i.test(robots) ? 'This page asks search engines not to index it.' : robots ? 'Found.' : 'Not set. Search engines use their defaults.');
  const vp = meta('meta[name="viewport" i]');
  push('Viewport', vp, vp ? 'pass' : 'warn', vp ? 'Found.' : 'Missing. Mobile layout may not work well.');
  const lang = doc.documentElement.getAttribute('lang') || '';
  push('Language (html lang)', lang, lang ? 'pass' : 'warn', lang ? 'Found.' : 'Add a lang attribute to <html>.');
  const h1 = doc.querySelectorAll('h1').length;
  push('H1 headings', String(h1), h1 === 1 ? 'pass' : 'warn', h1 === 1 ? 'Exactly one H1.' : h1 === 0 ? 'No H1 found.' : 'More than one H1 found.');
  [['og:title'], ['og:description'], ['og:image'], ['og:url']].forEach(([p]) => { const v = meta(`meta[property="${p}" i]`); push(p, v, v ? 'pass' : 'warn', v ? 'Found.' : 'Missing (used for link previews).'); });
  const tw = meta('meta[name="twitter:card" i]'); push('twitter:card', tw, tw ? 'pass' : 'warn', tw ? 'Found.' : 'Missing.');
  return items;
}

/* ---------- social generators ---------- */
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export function youtubeTitles({ topic, keyword = '', audience = '', number = 5, year = new Date().getFullYear() }) {
  const T = topic.trim(); const K = keyword.trim(); const n = number;
  const forA = audience.trim() ? ` for ${audience.trim()}` : '';
  const list = [
    `${cap(T)}: The Complete Guide${forA}`, `How to ${T}${forA} (Step-by-Step)`, `${cap(T)} Explained Simply${forA}`, `${n} ${cap(T)} Tips You Need to Know`,
    `${n} ${cap(T)} Mistakes to Avoid`, `${cap(T)} for Beginners: Start Here`, `The Truth About ${cap(T)}`, `Why ${cap(T)} Matters in ${year}`,
    `${cap(T)} in ${year}: What Has Changed`, `Stop Doing ${cap(T)} Wrong!`, `${n} Secrets of ${cap(T)} Nobody Tells You`, `I Tried ${cap(T)}: Here Is What Happened`,
  ];
  const out = K ? list.map((t, i) => (i % 3 === 0 && !t.toLowerCase().includes(K.toLowerCase()) ? `${cap(K)}: ${t}` : t)) : list;
  return [...new Set(out)].map((t) => ({ text: t, length: t.length }));
}
export function youtubeDescription({ title = '', summary = '', links = '', timestamps = '', hashtags = '', channel = '', cta = '' }) {
  const errors = []; const parts = [];
  if (summary.trim()) parts.push(summary.trim()); else if (title.trim()) parts.push(title.trim());
  if (cta.trim()) parts.push(cta.trim());
  const ts = timestamps.split('\n').map((l) => l.trim()).filter(Boolean);
  ts.forEach((l) => { if (!/^(\d{1,2}:)?\d{1,2}:\d{2}\s+\S/.test(l)) errors.push(`Timestamp line "${l.slice(0, 40)}" should look like "0:00 Intro".`); });
  if (ts.length) { if (!/^0?0:00\s/.test(ts[0])) errors.push('YouTube chapters need the first timestamp to be 0:00.'); parts.push('Chapters:\n' + ts.join('\n')); }
  const ls = links.split('\n').map((l) => l.trim()).filter(Boolean); if (ls.length) parts.push('Links:\n' + ls.join('\n'));
  if (channel.trim()) parts.push(`Subscribe to ${channel.trim()} for more.`);
  const tags = hashtags.split(/[\s,]+/).filter(Boolean).map((h) => '#' + h.replace(/^#+/, '').replace(/[^\p{L}\p{N}_]/gu, '')).filter((h) => h.length > 1);
  if (tags.length) parts.push(tags.slice(0, 15).join(' '));
  return { text: parts.join('\n\n'), errors, length: parts.join('\n\n').length };
}
export function hashtags(input, { style = 'lower', max = 20, variants = false } = {}) {
  const phrases = input.split(/[\n,;]+/).map((p) => p.trim()).filter(Boolean); const out = [];
  const make = (p) => { const w = p.replace(/^#+/, '').split(/[^\p{L}\p{N}]+/u).filter(Boolean); if (!w.length) return ''; return '#' + (style === 'camel' ? w.map(cap).join('') : w.join('').toLowerCase()); };
  phrases.forEach((p) => { const base = make(p); if (base) { out.push(base); if (variants) ['tips', 'daily', 'love', 'community'].forEach((s) => out.push(make(p + ' ' + s))); } });
  const words = input.split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2); if (phrases.length === 1 && words.length > 1) words.forEach((w) => out.push(make(w)));
  const uniq = [...new Set(out.filter(Boolean))].slice(0, max); return { tags: uniq, limited: out.length > uniq.length };
}
export function instagramBios({ role, interests = '', location = '', cta = '', emoji = true }) {
  const R = role.trim(); const it = interests.split(',').map((s) => s.trim()).filter(Boolean); const [a, b] = it; const L = location.trim(); const C = cta.trim();
  const e = (x) => (emoji ? x + ' ' : ''); const lines = (...ls) => ls.filter(Boolean).join('\n');
  const list = [
    lines(`${e('✨')}${cap(R)}`, it.length ? `${e('💡')}${it.slice(0, 3).join(' | ')}` : '', L && `${e('📍')}${L}`, C && `${e('👇')}${C}`),
    lines(`${cap(R)}${a ? ` | ${cap(a)}` : ''}${b ? ` & ${b}` : ''}`, L && `Based in ${L}`, C),
    lines(`${e('🌟')}${cap(R)} ${a ? `who loves ${a}` : ''}`.trim(), b && `Also into ${b}`, L && `${e('🌍')}${L}`, C && `${e('🔗')}${C}`),
    [cap(R), L, C].filter(Boolean).join(' • '),
    lines(`${cap(R)}.`, it.length ? it.slice(0, 3).map(cap).join('. ') + '.' : '', C),
  ].map((t) => t.trim());
  return [...new Set(list)].map((t) => ({ text: t, length: [...t].length }));
}
