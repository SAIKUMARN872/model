import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Layers3,
} from "lucide-react";

const sections = [
  {
    id: "overview",
    title: "Overview",
    content:
      "The Batch API is designed for processing groups of requests asynchronously. Instead of waiting for each request to complete interactively, your application can submit work for background processing.",
  },
  {
    id: "workflow",
    title: "Batch processing workflow",
    content:
      "A typical batch workflow includes preparing input data, submitting the batch, monitoring its status, and retrieving the results.",
    bullets: [
      "Prepare and validate the input requests.",
      "Submit the batch using the supported API endpoint.",
      "Store the returned batch identifier.",
      "Monitor the batch processing status.",
      "Retrieve and validate completed results.",
    ],
  },
  {
    id: "use-cases",
    title: "Common use cases",
    bullets: [
      "Bulk content generation",
      "Large-scale classification and extraction",
      "Dataset enrichment",
      "Offline model evaluation",
      "Scheduled AI processing jobs",
    ],
  },
  {
    id: "error-handling",
    title: "Error handling",
    content:
      "Batch processing should account for partial failures. A completed batch does not necessarily mean every individual request succeeded.",
    bullets: [
      "Validate input records before submission.",
      "Track individual request identifiers.",
      "Separate successful and failed results.",
      "Retry only eligible failed requests.",
      "Record errors for investigation and auditing.",
    ],
  },
  {
    id: "best-practices",
    title: "Best practices",
    bullets: [
      "Choose batch sizes appropriate to your workload.",
      "Avoid accidental duplicate submissions.",
      "Implement status polling with appropriate intervals.",
      "Persist batch identifiers for recovery.",
      "Validate output before passing it to downstream systems.",
    ],
  },
];

type Section = (typeof sections)[number];

function BatchApiPage() {
  return (
    <>
      <style>{`
        .ba-page{min-height:100vh;background:#fff;color:#111827;padding:30px}
        .ba-container{max-width:1180px;margin:0 auto}
        .ba-back{display:inline-flex;align-items:center;gap:8px;color:#64748b;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:25px}
        .ba-back:hover{color:#315fea}
        .ba-breadcrumb{display:flex;align-items:center;gap:9px;flex-wrap:wrap;color:#94a3b8;font-size:13px;margin-bottom:30px}
        .ba-breadcrumb a{color:#64748b;text-decoration:none}
        .ba-breadcrumb strong{color:#334155}
        .ba-hero{padding:32px;border:1px solid #e5e7eb;background:#f8fafc;border-radius:18px;margin-bottom:34px}
        .ba-icon{width:48px;height:48px;display:grid;place-items:center;background:#edf2ff;color:#315fea;border-radius:13px;margin-bottom:20px}
        .ba-eyebrow{font-size:12px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#315fea;margin-bottom:10px}
        .ba-hero h1{font-size:clamp(28px,4vw,38px);letter-spacing:-.035em;margin:0 0 12px;font-weight:750}
        .ba-hero p{max-width:740px;color:#64748b;line-height:1.8;font-size:16px;margin:0}
        .ba-grid{display:grid;grid-template-columns:minmax(0,1fr) 245px;gap:45px;align-items:start}
        .ba-article{min-width:0}
        .ba-section{scroll-margin-top:24px;margin-bottom:40px}
        .ba-section h2{font-size:21px;margin:0 0 15px;letter-spacing:-.02em}
        .ba-section p{font-size:15px;color:#64748b;line-height:1.85;margin:0 0 14px}
        .ba-list{display:grid;gap:13px;padding:0;margin:18px 0;list-style:none}
        .ba-list li{display:flex;gap:10px;align-items:flex-start;color:#475569;font-size:14px;line-height:1.7}
        .ba-list svg{flex-shrink:0;color:#16a34a;margin-top:2px}
        .ba-toc{position:sticky;top:24px;border:1px solid #e5e7eb;border-radius:13px;padding:19px}
        .ba-toc h3{font-size:14px;margin:0 0 14px}
        .ba-toc a{display:block;padding:9px 10px;border-radius:7px;color:#64748b;text-decoration:none;font-size:13px;line-height:1.5}
        .ba-toc a:hover{background:#f1f5ff;color:#315fea}
        .ba-note{padding:18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;color:#475569;font-size:14px;line-height:1.7}
        .ba-note strong{display:block;color:#1e293b;margin-bottom:4px}
        .ba-pager{display:flex;justify-content:space-between;gap:15px;margin-top:28px;padding-top:24px;border-top:1px solid #e5e7eb}
        .ba-next{display:flex;flex-direction:column;gap:8px;padding:15px 18px;border:1px solid #e2e8f0;border-radius:12px;color:#334155;text-decoration:none}
        .ba-next:hover{border-color:#315fea;background:#f8fafc}
        .ba-next span{font-size:12px;color:#94a3b8}
        .ba-next strong{display:flex;align-items:center;gap:9px;font-size:13px}
        .ba-next-right{margin-left:auto;text-align:right}
        .ba-next-right strong{justify-content:flex-end}
        @media(max-width:850px){.ba-grid{grid-template-columns:1fr}.ba-toc{position:static;grid-row:1}.ba-toc nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:600px){.ba-page{padding:20px 15px}.ba-hero{padding:23px}.ba-pager{flex-direction:column}.ba-next-right{margin-left:0;text-align:left}.ba-next-right strong{justify-content:flex-start}}
      `}</style>

      <main className="ba-page">
        <div className="ba-container">
          <Link
            href="/dashboard"
            className="ba-back"
            aria-label="Back to dashboard overview"
            title="Back to dashboard overview"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="ba-breadcrumb">
            <Link href="/">Dashboard</Link>
            <ChevronRight size={14} />
            <span>Documentation</span>
            <ChevronRight size={14} />
            <strong>Batch API</strong>
          </div>

          <header className="ba-hero">
            <div className="ba-icon"><Layers3 size={24} /></div>
            <div className="ba-eyebrow">API Documentation</div>
            <h1>Batch API</h1>
            <p>
              Learn how to prepare, submit, monitor, and process batch
              requests for asynchronous AI workloads.
            </p>
          </header>

          <div className="ba-grid">
            <article className="ba-article">
              {sections.map((section: Section, index) => (
                <section className="ba-section" id={section.id} key={section.id}>
                  <h2>{String(index + 1).padStart(2, "0")} Â· {section.title}</h2>
                  {"content" in section && section.content && <p>{section.content}</p>}
                  {"bullets" in section && section.bullets && (
                    <ul className="ba-list">
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

              <div className="ba-note">
                <strong>API compatibility</strong>
                Confirm the available batch endpoints, payload format,
                request limits, and processing states against your deployed
                ModelNow API version.
              </div>

              <nav className="ba-pager" aria-label="Documentation pagination">
                <Link href="/docs/fast-mode" className="ba-next">
                  <span>Previous documentation</span>
                  <strong><ArrowLeft size={16} /> Fast Mode</strong>
                </Link>

                <Link href="/docs/prompt-caching" className="ba-next ba-next-right">
                  <span>Next documentation</span>
                  <strong>Prompt Caching <ArrowRight size={16} /></strong>
                </Link>
              </nav>
            </article>

            <aside className="ba-toc">
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

export default BatchApiPage;
