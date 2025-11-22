'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-slate-400">
            Last updated: {new Date().getFullYear()}
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-slate-200">
          <p>
            This Privacy Policy explains how we collect, use, and protect your personal data when
            you use the ProTrade platform (the &quot;Service&quot;). We process your data in
            accordance with applicable data protection laws, including the GDPR where it applies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">1. Data We Collect</h2>
          <p className="text-sm text-slate-200">
            We collect information that you provide directly (such as your name, email address, and
            billing information) as well as technical data generated when you use the Service (such
            as device, browser, and usage information).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">2. How We Use Your Data</h2>
          <p className="text-sm text-slate-200">
            We use your data to provide and improve the Service, manage subscriptions and billing,
            communicate with you, and comply with legal obligations. We do not sell your personal
            data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">3. Legal Bases and Consent</h2>
          <p className="text-sm text-slate-200">
            Depending on the context, we process your data based on contract performance (providing
            the Service), legitimate interests (security, product improvement), and your consent
            (for example, when you agree to this policy during account creation).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">4. Data Sharing</h2>
          <p className="text-sm text-slate-200">
            We may share your data with service providers that help us operate the platform (such as
            hosting, analytics, and payment processors). These providers are bound by contractual
            obligations to protect your data and act only on our instructions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">5. Your Rights</h2>
          <p className="text-sm text-slate-200">
            Where applicable, you have rights to access, rectify, or erase your personal data, to
            restrict or object to certain processing, and to data portability. You can exercise
            these rights by contacting us through the support channels in the application.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">6. Data Retention</h2>
          <p className="text-sm text-slate-200">
            We retain your personal data for as long as necessary to provide the Service and meet
            legal or regulatory requirements. When data is no longer needed, we delete or anonymize
            it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">7. Contact</h2>
          <p className="text-sm text-slate-200">
            If you have questions about this Privacy Policy or how we handle your data, please
            contact us using the support information available in the platform.
          </p>
        </section>

        <footer className="pt-4 text-sm text-slate-400">
          <Link href="/" className="text-primary hover:underline">
            Back to dashboard
          </Link>
        </footer>
      </div>
    </div>
  );
}

