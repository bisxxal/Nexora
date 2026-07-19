'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { ArrowRight, ArrowUpRight, BarChart3, Bot, Check, ChevronDown, Code2, Database, FileText, Globe2, Headphones, Menu, MessageCircle, Play, ShieldCheck, Sparkles, X, Zap } from 'lucide-react';

const navItems = ['Product', 'Solutions', 'Resources', 'Pricing'];
const features = [
  ['Everything knows its place', 'Import your docs, site, help centre, PDFs and product data. Superbot keeps every answer grounded in the sources you trust.', Database],
  ['A voice that sounds like you', 'Set tone, guardrails and escalation rules in one visual workspace. Your agent stays useful, on-brand and on task.', Sparkles],
  ['One line. Every page.', 'Publish a beautifully native chat experience with one lightweight script. No engineering queue required.', Code2],
];
const stats = [['47%', 'fewer repetitive tickets'], ['3.2×', 'faster time to resolution'], ['24/7', 'always-on customer help'], ['< 2 min', 'to launch your first agent']];

export default function Home() {
  const { data } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-reveal', { y: 38, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .12, ease: 'power3.out', delay: .15 });
      gsap.fromTo('.float-card', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .14, ease: 'power3.out', delay: .65 });
      gsap.to('.orb-one', { x: 32, y: -22, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.orb-two', { x: -38, y: 20, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
  <main ref={root} className="site-shell">
    <div className="grain" />
    <nav className="nav-wrap">
      <Link href="/" className="brand">
        <span>✦</span> superbot
      </Link>
      <div className="nav-links">
        {navItems.map((item, i) => (
          <a key={item} href={i === 3 ? "#pricing" : "#platform"}>
            {item}
            {i < 3 && <ChevronDown size={14} />}
          </a>
        ))}
      </div>
      <div className="nav-actions">
        <Link href="/sign-in" className="login-link">
          Log in
        </Link>
        <Link
          href={data?.user ? "/dashboard" : "/sign-in"}
          className="button button-dark"
        >
          {data?.user ? "Dashboard" : "Get started"} <ArrowRight size={16} />
        </Link>
      </div>
      <button
        className="menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X /> : <Menu />}
      </button>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mobile-menu"
          >
            {navItems.map((x) => (
              <a key={x} href="#platform" onClick={() => setMenuOpen(false)}>
                {x}
              </a>
            ))}
            <Link href="/sign-in">Get started</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    <section className="hero section-pad">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="hero-copy">
        
        <h1 className="hero-reveal">
          Your website
          <br />
          has a new <em>expert.</em>
        </h1>
        <p className="hero-reveal text-sm!">
          Turn everything your company knows into an AI agent that answers,
          guides, and converts — anywhere your customers need it.
        </p>
        <div className="hero-buttons hero-reveal">
          <Link href="/sign-in" className="button button-coral">
            Build your agent <ArrowRight size={17} />
          </Link>
          <a href="#demo" className="text-button">
            <span className="play-icon">
              <Play size={13} fill="currentColor" />
            </span>{" "}
            See it in action
          </a>
        </div>
        <div className="trusted hero-reveal">
          <span>Trusted by ambitious teams at</span>
          <b>northstar</b>
          <b>AXIS</b>
          <b>vanta</b>
          <b>luma</b>
        </div>
      </div>
      <div className="hero-visual" id="demo">
        <div className="browser float-card">
          <div className="browser-bar">
            <div>
              <i />
              <i />
              <i />
            </div>
            <span>northstar.io</span>
            <span>↗</span>
          </div>
          <div className="site-preview">
            <div className="preview-nav">
              <b>NORTHSTAR</b>
              <span>Product　Solutions　Customers　Pricing</span>
            </div>
            <div className="preview-content">
              <span className="mini-label">WORK SMARTER</span>
              <h3>
                The operating system
                <br />
                for ambitious teams.
              </h3>
              <button>Start for free</button>
            </div>
          </div>
          <div className="chat-window">
            <div className="chat-head">
              <span className="bot-mark">✦</span>
              <div>
                <b>Northstar assistant</b>
                <small>Typically replies instantly</small>
              </div>
              <span className="online" />
            </div>
            <div className="bubble bubble-ai">
              Hi Maya! Looking for the right plan for your growing team?
            </div>
            <div className="bubble bubble-user">
              Yes — we have about 45 people.
            </div>
            <div className="bubble bubble-ai">
              Great fit for Scale. It includes unlimited projects and priority
              support. Want a quick comparison?
            </div>
            <div className="chat-input">
              Ask anything... <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
        <div className="metric-card float-card">
          <div className="metric-icon">
            <BarChart3 size={18} />
          </div>
          <span>Resolution rate</span>
          <strong>84.6%</strong>
          <div className="chart">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <small>↑ 12.4% this month</small>
        </div>
        <div className="source-card float-card">
          <FileText size={16} />
          <div>
            <b>Product handbook.pdf</b>
            <small>Synced 2 mins ago</small>
          </div>
          <Check size={16} />
        </div>
      </div>
    </section>

    <section className="logo-strip">
      <span>POWERING HELPFUL CONVERSATIONS FOR</span>
      <div>
        <b>FRACTAL</b>
        <b>modal</b>
        <b>HARBOR</b>
        <b>ΔTOMIC</b>
        <b>captain</b>
        <b>notionly</b>
      </div>
    </section>

    <section className="story-section section-pad" id="platform">
      <div className="section-intro">
        <span className="eyebrow">BUILT FOR CLARITY</span>
        <h2>
          More than a chatbot.
          <br />
          <em>Your best teammate.</em>
        </h2>
        <p>
          Superbot gives every customer an expert guide, while giving your team
          the space to do their best work.
        </p>
      </div>
      <div className="feature-grid">
        {features.map(([title, text, Icon], i) => (
          <motion.article
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className={"feature-card card-" + i}
            key={String(title)}
          >
            <div className="feature-icon">
              <Icon size={23} />
            </div>
            <span className="card-number">0{i + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <a href="#how">
              Explore capability <ArrowUpRight size={16} />
            </a>
          </motion.article>
        ))}
      </div>
    </section>

    <section className="marquee">
      <div>
        ANSWER MORE <span>•</span> DELIGHT ALWAYS <span>•</span> MOVE FASTER{" "}
        <span>•</span> ANSWER MORE <span>•</span> DELIGHT ALWAYS <span>•</span>
      </div>
    </section>

    <section className="workflow section-pad" id="how">
      <div className="section-intro centered">
      
        <h2>
          Built in an afternoon.
          <br />
          <em>Useful from the first hello.</em>
        </h2>
      </div>
      <div className="steps">
        <div className="step">
          <span>01</span>
          <Globe2 />
          <h3>Bring your knowledge</h3>
          <p>
            Drag in files, point us at a URL, or connect the tools your team
            already uses.
          </p>
        </div>
        <div className="connector" />
        <div className="step">
          <span>02</span>
          <Bot />
          <h3>Shape the experience</h3>
          <p>
            Give your agent a name, a tone and clear rules for when humans
            should step in.
          </p>
        </div>
        <div className="connector" />
        <div className="step">
          <span>03</span>
          <Code2 />
          <h3>Paste one script</h3>
          <p>
            Copy your tiny snippet, add it to your site, and say hello to a very
            capable teammate.
          </p>
        </div>
      </div>
      <div className="code-panel">
        <div className="code-copy">
          <span className="eyebrow">ONE LINE, INFINITE HELP</span>
          <h3>It’s really that simple.</h3>
          <p>
            Our widget is lightweight, responsive and feels completely at home
            on your brand.
          </p>
          <div className="security-row">
            <ShieldCheck /> Enterprise-grade security, by default
          </div>
        </div>
        <pre>
          <code>
            <span>&lt;script</span>
            {"\n"} src=<i>"https://cdn.superbot.ai/widget.js"</i>
            {"\n"} data-agent=<i>"your-agent-id"</i>
            {"\n"} async<span>&gt;&lt;/script&gt;</span>
          </code>
        </pre>
      </div>
    </section>

    <section className="impact">
      <div className="impact-copy">
        <span className="eyebrow light">THE COMPOUND EFFECT</span>
        <h2>
          Every answer is
          <br />a better <em>experience.</em>
        </h2>
        <p>
          When people get unstuck faster, they stay longer, buy with confidence,
          and tell others about you.
        </p>
        <Link href="/sign-in" className="button button-light">
          Start building today <ArrowRight size={17} />
        </Link>
      </div>
      <div className="impact-stats">
        {stats.map(([number, label]) => (
          <div key={label}>
            <strong>{number}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>

    <section className="testimonial section-pad">
      <div className="quote-mark">“</div>
      <blockquote>
        Superbot feels like we hired our most patient, most knowledgeable
        teammate — and put them on every page of our website.
      </blockquote>
    
    </section>

    <section className="faq section-pad">
      <div>
        <span className="eyebrow">QUESTIONS, ANSWERED</span>
        <h2>
          Let’s make it
          <br />
          <em>easy.</em>
        </h2>
        <p>
          Can’t find what you’re looking for?{" "}
          <a href="mailto:hello@superbot.ai">Talk to our team.</a>
        </p>
      </div>
      <div className="faq-list">
        {[
          [
            "How fast can I get an agent live?",
            "Most teams publish their first agent in under two minutes. Add your sources, customize its behavior, and paste the script onto your site.",
          ],
          [
            "Does Superbot work with my existing stack?",
            "Yes. Start with websites and documents, then connect your product, help desk and internal tools as your needs grow.",
          ],
          [
            "Can I control what the agent says?",
            "Absolutely. Use instructions, source controls, tone settings and human handoff rules to make every answer feel safe and on-brand.",
          ],
          [
            "Is our data secure?",
            "Your data is encrypted in transit and at rest. We provide the controls modern B2B teams expect, with security built into every layer.",
          ],
        ].map(([q, a], i) => (
          <button
            className="faq-item"
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            key={q}
          >
            <span>{q}</span>
            <i>{openFaq === i ? "−" : "+"}</i>
            <AnimatePresence>
              {openFaq === i ? (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {a}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </button>
        ))}
      </div>
    </section>

    <section className="final-cta" id="pricing">
      {/* <div className="cta-glow" /> */}
      <span className="eyebrow">YOUR TEAM IS READY</span>
      <h2>
        Make every visit
        <br />
        <em>feel personal.</em>
      </h2>
      <p>
        Start free. Launch fast. Make your website your hardest-working
        teammate.
      </p>
      <Link href="/sign-in" className="button button-coral">
        Create your first agent <ArrowRight size={17} />
      </Link>
    </section>
    <footer>
      <Link href="/" className="brand">
        <span>✦</span> superbot
      </Link>
      <p>AI agents for teams that care about the details.</p>
      <div>
        <a href="#platform">Product</a>
        <a href="#how">Resources</a>
        <a href="#pricing">Pricing</a>
        <a href="/sign-in">Log in</a>
      </div>
      <small>
        © {new Date().getFullYear()} Superbot, Inc. Crafted for better
        conversations.
      </small>
    </footer>
  </main>
);

}
