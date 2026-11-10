import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mergePdfs, extractPages, splitAll, parseRanges, pageCount, imagesToPdf } from '../utils/pdfOps.js';
const make = async (n) => { const d = await PDFDocument.create(); for (let i = 0; i < n; i++) d.addPage([200, 200]); return d.save(); };
const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/VscvDQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0));
describe('pdf ops', () => {
  it('merge', async () => { expect(await pageCount(await mergePdfs([await make(2), await make(3)]))).toBe(5); });
  it('extract', async () => { expect(await pageCount(await extractPages(await make(5), [1, 3, 5]))).toBe(3); });
  it('split all', async () => { const parts = await splitAll(await make(4)); expect(parts.length).toBe(4); expect(await pageCount(parts[2])).toBe(1); });
  it('ranges', () => { expect(parseRanges('1-3, 5, 8-', 9).pages).toEqual([1, 2, 3, 5, 8, 9]); expect(parseRanges('0', 5).error).toBeTruthy(); expect(parseRanges('6', 5).error).toBeTruthy(); expect(parseRanges('3-1', 5).error).toBeTruthy(); expect(parseRanges('a', 5).error).toBeTruthy(); expect(parseRanges('', 5).error).toBeTruthy(); });
  it('bad pdf', async () => { await expect(mergePdfs([new Uint8Array([1, 2, 3])])).rejects.toThrow(/could not be read/); });
  it('images to pdf', async () => { const a = await imagesToPdf([{ bytes: png, type: 'image/png' }, { bytes: png, type: 'image/png' }], 'a4'); expect(await pageCount(a)).toBe(2); const f = await PDFDocument.load(await imagesToPdf([{ bytes: png, type: 'image/png' }], 'fit')); expect(f.getPage(0).getSize()).toEqual({ width: 1, height: 1 }); });
});
