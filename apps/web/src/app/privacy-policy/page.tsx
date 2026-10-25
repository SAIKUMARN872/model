
import Link from "next/link";

const sections = [
  {
    title: "1. Personal Data We Collect",
    text: "ModelNow may collect account details, contact information, prompts, uploaded files, images, audio, video, device information, and usage data, depending on the features you use.",
  },
  {
    title: "2. How We Use Personal Data",
    text: "We use personal data to provide and maintain ModelNow, respond to requests, improve our services, personalize features, prevent misuse, protect security, and meet legal obligations.",
  },
  {
    title: "3. Disclosure of Personal Data",
    text: "We may share necessary data with authorized hosting providers, technical service providers, payment processors, and other partners that help operate ModelNow. We may also disclose information when legally required or necessary to protect users and our services.",
  },
  {
    title: "4. Data Retention",
    text: "We retain personal data for as long as reasonably necessary to provide services, meet legitimate business needs, resolve disputes, and comply with legal requirements. Retention periods depend on the type of data and applicable settings.",
  },
  {
    title: "5. Data Controls",
    text: "Where supported, you may access, update, export, or delete account information and manage available privacy settings. Some controls may depend on the features currently available in ModelNow.",
  },
  {
    title: "6. Your Rights",
    text: "Depending on applicable law, you may have rights to access, correct, delete, restrict, or request a copy of your personal data. You may contact ModelNow support to submit a privacy request.",
  },
  {
    title: "7. Children",
    text: "ModelNow is not intended for children below the minimum age permitted by applicable law. Additional parental consent requirements may apply.",
  },
  {
    title: "8. Security",
    text: "We use reasonable technical and organizational safeguards designed to protect personal data. However, no internet-based service can guarantee absolute security.",
  },
  {
    title: "9. International Data Processing",
    text: "Data may be processed in locations where ModelNow or its service providers operate, subject to applicable data-protection requirements.",
  },
  {
    title: "10. Changes to This Policy",
    text: "We may update this Privacy Policy as ModelNow evolves. Changes will be reflected on this page along with the applicable revision date.",
  },
  {
    title: "11. Data Controller",
    text: "The identity and contact details of the entity responsible for ModelNow's data processing must be provided here before this policy is published.",
  },
  {
    title: "12. How to Contact Us",
    text: "For privacy questions or requests, contact ModelNow through its official support channel.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#202123]">
      <header className="border-b border-black/10 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            ModelNow
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-black/15 px-4 py-2 text-sm hover:bg-gray-100"
          >
            Back to chat
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-10 md:grid-cols-[220px_1fr]">
        <aside>
          <p className="mb-4 text-sm font-semibold">Privacy Policy</p>
          <nav className="space-y-3 text-sm text-gray-600">
            {sections.map((section, index) => (
              <a
                key={section.title}
                href={`#section-${index + 1}`}
                className="block hover:text-black"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="min-w-0 rounded-2xl border border-black/10 bg-white p-6 md:p-10">
          <p className="mb-3 text-sm text-gray-500">
            ModelNow · Privacy &amp; Data Protection
          </p>
          <h1 className="mb-3 text-3xl font-semibold">Privacy Policy</h1>
          <p className="mb-8 text-sm text-gray-500">
            Last updated: October 12, 2026
          </p>

          <p className="mb-8 leading-7 text-gray-700">
            This Privacy Policy describes how ModelNow may collect, use,
            retain, and disclose personal data when you use its website,
            applications, and services. The final published policy must reflect
            ModelNow's actual data practices and applicable laws.
          </p>

          {sections.map((section, index) => (
            <section
              key={section.title}
              id={`section-${index + 1}`}
              className="mb-8 scroll-mt-8"
            >
              <h2 className="mb-3 text-lg font-semibold">
                {section.title}
              </h2>
              <p className="leading-7 text-gray-700">{section.text}</p>
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
