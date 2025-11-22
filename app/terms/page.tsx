'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Terms and Conditions</h1>
          <p className="text-sm text-slate-400">
            Last updated: {new Date().getFullYear()}
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-slate-200">
          <p>
            These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the
            ProTrade platform (the &quot;Service&quot;). By creating an account or using the
            Service, you agree to be bound by these Terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">1. Use of the Service</h2>
          <p className="text-sm text-slate-200">
            You may use the Service only for lawful purposes and in accordance with these Terms.
            You are responsible for maintaining the confidentiality of your login credentials and
            for all activities that occur under your account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">2. Subscriptions and Billing</h2>
          <p className="text-sm text-slate-200">
            Access to certain features of the Service may require a paid subscription. Subscription
            terms, pricing, and billing cycles are presented at checkout. By subscribing, you
            authorize us and our payment provider to charge the applicable fees.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">3. Data and Content</h2>
          <p className="text-sm text-slate-200">
            The market data, reports, and analytics provided through the Service are for
            informational purposes only and do not constitute investment advice. You remain solely
            responsible for any decisions made using the information provided.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">4. Account Termination</h2>
          <p className="text-sm text-slate-200">
            We may suspend or terminate your access to the Service if you breach these Terms or use
            the Service in a way that could cause harm to the platform, other users, or third
            parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">5. Changes to the Service and Terms</h2>
          <p className="text-sm text-slate-200">
            We may update the Service and these Terms from time to time. If changes are material, we
            will provide reasonable notice. Your continued use of the Service after changes take
            effect constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">6. Contact</h2>
          <p className="text-sm text-slate-200">
            If you have any questions about these Terms, please contact us using the support
            channels provided in the application.
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

