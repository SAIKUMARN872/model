import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Database,
} from "lucide-react";

const sections = [
  {
    id: "overview",
    title: "Overview",
    content:
      "Prompt caching is a technique for reusing eligible repeated prompt content across requests. It can reduce repeated processing and improve efficiency for applications that frequently send similar context.",
  },
  {
    id: "how-it-works",
    title: "How prompt caching works",
    content:
      "When requests contain eligible repeated content, supported model providers may reuse cached prompt information rather than processing all repeated content again.",
    bullets: [
      "An application sends a prompt containing reusable content.",
      "The provider evaluates whether the content qualifies for caching.",
      "Eligible repeated content may be served from cache.",
      "The provider reports cache-related usage where supported.",
    ],
  },
  {
    id: "use-cases",
    title: "Common use cases",
    bullets: [
      "AI assistants with long system instructions",
      "Applications using recurring reference material",
      "Document analysis workflows",
      "Repeated conversation context",
      "Applications using structured prompt templates",
    ],
  },
  {
    id: "optimization",
    title: "Prompt optimization",
    bullets: [
      "Keep reusable instructions consistent between requests.",
      "Organize repeated context in the appropriate prompt section.",
      "Avoid unnecessary changes to reusable content.",
      "Review the caching requirements of the selected provider.",
      "Test caching behavior using representative requests.",
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring and cost management",
    bullets: [
      "Track cached and uncached token usage where available.",
      "Compare token costs before and after caching.",
      "Monitor cache performance across workloads.",
      "Review provider-specific cache expiration behavior.",
      "Validate billing reports against provider pricing.",
    ],
  },
  {
    id: "limitations",
    title: "Limitations and considerations",
    bullets: [
      "Not every model or provider supports prompt caching.",
      "Caching eligibility can depend on prompt length and structure.",
      "Cache retention and expiration policies vary by provider.",
      "Cached tokens may have different pricing from regular input tokens.",
    ],
  },
];

type Section = (typeof sections)[number];

function PromptCachingPage() {
  return (
    <>
      <style>{`
        .pc-page{min-height:100vh;background:#fff;color:#111827;padding:30px}
        .pc-container{max-width:1180px;margin:0 auto}
        .pc-back{display:inline-flex;align-items:center;gap:8px;color:#64748b;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:25px}
        .pc-back:hover{color:#315fea}
        .pc-breadcrumb{display:flex;align-items:center;gap:9px;flex-wrap:wrap;color:#94a3b8;font-size:13px;margin-bottom:30px}
        .pc-breadcrumb a{color:#64748b;text-decoration:none}
        .pc-breadcrumb strong{color:#334155}
        .pc-hero{padding:32px;border:1px solid #e5e7eb;background:#f8fafc;border-radius:18px;margin-bottom:34px}
        .pc-icon{width:48px;height:48px;display:grid;place-items:center;background:#edf2ff;color:#315fea;border-radius:13px;margin-bottom:20px}
        .pc-eyebrow{font-size:12px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#315fea;margin-bottom:10px}
        .pc-hero h1{font-size:clamp(28px,4vw,38px);letter-spacing:-.035em;margin:0 0 12px;font-weight:750}
        .pc-hero p{max-width:740px;color:#64748b;line-height:1.8;font-size:16px;margin:0}
        .pc-grid{display:grid;grid-template-columns:minmax(0,1fr) 245px;gap:45px;align-items:start}
        .pc-article{min-width:0}
        .pc-section{scroll-margin-top:24px;margin-bottom:40px}
        .pc-section h2{font-size:21px;margin:0 0 15px;letter-spacing:-.02em}
        .pc-section p{font-size:15px;color:#64748b;line-height:1.85;margin:0 0 14px}
        .pc-list{display:grid;gap:13px;padding:0;margin:18px 0;list-style:none}
        .pc-list li{display:flex;gap:10px;align-items:flex-start;color:#475569;font-size:14px;line-height:1.7}
        .pc-list svg{flex-shrink:0;color:#16a34a;margin-top:2px}
        .pc-toc{position:sticky;top:24px;border:1px solid #e5e7eb;border-radius:13px;padding:19px}
        .pc-toc h3{font-size:14px;margin:0 0 14px}
        .pc-toc a{display:block;padding:9px 10px;border-radius:7px;color:#64748b;text-decoration:none;font-size:13px;line-height:1.5}
        .pc-toc a:hover{background:#f1f5ff;color:#315fea}
        .pc-note{padding:18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;color:#475569;font-size:14px;line-height:1.7}
        .pc-note strong{display:block;color:#1e293b;margin-bottom:4px}
        .pc-pager{display:flex;justify-content:flex-start;margin-top:28px;padding-top:24px;border-top:1px solid #e5e7eb}
        .pc-prev{display:flex;flex-direction:column;gap:8px;padding:15px 18px;border:1px solid #e2e8f0;border-radius:12px;color:#334155;text-decoration:none}
        .pc-prev:hover{border-color:#315fea;background:#f8fafc}
        .pc-prev span{font-size:12px;color:#94a3b8}
        .pc-prev strong{display:flex;align-items:center;gap:9px;font-size:13px}
        @media(max-width:850px){.pc-grid{grid-template-columns:1fr}.pc-toc{position:static;grid-row:1}.pc-toc nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:600px){.pc-page{padding:20px 15px}.pc-hero{padding:23px}}
      `}</style>

      <main className="pc-page">
        <div className="pc-container">
          <Link
            href="/dashboard"
            className="pc-back"
            aria-label="Back to dashboard overview"
            title="Back to dashboard overview"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="pc-breadcrumb">
            <Link href="/">Dashboard</Link>
            <ChevronRight size={14} />
            <span>Documentation</span>
            <ChevronRight size={14} />
            <strong>Prompt Caching</strong>
          </div>

          <header className="pc-hero">
            <div className="pc-icon"><Database size={24} /></div>
            <div className="pc-eyebrow">AI Optimization</div>
            <h1>Prompt Caching</h1>
            <p>
              Understand prompt caching, improve repeated-input efficiency,
              and monitor cache performance across supported models.
            </p>
          </header>

          <div className="pc-grid">
            <article className="pc-article">
              {sections.map((section: Section, index) => (
                <section className="pc-section" id={section.id} key={section.id}>
                  <h2>{String(index + 1).padStart(2, "0")} Â· {section.title}</h2>
                  {"content" in section && section.content && <p>{section.content}</p>}
                  {"bullets" in section && section.bullets && (
                    <ul className="pc-list">
                      {section.bullets.map((item) => (
                        <li key={item}>
                          <CheckCircle2 size={17} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              <div className="pc-note">
                <strong>Provider-specific behavior</strong>
                Cache eligibility, retention, token accounting, and pricing
                depend on the selected model provider. Verify these details
                before using caching in production.
              </div>

              <nav className="pc-pager" aria-label="Documentation pagination">
                <Link href="/docs/batch-api" className="pc-prev">
                  <span>Previous documentation</span>
                  <strong><ArrowLeft size={16} /> Batch API</strong>
                </Link>
              </nav>
            </article>

            <aside className="pc-toc">
              <h3><BookOpen size={16} /> On this page</h3>
              <nav>
                {sections.map((section) => (
                  <a href={`#${section.id}`} key={section.id}>{section.title}</a>
                ))}
              </nav>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

export default PromptCachingPage;
