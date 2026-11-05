/**
 * Links for reaching the other side of a pickup. Phone numbers on RePlate are mostly Indian and
 * often typed without the country code, so a bare 10-digit number is treated as +91.
 */

/** Digits only, with India's 91 added to a bare 10-digit mobile number. Null if it can't be a number. */
export function internationalDigits(phone: string): string | null {
  let digits = phone.replace(/\D/g, '');
  // A leading 0 is the domestic trunk prefix, as in 098450 12345.
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;
  return digits.length >= 11 && digits.length <= 15 ? digits : null;
}

export function telLink(phone: string): string {
  const digits = internationalDigits(phone);
  return digits ? `tel:+${digits}` : `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** A WhatsApp chat with a first message already written. Null if the number can't be used. */
export function whatsAppLink(phone: string, message: string): string | null {
  const digits = internationalDigits(phone);
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}

/**
 * Directions to a point. Android opens the phone's own maps app through a geo: link; everywhere
 * else gets OpenStreetMap's route planner with the destination filled in.
 */
export function directionsLink(lat: number, lng: number, userAgent = ''): string {
  if (/Android/i.test(userAgent)) return `geo:${lat},${lng}?q=${lat},${lng}`;
  return `https://www.openstreetmap.org/directions?route=%3B${lat}%2C${lng}`;
}
