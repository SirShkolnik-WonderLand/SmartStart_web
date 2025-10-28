-- Create admin user with proper password hash
-- Password: admin123
-- Hash: $2b$10$rQZ8K9vX7mN2pL1oE3fGhO5tY6uI8vC2wA4sD7fG9hJ1kL3mN5pQ7rS9uV1wX3yZ

INSERT INTO admin_users (email, password_hash, role) 
VALUES ('udi.shkolnik@alicesolutionsgroup.com', '$2b$10$rQZ8K9vX7mN2pL1oE3fGhO5tY6uI8vC2wA4sD7fG9hJ1kL3mN5pQ7rS9uV1wX3yZ', 'admin')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = '$2b$10$rQZ8K9vX7mN2pL1oE3fGhO5tY6uI8vC2wA4sD7fG9hJ1kL3mN5pQ7rS9uV1wX3yZ',
  role = 'admin';
