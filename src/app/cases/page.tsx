import { redirect } from 'next/navigation'

/**
 * GET /cases — список кейсов.
 * Редирект на главную с ?section=cases, где рендерится CasesPage.
 */
export default function CasesIndexPage() {
  redirect('/?section=cases')
}
