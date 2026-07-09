-- Prevent duplicate commissions for the same referral. A single lead should
-- only ever produce one commission — client_id alone isn't unique enough
-- since a client could theoretically have multiple leads/referrals over
-- time (e.g. a renewal cycle), but the lead that actually converted should
-- only ever be commissioned once.
--
-- Partial index (WHERE lead_id IS NOT NULL) since lead_id is nullable —
-- multiple manually-created commissions with no lead attached (future admin
-- tooling, not built yet) must remain allowed.

create unique index commissions_lead_id_unique
  on commissions (lead_id)
  where lead_id is not null;
