import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Markdown from "@/components/Markdown";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — Looksy",
  description:
    "How refunds and cancellations work for Looksy — currently free, with forward-looking terms for future paid credits and subscriptions.",
};

const REFUND = `_This is a template — have it reviewed by a professional before relying on it._

**Last updated:** 27 June 2026

This Refund & Cancellation Policy explains how refunds and cancellations work for Looksy ("Looksy", "we", "us", or "our"), the AI fashion app available at https://looksy-lemon.vercel.app. It forms part of, and should be read together with, our Terms of Service.

## 1. The App Is Currently Free

1.1. As of the "Last updated" date above, Looksy is offered **completely free of charge**. There are no subscriptions, credits, or paid plans, and we do not collect any payment from you to use the Service.

1.2. Because no payment is taken, **there is nothing to refund or cancel** in the current free version. If you no longer wish to use Looksy, you may simply stop using it or delete your account at any time, at no cost.

## 2. We Are Not the Seller of Shopped Products

2.1. Looksy shows AI-generated looks where each garment is linked to third-party retailers such as Myntra, Flipkart, Ajio, and Amazon. **Looksy is not the seller** of any product, does not process payments for any purchase, and does not handle shipping, returns, or warranties.

2.2. If you buy a product after clicking a link in Looksy, that purchase is made directly with the retailer. **Any refund, return, exchange, cancellation, or dispute for a purchased product is governed solely by that retailer's own policies** and must be raised with that retailer, not with Looksy. We have no ability to issue refunds for third-party purchases.

## 3. Forward-Looking Terms for Future Paid Features

The terms in this Section do **not** apply today (the app is free). They are published in advance so you know what to expect **if and when** we introduce paid features such as generation credits, premium "real-face" generation, or subscriptions. If we launch paid features, the specific terms, prices (in Indian Rupees, ₹), and any applicable taxes (including GST) will be shown to you at the point of purchase, and the version of this policy in effect at that time will govern.

### 3.1 Digital Goods / Credits

(a) Paid generation credits and AI-generated images are **digital goods delivered electronically and consumed immediately** upon use.

(b) Because of their nature, **credits are generally non-refundable once they have been used** (i.e., once a generation has been performed), except where a refund is required by applicable law or expressly stated otherwise.

(c) **Unused credits** that were purchased may be eligible for a refund within a stated window (for example, within 7 days of purchase) if none of the purchased credits have been used. This window and eligibility will be specified at purchase.

(d) Credits may have an expiry period. Expired credits are not refundable.

### 3.2 Subscriptions

(a) Paid subscriptions (if offered) renew automatically for the chosen billing period (for example, monthly or yearly) until cancelled.

(b) **Cancellation:** You may cancel a subscription at any time from your account settings (or by contacting us). Cancellation stops future renewals. Your paid access continues until the end of the current billing period; we do not provide pro-rated refunds for the unused portion of a billing period unless required by law.

(c) **Renewals:** We do not provide refunds for subscription renewals that you forgot to cancel before the renewal date, except where required by applicable law. We encourage you to cancel before your renewal date if you do not wish to continue.

(d) **Free trials (if offered):** If a paid plan includes a free trial, you will be charged when the trial ends unless you cancel before that date.

### 3.3 When We May Offer a Refund

Even though digital credits are generally non-refundable, we may, at our discretion or where required by law, offer a full or partial refund in cases such as: (a) you were **charged in error** or **charged twice** for the same item; (b) a **technical failure on our side** prevented a paid generation from completing **and** the corresponding credit was deducted (we will normally restore the credit or refund it); (c) the paid feature was **not delivered at all** due to a fault attributable to us; or (d) any case where a refund is mandated by applicable consumer-protection law.

We do **not** offer refunds for dissatisfaction with the artistic quality, accuracy, realism, or likeness of AI-generated images, as AI output is inherently variable and is provided on an "as is" basis (see our Terms of Service).

### 3.4 How to Request a Refund (Future Paid Features)

(a) To request a refund, email us at **[Insert contact email, e.g. support@looksy.app]** from the email address associated with your account, with your order/transaction reference and a brief description of the issue.

(b) We aim to acknowledge refund requests within **2 business days** and to resolve eligible requests within a reasonable period.

(c) Approved refunds will be processed to your **original payment method**. The time for the amount to reflect in your account depends on your bank or payment provider (typically 5–10 business days).

(d) Refunds will be made in **Indian Rupees (₹)**. We are not responsible for currency-conversion differences or bank charges applied by your payment provider.

## 4. Chargebacks and Abuse

We reserve the right to refuse refunds, suspend, or terminate accounts that abuse this policy (for example, by repeatedly requesting refunds after consuming credits, or by initiating fraudulent chargebacks). Filing a chargeback without first contacting us may result in suspension of your account.

## 5. Changes to This Policy

We may update this Refund & Cancellation Policy from time to time, particularly when paid features launch. The version in effect at the time of your purchase will apply to that purchase. Material changes will be reflected by an updated "Last updated" date and, where appropriate, in-app notice.

## 6. Contact

For any questions about this policy, refunds, or cancellations:

- **Email:** [Insert contact email, e.g. support@looksy.app]
- **Grievance Officer (as per the IT Act, 2000):** [Insert name and contact]

---

_This document is a template provided for convenience and does not constitute legal advice. Have it reviewed and adapted by a qualified legal professional before publishing or relying on it. Bracketed placeholders must be completed, and the terms must be aligned with your actual payment provider's rules (e.g. Razorpay/Stripe) and applicable Indian consumer-protection law before you charge anyone._`.replaceAll(
  "[Insert contact email, e.g. support@looksy.app]",
  CONTACT_EMAIL,
);

export default function RefundPage() {
  return (
    <PageShell kicker="Legal" title="Refund & Cancellation">
      <Markdown>{REFUND}</Markdown>
    </PageShell>
  );
}
