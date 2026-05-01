'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getDefaultWorkspace(userId: string) {
  // Find the first workspace where the user is a member
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
  });
  
  return membership?.workspace;
}
