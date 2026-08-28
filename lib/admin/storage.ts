/**
 * Mock image storage.
 * Returns a placeholder URL instead of uploading to Supabase Storage.
 * Replace this with real storage logic when you re-add a backend.
 */

export async function uploadProductImage(_file: File, _path: string): Promise<string> {
  // In a real implementation this would upload to S3/Supabase/Cloudinary.
  // For the mock, return a placeholder image URL.
  return `https://placehold.co/800x600/6366f1/ffffff?text=Product+Image`
}

export function generateImagePath(productSlug: string, fileName: string): string {
  const ext = fileName.split('.').pop() ?? 'jpg'
  const timestamp = Date.now()
  return `products/${productSlug}/${timestamp}.${ext}`
}
