import prisma from '@/lib/prisma';
import { getCurrentUser, getDefaultWorkspace } from '@/lib/actions/auth';
import { DashboardClient } from './dashboard-client';
import { redirect } from '@/navigation';
import { Idea } from '@/lib/types';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
    return null;
  }

  const workspace = await getDefaultWorkspace(user.id);
  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">No tienes un espacio de trabajo</h1>
        <p className="text-muted-foreground">Contacta con tu administrador para obtener acceso.</p>
      </div>
    );
  }

  const ideas = await prisma.idea.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: 'desc' },
  });

  return <DashboardClient initialIdeas={ideas as Idea[]} />;
}
