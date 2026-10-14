import { redirect } from 'next/navigation'

/** Saved items live in the My Stuff hub; this route is kept so old links and bookmarks still work. */
export default function SavedPage() {
  redirect('/my?tab=saved')
}
