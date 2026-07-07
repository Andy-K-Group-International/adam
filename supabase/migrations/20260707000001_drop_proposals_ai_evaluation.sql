-- proposals.ai_evaluation was never wired to any AI pipeline.
-- The column has been null on every row since the table was created.
-- questionnaires.ai_evaluation is separate and is NOT affected by this migration.

ALTER TABLE public.proposals DROP COLUMN ai_evaluation;
