export function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }]
}

export default async function IndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return null
}
