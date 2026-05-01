/**
 * RLS policies for IdeaOS.
 *
 * All policies enforce workspace-level isolation: a user can only access rows
 * that belong to a workspace they are a member of (or own).
 *
 * This file is the source of truth for policy definitions. The SQL is kept in
 * supabase/migrations/20250429000001_rls.sql and must stay in sync.
 */

export const RLS_POLICIES = {
  users: [
    'Users can read their own row',
    'Users can update their own row',
  ],
  workspaces: [
    'Members can read their workspaces',
    'Owners can update their workspace',
    'Owners can delete their workspace',
    'Authenticated users can create workspaces',
  ],
  workspace_members: [
    'Members can read membership of their workspaces',
    'Owners can manage members of their workspaces',
  ],
  ideas: [
    'Members can read ideas in their workspaces',
    'Editors and owners can insert ideas',
    'Editors and owners can update ideas',
    'Owners can delete ideas',
  ],
  analyses: [
    'Members can read analyses of their workspace ideas',
    'Service role only for insert/update/delete',
  ],
  hypotheses: [
    'Members can read hypotheses of their workspace ideas',
    'Editors and owners can manage hypotheses',
  ],
  experiments: [
    'Members can read experiments of their workspace ideas',
    'Editors and owners can manage experiments',
  ],
  audio_inputs: [
    'Members can read audio inputs of their workspace ideas',
    'Editors and owners can insert audio inputs',
  ],
  exports: [
    'Members can read exports of their workspace ideas',
    'Service role only for insert',
  ],
  ranking_history: [
    'Members can read ranking history of their workspace ideas',
    'Service role only for insert',
  ],
} as const
