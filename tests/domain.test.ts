import { isAllowedCompanyEmail } from '../utils/domain';
describe('isAllowedCompanyEmail', () => {
  it.each(['employee@hbplus.fit', ' EMPLOYEE@HBPLUS.FIT '])('accepts exact, case-insensitive company email %s', email => expect(isAllowedCompanyEmail(email)).toBe(true));
  it.each(['employee@gmail.com', 'employee@sub.hbplus.fit', 'employee@hbplus.fit.evil.com', 'hbplus.fit@evil.com', 'not-an-email', '', 'employee@hbplus'])('rejects invalid or lookalike email %s', email => expect(isAllowedCompanyEmail(email)).toBe(false));
  it('rejects absent email', () => expect(isAllowedCompanyEmail(null)).toBe(false));
});
