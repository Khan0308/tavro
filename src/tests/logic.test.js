// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import * as L from '../utils/logic.js';

describe('calculators', () => {
  it('age', () => { const a = L.ageInfo('1990-05-15', '2024-03-10'); expect([a.y, a.m, a.d]).toEqual([33, 9, 24]); expect(L.ageInfo('2030-01-01', '2024-01-01').error).toBeTruthy(); expect(L.ageInfo('1990-02-31', '2024-01-01').error).toBeTruthy(); });
  it('birthday today', () => { expect(L.ageInfo('2000-06-01', '2024-06-01').daysToBirthday).toBe(0); });
  it('date diff', () => { const d = L.dateDiff('2024-01-01', '2024-03-01'); expect(d.days).toBe(60); expect([d.y, d.m, d.d]).toEqual([0, 2, 0]); expect(L.dateDiff('2024-01-01', '2024-01-01', true).days).toBe(1); expect(L.dateDiff('2024-03-01', '2024-01-01').reversed).toBe(true); });
  it('emi', () => { const e = L.emi(100000, 12, 12); expect(e.emi).toBeCloseTo(8884.88, 1); expect(L.emi(1200, 0, 12).emi).toBe(100); const s = L.schedule(100000, 12, 12, 12); expect(s[11].balance).toBe(0); });
  it('gst', () => { expect(L.gst(100, 18, 'add').total).toBeCloseTo(118); const r = L.gst(118, 18, 'remove'); expect(r.net).toBeCloseTo(100); expect(r.gst).toBeCloseTo(18); });
  it('margin', () => { const m = L.margin(60, 100); expect(m.profit).toBe(40); expect(m.margin).toBe(40); expect(m.markup).toBeCloseTo(66.67, 1); expect(L.priceFromMargin(60, 40)).toBeCloseTo(100); });
});
describe('code tools', () => {
  it('html format', () => { const o = L.formatHtml('<div><p>Hi <b>x</b></p><img src="a.png"><ul><li>One</li></ul></div>'); expect(o).toContain('\n  <ul>'); expect(o).toContain('<li>One</li>'); expect(o.split('\n')[0]).toBe('<div>'); });
  it('html raw', () => { const o = L.formatHtml('<script>\nlet a = 1;\n</script><pre>  keep  </pre>'); expect(o).toContain('<pre>  keep  </pre>'); expect(o).toContain('let a = 1;'); });
  it('css minify', () => { expect(L.minifyCss('/* c */ a  {\n color : red ;\n margin: 0 auto;\n}\n.b::after{content:"a  b; {"}')).toBe('a{color:red;margin:0 auto}.b::after{content:"a  b; {"}'); expect(L.minifyCss('a :hover{width:calc(1px + 2px)}')).toBe('a :hover{width:calc(1px + 2px)}'); });
  it('entities', () => { expect(L.encodeEntities('<a href="x">&</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;'); expect(L.encodeEntities('é', true)).toBe('&#233;'); expect(L.decodeEntities('&lt;b&gt; &amp; &#169; &eacute;')).toBe('<b> & © é'); });
  it('terser', async () => { const m = await import('terser-browser'); const minify = m.minify || m.default?.minify; const r = await minify('function add(a, b) { return a + b; }\nconsole.log(add(1, 2));'); expect(r.code.length).toBeLessThan(60); await expect(minify('function (')).rejects.toBeTruthy(); });
});
describe('seo', () => {
  it('sitemap', () => { const r = L.buildSitemap('https://a.com/\nhttps://a.com/\nnot a url\nhttps://a.com/?a=1&b=2', { changefreq: 'weekly', priority: '0.8', lastmod: '2024-01-01' }); expect(r.count).toBe(2); expect(r.errors.length).toBe(1); expect(r.xml).toContain('a=1&amp;b=2'); expect(r.xml).toContain('<priority>0.8</priority>'); });
  it('robots', () => { expect(L.buildRobots({ mode: 'block' }).text).toBe('User-agent: *\nDisallow: /\n'); const r = L.buildRobots({ mode: 'custom', disallow: '/admin/\nbad', allow: '/admin/public', sitemaps: 'https://a.com/sitemap.xml', crawlDelay: '5' }); expect(r.errors.length).toBe(1); expect(r.text).toContain('Disallow: /admin/'); expect(r.text).toContain('Sitemap: https://a.com/sitemap.xml'); });
  it('meta gen', () => { const m = L.buildMeta({ title: 'A "B"', description: 'd', og: true, image: 'https://x/y.png' }); expect(m).toContain('&quot;B&quot;'); expect(m).toContain('summary_large_image'); });
  it('meta analyzer', () => { const r = L.analyzeMeta('<html lang="en"><head><title>Hi</title><meta name="description" content="short"></head><body><h1>a</h1></body></html>'); expect(r.find((i) => i.label === 'Title').status).toBe('warn'); expect(r.find((i) => i.label === 'Viewport').status).toBe('warn'); expect(r.find((i) => i.label === 'H1 headings').status).toBe('pass'); expect(L.analyzeMeta('')[0].status).toBe('fail'); });
});
describe('social', () => {
  it('yt titles', () => { const t = L.youtubeTitles({ topic: 'learn python', keyword: 'python', audience: 'beginners', number: 7, year: 2026 }); expect(t.length).toBeGreaterThan(8); expect(t.some((x) => x.text.includes('7'))).toBe(true); });
  it('yt description', () => { const d = L.youtubeDescription({ title: 'T', summary: 'S', timestamps: '0:00 Intro\n1:30 Setup', hashtags: 'python, #code', links: 'https://a.com' }); expect(d.errors).toEqual([]); expect(d.text).toContain('#python #code'); expect(L.youtubeDescription({ timestamps: '1:00 Hi\nbad' }).errors.length).toBe(2); });
  it('hashtags', () => { expect(L.hashtags('travel tips, Street Food', { style: 'camel' }).tags).toContain('#StreetFood'); expect(L.hashtags('alpha, beta, gamma', { max: 2 }).tags.length).toBe(2); expect(L.hashtags('  ').tags).toEqual([]); });
  it('bios', () => { const b = L.instagramBios({ role: 'photographer', interests: 'travel, coffee', location: 'Lahore', cta: 'Book below', emoji: false }); expect(b.length).toBeGreaterThan(3); expect(b[0].text).toContain('Lahore'); });
});
