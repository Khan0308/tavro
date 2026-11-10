import { PDFDocument } from 'pdf-lib';

const load = async (bytes) => {
  try { return await PDFDocument.load(bytes); }
  catch (e) { throw new Error(/encrypt/i.test(e.message) ? 'This PDF is password-protected. Remove the password first.' : 'This file could not be read as a PDF. It may be damaged.'); }
};
export async function mergePdfs(buffers) {
  const out = await PDFDocument.create();
  for (const b of buffers) { const src = await load(b); (await out.copyPages(src, src.getPageIndices())).forEach((p) => out.addPage(p)); }
  return out.save();
}
export async function pageCount(buffer) { return (await load(buffer)).getPageCount(); }
// "1-3, 5, 7-" -> [1,2,3,5,7,...total]; returns { pages } or { error }
export function parseRanges(text, total) {
  const pages = [];
  for (const part of text.split(',').map((s) => s.trim()).filter(Boolean)) {
    const m = /^(\d+)(?:\s*-\s*(\d*))?$/.exec(part); if (!m) return { error: `"${part}" is not a valid page or range.` };
    const a = Number(m[1]); const b = m[2] === undefined ? a : m[2] === '' ? total : Number(m[2]);
    if (a < 1 || b > total) return { error: `Pages must be between 1 and ${total}.` };
    if (a > b) return { error: `Range "${part}" goes backwards.` };
    for (let i = a; i <= b; i++) pages.push(i);
  }
  return pages.length ? { pages } : { error: 'Enter at least one page or range, like 1-3, 5.' };
}
export async function extractPages(buffer, pages) {
  const src = await load(buffer); const out = await PDFDocument.create();
  (await out.copyPages(src, pages.map((p) => p - 1))).forEach((p) => out.addPage(p)); return out.save();
}
export async function splitAll(buffer) {
  const src = await load(buffer); const files = [];
  for (let i = 0; i < src.getPageCount(); i++) { const d = await PDFDocument.create(); const [p] = await d.copyPages(src, [i]); d.addPage(p); files.push(await d.save()); }
  return files;
}
// items: [{ bytes, type: 'image/jpeg' | 'image/png' }], size: 'fit' | 'a4'
export async function imagesToPdf(items, size = 'fit') {
  const doc = await PDFDocument.create();
  for (const it of items) {
    const img = it.type === 'image/png' ? await doc.embedPng(it.bytes) : await doc.embedJpg(it.bytes);
    if (size === 'a4') {
      const [W, H] = [595.28, 841.89]; const k = Math.min((W - 40) / img.width, (H - 40) / img.height, 1); const w = img.width * k, h = img.height * k;
      doc.addPage([W, H]).drawImage(img, { x: (W - w) / 2, y: (H - h) / 2, width: w, height: h });
    } else doc.addPage([img.width, img.height]).drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return doc.save();
}
