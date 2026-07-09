"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getMySeller, acceptSellerAgreement, type MySellerStatus } from "@/app/actions/sellers";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

// ─── NDA document ─────────────────────────────────────────────────────────────
// Verbatim copy of the reviewed text in src/app/nda-sign/page.tsx — reused
// unmodified rather than redrafted.

function NdaDocument() {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  return (
    <div className="text-[13.5px] leading-relaxed text-muted space-y-5">
      <div className="text-center space-y-1 pb-4 border-b border-grid-300">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-2">Confidential</p>
        <h2 className="text-base font-bold text-foreground tracking-tight">Non-Disclosure Agreement</h2>
        <p className="text-xs text-muted-2 font-mono">Effective date: {today}</p>
      </div>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">Parties</h3>
        <p>
          <strong className="text-foreground">Disclosing Party:</strong> Andy&apos;K Group
          International LTD, company number 16453500, registered at 86&ndash;90 Paul Street,
          London, EC2A 4NE, United Kingdom (&ldquo;Andy&apos;K Group&rdquo;).
        </p>
        <p className="mt-2">
          <strong className="text-foreground">Receiving Party:</strong> The individual and/or
          organisation identified in the signature block below (&ldquo;Recipient&rdquo;).
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">Recitals</h3>
        <p>
          Andy&apos;K Group operates A.D.A.M. (AI-Powered Business Development Operating System)
          and may disclose certain Confidential Information to the Recipient in connection with a
          demonstration, evaluation, or potential commercial engagement. Both parties wish to protect
          that information on the terms set out in this Agreement.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">1. Confidential Information</h3>
        <p>
          &ldquo;Confidential Information&rdquo; means any non-public information disclosed by
          Andy&apos;K Group to the Recipient, whether disclosed orally, in writing, visually, or
          by any other means, including but not limited to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>System architecture, functionality, and demonstrations of A.D.A.M.</li>
          <li>Pricing, commercial terms, fee structures, and business models</li>
          <li>Business strategy, product roadmaps, and development plans</li>
          <li>Internal processes, workflows, operational systems, and methodologies</li>
          <li>Client data, client lists, prospect data, and engagement details</li>
          <li>Proprietary technology, source code, algorithms, and integrations</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">2. Obligations of the Recipient</h3>
        <p>The Recipient agrees to:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Keep all Confidential Information strictly confidential</li>
          <li>Not disclose Confidential Information to any third party without prior written consent from Andy&apos;K Group</li>
          <li>Use Confidential Information solely for the purpose of evaluating a potential engagement with Andy&apos;K Group</li>
          <li>Apply at least the same degree of care as it applies to its own confidential information (no less than reasonable care)</li>
          <li>Limit access to Confidential Information to its employees and advisers who have a need to know and who are bound by equivalent confidentiality obligations</li>
          <li>Promptly notify Andy&apos;K Group of any actual or suspected unauthorised disclosure</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">3. Exclusions</h3>
        <p>Obligations under this Agreement do not apply to information that:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Was already in the Recipient&apos;s possession and not subject to confidentiality restrictions prior to disclosure</li>
          <li>Is or becomes publicly available through no act or omission of the Recipient</li>
          <li>Is independently developed by the Recipient without reference to or use of the Confidential Information</li>
          <li>Is received from a third party who is not under any confidentiality obligation in respect of that information</li>
          <li>Must be disclosed pursuant to applicable law, regulation, or court order — provided the Recipient gives Andy&apos;K Group prompt prior written notice (where permitted) and cooperates with any application to limit disclosure</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">4. Term</h3>
        <p>
          This Agreement commences on the effective date above and remains in force for a period of{" "}
          <strong className="text-foreground">two (2) years</strong>. The obligations of
          confidentiality with respect to any Confidential Information disclosed during the term
          shall survive expiry.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">5. Return or Destruction of Information</h3>
        <p>
          Upon request by Andy&apos;K Group or upon termination of discussions between the parties,
          the Recipient shall promptly return or destroy all Confidential Information in its
          possession (including copies and extracts), and certify such destruction in writing if
          requested.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">6. No Licence or Commitment</h3>
        <p>
          Nothing in this Agreement grants the Recipient any right, licence, or interest in any
          intellectual property of Andy&apos;K Group. This Agreement does not obligate either party
          to enter into any further agreement, transaction, or business relationship.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">7. Remedies</h3>
        <p>
          The Recipient acknowledges that any breach of this Agreement may cause irreparable harm
          to Andy&apos;K Group for which monetary damages would be an inadequate remedy, and that
          Andy&apos;K Group shall be entitled to seek equitable relief (including injunction and
          specific performance) without the need to prove actual damages or post any bond.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">8. Governing Law &amp; Jurisdiction</h3>
        <p>
          This Agreement is governed by the laws of England and Wales. The parties irrevocably
          submit to the exclusive jurisdiction of the courts of England and Wales to resolve any
          dispute arising out of or in connection with this Agreement.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">9. Entire Agreement</h3>
        <p>
          This Agreement constitutes the entire agreement between the parties with respect to its
          subject matter and supersedes all prior discussions, representations, and agreements
          relating to confidentiality. Any amendment must be in writing and signed by both parties.
        </p>
      </section>
    </div>
  );
}

