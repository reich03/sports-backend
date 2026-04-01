// Mock de usuarios para desarrollo sin BD
const mockUsers = [
  {
    id: 1,
    email: 'test@test.com',
    username: 'testuser',
    password: '$2a$10$YourHashedPasswordHere', // "test123"
    role: 'user'
  },
  {
    id: 2,
    email: 'admin@mastersport.app',
    username: 'admin',
    password: '$2a$10$YourHashedPasswordHere', // "admin123"
    role: 'admin'
  }
];

module.exports = { mockUsers };
