import { redirect } from '@/navigation';
import { createClient } from '@/lib/supabase/server';

export function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }]
}

export default async function IndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
