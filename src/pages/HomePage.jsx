import { Link } from 'react-router-dom';
import { ArrowRight, Gift, UserX, Zap, ShieldCheck, MonitorSmartphone, Sparkles, Eye } from 'lucide-react';
import SearchBar from '../components/SearchBar.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import ToolCard from '../components/ToolCard.jsx';
import Reveal from '../components/Reveal.jsx';
import CountUp from '../components/CountUp.jsx';
import { WordCounter } from '../tools/text/TextTools.jsx';
import { Icon } from '../utils/icons.jsx';
import { categories } from '../data/categories.js';
import { tools, getTool } from '../data/tools.js';
import { usePageMeta } from '../utils/usePageMeta.js';

const faqs = [
  ['Is TAVRO free?', 'Yes. Every tool is free to use and needs no account.'],
  ['Are my files uploaded?', 'No. Tools run in your browser, so your text, images and PDFs stay on your device.'],
  ['Does it work on my phone?', 'Yes. The layout adapts to phones, tablets and desktops, and tools work in any modern browser.'],
  ['Which browsers are supported?', 'Current versions of Chrome, Edge, Firefox and Safari. A few features, like WebP output or the camera scanner, depend on your browser.'],
  ['How do I suggest a tool?', 'Use the contact page and tell us what you need.'],
];
const featureCards = [
  [ShieldCheck, 'Private by design', 'Your text, images and PDFs are processed on your own device. We do not upload them.'],
  [UserX, 'No account needed', 'Open a tool and use it. There is nothing to sign up for.'],
  [MonitorSmartphone, 'Works on any screen', 'A clean layout that adapts from phones to wide desktops.'],
  [Eye, 'Clear and honest', 'Every result shows what was done, and limits are explained in plain words.'],
];
const previewTools = ['word-counter', 'image-compressor', 'json-formatter', 'qr-code-generator', 'pdf-merger', 'case-converter'];
const half = Math.ceil(tools.length / 2);

