import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../utils/usePageMeta.js';
import { isEmail } from '../utils/validation.js';
import { Mail, Phone, MapPin, Heart, AtSign } from 'lucide-react';

import { Sparkles,Target,Eye,Zap,ShieldCheck,Globe,FileText,Image,Calculator,ArrowRight,CheckCircle} from 'lucide-react';

const Page = ({ title, children }) => <div className="container section narrow prose">{children}</div>;

export function AboutPage() {
  usePageMeta('About', 'About TAVRO, a set of free browser-based tools.');
  return  <Page title="About Us">

      {/* Hero Section */}
      <section className="about-hero">

        <div className="about-content">
          <div className="about-badge">
            <Sparkles size={21} />
            <span>About TAVRO</span>
          </div>

          <h1>
            Making Everyday Tasks
            <span> Simple & Smarter</span>
          </h1>

          <p className="about-description">
            Welcome to TAVRO, your all-in-one destination for
            simple, powerful, and easy-to-use online tools.
            From PDF conversion and image compression to
            calculators and everyday utilities, we bring
            everything you need into one convenient place.
          </p>

          <div className="about-highlights">
            <div>
              <CheckCircle size={20} />
              <span>Easy to Use</span>
            </div>
            <div>
              <CheckCircle size={20} />
              <span>Accessible Online</span>
            </div>
            <div>
              <CheckCircle size={20} />
              <span>Everyday Productivity</span>
            </div>
          </div>

          <a href="/tools" className="about-btn">
            Explore Our Tools
            <ArrowRight size={19} />
          </a>
        </div>

        {/* Right Illustration */}
        <div className="about-visual">
          <div className="about-visual-bg"></div>

          <div className="about-main-card">
            <div className="about-main-icon">
              <Sparkles size={55} />
            </div>
            <h2>TAVRO</h2>
            <p>Everything you need, in one place.</p>

            <div className="about-mini-tools">
              <div><FileText /></div>
              <div><Image /></div>
              <div><Calculator /></div>
              <div><Zap /></div>
            </div>
          </div>

          <div className="about-float about-float-one">
            <Zap size={28} />
          </div>

          <div className="about-float about-float-two">
            <ShieldCheck size={28} />
          </div>

          <div className="about-float about-float-three">
            <Globe size={28} />
          </div>
        </div>

      </section>

      {/* Mission & Vision */}
      <section className="about-purpose">

        <div className="about-section-heading">
          <span>OUR PURPOSE</span>
          <h2>Why We Built TAVRO</h2>
          <p>
            Our goal is to make useful digital tools accessible
            and simple for everyone.
          </p>
        </div>

        <div className="purpose-grid">

          <div className="purpose-card mission-card">
            <div className="purpose-icon">
              <Target size={30} />
            </div>
            <h3>Our Mission</h3>
            <p>
              To simplify everyday digital tasks by providing
              practical, accessible, and easy-to-use online tools
              that help people save time and work efficiently.
            </p>
          </div>

          <div className="purpose-card vision-card">
            <div className="purpose-icon">
              <Eye size={30} />
            </div>
            <h3>Our Vision</h3>
            <p>
              To become a trusted destination for everyday
              online utilities, bringing useful digital solutions
              together in one simple platform.
            </p>
          </div>

        </div>
      </section>

      {/* Why Choose TAVRO */}
      <section className="about-why">

        <div className="about-section-heading">
          <span>WHY TAVRO</span>
          <h2>Designed Around Your Needs</h2>
          <p>
            Everything is designed to make your daily digital
            tasks easier and more convenient.
          </p>
        </div>

        <div className="why-grid">

          <div className="why-card">
            <div className="why-icon blue">
              <Zap size={27} />
            </div>
            <h3>Simple & Fast</h3>
            <p>
              Get your tasks done with straightforward tools
              and an easy-to-use experience.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon purple">
              <Globe size={27} />
            </div>
            <h3>All in One Place</h3>
            <p>
              Access different categories of useful online
              tools from one convenient platform.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon green">
              <ShieldCheck size={27} />
            </div>
            <h3>Convenient Access</h3>
            <p>
              Use available tools directly in your browser
              without installing additional software.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div>
          <Sparkles size={34} />
          <h2>Ready to Make Things Easier?</h2>
          <p>
            Discover useful tools and simplify your everyday
            digital tasks with TAVRO.
          </p>
          <a href="/tools">
            Explore All Tools <ArrowRight size={18} />
          </a>
        </div>
      </section>

    </Page>
  // <Page title="About TAVRO">
  //   <p className="lead">TAVRO is a collection of free online tools that run in your browser. There is no account and no backend.</p>
  //   <p>Text, image and data tools process what you give them on your own device. We list every planned tool, but only mark one as ready once it works. The rest say Coming soon.</p>
  //   <p><Link className="btn btn-primary" to="/tools">Browse tools</Link></p>
  // </Page>;
}
export function ContactPage() {
  usePageMeta('Contact', 'Contact TAVRO.');
  const [f, setF] = useState({ name: '', email: '', message: '' }); const [err, setErr] = useState({}); const [sent, setSent] = useState(false);
  const submit = (e) => {
    e.preventDefault(); const er = {};
    if (!f.name.trim()) er.name = 'Enter your name.';
    if (!isEmail(f.email)) er.email = 'Enter a valid email address, like name@example.com.';
    if (f.message.trim().length < 10) er.message = 'Write at least 10 characters.';
    setErr(er); setSent(Object.keys(er).length === 0);
  };
  const on = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setSent(false); };
  return   <Page title="Contact">
      <section className="contact-hero">

        {/* Left Content */}
        <div className="contact-content">

          <div className="contact-badge">
            <Mail size={22} />
            <span>Get in Touch</span>
          </div>

          <h1>
            Contact <span>Us</span>
          </h1>

          <p className="contact-description">
            Have a question, suggestion, or need support?
            <br />
            We'd love to hear from you. Reach out to us anytime.
          </p>

          <div className="contact-details">

            <div className="contact-item">
              <div className="contact-icon email-icon">
                <Mail size={30} />
              </div>
              <div>
                <h3>Email</h3>
                <a href="mailto:support@TAVRO.com">
                  support@TAVRO.com
                </a>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon phone-icon">
                <Phone size={30} />
              </div>
              <div>
                <h3>Phone</h3>
                <a href="tel:+10000000000">
                  +1 (000) 000-0000
                </a>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon address-icon">
                <MapPin size={30} />
              </div>
              <div>
                <h3>Address</h3>
                <p>123 TAVRO Street, Tech City</p>
              </div>
            </div>

          </div>

          <div className="contact-footer">
            <Heart size={25} />
            <span>We're here to help!</span>
          </div>

        </div>

        {/* Right Illustration */}
        <div className="contact-visual">
          <div className="visual-bg"></div>

          <div className="floating-icon floating-phone">
            <Phone size={35} />
          </div>

          <div className="floating-icon floating-location">
            <MapPin size={35} />
          </div>

          <div className="envelope-wrapper">
            <div className="envelope">
              <div className="envelope-letter">
                <AtSign size={100} />
              </div>
              <div className="envelope-front"></div>
            </div>
          </div>

          <div className="visual-orbit"></div>
          <div className="visual-dot"></div>
        </div>

      </section>
    </Page>

  // <Page title="Contact">
  //   <p className="note"><strong>Demo form.</strong> This form checks your input but does not send anything yet. Connect it to a backend or email service before launch.</p>
  //   <form onSubmit={submit} noValidate className="stack">
  //     {[['name', 'Name', 'text'], ['email', 'Email', 'email']].map(([k, l, t]) => (
  //       <div className="field" key={k}><label htmlFor={`c-${k}`}>{l}</label>
  //         <input id={`c-${k}`} type={t} value={f[k]} onChange={on(k)} aria-invalid={!!err[k]} aria-describedby={err[k] ? `e-${k}` : undefined} />
  //         {err[k] && <span className="error" id={`e-${k}`} role="alert">{err[k]}</span>}</div>))}
  //     <div className="field"><label htmlFor="c-message">Message</label>
  //       <textarea id="c-message" rows="5" value={f.message} onChange={on('message')} aria-invalid={!!err.message} aria-describedby={err.message ? 'e-message' : undefined} />
  //       {err.message && <span className="error" id="e-message" role="alert">{err.message}</span>}</div>
  //     <button className="btn btn-primary" type="submit">Check message</button>
  //     {sent && <p className="success" role="status">Looks good. In this demo nothing was sent, because no email service is connected.</p>}
  //   </form>
  // </Page>;
}
export function PrivacyPage() {
  usePageMeta('Privacy Policy', 'How TAVRO handles your data.');
  return <Page title="Privacy Policy"><p className="muted">Starter text. Have it reviewed before you launch.</p>
    <h2>Your input stays on your device</h2><p>Tools run in your browser. Text, images and files you use are not uploaded to a TAVRO server, because this version has no backend.</p>
    <h2>What is stored</h2><p>Your light or dark theme choice is saved in your browser's local storage. Nothing else is stored.</p>
    <h2>Analytics and cookies</h2><p>This version has no analytics, ads, cookies or trackers. If you add any, update this page.</p>
    <h2>Camera</h2><p>If a scanning tool is added, it will use your camera only after you press a start button.</p>
    <h2>Contact</h2><p>See the <Link to="/contact">contact page</Link>.</p></Page>;
}
export function TermsPage() {
  usePageMeta('Terms of Use', 'Terms of use for TAVRO.');
  return <Page title="Terms of Use"><p className="muted">Starter text. Have it reviewed before you launch.</p>
    <h2>Using TAVRO</h2><p>You may use the tools for lawful purposes. You are responsible for the content you process and for having the right to use it.</p>
    <h2>No warranty</h2><p>Tools are provided as they are. Check important results, such as financial or health calculations, before relying on them.</p>
    <h2>Changes</h2><p>Tools and these terms may change over time.</p></Page>;
}
export function NotFoundPage() {
  usePageMeta('Page not found', '');
  return <Page title="Page not found"><p className="lead">That page does not exist or has moved.</p><p><Link className="btn btn-primary" to="/tools">Browse all tools</Link></p></Page>;
}
