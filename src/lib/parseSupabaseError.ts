export function parseSupabaseError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Something went wrong. Please try again.';

  const e = error as { message?: string; code?: string; details?: string; hint?: string };

  const msg = e.message ?? '';
  const lower = msg.toLowerCase();

  if (lower.includes('could not find the function') || lower.includes('create_order_admin')) {
    return 'Database not updated yet. Open UPDATE_DATABASE.txt (or double-click OPEN_DATABASE_UPDATE.bat), copy all, paste in Supabase SQL Editor, and RUN.';
  }
  if (lower.includes('permission_denied') || lower.includes('42501')) {
    return 'You do not have permission for this action. Sign in as staff and try again.';
  }
  if (msg.includes('insufficient_stock')) {
    return 'One or more products are out of stock. Reduce quantity or pick another product.';
  }
  if (msg.includes('invalid_name')) return 'Enter a valid customer name (at least 2 characters).';
  if (msg.includes('invalid_phone')) return 'Phone number looks too short. Leave blank if unknown.';
  if (msg.includes('invalid_email')) return 'Enter a valid email or leave it blank.';
  if (msg.includes('empty_cart')) return 'Add at least one product.';
  if (msg.includes('contact_required')) {
    return 'Add at least one way to reach them: phone, email, or social link.';
  }

  return msg || 'Could not complete this action.';
}
