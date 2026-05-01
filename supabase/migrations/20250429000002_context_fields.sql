-- Add context_answers JSONB to ideas (stores user answers to context agent questions)
ALTER TABLE "ideas" ADD COLUMN "context_answers" JSONB;

-- Add input_hash to analyses (used for selective re-analysis on idea update)
ALTER TABLE "analyses" ADD COLUMN "input_hash" TEXT;
