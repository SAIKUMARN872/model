"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const sections = [
  {
    title: "1. Introduction",
    paragraphs: [
      "Welcome to ModelNow. These Terms of Use govern your access to and use of the ModelNow website, applications, AI-powered tools, APIs, and related services.",
      "By accessing or using ModelNow, you agree to these Terms. If you do not agree, do not use the Services.",
    ],
  },
  {
    title: "2. About ModelNow",
    paragraphs: [
      "ModelNow is an AI workspace for individuals and organizations. Depending on availability, the Services may include AI chat, model routing, browser automation, computer use, multimodal processing, knowledge retrieval, fine-tuning, and agent workflows.",
      "Features may change as the product evolves. Some features may be experimental, limited, or unavailable.",
    ],
  },
  {
    title: "3. Eligibility and Accounts",
    paragraphs: [
      "You must have the legal capacity required to enter into these Terms. If you use ModelNow on behalf of an organization, you represent that you are authorized to act for that organization.",
      "You are responsible for maintaining the confidentiality of your account credentials and for activity carried out through your account. Notify us if you suspect unauthorized access.",
    ],
  },
  {
    title: "4. Acceptable Use",
    paragraphs: [
      "You may use ModelNow only for lawful purposes and in accordance with these Terms and applicable laws.",
      "You must not use the Services to facilitate fraud, distribute malware, violate third-party rights, gain unauthorized access to systems, interfere with platform security, or disrupt the Services.",
      "You must not bypass access controls, abuse usage limits, or use the Services in ways that could harm other users or the platform.",
    ],
  },
  {
    title: "5. AI-Generated Content",
    paragraphs: [
      "ModelNow may use AI models and automated systems to generate responses, summaries, recommendations, code, classifications, and other outputs.",
      "AI-generated content may be inaccurate, incomplete, outdated, or misleading. You are responsible for reviewing outputs before relying on them.",
      "AI-generated content is not a substitute for professional legal, medical, financial, security, or other expert advice where such advice is required.",
    ],
  },
  {
    title: "6. Your Content",
    paragraphs: [
      "You may submit prompts, text, documents, images, audio, video, datasets, and other materials to ModelNow. You retain the rights you hold in the content you submit.",
      "You authorize ModelNow to process your content as reasonably necessary to provide, maintain, and secure the features you use, subject to the Privacy Policy and any separate agreement.",
      "You represent that you have the rights and permissions necessary to submit your content and authorize its processing.",
    ],
  },
  {
    title: "7. Files and Third-Party Services",
    paragraphs: [
      "Some features may allow you to upload files, connect third-party services, or permit AI agents to interact with websites, applications, and computer environments.",
      "You are responsible for reviewing the permissions you grant and checking actions that may affect your files, accounts, devices, or third-party services.",
      "Third-party services are governed by their own terms and policies. ModelNow does not control services it does not operate.",
    ],
  },
  {
    title: "8. Browser Automation and Computer Use",
    paragraphs: [
      "Automation features may interact with websites, forms, files, and applications on your behalf. Automated actions can have unintended consequences.",
      "Review actions where possible before submitting forms, sending messages, deleting files, making purchases, changing settings, or performing other consequential operations.",
      "You must not use automation to bypass security measures, access systems without permission, or perform unlawful activities.",
    ],
  },
  {
    title: "9. Intellectual Property",
    paragraphs: [
      "ModelNow branding, design, software, and platform materials are owned by or licensed to their respective rights holders and are protected by applicable laws.",
      "Except for rights expressly granted to you, these Terms do not transfer ownership of ModelNow intellectual property to you.",
      "You must not use ModelNow branding or proprietary materials in a misleading way or claim ownership of materials belonging to others.",
    ],
  },
  {
    title: "10. Feedback",
    paragraphs: [
      "If you provide suggestions, ideas, or feedback about ModelNow, you authorize us to use that feedback to improve the Services without an obligation to compensate you, to the extent permitted by law.",
      "Do not include confidential information in feedback unless you are authorized to share it and the relevant feature is designed to receive it.",
    ],
  },
  {
    title: "11. Plans, Fees, and Payments",
    paragraphs: [
      "ModelNow may offer free, paid, usage-based, or enterprise plans. Applicable pricing, usage limits, and included features will be disclosed when relevant.",
      "Paid features may be subject to additional billing, renewal, cancellation, tax, and refund conditions disclosed at the time of purchase.",
      "Test payments or demonstration pricing do not constitute a final commercial offer.",
    ],
  },
  {
    title: "12. Availability and Changes",
    paragraphs: [
      "We may add, modify, suspend, or discontinue features to maintain security, improve performance, comply with law, or develop the product.",
      "We do not guarantee uninterrupted availability, error-free operation, or compatibility with every device, model, integration, or third-party service.",
    ],
  },
  {
    title: "13. Privacy and Security",
    paragraphs: [
      "Your use of ModelNow is also subject to our Privacy Policy, which explains how personal information is handled.",
      "No online service can guarantee absolute security. Avoid submitting passwords, payment credentials, highly sensitive personal data, or confidential third-party information unless the service expressly supports that use.",
    ],
  },
  {
    title: "14. Suspension and Termination",
    paragraphs: [
      "We may restrict or suspend access when reasonably necessary to protect users, investigate suspected abuse, enforce these Terms, comply with law, or address security risks.",
      "You may stop using ModelNow at any time. Account closure, data retention, and surviving obligations are subject to applicable product terms and legal requirements.",
    ],
  },
  {
    title: "15. Disclaimers",
    paragraphs: [
      "To the extent permitted by law, ModelNow is provided on an “as is” and “as available” basis. We do not guarantee that the Services or their outputs will meet every requirement or produce specific results.",
      "Nothing in these Terms excludes a consumer right or legal protection that cannot lawfully be excluded.",
    ],
  },
  {
    title: "16. Limitation of Liability",
    paragraphs: [
      "To the extent permitted by applicable law, ModelNow and its operators will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, business, or goodwill arising from use of the Services.",
      "These Terms do not limit liability where such limitation is prohibited by law. Any final liability cap should be reviewed and completed before public launch.",
    ],
  },
  {
    title: "17. Indemnity",
    paragraphs: [
      "To the extent permitted by law, you may be responsible for claims, losses, or expenses arising from your unlawful use of ModelNow, violation of these Terms, or content you submit without the necessary rights.",
    ],
  },
  {
    title: "18. Updates to These Terms",
    paragraphs: [
      "We may update these Terms as the Services change. The updated version will be published on this page with a revised effective date.",
      "Where required by law, we will provide notice of material changes or obtain your consent.",
    ],
  },
  {
    title: "19. Governing Law and Disputes",
    paragraphs: [
      "The governing law, jurisdiction, and dispute-resolution process must be specified based on the legal entity operating ModelNow and applicable law. This section should be reviewed and completed before public launch.",
    ],
  },
  {
    title: "20. Contact",
    paragraphs: [
      "For questions about these Terms, contact the official ModelNow support or legal contact published on the platform.",
      "Before public launch, add a monitored business email address and the correct legal entity details.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <header className="flex h-16 items-center justify-between border-b border-gray-100 px-5 sm:px-10">
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          ModelNow
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link href="/research" className="hover:text-gray-500">
            Research
          </Link>
          <Link href="/products" className="hover:text-gray-500">
            Products
          </Link>
          <Link href="/business" className="hover:text-gray-500">
            Business
          </Link>
          <Link href="/developers" className="hover:text-gray-500">
            Developers
          </Link>
          <Link href="/company" className="hover:text-gray-500">
            Company
          </Link>
        </nav>

        <Link
          href="/login"
          className="rounded-full bg-gray-100 px-5 py-3 text-sm transition hover:bg-gray-200"
        >
          Log in
        </Link>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-[845px] px-5 pb-16 sm:px-8">
        {/* Language selector */}
        <div className="pt-24 sm:pt-28">
          <label htmlFor="terms-language" className="sr-only">
            Language
          </label>
          <select
            id="terms-language"
            defaultValue="en-US"
            className="h-[50px] w-full rounded-md border border-gray-300 bg-white px-4 text-base outline-none focus:border-black"
          >
            <option value="en-US">English (United States)</option>
          </select>
        </div>

        {/* Title */}
        <section className="pb-12 pt-20 text-center sm:pt-20">
          <p className="text-base">Published: 12 October 2026</p>

          <h1 className="mt-10 text-5xl font-normal tracking-tight sm:text-7xl">
            Terms of Use
          </h1>

          <p className="mt-20 text-base">
            Effective: 12 October 2026
          </p>

          <p className="mt-12 text-left text-lg">
            Thank you for using ModelNow!
          </p>

          <p className="mt-8 text-left text-lg leading-8">
            These Terms of Use apply to your use of ModelNow, including its
            website, AI-powered tools, applications, APIs, and related
            services (collectively, the “Services”). These Terms form an
            agreement between you and the legal entity operating ModelNow.
            By using the Services, you agree to these Terms.
          </p>
        </section>

        {/* Table of contents */}
        <nav className="mb-10 border-y border-gray-200 py-6">
          <h2 className="mb-4 text-lg font-semibold">Contents</h2>
          <ol className="grid gap-3 sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.title}>
                <a
                  href={`#section-${index + 1}`}
                  className="text-sm text-gray-600 underline-offset-4 hover:text-black hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Full terms text */}
        <article className="space-y-10 text-[17px] leading-[1.9] text-gray-800">
          {sections.map((section, index) => (
            <section
              key={section.title}
              id={`section-${index + 1}`}
              className="scroll-mt-8"
            >
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-black">
                {section.title}
              </h2>

              <div className="space-y-4">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </article>

        {/* Legal notice */}
        <div className="mt-14 border-t border-gray-200 pt-7 text-sm leading-7 text-gray-500">
          This is preliminary Terms of Use content, not legal advice. Before
          public launch, verify the operating legal entity, contact details,
          payment and refund terms, governing law, and other legal requirements
          with a qualified professional.
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 py-8 text-sm text-gray-500">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p>
              © {new Date().getFullYear()} ModelNow. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-6">
              <Link href="/privacy" className="hover:text-black">
                Privacy Policy
              </Link>

              <Link href="/" className="inline-flex items-center gap-1 hover:text-black">
                ModelNow <ArrowUpRight size={14} />
              </Link>

              <Link href="/" className="inline-flex items-center gap-1 hover:text-black">
                <ArrowLeft size={14} />
                Back to ModelNow
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}