export default function HomePage() {
  usePageMeta('', 'TAVRO: 53 free online tools for text, images, PDFs, developers, calculators, QR codes and SEO. No sign-up, runs in your browser.');
  const popular = tools.filter((t) => t.popular);
  const quick = popular.slice(0, 5);
  const row = (list) => [...list, ...list].map((t, i) => <span key={i} className="pill-tool" data-cat={t.category}><Icon name={t.icon} size={16} />{t.title}</span>);
  return (
    <>
      <section className="sec hero3 bg-aurora bg-grid">
        <div className="blob blob-a" aria-hidden="true" /><div className="blob blob-b" aria-hidden="true" />
        <div className="container hero2-grid">
          <div className="hero2-copy">
            <span className="eyebrow"><Sparkles size={14} aria-hidden="true" /> Simple. Fast. Powerful.</span>
            <h1>All-in-One <span className="sr-only">Online Tools</span>
              {/* <span className="rot grad-text" aria-hidden="true"><span>Online Tools</span><span>Image Tools</span><span>PDF Tools</span><span>Dev Tools</span></span></h1> */}
              <span className="rot grad-text" aria-hidden="true"><span>Online Tools</span></span></h1>
            
            <p className="lead">Count words, compress images, merge PDFs, convert files, format JSON, generate QR codes, and much more. Choose from a wide range of free online tools and get things done in seconds — right in your browser, with no downloads required.</p>
            <div className="glass hero-search"><SearchBar large id="hero-search" /></div>
            <div className="quick"><span className="muted small">Popular:</span>{quick.map((t) => <Link key={t.slug} to={`/tools/${t.slug}`} className="chip">{t.title}</Link>)}</div>
            <div className="actions"><Link to="/tools" className="btn btn-primary btn-lg">Browse all tools <ArrowRight size={18} aria-hidden="true" /></Link><Link to="/about" className="btn btn-ghost btn-lg">About TAVRO</Link></div>
          </div>
          <div className="hero2-art" aria-hidden="true">
            <div className="art-card">
              <div className="art-bar"><i /><i /><i /></div>
              <div className="art-grid">{previewTools.map((s) => <div key={s} className="art-tile" data-cat={getTool(s).category}><span className="icon-chip"><Icon name={getTool(s).icon} /></span><b>{getTool(s).title}</b></div>)}</div>
              <div className="art-line w80" /><div className="art-line w55" />
            </div>
            <div className="art-float f1"><Icon name="QrCode" size={26} /></div><div className="art-float f2"><Icon name="Braces" size={26} /></div><div className="art-float f3"><Icon name="Image" size={22} /></div>
          </div>
        </div>
        <Reveal className="container stats stagger">
          <div><strong><CountUp to={tools.length} /></strong><span>Free tools</span></div>
          <div><strong><CountUp to={categories.length} /></strong><span>Categories</span></div>
          <div><strong><CountUp to={0} /></strong><span>Sign-ups needed</span></div>
          <div><strong><CountUp to={100} suffix="%" /></strong><span>In your browser</span></div>
        </Reveal>
      </section>

      <section className="sec bg-dots wave-t">
        <div className="container section">
          <Reveal className="section-head"><span className="eyebrow">Try it now</span><h2>Use a tool right here</h2><p className="lead">This is the real Word Counter. Type or paste some text and watch it work.</p></Reveal>
          <Reveal className="card tool-panel try-panel" delay={100}><WordCounter /></Reveal>
          <p className="center-text"><Link to="/tools/word-counter">Open the full Word Counter page</Link></p>
        </div>
      </section>

      <section className="sec bg-diagonal">
        <div className="container section">
          <Reveal className="section-head"><span className="eyebrow">Categories</span><h2>Find the right tool faster</h2><p className="lead">{tools.length} tools in {categories.length} categories. Every one is ready to use.</p></Reveal>
          <Reveal className="grid stagger">{categories.map((c) => <CategoryCard key={c.slug} category={c} />)}</Reveal>
        </div>
      </section>

      <section className="sec bg-mesh">
        <div className="container section">
          <Reveal className="section-head row-head"><div><span className="eyebrow">Popular</span><h2>Most-used tools</h2></div><Link to="/tools" className="btn btn-soft">See all tools</Link></Reveal>
          <Reveal className="grid stagger">{popular.map((t) => <ToolCard key={t.slug} tool={t} />)}</Reveal>
        </div>
      </section>

      <div className="marquee-wrap" aria-hidden="true">
        <div className="marquee"><div className="marquee-track">{row(tools.slice(0, half))}</div></div>
        <div className="marquee rev"><div className="marquee-track">{row(tools.slice(half))}</div></div>
      </div>

      <section className="sec bg-dark wave-t wave-b">
        <div className="container section">
          <Reveal className="section-head"><span className="eyebrow">Why TAVRO</span><h2>Built to be simple and trustworthy</h2></Reveal>
          <Reveal className="features stagger">{featureCards.map(([I, t, d]) => <article key={t} className="feature"><span className="icon-chip"><I aria-hidden="true" /></span><h3>{t}</h3><p>{d}</p></article>)}</Reveal>
        </div>
      </section>

      <section className="sec bg-dots">
        <div className="container section">
          <Reveal className="section-head"><span className="eyebrow">How it works</span><h2>Three steps, no setup</h2></Reveal>
          <Reveal as="ol" className="how stagger">
            <li><strong>Find a tool</strong><span>Search, or browse by category.</span></li>
            <li><strong>Add your input</strong><span>Type, paste text, or choose a file.</span></li>
            <li><strong>Copy or download</strong><span>Take the result with you.</span></li>
          </Reveal>
          <Reveal className="values stagger">
            <div><Gift aria-hidden="true" /><strong>Free to use</strong><span>No payment needed.</span></div>
            <div><UserX aria-hidden="true" /><strong>No sign-up</strong><span>Open a tool and start.</span></div>
            <div><Zap aria-hidden="true" /><strong>Fast in your browser</strong><span>Your input stays on your device.</span></div>
          </Reveal>
        </div>
      </section>

      <section className="sec bg-diagonal">
        <div className="container section narrow">
          <Reveal className="section-head"><span className="eyebrow">FAQ</span><h2>Questions, answered</h2></Reveal>
          <Reveal className="stagger">{faqs.map(([q, a]) => <details className="faq" key={q}><summary>{q}</summary><p>{a}</p></details>)}</Reveal>
        </div>
      </section>

      <section className="sec cta-sec">
        <div className="container section"><Reveal className="cta-band"><span className="shape s1" aria-hidden="true" /><span className="shape s2" aria-hidden="true" /><h2>Ready when you are</h2><p>Pick a tool and get it done. No sign-up, no waiting.</p><Link to="/tools" className="btn btn-lg btn-light">Browse all tools</Link></Reveal></div>
      </section>
    </>
  );
}