// ─── Seller Partner Agreement (full text, Andy-approved final version) ─────
//
// AGREEMENT_VERSION identifies which wording a seller accepted. There's no
// formal versioned/hashed storage of the accepted text yet (flagged to Andy
// as a nice-to-have — a `seller_agreement_version` text column on `sellers`
// would let us prove exactly which wording a given seller agreed to if this
// text changes later); for now this constant is the single source of truth
// for "what does seller_agreement_accepted_at actually refer to." Bump the
// version whenever the wording below changes.
//
// Section 12 ("Data Protection and GDPR") is the GDPR disclosure for this
// agreement — there is deliberately no separate Privacy Notice block.
const AGREEMENT_VERSION = "v1.0-2026-07-09";

function SellerPartnerAgreementDocument() {
  return (
    <div className="text-[13.5px] leading-relaxed text-muted space-y-5">
      <div className="text-center space-y-1 pb-4 border-b border-grid-300">
        <h2 className="text-base font-bold text-foreground tracking-tight">Seller Partner Agreement</h2>
        <p className="text-xs text-muted-2 font-mono">Andy&apos;K Group International LTD — A.D.A.M. Seller Partner Programme</p>
        <p className="text-[10px] text-muted-2 font-mono">Version: {AGREEMENT_VERSION}</p>
      </div>

      <section>
        <p>This Seller Partner Agreement (&ldquo;Agreement&rdquo;) is entered into between:</p>
        <p className="mt-3">
          <strong className="text-foreground">Andy&apos;K Group International LTD</strong><br />
          Company Number: 16453500<br />
          Registered Office: 86&ndash;90 Paul Street, London, EC2A 4NE, United Kingdom<br />
          Email: info@andykgroupinternational.com<br />
          referred to as &ldquo;Andy&apos;K Group&rdquo;, &ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;,
        </p>
        <p className="mt-3">and</p>
        <p className="mt-3">
          the individual or business registering as an approved seller, referral partner, business
          developer, consultant or commercial partner for A.D.A.M., referred to as &ldquo;Seller
          Partner&rdquo;, &ldquo;Partner&rdquo;, &ldquo;you&rdquo; or &ldquo;your&rdquo;.
        </p>
        <p className="mt-3">
          Together, Andy&apos;K Group and the Seller Partner are referred to as the &ldquo;Parties&rdquo;.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">1. Purpose of this Agreement</h3>
        <p>
          This Agreement defines the terms under which the Seller Partner may introduce, refer,
          promote and support sales opportunities for A.D.A.M., a B2B SaaS platform developed and
          operated by Andy&apos;K Group International LTD.
        </p>
        <p className="mt-2">
          A.D.A.M. is a business software solution designed to support structured business
          onboarding, client management, documentation, contracts, reporting, payment preparation,
          operational workflows and selected AI-supported business functions.
        </p>
        <p className="mt-2">
          The purpose of this Agreement is to create a clear, professional and controlled seller
          relationship. The Seller Partner may introduce potential business clients to A.D.A.M., but
          does not become an employee, director, legal representative, shareholder, official agent
          or authorised signatory of Andy&apos;K Group.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">2. Independent Partner Status</h3>
        <p>The Seller Partner acts as an independent commercial partner.</p>
        <p className="mt-2">
          Nothing in this Agreement creates an employment relationship, agency relationship, joint
          venture, franchise, partnership in the legal sense, or corporate representation between
          the Seller Partner and Andy&apos;K Group.
        </p>
        <p className="mt-2">
          The Seller Partner is responsible for their own taxes, business registrations, social
          security obligations, insurance, expenses, equipment and legal compliance in their own
          country.
        </p>
        <p className="mt-2">The Seller Partner has no authority to:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>sign contracts on behalf of Andy&apos;K Group;</li>
          <li>promise discounts, refunds or custom terms unless approved in writing;</li>
          <li>collect payments directly from clients on behalf of Andy&apos;K Group;</li>
          <li>represent themselves as an employee, director or officer of Andy&apos;K Group;</li>
          <li>make legal, tax, compliance, accounting or regulatory promises to clients;</li>
          <li>modify A.D.A.M. pricing, terms, deliverables, onboarding rules or service scope without written approval from Andy&apos;K Group.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">3. Scope of Seller Partner Activities</h3>
        <p>The Seller Partner may, after approval by Andy&apos;K Group:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>introduce potential B2B clients to A.D.A.M.;</li>
          <li>use an approved referral link or referral code;</li>
          <li>explain the general purpose of A.D.A.M.;</li>
          <li>share approved sales materials, presentations, pricing information and product descriptions;</li>
          <li>support initial discovery conversations;</li>
          <li>refer qualified businesses to the A.D.A.M. onboarding or demo process;</li>
          <li>help explain the value of A.D.A.M. to companies, consultants, agencies, service providers or organisations;</li>
          <li>provide market feedback to Andy&apos;K Group.</li>
        </ul>
        <p className="mt-3">
          The Seller Partner may not sell A.D.A.M. to consumers. A.D.A.M. is a B2B product intended
          for businesses, organisations, agencies, consultants and professional users.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">4. Approval and Access</h3>
        <p>Seller Partner access is not automatic.</p>
        <p className="mt-2">
          After registration, Andy&apos;K Group may review the Seller Partner application and may
          approve, reject, suspend or terminate access at its sole discretion.
        </p>
        <p className="mt-2">
          Andy&apos;K Group may request additional verification information before approving Seller
          Partner access, including but not limited to: full legal name; business name, if
          applicable; country of residence or business registration; business email; phone number;
          website or LinkedIn profile; tax or invoicing details where required; confirmation of legal
          capacity to enter into this Agreement.
        </p>
        <p className="mt-2">Seller Partner access may require completion of:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>this Seller Partner Agreement;</li>
          <li>a confidentiality/NDA confirmation;</li>
          <li>a data protection acknowledgement;</li>
          <li>internal onboarding steps;</li>
          <li>any additional compliance or business verification step requested by Andy&apos;K Group.</li>
        </ul>
        <p className="mt-3">
          Andy&apos;K Group reserves the right to refuse or withdraw Seller Partner access if the
          information provided is incomplete, false, misleading, unverifiable or inconsistent with
          the standards of Andy&apos;K Group.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">5. Referral Code and Tracking</h3>
        <p>Approved Seller Partners may receive a unique referral code or referral link.</p>
        <p className="mt-2">
          The referral code may be used to attribute leads, demo requests, qualified opportunities
          or paying clients to the Seller Partner.
        </p>
        <p className="mt-2">Referral attribution may be tracked through the A.D.A.M. platform, including but not limited to:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>referral code;</li>
          <li>referral link;</li>
          <li>lead metadata;</li>
          <li>questionnaire submission;</li>
          <li>client activation status;</li>
          <li>payment status;</li>
          <li>internal admin confirmation;</li>
          <li>manual verification by Andy&apos;K Group.</li>
        </ul>
        <p className="mt-3">
          A referral is only valid if it is properly recorded in the A.D.A.M. system or otherwise
          confirmed in writing by Andy&apos;K Group.
        </p>
        <p className="mt-2">
          Andy&apos;K Group has the final decision on whether a referral is valid, duplicate,
          qualified, payable or excluded.
        </p>
        <p className="mt-2">A referral may be rejected or excluded if:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>the client was already known to Andy&apos;K Group;</li>
          <li>the client already existed in the A.D.A.M. pipeline;</li>
          <li>the lead was generated through spam, misleading claims or unauthorised marketing;</li>
          <li>the client was referred by another approved partner first;</li>
          <li>the referral code was not used and no written attribution can be reasonably verified;</li>
          <li>the client does not complete onboarding or payment;</li>
          <li>the client fails business verification;</li>
          <li>the client is involved in prohibited, illegal, abusive, fraudulent or high-risk activity;</li>
          <li>Andy&apos;K Group decides not to activate the client.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">6. Commission Model</h3>
        <p>
          Unless otherwise agreed in writing, the standard Seller Partner commission is: 10% of the
          first successfully received client payment for A.D.A.M.
        </p>
        <p className="mt-2">
          The commission applies only to the first payment actually received by Andy&apos;K Group
          from a valid referred client.
        </p>
        <p className="mt-2">The commission does not automatically apply to:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>renewal payments; future subscription months; upgrades; add-ons;</li>
          <li>consulting services; custom development;</li>
          <li>refunds; chargebacks; failed payments; unpaid invoices;</li>
          <li>taxes; payment processing fees; discounts; credits; reversed transactions;</li>
          <li>clients who were not validly attributed to the Seller Partner.</li>
        </ul>
        <p className="mt-3">
          Andy&apos;K Group may offer different commission terms, promotional rates or custom
          arrangements in writing. Any custom commission must be confirmed in writing by
          Andy&apos;K Group to be valid.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">7. Commission Status and Payout</h3>
        <p>
          The A.D.A.M. platform may track commission status using labels such as: pending; approved;
          paid; cancelled; rejected; under review.
        </p>
        <p className="mt-2">A commission becomes eligible for approval only when:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>the referred client has been accepted by Andy&apos;K Group;</li>
          <li>the client has completed the required onboarding or verification process;</li>
          <li>the first payment has been successfully received;</li>
          <li>the payment is not under dispute, chargeback or refund review;</li>
          <li>the referral attribution is confirmed by Andy&apos;K Group.</li>
        </ul>
        <p className="mt-3">
          Commission payouts are not automatic. All Seller Partner payouts are handled manually by
          Andy&apos;K Group, for example via Revolut or another agreed payment method.
        </p>
        <p className="mt-2">
          The Seller Partner must provide correct payout and invoicing details if required.
          Andy&apos;K Group is not responsible for delayed payments caused by incorrect, incomplete
          or missing payout details.
        </p>
        <p className="mt-2">Andy&apos;K Group may delay or withhold a commission if:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>the client payment is refunded, reversed, disputed or charged back;</li>
          <li>the referral is suspected to be fraudulent, misleading or invalid;</li>
          <li>the Seller Partner breached this Agreement;</li>
          <li>required tax, invoice or payout information is missing;</li>
          <li>the client was acquired through prohibited conduct;</li>
          <li>the client has not passed business verification;</li>
          <li>legal or compliance review is required.</li>
        </ul>
        <p className="mt-3">
          If a commission has already been paid and the related client payment is later refunded,
          reversed or charged back, Andy&apos;K Group may deduct the amount from future commissions
          or request repayment where legally permitted.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">8. No Client Payment Collection by Seller Partner</h3>
        <p>The Seller Partner must not collect payments from clients on behalf of Andy&apos;K Group.</p>
        <p className="mt-2">
          All A.D.A.M. payments must be made directly to Andy&apos;K Group through approved payment
          channels, including but not limited to Revolut, invoice payment, bank transfer or other
          official payment methods provided by Andy&apos;K Group.
        </p>
        <p className="mt-2">
          The Seller Partner must not ask clients to pay into personal accounts, third-party
          accounts, crypto wallets or unofficial payment channels.
        </p>
        <p className="mt-2">Any violation of this clause may result in immediate termination and loss of unpaid commissions.</p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">9. Sales Conduct and Brand Standards</h3>
        <p>The Seller Partner agrees to represent A.D.A.M. professionally, honestly and accurately.</p>
        <p className="mt-2">The Seller Partner must not:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>make false, exaggerated or misleading claims;</li>
          <li>guarantee results that Andy&apos;K Group has not guaranteed in writing;</li>
          <li>claim that A.D.A.M. replaces legal, accounting, tax or compliance advice;</li>
          <li>claim that A.D.A.M. guarantees revenue, funding, contracts, clients or government approval;</li>
          <li>use spam, deceptive outreach, fake identities or misleading domains;</li>
          <li>use aggressive, discriminatory, abusive or unlawful sales methods;</li>
          <li>damage the reputation of Andy&apos;K Group, A.D.A.M., its clients or partners;</li>
          <li>copy, modify or publish internal materials without approval;</li>
          <li>use Andy&apos;K Group branding in a way that suggests employment, ownership or official representation beyond this Seller Partner relationship.</li>
        </ul>
        <p className="mt-3">
          Seller Partner communication must be clear that the Partner is introducing A.D.A.M. as an
          approved partner or referral partner, not acting as a director or employee of
          Andy&apos;K Group.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">10. Approved Materials</h3>
        <p>Andy&apos;K Group may provide approved sales materials, including:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>product descriptions; pricing information;</li>
          <li>demo links; presentation decks; FAQs;</li>
          <li>onboarding explanations; screenshots;</li>
          <li>email templates; LinkedIn text; brand assets.</li>
        </ul>
        <p className="mt-3">
          The Seller Partner may only use the latest approved version of these materials.
          Andy&apos;K Group may update, replace or withdraw materials at any time. The Seller
          Partner must stop using outdated or withdrawn materials when requested.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">11. Confidentiality</h3>
        <p>The Seller Partner may receive access to confidential information, including but not limited to:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>product roadmap; internal pricing strategy;</li>
          <li>client information; lead data;</li>
          <li>business processes; onboarding flows;</li>
          <li>internal documents; technical information; demo materials;</li>
          <li>commission data; sales strategy; AI workflows; operational processes;</li>
          <li>non-public information about Andy&apos;K Group or A.D.A.M.</li>
        </ul>
        <p className="mt-3">
          The Seller Partner agrees to keep all confidential information strictly confidential and
          not disclose it to any third party without written permission from Andy&apos;K Group.
        </p>
        <p className="mt-2">
          The Seller Partner may use confidential information only for the purpose of performing
          activities under this Agreement.
        </p>
        <p className="mt-2">This confidentiality obligation continues after termination of this Agreement.</p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">12. Data Protection and GDPR</h3>
        <p>
          The Seller Partner may receive or process personal data or business contact data in
          connection with referrals, leads or client introductions.
        </p>
        <p className="mt-2">
          The Seller Partner agrees to comply with all applicable data protection laws, including
          the UK GDPR, EU GDPR where applicable, and any local data protection laws relevant to the
          Seller Partner&apos;s activities.
        </p>
        <p className="mt-2">The Seller Partner must:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>process personal data lawfully, fairly and transparently;</li>
          <li>collect only data necessary for legitimate B2B referral purposes;</li>
          <li>not sell, misuse or disclose personal data;</li>
          <li>not upload unlawful, scraped, stolen or purchased contact lists unless legally permitted and approved;</li>
          <li>keep personal data secure;</li>
          <li>report suspected data breaches to Andy&apos;K Group immediately;</li>
          <li>delete or return personal data when requested;</li>
          <li>respect opt-outs and objections;</li>
          <li>use only approved systems or channels where required.</li>
        </ul>
        <p className="mt-3">
          The Seller Partner must not use A.D.A.M., Andy&apos;K Group materials or referral links
          for illegal spam, unlawful cold outreach, deceptive marketing or unauthorised mass
          messaging.
        </p>
        <p className="mt-2">Where required, additional data processing terms may be signed separately.</p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">13. Client Data and Access Restrictions</h3>
        <p>
          The Seller Partner has no automatic right to access client dashboards, client contracts,
          client files, payment details, KYC documents, questionnaires or confidential client
          materials.
        </p>
        <p className="mt-2">
          Any seller dashboard access is limited to the Seller Partner&apos;s own profile, own
          referral link, own referred leads and own commission status, unless Andy&apos;K Group
          explicitly grants additional access.
        </p>
        <p className="mt-2">
          The Seller Partner must not attempt to access, modify, extract, copy or interfere with any
          data outside their authorised access. Any unauthorised access attempt may result in
          immediate termination and legal action.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">14. NDA Requirement</h3>
        <p>Seller Partner access may be conditional upon signing or accepting an NDA or confidentiality confirmation.</p>
        <p className="mt-2">
          The NDA may be enforced through the A.D.A.M. system before dashboard, demo, internal
          material or seller resources are made available.
        </p>
        <p className="mt-2">Failure to complete the NDA or confidentiality step may result in refusal or suspension of access.</p>
        <p className="mt-2">
          The Seller Partner understands that A.D.A.M. contains non-public business, operational and
          technical workflows that must not be copied, disclosed or reused outside the approved
          relationship.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">15. Intellectual Property</h3>
        <p>
          All intellectual property rights in A.D.A.M., Andy&apos;K Group materials, documents,
          software, workflows, product names, branding, processes, templates, designs, text,
          dashboards, code, logic, AI prompts, onboarding materials and internal systems remain the
          exclusive property of Andy&apos;K Group International LTD or its licensors.
        </p>
        <p className="mt-2">
          The Seller Partner receives only a limited, revocable, non-exclusive, non-transferable
          permission to use approved materials for the purpose of promoting A.D.A.M. under this
          Agreement.
        </p>
        <p className="mt-2">The Seller Partner must not:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>copy A.D.A.M.; reverse engineer the platform; reproduce internal workflows;</li>
          <li>create a competing product using confidential materials;</li>
          <li>claim ownership over A.D.A.M. content or materials;</li>
          <li>register confusingly similar names, domains, trademarks or social media accounts;</li>
          <li>modify brand materials without written approval.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">16. Non-Circumvention</h3>
        <p>
          The Seller Partner must not use confidential information, client contacts, referral
          opportunities or internal business information obtained through Andy&apos;K Group to
          bypass, compete against, misappropriate or interfere with the business of Andy&apos;K
          Group.
        </p>
        <p className="mt-2">
          The Seller Partner must not secretly approach Andy&apos;K Group clients, leads, suppliers,
          contractors or partners for competing services using information obtained through this
          relationship.
        </p>
        <p className="mt-2">
          This clause does not prevent the Seller Partner from conducting their normal business
          independently, provided they do not misuse confidential information or client data
          obtained through Andy&apos;K Group.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">17. No Exclusivity</h3>
        <p>
          This Agreement is non-exclusive. Andy&apos;K Group may work with multiple Seller Partners,
          agencies, consultants, sales representatives, distributors or direct sales channels.
        </p>
        <p className="mt-2">
          The Seller Partner may operate other business activities, provided they do not conflict
          with this Agreement, misuse confidential information or damage Andy&apos;K Group.
        </p>
        <p className="mt-2">No territory, market, industry or client segment is exclusive unless agreed in writing.</p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">18. Prohibited Clients and Activities</h3>
        <p>Andy&apos;K Group may refuse any client, lead or referral at its sole discretion.</p>
        <p className="mt-2">
          A.D.A.M. may not be offered to businesses involved in illegal, fraudulent, abusive,
          harmful or high-risk activity.
        </p>
        <p className="mt-2">The Seller Partner must not knowingly refer clients involved in:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>fraud; scams; money laundering; terrorist financing;</li>
          <li>illegal weapons; illegal drugs;</li>
          <li>human exploitation; hate or extremist activity;</li>
          <li>illegal adult exploitation; stolen goods; identity theft; cybercrime;</li>
          <li>sanctions evasion; illegal surveillance; deceptive financial schemes;</li>
          <li>any activity that may damage Andy&apos;K Group legally, financially or reputationally.</li>
        </ul>
        <p className="mt-3">
          Andy&apos;K Group may request additional verification for any referred business and may
          reject activation without obligation to pay commission.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">19. Compliance With Laws</h3>
        <p>
          The Seller Partner is responsible for complying with all applicable laws in their country
          and in any market where they promote A.D.A.M. This includes but is not limited to laws
          related to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>advertising; commercial communication; electronic marketing;</li>
          <li>data protection; anti-spam;</li>
          <li>tax; invoicing;</li>
          <li>consumer protection where applicable;</li>
          <li>sanctions; anti-bribery; anti-corruption; fair competition.</li>
        </ul>
        <p className="mt-3">
          The Seller Partner must not offer or accept bribes, kickbacks, hidden payments or improper
          benefits in connection with A.D.A.M.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">20. Taxes and Invoicing</h3>
        <p>
          The Seller Partner is responsible for declaring and paying any taxes, social contributions,
          VAT, income tax, withholding tax or similar obligations related to commission payments.
        </p>
        <p className="mt-2">
          Andy&apos;K Group may request a valid invoice, tax statement, payout details or other
          documentation before paying a commission.
        </p>
        <p className="mt-2">
          If legally required, Andy&apos;K Group may withhold taxes or request additional
          information before processing payment.
        </p>
        <p className="mt-2">
          The Seller Partner confirms that they are responsible for understanding and complying with
          their local tax obligations.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">21. Term and Termination</h3>
        <p>
          This Agreement begins when the Seller Partner accepts it and is approved by Andy&apos;K
          Group, unless otherwise stated.
        </p>
        <p className="mt-2">Either Party may terminate this Agreement at any time by written notice.</p>
        <p className="mt-2">Andy&apos;K Group may suspend or terminate the Seller Partner immediately if:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>the Seller Partner breaches this Agreement;</li>
          <li>the Seller Partner makes false or misleading claims;</li>
          <li>the Seller Partner misuses client data;</li>
          <li>the Seller Partner violates confidentiality;</li>
          <li>the Seller Partner damages the reputation of Andy&apos;K Group;</li>
          <li>the Seller Partner attempts unauthorised access;</li>
          <li>the Seller Partner collects payments directly from clients;</li>
          <li>the Seller Partner engages in fraud, spam or illegal activity;</li>
          <li>continued cooperation creates legal, financial or reputational risk.</li>
        </ul>
        <p className="mt-3">After termination:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>the Seller Partner must stop using Andy&apos;K Group materials;</li>
          <li>the Seller Partner must stop presenting themselves as an approved Seller Partner;</li>
          <li>the Seller Partner must delete or return confidential information when requested;</li>
          <li>unpaid commissions may be reviewed and paid only if they were validly earned before termination and no breach occurred.</li>
        </ul>
        <p className="mt-3">Andy&apos;K Group may cancel unpaid commissions if the Seller Partner materially breached this Agreement.</p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">22. Limitation of Liability</h3>
        <p>
          To the maximum extent permitted by law, Andy&apos;K Group is not liable for indirect,
          incidental, consequential, special or punitive damages, including loss of profit, loss of
          business opportunity, loss of goodwill, loss of data or reputational harm.
        </p>
        <p className="mt-2">
          Andy&apos;K Group does not guarantee that the Seller Partner will earn commissions, obtain
          clients or generate income.
        </p>
        <p className="mt-2">The Seller Partner participates in the Seller Partner Programme at their own business risk.</p>
        <p className="mt-2">Nothing in this Agreement excludes liability where it cannot legally be excluded.</p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">23. No Guarantee of Product Availability</h3>
        <p>
          Andy&apos;K Group may modify, suspend, discontinue, rename, restructure or update A.D.A.M.,
          its pricing, features, plans, onboarding flow, seller programme, commission model or sales
          materials at any time.
        </p>
        <p className="mt-2">
          Andy&apos;K Group will make reasonable efforts to communicate material changes, but the
          Seller Partner has no guaranteed right to any specific product structure, commission
          programme or feature set.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">24. Public Statements and Marketing</h3>
        <p>
          The Seller Partner may not issue press releases, public announcements, paid ads, mass
          campaigns or official-looking statements using Andy&apos;K Group or A.D.A.M. branding
          without prior approval.
        </p>
        <p className="mt-2">
          The Seller Partner may create reasonable professional outreach messages using approved
          materials, provided such messages are accurate, lawful and not misleading.
        </p>
        <p className="mt-2">
          Andy&apos;K Group may request removal or correction of any public content that it
          considers inaccurate, outdated, misleading, unlawful or harmful to the brand.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">25. Conflict of Interest</h3>
        <p>
          The Seller Partner must disclose any conflict of interest that may affect the relationship
          with Andy&apos;K Group or referred clients.
        </p>
        <p className="mt-2">
          The Seller Partner must not present themselves as neutral or independent if they are
          receiving a commission and disclosure is required by law, platform rules or professional
          ethics.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">26. Records and Audit</h3>
        <p>Andy&apos;K Group may keep records of Seller Partner activity, including:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>registration details; agreement acceptance;</li>
          <li>referral codes; referred leads; commission status;</li>
          <li>communications; login and platform activity;</li>
          <li>compliance notes; admin decisions.</li>
        </ul>
        <p className="mt-3">
          Andy&apos;K Group may review Seller Partner activity to detect misuse, fraud, duplicate
          referrals, improper conduct, technical abuse or policy violations.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">27. Changes to this Agreement</h3>
        <p>Andy&apos;K Group may update this Agreement from time to time.</p>
        <p className="mt-2">
          Material changes may be communicated through the A.D.A.M. platform, by email or through
          another reasonable method.
        </p>
        <p className="mt-2">
          Continued use of the Seller Partner access, referral link or seller dashboard after changes
          take effect means the Seller Partner accepts the updated Agreement.
        </p>
        <p className="mt-2">
          If the Seller Partner does not agree with the updated terms, they must stop using the
          Seller Partner access and notify Andy&apos;K Group.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">28. Governing Law and Jurisdiction</h3>
        <p>This Agreement is governed by the laws of England and Wales.</p>
        <p className="mt-2">
          The courts of England and Wales shall have jurisdiction over disputes arising from or
          relating to this Agreement, unless mandatory law requires otherwise.
        </p>
        <p className="mt-2">
          Before starting legal proceedings, the Parties should first attempt to resolve disputes in
          good faith through written communication.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">29. Entire Agreement</h3>
        <p>
          This Agreement, together with any accepted NDA, Partner Agreement confirmation, data
          protection terms, approved commission terms and written addendum issued by Andy&apos;K
          Group, forms the entire agreement between the Parties regarding the Seller Partner
          Programme.
        </p>
        <p className="mt-2">
          It replaces any previous oral or written discussions about the Seller Partner
          relationship, unless expressly confirmed in writing by Andy&apos;K Group.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">30. Acceptance</h3>
        <p>
          By registering as a Seller Partner, accepting this Agreement electronically, signing it
          physically, clicking an acceptance checkbox or using a referral link provided by
          Andy&apos;K Group, the Seller Partner confirms that they:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>have read and understood this Agreement;</li>
          <li>agree to be bound by it;</li>
          <li>have legal capacity to enter into it;</li>
          <li>will act professionally and lawfully;</li>
          <li>will protect confidential information;</li>
          <li>will comply with data protection obligations;</li>
          <li>will not collect client payments directly;</li>
          <li>understand that commissions are tracked by A.D.A.M. but paid manually by Andy&apos;K Group;</li>
          <li>understand that Andy&apos;K Group may approve, reject, suspend or terminate Seller Partner access at its discretion.</li>
        </ul>
      </section>

      <section className="border-t border-grid-300 pt-5">
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-3">Signature / Electronic Acceptance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">For Andy&apos;K Group International LTD</p>
            <p className="text-xs">Name: Andrej Kneisl</p>
            <p className="text-xs">Role: Director</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Seller Partner</p>
            <p className="text-xs text-muted-2">
              Your full legal name, company (if applicable), country, email and electronic
              signature are captured in the form below and recorded against your account when you
              submit it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Signature canvas ─────────────────────────────────────────────────────────
// Page-local, matching the pattern used in src/app/nda-sign/page.tsx (that
// page also keeps its own copy rather than sharing one — this isn't a new
// duplication, just following the existing convention).

function SignatureCanvas({
  canvasRef,
  onHasSignature,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onHasSignature: (v: boolean) => void;
}) {
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#0E282D";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [canvasRef]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    onHasSignature(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onHasSignature(false);
  };

  return (
    <div>
      <div className="border border-grid-500 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={160}
          className="w-full cursor-crosshair touch-none block"
          style={{ height: "120px" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <button
        type="button"
        onClick={clear}
        className="mt-2 text-xs text-muted-2 hover:text-foreground underline underline-offset-2 transition-colors"
      >
        Clear signature
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SellerAgreementPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [seller, setSeller] = useState<MySellerStatus | null | undefined>(undefined);
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [hasSignature, setHasSignature] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    getMySeller().then((s) => {
      if (!s) {
        router.replace("/sign-in");
        return;
      }
      setSeller(s);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!hasSignature) {
      setError("Please draw your signature before submitting.");
      return;
    }
    if (!agreed) {
      setError("Please confirm you have read and agree to the Seller Partner Agreement.");
      return;
    }

    const signatureData = canvasRef.current?.toDataURL("image/png") ?? "";

    setLoading(true);
    const result = await acceptSellerAgreement({ company, jobTitle, signatureData, agreedToPartnerTerms: agreed });
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
    } else {
      setDone(true);
    }
  }

  if (seller === undefined) {
    return <LoadingSpinner className="min-h-screen" />;
  }
  if (!seller) {
    return null; // redirecting
  }

  const inputClass =
    "w-full h-11 px-3.5 border border-grid-500 bg-white text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors";

  return (
    <main className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 cartesian-grid opacity-30" />
        <div className="absolute inset-0 hero-gradient" />
      </div>

      <div className="relative z-10 max-w-[760px] mx-auto px-6 py-14 md:py-20">
        <div className="flex items-center gap-3 mb-10">
          <Image src="/adam-logo-simple-no-bg.png" alt="A.D.A.M." width={36} height={36} priority />
          <div>
            <p className="gradient-text font-bold tracking-tight text-lg leading-none">A.D.A.M.</p>
            <p className="text-[10px] font-mono text-muted-2 uppercase tracking-[0.15em] mt-0.5">
              Seller Partner Agreement
            </p>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
          Sign your Seller Partner Agreement
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-8 max-w-[560px]">
          One last step, {seller.full_name}. Please review and sign the Non-Disclosure Agreement
          and the Seller Partner Agreement below to activate your referral link.
        </p>

        {seller.status === "active" ? (
          <div className="rounded-xl border border-success/20 bg-success/8 px-6 py-5 text-sm text-success">
            You&apos;ve already completed this step — your seller partner account is active.
          </div>
        ) : seller.status === "suspended" ? (
          <div className="rounded-xl border border-error/20 bg-error/8 px-6 py-5 text-sm text-error">
            Your seller partner account is currently suspended. Please contact us for details.
          </div>
        ) : seller.status === "invited" ? (
          <div className="rounded-xl border border-warning/20 bg-warning/8 px-6 py-5 text-sm text-warning">
            Please finish setting up your account from your invitation email before signing this agreement.
          </div>
        ) : done ? (
          <div className="rounded-xl border border-success/20 bg-success/8 px-6 py-5 text-sm text-success">
            Thank you — your signature has been recorded and your seller partner account is now active.
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-grid-300 bg-white mb-6">
              <div className="px-6 py-4 border-b border-grid-300 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2">NDA Document</span>
                <span className="text-[10px] font-mono text-muted-2">Andy&apos;K Group International LTD</span>
              </div>
              <div className="px-6 py-5 max-h-[420px] overflow-y-auto overscroll-contain">
                <NdaDocument />
              </div>
            </div>

            <div className="rounded-xl border border-grid-300 bg-white mb-8">
              <div className="px-6 py-4 border-b border-grid-300 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2">Seller Partner Agreement</span>
                <span className="text-[10px] font-mono text-muted-2">Andy&apos;K Group International LTD</span>
              </div>
              <div className="px-6 py-5 max-h-[420px] overflow-y-auto overscroll-contain">
                <SellerPartnerAgreementDocument />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 border-2 transition-colors flex items-center justify-center ${
                      agreed
                        ? "border-highlight bg-highlight"
                        : "border-grid-500 bg-white group-hover:border-highlight/60"
                    }`}
                  >
                    {agreed && (
                      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-muted leading-relaxed">
                  I have read and understood the NDA and Seller Partner Agreement above. I agree to
                  their terms on behalf of myself and/or the organisation I represent.
                </span>
              </label>

              <div className="border-t border-grid-300" />

              <div>
                <h3 className="text-sm font-bold text-foreground mb-4">Signatory details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-[0.12em] text-muted-2 block">
                      Full Name
                    </label>
                    <input readOnly value={seller.full_name} className={`${inputClass} bg-grid-300/40 text-muted-2 cursor-default`} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-[0.12em] text-muted-2 block">
                      Email Address
                    </label>
                    <input readOnly value={seller.email} className={`${inputClass} bg-grid-300/40 text-muted-2 cursor-default`} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-[0.12em] text-muted-2 block">
                      Company <span className="text-highlight">*</span>
                    </label>
                    <input
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Ltd, or &quot;N/A&quot; if independent"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-[0.12em] text-muted-2 block">
                      Job Title <span className="text-highlight">*</span>
                    </label>
                    <input
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Seller Partner"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-grid-300" />

              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">Digital signature</h3>
                <p className="text-xs text-muted-2 mb-3">
                  Draw your signature in the box below using your mouse or finger.
                </p>
                <SignatureCanvas canvasRef={canvasRef} onHasSignature={setHasSignature} />
              </div>

              {error && (
                <div className="rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative inline-flex w-full items-center justify-center h-12 px-6 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">{loading ? "Submitting…" : "I agree and sign"}</span>
                </button>
                <p className="text-center text-xs text-muted-2 mt-3">
                  By clicking &ldquo;I agree and sign&rdquo;, you are entering into a legally
                  binding agreement with Andy&apos;K Group International LTD.
                </p>
              </div>
            </form>
          </>
        )}

        <div className="mt-12 pt-8 border-t border-grid-300 text-center">
          <p className="text-xs text-muted-2 font-mono">
            Andy&apos;K Group International LTD &middot; Reg: 16453500 &middot; 86&ndash;90 Paul Street, London, EC2A 4NE
          </p>
        </div>
      </div>
    </main>
  );
}
