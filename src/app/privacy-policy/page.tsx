import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";

const PAGE_URL = `${SITE_URL}/privacy-policy/`;
const LAST_UPDATED = "June 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for HVAC PT Charts. What we collect, how we use it, advertising via Raptive, your rights and choices.",
  alternates: { canonical: PAGE_URL },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        graph={[
          ORG,
          WEBSITE,
          {
            "@type": "WebPage",
            "@id": `${PAGE_URL}#webpage`,
            url: PAGE_URL,
            name: "Privacy Policy",
            isPartOf: { "@id": `${SITE_URL}/#website` },
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${PAGE_URL}#breadcrumb`,
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Privacy" },
            ],
          },
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Privacy</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-zinc-500">Last Updated: {LAST_UPDATED}</p>
        </header>

        <section className="prose prose-zinc max-w-none dark:prose-invert">
          <h2>Your Privacy Matters</h2>
          <p>
            At HVAC PT Charts, we are committed to protecting your privacy and being transparent about how we collect,
            use, and protect your information. This policy explains our practices in simple, clear terms.
          </p>

          <div className="not-prose mt-4 rounded-md border border-amber-200 bg-amber-50/50 p-4 text-sm dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="font-semibold">Advertising</p>
            <p className="mt-1">
              This Site is affiliated with CMI Marketing, Inc., d/b/a Raptive (&quot;Raptive&quot;) for the purposes of
              placing advertising on the Site, and Raptive will collect and use certain data for advertising purposes.
              To learn more about Raptive&apos;s data usage, click here:{" "}
              <a
                href="https://raptive.com/creator-advertising-privacy-statement/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline decoration-blue-400 underline-offset-2 hover:text-blue-900 hover:decoration-blue-700 dark:text-blue-300 dark:decoration-blue-500 dark:hover:text-blue-100"
              >
                https://raptive.com/creator-advertising-privacy-statement/
              </a>
            </p>
          </div>

          <h2>1. Information We Collect</h2>

          <h3>Information You Provide</h3>
          <p>We may collect information you voluntarily provide when you:</p>
          <ul>
            <li>Contact us through our contact forms or email</li>
            <li>Subscribe to newsletters or updates</li>
            <li>Participate in surveys or feedback requests</li>
            <li>Use interactive features of our calculators and tools</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>When you visit our website, we automatically collect certain information, including:</p>
          <ul>
            <li>IP address and general location information</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent on our site</li>
            <li>Referring website or search terms used</li>
            <li>Device information (mobile, tablet, desktop)</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li><strong>Provide Services:</strong> To operate and improve our calculators, charts, and educational content</li>
            <li><strong>User Experience:</strong> To understand how visitors use our site and improve functionality</li>
            <li><strong>Communication:</strong> To respond to your inquiries and provide customer support</li>
            <li><strong>Content Improvement:</strong> To analyze which tools and guides are most valuable to users</li>
            <li><strong>Technical Maintenance:</strong> To ensure website security and optimal performance</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
          </ul>

          <h2>3. Cookies and Tracking Technologies</h2>

          <h3>What Are Cookies?</h3>
          <p>
            Cookies are small text files stored on your device that help us provide a better user experience. We use
            different types of cookies:
          </p>

          <h3>Essential Cookies</h3>
          <ul>
            <li>Required for basic website functionality</li>
            <li>Remember your preferences during your visit</li>
            <li>Enable interactive calculator features</li>
          </ul>

          <h3>Analytics Cookies</h3>
          <ul>
            <li>Help us understand how visitors use our site</li>
            <li>Provide insights to improve our content and tools</li>
            <li>Track performance of our educational resources</li>
          </ul>

          <h3>Managing Cookies</h3>
          <p>
            You can control cookies through your browser settings. However, disabling certain cookies may limit your
            ability to use some features of our website.
          </p>

          <h2>4. Third-Party Services</h2>

          <h3>Analytics Services</h3>
          <p>
            We use Google Analytics 4 (GA4), provided by Google LLC, to understand aggregate website usage patterns
            (which pages get traffic, which calculators get used, where visitors come from). GA4 sets cookies and may
            collect information about your interaction with our site and other sites that use Google services. By default,
            GA4 does not log or store full IP addresses — IP data is used to derive approximate geographic location, then
            discarded.
          </p>
          <p>
            For details on how Google handles this data, see{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline decoration-blue-400 underline-offset-2 hover:text-blue-900 hover:decoration-blue-700 dark:text-blue-300 dark:decoration-blue-500 dark:hover:text-blue-100"
            >
              Google&apos;s Privacy Policy
            </a>
            . You can opt out of GA tracking across all sites by installing the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline decoration-blue-400 underline-offset-2 hover:text-blue-900 hover:decoration-blue-700 dark:text-blue-300 dark:decoration-blue-500 dark:hover:text-blue-100"
            >
              Google Analytics opt-out browser add-on
            </a>
            , or by blocking analytics cookies through your browser settings.
          </p>

          <h3>Content Delivery</h3>
          <p>
            We may use content delivery networks (CDNs) to ensure fast loading of our calculators and charts. These
            services may collect basic technical information about your visit.
          </p>

          <h3>Social Media</h3>
          <p>
            Our website may include social media sharing buttons. These features may collect information about your
            visit and are governed by the privacy policies of the respective social media platforms.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your information against
            unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul>
            <li>Secure hosting infrastructure</li>
            <li>Regular security updates and monitoring</li>
            <li>Encrypted data transmission (HTTPS)</li>
            <li>Access controls and authentication</li>
            <li>Regular security assessments</li>
          </ul>
          <p>
            However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot
            guarantee absolute security.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We retain information only as long as necessary to fulfill the purposes outlined in this privacy policy,
            unless a longer retention period is required or permitted by law. Factors that influence our retention
            periods include:
          </p>
          <ul>
            <li>The nature and sensitivity of the information</li>
            <li>Legal and regulatory requirements</li>
            <li>Our legitimate business interests</li>
            <li>Your preferences and consent</li>
          </ul>

          <h2>7. Your Rights and Choices</h2>

          <h3>Access and Correction</h3>
          <p>
            You have the right to access and correct personal information we hold about you. Contact us if you need to
            update your information.
          </p>

          <h3>Data Portability</h3>
          <p>
            Where applicable, you have the right to receive your personal data in a structured, commonly used format.
          </p>

          <h3>Deletion</h3>
          <p>
            You may request deletion of your personal information, subject to legal and operational requirements.
          </p>

          <h3>Opt-Out</h3>
          <p>
            You can opt out of non-essential data collection and marketing communications at any time.
          </p>

          <h2>8. Children&apos;s Privacy</h2>
          <p>
            Our website is designed for HVAC professionals and is not intended for children under 13. We do not
            knowingly collect personal information from children under 13. If we become aware that we have collected
            personal information from a child under 13, we will take steps to delete such information.
          </p>

          <h2>9. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. We
            ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
          </p>

          <h2>10. Changes to This Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time to reflect changes in our practices or applicable laws.
            We will notify you of any material changes by:
          </p>
          <ul>
            <li>Posting the updated policy on our website</li>
            <li>Updating the &quot;Last Updated&quot; date</li>
            <li>Providing notice through our website or other appropriate means</li>
          </ul>
          <p>
            Your continued use of our website after any changes indicates your acceptance of the updated privacy policy.
          </p>

          <h2>11. Legal Basis for Processing</h2>
          <p>We process your personal information based on the following legal grounds:</p>
          <ul>
            <li><strong>Legitimate Interest:</strong> To provide and improve our services</li>
            <li><strong>Consent:</strong> When you voluntarily provide information or agree to cookies</li>
            <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
            <li><strong>Performance of Contract:</strong> To provide requested services or information</li>
          </ul>

          <h2>Contact Us About Privacy</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:privacy@hvacptcharts.com">privacy@hvacptcharts.com</a></li>
            <li><strong>Website:</strong> <Link href="/contact-us/">hvacptcharts.com/contact-us/</Link></li>
            <li><strong>Response Time:</strong> We will respond to privacy-related inquiries within 30 days.</li>
          </ul>
        </section>
      </article>
    </>
  );
}
