
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Zap,
} from "lucide-react";

const sections = [
  {
    id: "overview",
    title: "Overview",
    content:
      "Fast Mode is designed for AI workloads where response speed and low latency are important. It helps applications deliver responsive experiences when users interact with AI-powered features.",
  },
  {
    id: "how-it-works",
    title: "How Fast Mode works",
    content:
      "Fast Mode uses the supported inference configuration selected by your application. Availability and performance depend on the selected model, provider, and platform configuration.",
    bullets: [
      "Select a model that supports the required fast inference configuration.",
      "Configure the inference request using the supported parameters.",
      "Send requests through the ModelNow API.",
      "Measure response latency and output quality.",
    ],
  },
  {
    id: "use-cases",
    title: "Common use cases",
    content:
      "Fast Mode can be useful for applications that need responsive AI interactions.",
    bullets: [
      "Interactive AI chat applications",
      "Real-time assistance and support experiences",
      "Low-latency content generation",
      "Interactive application workflows",
      "High-frequency inference workloads",
    ],
  },
  {
    id: "best-practices",
    title: "Best practices",
    bullets: [
      "Measure end-to-end latency rather than only model response time.",
      "Test with realistic production prompts and input sizes.",
      "Set request timeouts appropriate to your application.",
      "Monitor errors, retries, and token usage.",
      "Compare response quality before changing production settings.",
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring and troubleshooting",
    bullets: [
      "Track request latency and response times.",
      "Monitor failed requests and provider errors.",
      "Review token consumption and request costs.",
      "Check model compatibility when Fast Mode is unavailable.",
      "Use application logs to investigate unexpected behavior.",
    ],
  },
];

type Section = (typeof sections)[number];

function FastModePage() {
  return (
    <>
      <style>{`
        .fm-page{min-height:100vh;background:#fff;color:#111827;padding:30px}
        .fm-container{max-width:1180px;margin:0 auto}
        .fm-back{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          width:38px;
          height:38px;
          color:#64748b;
          text-decoration:none;
          border-radius:9px;
          margin-bottom:25px;
          transition:background .2s ease,color .2s ease;
        }
        .fm-back:hover{color:#315fea;background:#f1f5ff}
        .fm-back:focus-visible{
          outline:2px solid #315fea;
          outline-offset:3px;
        }
        .fm-breadcrumb{display:flex;align-items:center;gap:9px;flex-wrap:wrap;color:#94a3b8;font-size:13px;margin-bottom:30px}
        .fm-breadcrumb a{color:#64748b;text-decoration:none}
        .fm-breadcrumb strong{color:#334155}
        .fm-hero{padding:32px;border:1px solid #e5e7eb;background:#f8fafc;border-radius:18px;margin-bottom:34px}
        .fm-icon{width:48px;height:48px;display:grid;place-items:center;background:#edf2ff;color:#315fea;border-radius:13px;margin-bottom:20px}
        .fm-eyebrow{font-size:12px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#315fea;margin-bottom:10px}
        .fm-hero h1{font-size:clamp(28px,4vw,38px);letter-spacing:-.035em;margin:0 0 12px;font-weight:750}
        .fm-hero p{max-width:740px;color:#64748b;line-height:1.8;font-size:16px;margin:0}
        .fm-grid{display:grid;grid-template-columns:minmax(0,1fr) 245px;gap:45px;align-items:start}
        .fm-article{min-width:0}
        .fm-section{scroll-margin-top:24px;margin-bottom:40px}
        .fm-section h2{font-size:21px;margin:0 0 15px;letter-spacing:-.02em}
        .fm-section p{font-size:15px;color:#64748b;line-height:1.85;margin:0 0 14px}
        .fm-list{display:grid;gap:13px;padding:0;margin:18px 0;list-style:none}
        .fm-list li{display:flex;gap:10px;align-items:flex-start;color:#475569;font-size:14px;line-height:1.7}
        .fm-list svg{flex-shrink:0;color:#16a34a;margin-top:2px}
        .fm-toc{position:sticky;top:24px;border:1px solid #e5e7eb;border-radius:13px;padding:19px}
        .fm-toc h3{font-size:14px;margin:0 0 14px;display:flex;align-items:center;gap:8px}
        .fm-toc a{display:block;padding:9px 10px;border-radius:7px;color:#64748b;text-decoration:none;font-size:13px;line-height:1.5}
        .fm-toc a:hover{background:#f1f5ff;color:#315fea}
        .fm-note{padding:18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;color:#475569;font-size:14px;line-height:1.7}
        .fm-note strong{display:block;color:#1e293b;margin-bottom:4px}
        .fm-pager{display:flex;justify-content:flex-end;margin-top:28px;padding-top:24px;border-top:1px solid #e5e7eb}
        .fm-next{display:flex;flex-direction:column;gap:8px;padding:15px 18px;border:1px solid #e2e8f0;border-radius:12px;color:#334155;text-decoration:none}
        .fm-next:hover{border-color:#315fea;background:#f8fafc}
        .fm-next span{font-size:12px;color:#94a3b8}
        .fm-next strong{display:flex;align-items:center;gap:9px;font-size:13px}
        @media(max-width:850px){
          .fm-grid{grid-template-columns:1fr}
          .fm-toc{position:static;grid-row:1}
          .fm-toc nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
        }
        @media(max-width:600px){
          .fm-page{padding:20px 15px}
          .fm-hero{padding:23px}
        }
        @media(prefers-reduced-motion:reduce){
          .fm-page *{scroll-behavior:auto!important;transition:none!important}
        }
      `}</style>

      <main className="fm-page">
        <div className="fm-container">

          {/* Back arrow only */}
          <Link
            href="/dashboard"
            className="fm-back"
            aria-label="Back to dashboard overview"
            title="Back to dashboard overview"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="fm-breadcrumb">
            <Link href="/dashboard">Dashboard</Link>
            <ChevronRight size={14} />
            <span>Documentation</span>
            <ChevronRight size={14} />
            <strong>Fast Mode</strong>
          </div>

          <header className="fm-hero">
            <div className="fm-icon">
              <Zap size={24} />
            </div>

            <div className="fm-eyebrow">AI Inference</div>

            <h1>Fast Mode</h1>

            <p>
              Learn how Fast Mode works, when to use it, and how to monitor
              inference performance in your ModelNow applications.
            </p>
          </header>

          <div className="fm-grid">
            <article className="fm-article">
              {sections.map((section: Section, index) => (
                <section
                  className="fm-section"
                  id={section.id}
                  key={section.id}
                >
                  <h2>
                    {String(index + 1).padStart(2, "0")} Â· {section.title}
                  </h2>

                  {"content" in section && section.content && (
                    <p>{section.content}</p>
                  )}

                  {"bullets" in section && section.bullets && (
                    <ul className="fm-list">
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

              <div className="fm-note">
                <strong>Implementation note</strong>
                Confirm model compatibility and provider-specific settings
                against the API documentation available in your deployment.
              </div>

              <nav
                className="fm-pager"
                aria-label="Documentation pagination"
              >
                <Link href="/docs/batch-api" className="fm-next">
                  <span>Next documentation</span>
                  <strong>
                    Batch API <ArrowRight size={16} />
                  </strong>
                </Link>
              </nav>
            </article>

            <aside className="fm-toc">
              <h3>
                <BookOpen size={16} />
                On this page
              </h3>

              <nav>
                {sections.map((section) => (
                  <a href={`#${section.id}`} key={section.id}>
                    {section.title}
                  </a>
                ))}
              </nav>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

export default FastModePage;

