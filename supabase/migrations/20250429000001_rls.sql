-- ─── Enable RLS on all tables ─────────────────────────────────────────────────

ALTER TABLE "users"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspaces"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ideas"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "analyses"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hypotheses"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "experiments"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audio_inputs"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exports"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ranking_history"   ENABLE ROW LEVEL SECURITY;

-- ─── Helper: is the current user a member of a workspace? ─────────────────────

CREATE OR REPLACE FUNCTION is_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = p_workspace_id
      AND user_id = auth.uid()
  )
$$;

-- ─── Helper: is the current user an editor or owner of a workspace? ───────────

CREATE OR REPLACE FUNCTION is_workspace_editor(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = p_workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
  )
$$;

-- ─── Helper: is the current user the owner of a workspace? ───────────────────

CREATE OR REPLACE FUNCTION is_workspace_owner(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = p_workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
  )
$$;

-- ─── users ────────────────────────────────────────────────────────────────────

CREATE POLICY "users: read own row"
  ON "users" FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users: update own row"
  ON "users" FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─── workspaces ───────────────────────────────────────────────────────────────

CREATE POLICY "workspaces: members can read"
  ON "workspaces" FOR SELECT
  USING (is_workspace_member(id));

CREATE POLICY "workspaces: authenticated can insert"
  ON "workspaces" FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "workspaces: owner can update"
  ON "workspaces" FOR UPDATE
  USING (is_workspace_owner(id))
  WITH CHECK (is_workspace_owner(id));

CREATE POLICY "workspaces: owner can delete"
  ON "workspaces" FOR DELETE
  USING (is_workspace_owner(id));

-- ─── workspace_members ────────────────────────────────────────────────────────

CREATE POLICY "workspace_members: members can read"
  ON "workspace_members" FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_members: owner can insert"
  ON "workspace_members" FOR INSERT
  WITH CHECK (is_workspace_owner(workspace_id));

CREATE POLICY "workspace_members: owner can update"
  ON "workspace_members" FOR UPDATE
  USING (is_workspace_owner(workspace_id))
  WITH CHECK (is_workspace_owner(workspace_id));

CREATE POLICY "workspace_members: owner can delete"
  ON "workspace_members" FOR DELETE
  USING (is_workspace_owner(workspace_id));

-- ─── ideas ────────────────────────────────────────────────────────────────────

CREATE POLICY "ideas: members can read"
  ON "ideas" FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "ideas: editors can insert"
  ON "ideas" FOR INSERT
  WITH CHECK (is_workspace_editor(workspace_id));

CREATE POLICY "ideas: editors can update"
  ON "ideas" FOR UPDATE
  USING (is_workspace_editor(workspace_id))
  WITH CHECK (is_workspace_editor(workspace_id));

CREATE POLICY "ideas: owners can delete"
  ON "ideas" FOR DELETE
  USING (is_workspace_owner(workspace_id));

-- ─── analyses ────────────────────────────────────────────────────────────────

CREATE POLICY "analyses: members can read"
  ON "analyses" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = analyses.idea_id
        AND is_workspace_member(ideas.workspace_id)
    )
  );

-- Insert/update/delete handled by service role only (no user-facing policy)

-- ─── hypotheses ───────────────────────────────────────────────────────────────

CREATE POLICY "hypotheses: members can read"
  ON "hypotheses" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = hypotheses.idea_id
        AND is_workspace_member(ideas.workspace_id)
    )
  );

CREATE POLICY "hypotheses: editors can insert"
  ON "hypotheses" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = hypotheses.idea_id
        AND is_workspace_editor(ideas.workspace_id)
    )
  );

CREATE POLICY "hypotheses: editors can update"
  ON "hypotheses" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = hypotheses.idea_id
        AND is_workspace_editor(ideas.workspace_id)
    )
  );

CREATE POLICY "hypotheses: editors can delete"
  ON "hypotheses" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = hypotheses.idea_id
        AND is_workspace_editor(ideas.workspace_id)
    )
  );

-- ─── experiments ──────────────────────────────────────────────────────────────

CREATE POLICY "experiments: members can read"
  ON "experiments" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = experiments.idea_id
        AND is_workspace_member(ideas.workspace_id)
    )
  );

CREATE POLICY "experiments: editors can insert"
  ON "experiments" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = experiments.idea_id
        AND is_workspace_editor(ideas.workspace_id)
    )
  );

CREATE POLICY "experiments: editors can update"
  ON "experiments" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = experiments.idea_id
        AND is_workspace_editor(ideas.workspace_id)
    )
  );

CREATE POLICY "experiments: editors can delete"
  ON "experiments" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = experiments.idea_id
        AND is_workspace_editor(ideas.workspace_id)
    )
  );

-- ─── audio_inputs ─────────────────────────────────────────────────────────────

CREATE POLICY "audio_inputs: members can read"
  ON "audio_inputs" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = audio_inputs.idea_id
        AND is_workspace_member(ideas.workspace_id)
    )
  );

CREATE POLICY "audio_inputs: editors can insert"
  ON "audio_inputs" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = audio_inputs.idea_id
        AND is_workspace_editor(ideas.workspace_id)
    )
  );

-- ─── exports ──────────────────────────────────────────────────────────────────

CREATE POLICY "exports: members can read"
  ON "exports" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = exports.idea_id
        AND is_workspace_member(ideas.workspace_id)
    )
  );

-- Insert handled by service role only

-- ─── ranking_history ──────────────────────────────────────────────────────────

CREATE POLICY "ranking_history: members can read"
  ON "ranking_history" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = ranking_history.idea_id
        AND is_workspace_member(ideas.workspace_id)
    )
  );

-- Insert handled by service role only
