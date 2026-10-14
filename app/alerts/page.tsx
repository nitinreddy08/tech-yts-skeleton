import { redirect } from 'next/navigation'

/** Price watches live in the My Stuff hub; this route is kept so old links and bookmarks still work. */
export default function AlertsPage() {
  redirect('/my?tab=alerts')
}
