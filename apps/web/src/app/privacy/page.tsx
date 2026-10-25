import Link from "next/link";

const sections = [
  {
    title: "1. Personal Data We Collect",
    id: "personal-data",
    content: [
      {
        heading: "Personal Data You Provide",
        text: "When you create a ModelNow account or contact us, we may collect information such as your name, email address, account credentials, profile information, and other details you choose to provide."
      },
      {
        heading: "Account Information",
        text: "Account information may include your account identifier, contact details, preferences, subscription information, and transaction records where applicable."
      },
      {
        heading: "User Content",
        text: "Depending on the features you use, you may submit prompts, messages, documents, images, audio, video, code, and other files. These materials may be processed to provide requested AI features."
      },
      {
        heading: "Communication Information",
        text: "If you contact our support team or communicate with us through other channels, we may process your contact details and the contents of your messages."
      },
      {
        heading: "Log and Usage Data",
        text: "We may collect technical logs, browser information, device and operating-system details, timestamps, feature usage, error reports, and information needed to diagnose service issues."
      },
      {
        heading: "Device and Location Information",
        text: "We may process device identifiers and general location information derived from technical data where necessary for security, fraud prevention, or service operation. Precise location should only be processed if a feature requests it and you provide it."
      },
      {
        heading: "Cookies and Similar Technologies",
        text: "Cookies or similar technologies may be used to support authentication, maintain preferences, protect sessions, measure service performance, and provide essential functionality."
      },
      {
        heading: "Information from Other Sources",
        text: "Where permitted by law, we may receive information from service providers, security partners, or other sources to protect accounts, prevent fraud, and operate ModelNow."
      }
    ]
  },
  {
    title: "2. How We Use Personal Data",
    id: "data-use",
    content: [
      {
        heading: "Providing Our Services",
        text: "We use relevant information to operate ModelNow, answer requests, process uploads, run AI workflows, maintain accounts, and provide the features you choose."
      },
      {
        heading: "Improving Reliability",
        text: "Technical and usage information may be used to troubleshoot errors, measure performance, improve reliability, and develop new features."
      },
      {
        heading: "Personalization",
        text: "Where supported and permitted, we may use your settings and preferences to make your experience more relevant."
      },
      {
        heading: "Communication",
        text: "We may use contact information to respond to support requests, provide service announcements, and communicate important account or policy changes."
      },
      {
        heading: "Safety and Legal Compliance",
        text: "We may process information to detect abuse, prevent fraud, secure our systems, enforce applicable terms, and meet legal obligations."
      },
      {
        heading: "AI Model Improvement",
        text: "Whether user content is used to train or improve AI models depends on the models, providers, product configuration, and applicable settings. ModelNow must clearly disclose its actual practices and available opt-out controls before launch."
      }
    ]
  },
  {
    title: "3. Disclosure of Personal Data",
    id: "data-disclosure",
    content: [
      {
        heading: "Service Providers",
        text: "We may share necessary information with authorized hosting, storage, analytics, payment, security, communications, and technical providers that help operate ModelNow."
      },
      {
        heading: "AI Model Providers",
        text: "If a request is processed by an external AI provider, relevant prompts, files, or context may be sent to that provider. The applicable provider terms, retention practices, and data controls should be disclosed for each integration."
      },
      {
        heading: "Business Transfers",
        text: "Information may be transferred as part of a merger, acquisition, restructuring, financing, or sale of business assets, subject to applicable legal requirements."
      },
      {
        heading: "Legal and Safety Reasons",
        text: "We may disclose information when required by law or when reasonably necessary to investigate abuse, protect rights, maintain security, or prevent serious harm."
      },
      {
        heading: "User-Directed Sharing",
        text: "If you choose to share content, connect an external service, or use a feature that sends information to a third party, that sharing may be governed by the third party's own terms and privacy policy."
      }
    ]
  },
  {
    title: "4. Retention",
    id: "retention",
    content: [
      {
        heading: "Retention Periods",
        text: "We retain personal data only for as long as reasonably necessary for the purposes described in this policy, including providing services, maintaining security, resolving disputes, and meeting legal obligations."
      },
      {
        heading: "Account and Conversation Data",
        text: "Retention of account information, conversations, uploaded documents, generated outputs, and saved memories depends on the features used and the retention controls ModelNow provides."
      },
      {
        heading: "Deletion Requests",
        text: "Where supported, you may request deletion of your information. Certain records may need to be retained for legal, security, fraud-prevention, or accounting reasons."
      },
      {
        heading: "Backups and Provider Systems",
        text: "Deletion from active systems may not immediately remove information from every backup or third-party system. Actual deletion timelines must be disclosed according to ModelNow's implemented processes."
      }
    ]
  },
  {
    title: "5. Data Controls",
    id: "data-controls",
    content: [
      {
        heading: "Account Settings",
        text: "Where available, you can review and update account details, preferences, and security settings."
      },
      {
        heading: "Conversation and File Controls",
        text: "ModelNow should provide clear controls for viewing, deleting, exporting, or managing conversations and uploaded content wherever those capabilities are supported."
      },
      {
        heading: "Memory and Personalization",
        text: "If memory features are enabled, the product should explain what information may be remembered and provide controls to review or remove saved information."
      },
      {
        heading: "AI Training Preferences",
        text: "If ModelNow offers controls over the use of content for model improvement, those controls and their effects should be described clearly in the product."
      },
      {
        heading: "Cookies and Communications",
        text: "Where applicable, you may manage cookie preferences and opt out of non-essential marketing communications using the available controls."
      }
    ]
  },
  {
    title: "6. Your Rights",
    id: "rights",
    content: [
      {
        heading: "Access and Correction",
        text: "Depending on applicable law, you may have the right to access your personal data and request corrections to inaccurate information."
      },
      {
        heading: "Deletion and Restriction",
        text: "You may be entitled to request deletion of personal data or to restrict certain processing, subject to applicable legal exceptions."
      },
      {
        heading: "Data Portability",
        text: "Where required by law, you may request a copy of certain personal data in a commonly used or portable format."
      },
      {
        heading: "Consent and Objections",
        text: "Where processing relies on consent, you may be able to withdraw it. You may also have rights to object to or limit certain processing."
      },
      {
        heading: "Submitting a Request",
        text: "Contact ModelNow through its official support channel to exercise your rights. We may need to verify your identity before completing a request."
      }
    ]
  },
  {
    title: "7. Children",
    id: "children",
    content: [
      {
        heading: "Age Requirements",
        text: "ModelNow is not intended for individuals who are below the minimum age permitted by applicable law. Age restrictions may vary by jurisdiction and product."
      },
      {
        heading: "Information About Children",
        text: "We do not knowingly collect children's personal data in circumstances where collection is prohibited. If you believe a child has provided personal data inappropriately, contact our support team."
      },
      {
        heading: "Parental Consent",
        text: "Where required by law, parental or guardian consent must be obtained before a child can use a service that requires such consent."
      }
    ]
  },
  {
    title: "8. Security",
    id: "security",
    content: [
      {
        heading: "Protective Measures",
        text: "ModelNow should use appropriate technical and organizational safeguards to protect personal data against unauthorized access, loss, misuse, alteration, and disclosure."
      },
      {
        heading: "Account Security",
        text: "You should keep your login credentials confidential and promptly report suspected unauthorized access."
      },
      {
        heading: "Security Limitations",
        text: "No online service or method of transmission can guarantee absolute security. Security measures should be reviewed and improved as risks evolve."
      },
      {
        heading: "Security Incidents",
        text: "Where required by applicable law, affected users and relevant authorities will be notified of qualifying personal-data breaches."
      }
    ]
  },
  {
    title: "9. Additional U.S. State Disclosures",
    id: "us-disclosures",
    content: [
      {
        heading: "Categories of Information",
        text: "Depending on the service and applicable law, categories may include identifiers, account information, commercial information, online activity, user content, communications, and device or location data."
      },
      {
        heading: "Purposes and Recipients",
        text: "The purposes of processing and categories of recipients are described in the sections above. Additional disclosures may be required under particular U.S. state privacy laws."
      },
      {
        heading: "State Privacy Rights",
        text: "Eligible residents may have rights to know, access, correct, delete, or obtain a copy of personal data and to appeal certain decisions, subject to applicable law."
      },
      {
        heading: "Verification and Agents",
        text: "We may verify identity and authority before processing a privacy request. Authorized-agent requests may be accepted where required by applicable law."
      }
    ]
  },
  {
    title: "10. Changes to the Privacy Policy",
    id: "policy-changes",
    content: [
      {
        heading: "Updates",
        text: "We may update this Privacy Policy when ModelNow's features, operations, legal obligations, or data practices change."
      },
      {
        heading: "Notice of Changes",
        text: "The updated version will be published on this page with a revised date. Where required, we will provide additional notice or obtain consent."
      }
    ]
  },
  {
    title: "11. Data Controller",
    id: "controller",
    content: [
      {
        heading: "Responsible Entity",
        text: "The legal entity responsible for ModelNow's processing of personal data must be identified here, including its registered name and applicable business details."
      },
      {
        heading: "Scope of Responsibility",
        text: "For enterprise customers, the parties' responsibilities may depend on the service agreement and whether ModelNow or the customer determines the purposes and means of processing."
      }
    ]
  },
  {
    title: "12. How to Contact Us",
    id: "contact",
    content: [
      {
        heading: "Privacy Questions",
        text: "For questions, complaints, or requests concerning this Privacy Policy, contact ModelNow through its official support channel."
      },
      {
        heading: "Contact Details",
        text: "Before publishing this policy, add ModelNow's verified support email address, legal entity name, and any required privacy contact details."
      }
    ]
  },
  {
    title: "13. Useful Resources",
    id: "resources",
    content: [
      {
        heading: "Related Policies",
        text: "Please review the ModelNow Terms of Service, Cookie Policy, and other applicable product notices when they become available."
      },
      {
        heading: "External AI Providers",
        text: "If ModelNow connects to third-party AI models or other external services, review the applicable provider privacy documentation before submitting sensitive information."
      }
    ]
  }
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#202123]">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            ModelNow
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-black/15 px-4 py-2 text-sm transition hover:bg-gray-100"
          >
            Back to chat
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-10">
        <aside className="h-fit lg:sticky lg:top-24">
          <p className="mb-4 text-sm font-semibold">On this page</p>
          <nav className="space-y-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-lg px-3 py-2 text-sm leading-5 text-gray-600 transition hover:bg-gray-200/70 hover:text-black"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="min-w-0 rounded-2xl border border-black/10 bg-white px-6 py-8 md:px-12 md:py-12">
          <p className="mb-3 text-sm font-medium text-gray-500">
            ModelNow · Privacy &amp; Data Protection
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            Updated: October 12, 2026
          </p>

          <div className="my-8 rounded-xl border border-black/10 bg-[#f9f9fa] p-5">
            <p className="leading-7 text-gray-700">
              This Privacy Policy explains how ModelNow may collect, use,
              disclose, and retain personal data when you use our website,
              applications, and services. It should be read together with
              applicable product notices and service agreements.
            </p>
          </div>

          <p className="mb-10 leading-7 text-gray-700">
            The practices described here must match ModelNow's actual
            implementation, including its AI providers, storage systems,
            training settings, retention periods, and available privacy controls.
            Features that are not implemented should not be presented as available.
          </p>

          <div className="mb-10 border-b border-black/10 pb-8">
            <h2 className="mb-4 text-lg font-semibold">Contents</h2>
            <ol className="grid gap-3 sm:grid-cols-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-gray-600 underline-offset-4 hover:text-black hover:underline"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="mb-12 scroll-mt-28 border-b border-black/10 pb-10 last:border-b-0"
            >
              <h2 className="mb-6 text-2xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.content.map((item) => (
                  <div key={item.heading}>
                    <h3 className="mb-2 text-base font-semibold">
                      {item.heading}
                    </h3>
                    <p className="leading-7 text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="rounded-xl bg-[#f7f7f8] p-5 text-sm leading-6 text-gray-600">
            This is a draft policy for the ModelNow interface, not legal advice.
            Confirm all data practices and contact details with the responsible
            business before publishing.
          </div>

          <div className="mt-8 flex flex-wrap gap-5 text-sm text-gray-500">
            <Link href="/" className="hover:text-black">ModelNow Home</Link>
            <Link href="/terms" className="hover:text-black">Terms of Service</Link>
          </div>
        </article>
      </div>
    </main>
  );
}
