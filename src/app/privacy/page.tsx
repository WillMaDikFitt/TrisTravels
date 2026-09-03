import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalBulletList,
  LegalContactBlock,
  LegalSection,
  LegalShell,
} from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How TRIS Travels Meghalaya collects, uses, and protects your personal information.",
};

const toc = [
  { id: "commitment", label: "1. Our commitment" },
  { id: "collect", label: "2. Information we collect" },
  { id: "use", label: "3. How we use information" },
  { id: "payments", label: "4. Payments & booking data" },
  { id: "cookies", label: "5. Cookies" },
  { id: "control", label: "6. Controlling your information" },
  { id: "security", label: "7. Security" },
  { id: "contact", label: "8. Contact" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      subtitle="TRIS Travels Meghalaya"
      effective="Last updated September 2026"
      intro={
        <p>
          TRIS Travels Meghalaya is committed to ensuring that your privacy is protected. This
          policy explains what information we collect when you use our website, make an enquiry, or
          book a journey — and how we use it.
        </p>
      }
      notice={
        <p>
          Related:{" "}
          <Link href="/terms" className="font-semibold text-primary underline-offset-2 hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          ·{" "}
          <Link href="/refunds" className="font-semibold text-primary underline-offset-2 hover:underline">
            Cancellation &amp; Refunds
          </Link>
        </p>
      }
      toc={toc}
      relatedExcludeHref="/privacy"
      footerNote="TRIS Travels Meghalaya · Shillong, Meghalaya, India"
    >
      <LegalSection id="commitment" number="01" title="Our commitment">
        <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
          We only collect information that helps us deliver travel services, improve our website,
          and communicate with you about your trip or related offers. We will not sell, distribute,
          or lease your personal information to third parties unless we have your permission or are
          required by law to do so.
        </p>
      </LegalSection>

      <LegalSection id="collect" number="02" title="Information we collect">
        <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
          We may collect information such as:
        </p>
        <LegalBulletList
          items={[
            "Name and contact information (email, phone / WhatsApp)",
            "Demographic information such as postcode, preferences, interests, and other details relevant to customer surveys or offers",
            "Travel details needed for bookings — dates, guest counts, ages where relevant, stay preferences, transport needs, and special requests",
            "Account information if you sign in (for example via Firebase Authentication)",
            "Payment-related references processed through our payment partner (we do not store full card details on our servers)",
            "Messages you send through enquiry, craft-my-journey, partner, or contact forms",
          ]}
        />
      </LegalSection>

      <LegalSection id="use" number="03" title="How we use information">
        <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
          We require this information for the following reasons:
        </p>
        <LegalBulletList
          items={[
            "Internal record keeping and fulfilling bookings, enquiries, and customer support",
            "To understand your needs, improve our products and services, and provide you with a better experience",
            "To customise the website according to your interests",
            "We may periodically send promotional emails about new products, special offers, or other information which we think you may find interesting using the email address you have provided",
            "We may contact you using your email or phone number for market research purposes",
            "We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen",
          ]}
        />
      </LegalSection>

      <LegalSection id="payments" number="04" title="Payments & booking data">
        <LegalBulletList
          items={[
            "Online payments for eligible bookings are processed by Razorpay. Card and UPI details are handled by Razorpay under their own security and privacy standards.",
            "We retain booking records (guest details, dates, amounts, payment status) as needed to deliver the journey, issue confirmations, handle refunds, and meet accounting or legal requirements.",
            "Authentication and account features may use Firebase. Access is limited to what is needed to operate the site and Studio.",
          ]}
        />
      </LegalSection>

      <LegalSection id="cookies" number="05" title="Cookies">
        <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
          A cookie is a small file that asks permission to be placed on your computer&apos;s hard
          drive. Once you agree, the file is added and the cookie helps analyse web traffic or lets
          you know when you visit a particular site. Cookies allow web applications to respond to
          you as an individual. The web application can tailor its operations to your needs, likes,
          and dislikes by gathering and remembering information about your preferences.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
          We use traffic log cookies to identify which pages are being used. This helps us analyse
          data traffic and improve our website as per customer needs. A cookie will not give us
          access to your computer or any information about you, other than the data you choose to
          share with us. You can usually refuse or delete cookies through your browser settings.
        </p>
      </LegalSection>

      <LegalSection id="control" number="06" title="Controlling your personal information">
        <LegalBulletList
          items={[
            "We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so.",
            "If you believe that any information we are holding on you is incorrect or incomplete, please write to or email us at trissimai03@gmail.com. We will promptly correct any information found to be incorrect.",
            "You may also use our Contact page to request access, correction, or deletion of information we hold about you, subject to legal and operational requirements (for example, completed booking records).",
          ]}
        />
      </LegalSection>

      <LegalSection id="security" number="07" title="Security">
        <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
          We are committed to ensuring that your information is secure. In order to prevent
          unauthorised access or disclosure we have put in suitable measures, including hosting on
          secure platforms and restricting access to booking and customer data to people who need it
          to serve you.
        </p>
      </LegalSection>

      <LegalSection id="contact" number="08" title="Contact">
        <LegalContactBlock />
      </LegalSection>
    </LegalShell>
  );
}
