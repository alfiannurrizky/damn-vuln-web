CREATE DATABASE IF NOT EXISTS vuln_db;
USE vuln_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  phone VARCHAR(20),
  address TEXT,
  salary DECIMAL(10,2),
  avatar VARCHAR(255) DEFAULT 'default.png'
);

INSERT INTO users (username, email, password, role, phone, address, salary) VALUES
('Admin', 'admin@lab.local', 'admin123', 'admin', '123-456-7890', '123 Admin Street', 100000.00),
('User1', 'user1@lab.local', 'password123', 'user', '555-000-1111', '456 User Ave', 50000.00),
('User2', 'user2@lab.local', 'password123', 'user', '555-000-2222', '789 Test Blvd', 55000.00);
