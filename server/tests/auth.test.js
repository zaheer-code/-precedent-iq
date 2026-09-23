import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../src/schemas/authSchemas.js';
import { ENV } from '../src/config/env.js';

test('Auth Schema & Hashing Suite', async (t) => {

  await t.test('Password hashing with bcrypt generates valid hash and verifies correctly', async () => {
    const password = 'LegalPassword2026!';
    const hash = await bcrypt.hash(password, 10);
    assert.ok(hash.startsWith('$2'), 'Bcrypt hash should start with prefix $2');

    const isValid = await bcrypt.compare(password, hash);
    assert.equal(isValid, true, 'Bcrypt compare should return true for correct password');

    const isWrong = await bcrypt.compare('WrongPassword', hash);
    assert.equal(isWrong, false, 'Bcrypt compare should return false for incorrect password');
  });

  await t.test('JWT token generation and verification with expiration', () => {
    const payload = { userId: '11111111-1111-1111-1111-111111111111', email: 'attorney@law.com' };
    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '1h' });

    assert.ok(token && typeof token === 'string', 'JWT token should be generated');

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    assert.equal(decoded.userId, payload.userId);
    assert.equal(decoded.email, payload.email);

    // Verify expired token rejection
    const expiredToken = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '0s' });
    assert.throws(() => {
      jwt.verify(expiredToken, ENV.JWT_SECRET);
    }, /jwt expired/);
  });

  await t.test('Registration schema rejects weak passwords or invalid emails', () => {
    // Valid
    const valid = registerSchema.safeParse({
      fullName: 'Sarah Jenkins',
      email: 'sarah@firm.com',
      password: 'StrongPassword123',
      confirmPassword: 'StrongPassword123'
    });
    assert.equal(valid.success, true);

    // Mismatched passwords
    const mismatch = registerSchema.safeParse({
      fullName: 'Sarah Jenkins',
      email: 'sarah@firm.com',
      password: 'StrongPassword123',
      confirmPassword: 'DifferentPassword123'
    });
    assert.equal(mismatch.success, false);

    // Missing uppercase
    const noUpper = registerSchema.safeParse({
      fullName: 'Sarah Jenkins',
      email: 'sarah@firm.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
    assert.equal(noUpper.success, false);
  });

  await t.test('Login schema validates email format', () => {
    const invalidEmail = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'Password123'
    });
    assert.equal(invalidEmail.success, false);
  });

});
