import { validateUrl, validateEmail, validatePassword } from '../../src/utils/validators';

describe('Validators', () => {
  describe('validateUrl', () => {
    it('should return true for valid URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
      expect(validateUrl('https://sub.domain.com/path?query=1')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('http://')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validateEmail('not-an-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid passwords', () => {
      expect(validatePassword('Password123')).toBe(true);
      expect(validatePassword('SecurePass1')).toBe(true);
      expect(validatePassword('TestPass123')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      expect(validatePassword('pass')).toBe(false); // too short
      expect(validatePassword('password123')).toBe(false); // no uppercase
      expect(validatePassword('PASSWORD123')).toBe(false); // no lowercase
      expect(validatePassword('Password')).toBe(false); // no number
    });
  });
}); 