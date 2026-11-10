// Maps tool slug -> lazy React component, so each tool group loads only when opened.
// Add new tools here (and a row in src/data/tools.js).
import { lazy } from 'react';
const L = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));
const text = () => import('./text/TextTools.jsx');
const img = () => import('./image/ImageTools.jsx');
const img2 = () => import('./image/ImageTools2.jsx');
const dev = () => import('./developer/DevTools.jsx');
const dev2 = () => import('./developer/DevTools2.jsx');
const calc = () => import('./calculators/Calcs.jsx');
const calc2 = () => import('./calculators/Calcs2.jsx');
const qr = () => import('./qr-pdf/QrTools.jsx');
const scan = () => import('./qr-pdf/QrScanner.jsx');
const pdf = () => import('./qr-pdf/PdfTools.jsx');
const seo = () => import('./seo-social/SeoTools.jsx');

export const registry = {
  'word-counter': L(text, 'WordCounter'), 'character-counter': L(text, 'CharacterCounter'), 'case-converter': L(text, 'CaseConverter'),
  'uppercase-converter': L(text, 'UppercaseConverter'), 'lowercase-converter': L(text, 'LowercaseConverter'), 'remove-extra-spaces': L(text, 'RemoveExtraSpaces'),
  'text-reverser': L(text, 'TextReverser'), 'duplicate-line-remover': L(text, 'DuplicateLineRemover'), 'text-to-slug': L(text, 'TextToSlug'), 'lorem-ipsum-generator': L(text, 'LoremGenerator'),
  'image-compressor': L(img, 'ImageCompressor'), 'jpg-to-png': L(img2, 'JpgToPng'), 'png-to-jpg': L(img2, 'PngToJpg'), 'webp-to-jpg': L(img2, 'WebpToJpg'), 'jpg-to-webp': L(img2, 'JpgToWebp'),
  'image-resizer': L(img, 'ImageResizer'), 'image-cropper': L(img2, 'ImageCropper'), 'image-rotator': L(img2, 'ImageRotator'), 'image-to-base64': L(img2, 'ImageToBase64'), 'image-background-color-changer': L(img2, 'BackgroundColorChanger'),
  'json-formatter': L(dev, 'JsonFormatter'), 'json-validator': L(dev, 'JsonValidator'), 'html-formatter': L(dev2, 'HtmlFormatter'), 'css-minifier': L(dev2, 'CssMinifier'), 'javascript-minifier': L(dev2, 'JsMinifier'),
  'base64-encoder': L(dev, 'Base64Encoder'), 'base64-decoder': L(dev, 'Base64Decoder'), 'url-encoder': L(dev, 'UrlEncoder'), 'url-decoder': L(dev, 'UrlDecoder'), 'html-entity-encoder-decoder': L(dev2, 'HtmlEntities'),
  'percentage-calculator': L(calc, 'PercentageCalculator'), 'age-calculator': L(calc2, 'AgeCalculator'), 'bmi-calculator': L(calc, 'BmiCalculator'), 'discount-calculator': L(calc, 'DiscountCalculator'),
  'profit-margin-calculator': L(calc2, 'ProfitMargin'), 'loan-emi-calculator': L(calc2, 'LoanEmi'), 'gst-calculator': L(calc2, 'GstCalculator'), 'date-difference-calculator': L(calc2, 'DateDifference'),
  'qr-code-generator': L(qr, 'QrGenerator'), 'qr-code-scanner': L(scan, 'QrScanner'), 'url-to-qr-code': L(qr, 'UrlToQr'),
  'pdf-merger': L(pdf, 'PdfMerger'), 'pdf-splitter': L(pdf, 'PdfSplitter'), 'pdf-to-jpg': L(pdf, 'PdfToJpg'), 'jpg-to-pdf': L(pdf, 'JpgToPdf'),
  'meta-tag-generator': L(seo, 'MetaGenerator'), 'meta-tag-analyzer': L(seo, 'MetaAnalyzer'), 'robots-txt-generator': L(seo, 'RobotsGenerator'), 'xml-sitemap-generator': L(seo, 'SitemapGenerator'),
  'youtube-title-generator': L(seo, 'YoutubeTitles'), 'youtube-description-generator': L(seo, 'YoutubeDescription'), 'hashtag-generator': L(seo, 'HashtagGenerator'), 'instagram-bio-generator': L(seo, 'InstagramBio'),
};
