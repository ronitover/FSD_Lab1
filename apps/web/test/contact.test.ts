import { describe, expect, it } from 'vitest';
import { directionsLink, internationalDigits, telLink, whatsAppLink } from '../src/lib/contact.ts';

describe('internationalDigits', () => {
  it('adds 91 to a bare 10-digit Indian number', () => {
    expect(internationalDigits('98450 12345')).toBe('919845012345');
  });

  it('drops the domestic 0 prefix', () => {
    expect(internationalDigits('098450-12345')).toBe('919845012345');
  });

  it('keeps a number that already has a country code', () => {
    expect(internationalDigits('+91 98450 12345')).toBe('919845012345');
    expect(internationalDigits('+44 20 7946 0958')).toBe('442079460958');
  });

  it('rejects numbers that are too short to dial', () => {
    expect(internationalDigits('12345')).toBeNull();
  });
});

describe('contact links', () => {
  it('builds a tel link with the country code', () => {
    expect(telLink('98450 12345')).toBe('tel:+919845012345');
  });

  it('builds a WhatsApp link with the message encoded', () => {
    expect(whatsAppLink('98450 12345', 'Hi, about the biryani & rotis')).toBe(
      'https://wa.me/919845012345?text=Hi%2C%20about%20the%20biryani%20%26%20rotis',
    );
  });

  it('has no WhatsApp link for an unusable number', () => {
    expect(whatsAppLink('123', 'Hi')).toBeNull();
  });
});

describe('directionsLink', () => {
  it('opens the maps app on Android', () => {
    expect(directionsLink(12.97, 77.59, 'Mozilla/5.0 (Linux; Android 14)')).toBe(
      'geo:12.97,77.59?q=12.97,77.59',
    );
  });

  it('uses OpenStreetMap elsewhere', () => {
    expect(directionsLink(12.97, 77.59, 'Mozilla/5.0 (iPhone)')).toBe(
      'https://www.openstreetmap.org/directions?route=%3B12.97%2C77.59',
    );
  });
});
