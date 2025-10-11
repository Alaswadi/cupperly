#!/usr/bin/env node

/**
 * Generate secure random secrets for production deployment
 * Run this script to generate JWT secrets and other secure tokens
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

console.log('\n🔐 Generating Secure Secrets for Production\n');
console.log('Copy these values to your Coolify environment variables:\n');
console.log('=' .repeat(60));

console.log('\n# JWT Configuration');
console.log(`JWT_SECRET=${generateSecret(32)}`);
console.log(`JWT_REFRESH_SECRET=${generateSecret(32)}`);

console.log('\n# NextAuth Configuration');
console.log(`NEXTAUTH_SECRET=${generateSecret(32)}`);

console.log('\n# Database Password (example - use your own)');
console.log(`POSTGRES_PASSWORD=${generateSecret(24)}`);

console.log('\n' + '='.repeat(60));
console.log('\n⚠️  IMPORTANT NOTES:');
console.log('1. Use the SAME JWT secrets for both frontend and backend');
console.log('2. Use the SAME NEXTAUTH_SECRET for both services');
console.log('3. Store these secrets securely - you cannot recover them');
console.log('4. Never commit these secrets to Git');
console.log('5. Set these in Coolify environment variables, not in .env files\n');

