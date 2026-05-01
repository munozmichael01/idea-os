-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('free', 'pro');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('owner', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('text', 'audio');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('market', 'competition', 'economics', 'gtm', 'founder_fit');

-- CreateEnum
CREATE TYPE "Criticality" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "HypothesisStatus" AS ENUM ('unvalidated', 'confirmed', 'invalidated');

-- CreateEnum
CREATE TYPE "ExperimentStatus" AS ENUM ('pending', 'in_progress', 'done');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('pdf', 'docx', 'audio');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'es',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "owner_id" UUID NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'free',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'viewer',
    "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("workspace_id","user_id")
);

-- CreateTable
CREATE TABLE "ideas" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sector" TEXT,
    "target_market" TEXT,
    "business_model" TEXT,
    "notes" TEXT,
    "composite_score" DOUBLE PRECISION,
    "confidence_score" DOUBLE PRECISION,
    "volatility_score" DOUBLE PRECISION,
    "status" "IdeaStatus" NOT NULL DEFAULT 'active',
    "input_type" "InputType" NOT NULL DEFAULT 'text',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyses" (
    "id" UUID NOT NULL,
    "idea_id" UUID NOT NULL,
    "agent_type" "AgentType" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "headline" TEXT NOT NULL,
    "strengths" TEXT[],
    "risks" TEXT[],
    "recommendation" TEXT NOT NULL,
    "hypotheses" TEXT[],
    "next_validation_action" TEXT NOT NULL,
    "web_search_used" BOOLEAN NOT NULL DEFAULT false,
    "model_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hypotheses" (
    "id" UUID NOT NULL,
    "idea_id" UUID NOT NULL,
    "agent_type" "AgentType" NOT NULL,
    "description" TEXT NOT NULL,
    "criticality" "Criticality" NOT NULL DEFAULT 'medium',
    "status" "HypothesisStatus" NOT NULL DEFAULT 'unvalidated',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hypotheses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" UUID NOT NULL,
    "idea_id" UUID NOT NULL,
    "hypothesis_id" UUID,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ExperimentStatus" NOT NULL DEFAULT 'pending',
    "result" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_inputs" (
    "id" UUID NOT NULL,
    "idea_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "storage_url" TEXT NOT NULL,
    "transcript" TEXT,
    "duration_seconds" DOUBLE PRECISION,
    "whisper_model" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audio_inputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exports" (
    "id" UUID NOT NULL,
    "idea_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "storage_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_history" (
    "id" UUID NOT NULL,
    "idea_id" UUID NOT NULL,
    "composite_score" DOUBLE PRECISION NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL,
    "volatility_score" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE INDEX "ideas_workspace_id_idx" ON "ideas"("workspace_id");

-- CreateIndex
CREATE INDEX "ideas_created_by_idx" ON "ideas"("created_by");

-- CreateIndex
CREATE INDEX "analyses_idea_id_idx" ON "analyses"("idea_id");

-- CreateIndex
CREATE INDEX "analyses_idea_id_agent_type_idx" ON "analyses"("idea_id", "agent_type");

-- CreateIndex
CREATE INDEX "hypotheses_idea_id_idx" ON "hypotheses"("idea_id");

-- CreateIndex
CREATE INDEX "experiments_idea_id_idx" ON "experiments"("idea_id");

-- CreateIndex
CREATE INDEX "experiments_hypothesis_id_idx" ON "experiments"("hypothesis_id");

-- CreateIndex
CREATE INDEX "audio_inputs_idea_id_idx" ON "audio_inputs"("idea_id");

-- CreateIndex
CREATE INDEX "exports_idea_id_idx" ON "exports"("idea_id");

-- CreateIndex
CREATE INDEX "ranking_history_idea_id_idx" ON "ranking_history"("idea_id");

-- CreateIndex
CREATE INDEX "ranking_history_snapshot_at_idx" ON "ranking_history"("snapshot_at");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hypotheses" ADD CONSTRAINT "hypotheses_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_hypothesis_id_fkey" FOREIGN KEY ("hypothesis_id") REFERENCES "hypotheses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_inputs" ADD CONSTRAINT "audio_inputs_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_inputs" ADD CONSTRAINT "audio_inputs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exports" ADD CONSTRAINT "exports_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exports" ADD CONSTRAINT "exports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_history" ADD CONSTRAINT "ranking_history_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

