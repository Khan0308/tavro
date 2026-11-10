export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
export const toNumber = (v) => (v === '' || v === null || v === undefined ? NaN : Number(v));
