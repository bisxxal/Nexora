'use client';

import { generateEmbeddings } from '@/ai/embeding';
import PdfUploader from '@/components/pdfupload';
import { toastSuccess } from '@/lib/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { useLayoutEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowRight, Check, FileText, Github, Globe2, LoaderCircle, MessageCircle, Plus, Sparkles, Youtube } from 'lucide-react';

const sources = [
  { name: 'Website', field: 'website', description: 'Crawl pages, docs and your help centre.', placeholder: 'https://yourcompany.com', icon: Globe2, color: 'mint' },
  { name: 'YouTube', field: 'youtube', description: 'Turn videos into searchable expertise.', placeholder: 'https://youtube.com/watch?v=...', icon: Youtube, color: 'peach' },
  { name: 'Text note', field: 'textData', description: 'Add FAQs, launch notes or private context.', placeholder: 'Paste a useful piece of context...', icon: FileText, color: 'sky' },
  { name: 'github', field: 'github', description: 'Train your agent on product docs, READMEs and code.', placeholder: 'https://github.com/user/repo', icon: Github, color: 'sky' },
] as const;

export default function DashBoardPage() {
  const { data } = useSession();
  const client = useQueryClient();
  const root = useRef<HTMLDivElement>(null);
  const [activeSource, setActiveSource] = useState<'pdf' | 'website' | 'youtube' | 'textData'>('website');

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dash-reveal",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: "power3.out" }
      );
      gsap.fromTo(
        ".dash-card",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          delay: 0.28,
          ease: "power2.out",
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);


  const createCollections = useMutation({
    mutationFn: async ({
      textData,
      type,
      collectionName,
    }: {
      textData: string;
      type: "web" | "text" | "yt" | "github";
      collectionName: string;
    }) => generateEmbeddings(textData, type, collectionName, "bot"),
    onSuccess: (result) => {
      toastSuccess(
        result
          ? "Knowledge source added successfully!"
          : "We could not add that source."
      );
      client.invalidateQueries({ queryKey: ["modelsinfo"] });
    },
  });

  async function submitSource(formData: FormData) {
    const values = [
      ["youtube", "yt"],
      ["website", "web"],
      ["textData", "text"],
      ["github", "github"],
    ] as const;
    const found = values.find(([field]) =>
      String(formData.get(field) || "").trim()
    );
    if (!found) return;
    const [field, type] = found;
    const value = String(formData.get(field)).trim();
    createCollections.mutate({
      textData: value,
      type,
      collectionName: `${data?.user?.name || "Nexora"
        }_${type}_collection${Date.now()}`,
    });
  }

  const current = sources.find(source => source.field === activeSource);
  return (
    <div ref={root} className="dashboard-shell">
      <section className="dash-hero">
        <div className="dash-reveal">

          <h1 className='text-[#17221d]! [text-shadow:_-3px_2px_1px_#0000004d]'>
            Hello
            {data?.user?.name ? ` , ${data.user.name.split(" ")[0]}` : ""}.<br />
            <em>What should it learn today?</em>
          </h1>
          <p>
            Give your Nexora the context it needs to have helpful, accurate
            conversations — then publish it anywhere.
          </p>
        </div>

      </section>

      <section className="dash-progress dash-reveal">
        <div className="progress-item complete">
          <span>
            <Check size={14} />
          </span>
          <div>
            <b>Create your workspace</b>
            <small>Ready to go</small>
          </div>
        </div>
        <div className="progress-line active" />
        <div className="progress-item active">
          <span>2</span>
          <div>
            <b>Give it knowledge</b>
            <small>In progress</small>
          </div>
        </div>
        <div className="progress-line" />
        <div className="progress-item">
          <span>3</span>
          <div>
            <b>Test & publish</b>
            <small>Up next</small>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="knowledge-area">
          <div className="dash-section-heading dash-reveal">
            <div>
              <span className="dash-kicker">KNOWLEDGE BASE</span>
              <h2>
                Feed your agent <em>the good stuff.</em>
              </h2>
            </div>

          </div>
          <div className="source-switcher dash-card">
            <button
              onClick={() => setActiveSource("pdf")}
              className={activeSource === "pdf" ? "selected" : ""}
            >
              <FileText size={16} /> PDF
            </button>
            {sources.map((source) => (
              <button
                key={source.field}
                onClick={() => setActiveSource(source.field)}
                className={activeSource === source.field ? "selected" : ""}
              >
                <source.icon size={16} />
                {source.name}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {activeSource === "pdf" ? (
              <motion.div
                key="pdf"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pdf-frame dash-card"
              >
                <PdfUploader mode="bot" />
              </motion.div>
            ) : (
              current && (
                <motion.form
                  key={current.field}
                  action={submitSource}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`source-form ${current.color} dash-card`}
                >
                  <div className="source-form-icon">
                    <current.icon size={23} />
                  </div>
                  <div>
                    <h3>Add from {current.name}</h3>
                    <p>{current.description}</p>
                  </div>
                  {current.field === "textData" ? (
                    <textarea
                      name="textData"
                      placeholder={current.placeholder}
                      rows={6}
                    />
                  ) : (
                    <input
                      name={current.field}
                      placeholder={current.placeholder}
                    />
                  )}
                  <button
                    disabled={createCollections.isPending}
                    className="dash-primary"
                  >
                    {createCollections.isPending ? (
                      <LoaderCircle className="spin" size={17} />
                    ) : (
                      <Plus size={17} />
                    )}{" "}
                    Add to knowledge
                  </button>
                </motion.form>
              )
            )}
          </AnimatePresence>
          {/* <div className="github-row dash-card">
          <Code2 size={19} />
          <div>
            <b>Bring a GitHub repository</b>
            <span>Train your agent on product docs, READMEs and code.</span>
          </div>
          <form action={submitSource}>
            <input name="github" placeholder="github.com/your-org/repo" />
            <button aria-label="Add GitHub source">
              <ArrowRight size={16} />
            </button>
          </form>
        </div> */}
        </div>

        <aside className="dash-sidebar">
          <div className="activity-card dash-card">
            <div className="side-head">
              <div>
                <span className="dash-kicker">AT A GLANCE</span>
                <h3>Today’s pulse</h3>
              </div>
              <span className="live-dot">LIVE</span>
            </div>
            <div className="mini-metrics">
              <div>
                <b>0</b>
                <span>Conversations</span>
              </div>
              <div>
                <b>—</b>
                <span>Avg. response</span>
              </div>
            </div>
            <div className="empty-activity">
              <MessageCircle size={19} />
              <p>Your agent is waiting for its first conversation.</p>
            </div>
            <Link href="/my-chatbot">
              View agents <ArrowRight size={15} />
            </Link>
          </div>

          <div className="publish-card dash-card">
            <span className="dash-kicker">WHEN YOU’RE READY</span>
            <h3>
              Put your agent
              <br />
              on your site.
            </h3>
            <p>One lightweight script. Every page covered.</p>
            <Link href="/scripts" className="dash-secondary">
              Generate script <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </section>
      {createCollections.isPending && (
        <div className="dash-saving">
          <LoaderCircle className="spin" size={18} />
          <span>Teaching your agent…</span>
        </div>
      )}
    </div>
  );

}
