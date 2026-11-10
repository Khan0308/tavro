// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { Suspense } from 'react';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { registry } from '../tools/registry.js';
import { tools } from '../data/tools.js';

afterEach(cleanup);
const show = async (slug) => { const C = registry[slug]; const r = render(<Suspense fallback="loading"><C /></Suspense>); await waitFor(() => expect(r.container.textContent).not.toBe('loading'), { timeout: 5000 }); return r; };
const type = (el, v) => fireEvent.change(el, { target: { value: v } });

describe('every listed tool has a component that renders', () => {
  it('registry covers all 53 tools', () => { expect(tools.length).toBe(53); tools.forEach((t) => expect(registry[t.slug], t.slug).toBeTruthy()); });
  tools.forEach((t) => it(`renders ${t.slug}`, async () => { const { container } = await show(t.slug); expect(container.querySelector('label, button, input, textarea')).toBeTruthy(); }));
});

describe('interactions', () => {
  it('word counter', async () => { await show('word-counter'); type(screen.getByLabelText('Your text'), 'Hello brave new world. Again!'); expect(screen.getByText('Words').previousSibling.textContent).toBe('5'); expect(screen.getByText('Sentences').previousSibling.textContent).toBe('2'); });
  it('case converter', async () => { await show('case-converter'); type(screen.getByLabelText('Your text'), 'hello big world'); fireEvent.change(screen.getByLabelText('Mode'), { target: { value: 'camel' } }); expect(screen.getByLabelText('Result').value).toBe('helloBigWorld'); });
  it('duplicate lines', async () => { await show('duplicate-line-remover'); type(screen.getByLabelText('Your lines'), 'a\nb\na\nc\nb'); expect(screen.getByLabelText('Result').value).toBe('a\nb\nc'); });
  it('json formatter error + ok', async () => { await show('json-formatter'); type(screen.getByLabelText('JSON input'), '{"a":'); expect(screen.getByRole('alert').textContent).toMatch(/Invalid JSON/); type(screen.getByLabelText('JSON input'), '{"a":1}'); expect(screen.getByLabelText('Result').value).toBe('{\n  "a": 1\n}'); });
  it('base64 roundtrip + invalid', async () => { await show('base64-encoder'); type(screen.getByLabelText('Input'), 'héllo ✓'); expect(screen.getByLabelText('Result').value).toBe('aMOpbGxvIOKckw=='); cleanup(); await show('base64-decoder'); type(screen.getByLabelText('Input'), 'aMOpbGxvIOKckw=='); expect(screen.getByLabelText('Result').value).toBe('héllo ✓'); type(screen.getByLabelText('Input'), '%%%'); expect(screen.getByRole('alert')).toBeTruthy(); });
  it('percentage', async () => { await show('percentage-calculator'); type(screen.getByLabelText('Percentage (X)'), '20'); type(screen.getByLabelText('Number (Y)'), '150'); expect(screen.getByRole('status').textContent).toContain('30'); });
  it('age calculator', async () => { await show('age-calculator'); type(screen.getByLabelText('Date of birth'), '2000-01-01'); type(screen.getByLabelText('Age at (date)'), '2024-03-15'); expect(screen.getByRole('status').textContent).toMatch(/24 years, 2 months, 14 days/); });
  it('emi', async () => { await show('loan-emi-calculator'); type(screen.getByLabelText('Loan amount'), '100000'); type(screen.getByLabelText('Interest rate (% per year)'), '12'); type(screen.getByLabelText('Loan term'), '1'); expect(screen.getAllByRole('status')[0].textContent).toMatch(/8,884\.88/); type(screen.getByLabelText('Interest rate (% per year)'), '-1'); expect(screen.getByText('Enter 0 to 100.')).toBeTruthy(); });
  it('gst', async () => { await show('gst-calculator'); type(screen.getByLabelText('Amount'), '1000'); expect(screen.getByRole('status').textContent).toMatch(/180/); });
  it('date diff', async () => { await show('date-difference-calculator'); type(screen.getByLabelText('Start date'), '2024-01-01'); type(screen.getByLabelText('End date'), '2024-12-31'); expect(screen.getByRole('status').textContent).toMatch(/365 days/); });
  it('profit margin', async () => { await show('profit-margin-calculator'); type(screen.getByLabelText('Cost'), '60'); type(screen.getByLabelText('Selling price'), '100'); expect(screen.getByRole('status').textContent).toMatch(/Margin: 40/); });
  it('html entities', async () => { await show('html-entity-encoder-decoder'); type(screen.getByLabelText('Your text'), '<b>&</b>'); expect(screen.getByLabelText('Result').value).toBe('&lt;b&gt;&amp;&lt;/b&gt;'); });
  it('css minifier', async () => { await show('css-minifier'); type(screen.getByLabelText('CSS'), 'a { color : red; }'); expect(screen.getByLabelText('Result').value).toBe('a{color:red}'); });
  it('js minifier error + ok', async () => { await show('javascript-minifier'); fireEvent.click(screen.getByText('Minify JavaScript')); expect((await screen.findByRole('alert')).textContent).toMatch(/Paste some/); type(screen.getByLabelText('JavaScript'), 'function (('); fireEvent.click(screen.getByText('Minify JavaScript')); await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/Could not minify/), { timeout: 5000 }); type(screen.getByLabelText('JavaScript'), 'var longName = 1; console.log(longName);'); fireEvent.click(screen.getByText('Minify JavaScript')); await waitFor(() => expect(screen.getByLabelText('Result').value).toContain('console.log'), { timeout: 5000 }); });
  it('html formatter', async () => { await show('html-formatter'); type(screen.getByLabelText('HTML'), '<div><p>Hi</p></div>'); expect(screen.getByLabelText('Result').value).toBe('<div>\n  <p>Hi</p>\n</div>'); });
  it('qr generator validation (url)', async () => { await show('url-to-qr-code'); type(screen.getByLabelText('Web address'), 'nope'); expect(screen.getByRole('alert').textContent).toMatch(/full web address/); });
  it('meta analyzer', async () => { await show('meta-tag-analyzer'); type(screen.getByLabelText('Page HTML'), '<html><head><title>Hello there friend, this is a good page title</title></head></html>'); fireEvent.click(screen.getByText('Analyze meta tags')); expect(await screen.findByText(/checks passed/)).toBeTruthy(); });
  it('sitemap invalid line', async () => { await show('xml-sitemap-generator'); type(screen.getByLabelText('Page URLs'), 'https://a.com/\nbad'); expect(screen.getByRole('alert').textContent).toMatch(/not a full/); expect(screen.getByLabelText('sitemap.xml').value).toContain('<loc>https://a.com/</loc>'); });
  it('youtube titles', async () => { await show('youtube-title-generator'); type(screen.getByLabelText('Video topic'), 'learn python'); expect(screen.getAllByText(/Learn python/).length).toBeGreaterThan(2); });
  it('hashtags', async () => { await show('hashtag-generator'); type(screen.getByLabelText('Keywords or topics'), 'travel tips, street food'); expect(screen.getByLabelText(/Hashtags \(/).value).toBe('#traveltips #streetfood'); });
  it('instagram bio', async () => { await show('instagram-bio-generator'); type(screen.getByLabelText('Who are you or what do you do?'), 'baker'); expect(screen.getAllByText(/Baker/).length).toBeGreaterThan(1); });
  it('pdf merger starts disabled', async () => { await show('pdf-merger'); expect(screen.getByText('Merge and download').closest('button').disabled).toBe(true); });
});
