import { JoinOnboarding } from '@/components/joinOnboarding'

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  return <JoinOnboarding token={token} />
}
