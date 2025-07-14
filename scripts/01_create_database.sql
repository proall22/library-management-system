-- Create database and user for library management system
CREATE DATABASE IF NOT EXISTS library_db;
CREATE USER IF NOT EXISTS 'library_user'@'localhost' IDENTIFIED BY 'library_password';
GRANT ALL PRIVILEGES ON library_db.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;

USE library_db;

-- Create initial tables (Frappe will handle the rest)
-- This is just for reference, Frappe ORM will create the actual tables
