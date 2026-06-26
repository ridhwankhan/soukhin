import { supabase } from './supabase';
import { checkClientRateLimit, formatRetryAfter, isRateLimitError } from './rateLimit';

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  website?: string; // honeypot — must stay empty
}

export async function submitContactMessage(input: ContactMessageInput): Promise<{ error?: string }> {
  const clientLimit = checkClientRateLimit('contact_form', 3, 60 * 60 * 1000);
  if (!clientLimit.allowed) {
    return { error: `Too many messages. Try again in ${formatRetryAfter(clientLimit.retryAfterMs)}.` };
  }

  const { error } = await supabase.rpc('submit_contact_message', {
    p_payload: {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() ?? '',
      subject: input.subject.trim(),
      message: input.message.trim(),
      website: input.website ?? '',
    },
  });

  if (error) {
    if (isRateLimitError(error)) {
      return { error: 'Too many messages sent. Please wait an hour and try again.' };
    }
    return { error: 'Could not send your message. Please try again or email us directly.' };
  }

  return {};
}
