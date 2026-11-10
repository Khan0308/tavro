// Central tool data. To add a tool: add a row here, build a component, register it in src/tools/registry.js,
// and add its slug to IMPLEMENTED below.
// Row: [slug, title, description, category, icon, keywords, popular]
const rows = [
  ['word-counter','Word Counter','Count words, characters, sentences and reading time.','text','Hash','words count length',1],
  ['character-counter','Character Counter','Count characters with and without spaces.','text','Type','characters letters length',1],
  ['case-converter','Case Converter','Switch text between upper, lower, title, camel and more.','text','CaseSensitive','uppercase lowercase title camel snake',1],
  ['uppercase-converter','Uppercase Converter','Turn any text into UPPERCASE.','text','ArrowUpAZ','capital caps',0],
  ['lowercase-converter','Lowercase Converter','Turn any text into lowercase.','text','ArrowDownAZ','small letters',0],
  ['remove-extra-spaces','Remove Extra Spaces','Clean repeated spaces and blank lines from text.','text','Eraser','whitespace trim clean',0],
  ['text-reverser','Text Reverser','Reverse text, words or lines.','text','Undo2','backwards flip',0],
  ['duplicate-line-remover','Duplicate Line Remover','Remove repeated lines and keep the first of each.','text','ListX','unique dedupe lines',0],
  ['text-to-slug','Text to Slug Converter','Make clean, URL-friendly slugs from any text.','text','Link','url permalink seo',0],
  ['lorem-ipsum-generator','Lorem Ipsum Generator','Generate placeholder paragraphs, sentences or words.','text','AlignLeft','placeholder dummy text',0],
  ['image-compressor','Image Compressor','Shrink JPG, PNG and WebP files right in your browser.','image','Minimize2','compress reduce size optimize',1],
  ['jpg-to-png','JPG to PNG Converter','Convert JPG images to PNG.','image','FileImage','convert jpeg',0],
  ['png-to-jpg','PNG to JPG Converter','Convert PNG images to JPG.','image','FileImage','convert jpeg',0],
  ['webp-to-jpg','WebP to JPG Converter','Convert WebP images to JPG.','image','FileImage','convert',0],
  ['jpg-to-webp','JPG to WebP Converter','Convert JPG images to WebP.','image','FileImage','convert',0],
  ['image-resizer','Image Resizer','Resize images by pixel size or percentage.','image','Scaling','resize dimensions width height',1],
  ['image-cropper','Image Cropper','Crop an image to the area you choose.','image','Crop','cut trim',0],
  ['image-rotator','Image Rotator','Rotate or flip an image.','image','RotateCw','rotate flip',0],
  ['image-to-base64','Image to Base64 Converter','Turn an image into a Base64 data URL.','image','Binary','data url encode',0],
  ['image-background-color-changer','Image Background Color Changer','Replace transparent areas with a solid colour.','image','Palette','background transparent',0],
  ['json-formatter','JSON Formatter','Pretty-print or minify JSON with clear error messages.','developer','Braces','json beautify minify pretty',1],
  ['json-validator','JSON Validator','Check whether JSON is valid and see where it breaks.','developer','ShieldCheck','json check lint',0],
  ['html-formatter','HTML Formatter','Indent and tidy HTML markup.','developer','FileCode','html beautify',0],
  ['css-minifier','CSS Minifier','Minify CSS to reduce file size.','developer','Shrink','css compress',0],
  ['javascript-minifier','JavaScript Minifier','Minify JavaScript to reduce file size.','developer','Shrink','js compress',0],
  ['base64-encoder','Base64 Encoder','Encode text as Base64.','developer','Lock','base64 encode',1],
  ['base64-decoder','Base64 Decoder','Decode Base64 back to text.','developer','Unlock','base64 decode',0],
  ['url-encoder','URL Encoder','Percent-encode text for safe use in URLs.','developer','Link2','url encode percent',0],
  ['url-decoder','URL Decoder','Decode percent-encoded URL text.','developer','Link2','url decode percent',0],
  ['html-entity-encoder-decoder','HTML Entity Encoder / Decoder','Convert special characters to and from HTML entities.','developer','Code','html entities escape',0],
  ['percentage-calculator','Percentage Calculator','Find percentages, percent of a number and percent change.','calculators','Percent','percent increase decrease',1],
  ['age-calculator','Age Calculator','Work out exact age in years, months and days.','calculators','Cake','birthday date',0],
  ['bmi-calculator','BMI Calculator','Calculate body mass index from height and weight.','calculators','HeartPulse','health weight height',0],
  ['discount-calculator','Discount Calculator','Find the sale price and how much you save.','calculators','Tag','sale price off',0],
  ['profit-margin-calculator','Profit Margin Calculator','Calculate profit, margin and markup.','calculators','TrendingUp','business revenue cost',0],
  ['loan-emi-calculator','Loan EMI Calculator','Estimate monthly instalments for a loan.','calculators','Landmark','loan emi interest',0],
  ['gst-calculator','GST Calculator','Add or remove GST from an amount.','calculators','Receipt','tax vat',0],
  ['date-difference-calculator','Date Difference Calculator','Find the time between two dates.','calculators','CalendarDays','days between',0],
  ['qr-code-generator','QR Code Generator','Create a QR code from text or a link and download it.','qr-pdf','QrCode','qr barcode',1],
  ['qr-code-scanner','QR Code Scanner','Scan a QR code with your camera or an image.','qr-pdf','ScanLine','qr read',0],
  ['url-to-qr-code','URL to QR Code','Turn a web address into a QR code.','qr-pdf','QrCode','link qr',0],
  ['pdf-merger','PDF Merger','Combine several PDFs into one.','qr-pdf','Files','pdf merge combine',0],
  ['pdf-splitter','PDF Splitter','Split a PDF into separate pages or ranges.','qr-pdf','Scissors','pdf split extract',0],
  ['pdf-to-jpg','PDF to JPG Converter','Turn PDF pages into JPG images.','qr-pdf','FileImage','pdf convert',0],
  ['jpg-to-pdf','JPG to PDF Converter','Put images into a PDF.','qr-pdf','FileText','pdf convert',0],
  ['meta-tag-generator','Meta Tag Generator','Generate SEO and social meta tags.','seo-social','Tags','seo open graph',0],
  ['meta-tag-analyzer','Meta Tag Analyzer','Check the meta tags in pasted HTML.','seo-social','ScanSearch','seo audit',0],
  ['robots-txt-generator','Robots.txt Generator','Build a robots.txt file.','seo-social','Bot','seo crawler',0],
  ['xml-sitemap-generator','XML Sitemap Generator','Build an XML sitemap from a list of URLs.','seo-social','Map','seo sitemap',0],
  ['youtube-title-generator','YouTube Title Generator','Get title ideas from your topic.','seo-social','Youtube','video titles',0],
  ['youtube-description-generator','YouTube Description Generator','Draft a video description from your details.','seo-social','Youtube','video description',0],
  ['hashtag-generator','Hashtag Generator','Turn keywords into hashtags.','seo-social','Hash','social tags',0],
  ['instagram-bio-generator','Instagram Bio Generator','Draft bio options from your details.','seo-social','Instagram','social bio',0],
];

// Every listed tool has a working component in src/tools/registry.js.
// To list a tool as Coming soon, remove its slug from this set.
export const IMPLEMENTED = new Set(rows.map((r) => r[0]));

export const tools = rows.map(([slug, title, description, category, icon, keywords, popular]) => ({
  slug, title, description, category, icon, keywords: keywords.split(' '), popular: !!popular,
  status: IMPLEMENTED.has(slug) ? 'ready' : 'coming-soon',
}));
export const getTool = (slug) => tools.find((t) => t.slug === slug);
export const searchTools = (list, q) => {
  const s = q.trim().toLowerCase();
  if (!s) return list;
  return list.filter((t) => [t.title, t.description, t.category, ...t.keywords].join(' ').toLowerCase().includes(s));
};
