import { PotentialCustomer } from './potentialCustomerService';

function normalizeBdPhoneForWa(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880')) return digits;
  if (digits.startsWith('0')) return `88${digits}`;
  return `880${digits}`;
}

export type LeadContactMethod = 'phone' | 'email' | 'whatsapp' | 'social';

export function getLeadContactOptions(lead: PotentialCustomer) {
  const socialUrl = lead.socialLink
    ? lead.socialLink.startsWith('http')
      ? lead.socialLink
      : `https://${lead.socialLink}`
    : null;

  const waText = encodeURIComponent(`Hi ${lead.name}, this is Shoukhin. `);

  return {
    phone: lead.phone ? `tel:${lead.phone.replace(/\s/g, '')}` : null,
    email: lead.email
      ? `mailto:${lead.email}?subject=${encodeURIComponent(`Shoukhin — following up with ${lead.name}`)}`
      : null,
    whatsapp: lead.phone ? `https://wa.me/${normalizeBdPhoneForWa(lead.phone)}?text=${waText}` : null,
    social: socialUrl,
  };
}

export function hasAnyLeadContact(lead: PotentialCustomer): boolean {
  return Boolean(lead.phone || lead.email || lead.socialLink);
}
