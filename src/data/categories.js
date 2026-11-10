export const categories = [
  { slug: 'text', name: 'Text & Writing', icon: 'Type', description: 'Count, clean and convert text.' },
  { slug: 'image', name: 'Image Tools', icon: 'Image', description: 'Compress, resize and convert images.' },
  { slug: 'developer', name: 'Developer Tools', icon: 'Code', description: 'Format, encode and decode code and data.' },
  { slug: 'calculators', name: 'Calculators', icon: 'Calculator', description: 'Quick maths for money, health and dates.' },
  { slug: 'qr-pdf', name: 'QR & PDF Tools', icon: 'QrCode', description: 'Make QR codes and work with PDFs.' },
  { slug: 'seo-social', name: 'SEO & Social Tools', icon: 'Search', description: 'Meta tags, sitemaps and social copy.' },
];
export const getCategory = (slug) => categories.find((c) => c.slug === slug);
