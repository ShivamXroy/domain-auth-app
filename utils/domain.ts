export const ALLOWED_DOMAIN = 'hbplus.fit';

/** Returns true only for a syntactically valid address at the exact company domain. */
export function isAllowedCompanyEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const match = /^([a-z0-9.!#$%&'*+/=?^_`{|}~-]+)@([a-z0-9-]+(?:\.[a-z0-9-]+)*)$/i.exec(normalized);
  return Boolean(match && match[2] === ALLOWED_DOMAIN);
}
