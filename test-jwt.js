const jwt = require('jsonwebtoken');

const NEXTAUTH_SECRET = 'hiiamaniket';

// Test JWT creation and verification
const payload = {
  userId: 'test@example.com',
  email: 'test@example.com',
  name: 'Test User',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
};

console.log('Creating JWT token...');
const token = jwt.sign(payload, NEXTAUTH_SECRET);
console.log('Token created:', token);

console.log('\nVerifying JWT token...');
try {
  const decoded = jwt.verify(token, NEXTAUTH_SECRET);
  console.log('Token verified successfully:', decoded);
} catch (error) {
  console.error('Token verification failed:', error);
}
