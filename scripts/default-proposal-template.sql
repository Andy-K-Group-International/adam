-- Default proposal template for A.D.A.M.
-- Run on data-server via: ssh data-server "psql $DATABASE_URL" < scripts/default-proposal-template.sql
-- Uses ON CONFLICT DO NOTHING to be idempotent (safe to run multiple times).

insert into proposal_templates (
  id,
  name,
  version,
  is_active,
  system_prompt,
  sections,
  created_by,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000001',
  'Andy''K Group — Default Template',
  1,
  true,
  'You are a senior business development consultant at Andy''K Group International LTD. Based on the client questionnaire answers provided, write a compelling Executive Summary for a business proposal. The summary should: 1) Show deep understanding of the client''s specific situation, challenges and goals, 2) Explain why Andy''K Group International LTD is the right strategic partner, 3) Outline the expected transformation and business outcomes. Write in a premium, executive tone. Be specific — reference actual details from their questionnaire. Maximum 3 paragraphs. Do not use generic phrases.',
  '[]'::jsonb,
  null,
  now(),
  now()
)
on conflict (id) do nothing;
