'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type {
  Workspace,
  WorkspaceMember,
  WorkspaceMemberWithUser,
  WorkspaceRole,
} from '@/lib/types'

// ─── createWorkspace ──────────────────────────────────────────────────────────

export interface CreateWorkspacePayload {
  name: string
  slug: string
}

export async function createWorkspace(
  userId: string,
  payload: CreateWorkspacePayload
): Promise<Workspace> {
  const workspace = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const ws = await tx.workspace.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        ownerId: userId,
      },
    })

    await tx.workspaceMember.create({
      data: {
        workspaceId: ws.id,
        userId,
        role: 'owner',
      },
    })

    return ws
  })

  revalidatePath('/dashboard')
  return workspace
}

// ─── inviteMember ─────────────────────────────────────────────────────────────

export async function inviteMember(
  workspaceId: string,
  inviteeEmail: string,
  role: WorkspaceRole = 'viewer'
): Promise<WorkspaceMember> {
  const invitee = await prisma.user.findUnique({
    where: { email: inviteeEmail },
  })

  if (!invitee) {
    throw new Error(`No account found for ${inviteeEmail}`)
  }

  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: invitee.id } },
  })

  if (existing) {
    throw new Error(`${inviteeEmail} is already a member of this workspace`)
  }

  const member = await prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: invitee.id,
      role,
    },
  })

  revalidatePath('/settings/workspace')
  return member
}

// ─── updateMemberRole ─────────────────────────────────────────────────────────

export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole
): Promise<WorkspaceMember> {
  if (role !== 'owner') {
    const ownerCount = await prisma.workspaceMember.count({
      where: { workspaceId, role: 'owner' },
    })

    const targetIsOwner = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { role: true },
    })

    if (ownerCount === 1 && targetIsOwner?.role === 'owner') {
      throw new Error('Cannot demote the last owner of a workspace')
    }
  }

  const member = await prisma.workspaceMember.update({
    where: { workspaceId_userId: { workspaceId, userId } },
    data: { role },
  })

  revalidatePath('/settings/workspace')
  return member
}

// ─── getWorkspaceMembers ──────────────────────────────────────────────────────

export async function getWorkspaceMembers(
  workspaceId: string
): Promise<WorkspaceMemberWithUser[]> {
  return prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true },
    orderBy: { invitedAt: 'asc' },
  })
}
