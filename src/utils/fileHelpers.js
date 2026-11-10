export const MAX_IMAGE_MB = 25;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export function validateImage(file) {
  if (!file) return 'Choose an image file first.';
  if (!IMAGE_TYPES.includes(file.type)) return 'Unsupported file type. Use a JPG, PNG or WebP image.';
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `File is too large. The limit is ${MAX_IMAGE_MB} MB.`;
  return null;
}
export const formatBytes = (n) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`);
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const downloadText = (text, filename, type = 'text/plain') => downloadBlob(new Blob([text], { type }), filename);
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('This image could not be read. It may be corrupted.')); };
    img.src = url;
  });
}
export const canvasToBlob = (canvas, type, quality) =>
  new Promise((res, rej) => canvas.toBlob((b) => (b && b.type === type ? res(b) : rej(new Error(`Your browser cannot create ${type.replace('image/', '').toUpperCase()} images. Try another browser or output format.`))), type, quality));
