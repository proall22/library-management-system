-- Seed data for library management system
-- This script should be run after Frappe installation

USE library_db;

-- Insert sample books
INSERT INTO `tabBook` (name, title, author, isbn, publish_date, is_available, description, category, creation, modified, modified_by, owner) VALUES
('BOOK-001', 'The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', '1925-04-10', 1, 'A classic American novel set in the Jazz Age', 'Fiction', NOW(), NOW(), 'Administrator', 'Administrator'),
('BOOK-002', 'To Kill a Mockingbird', 'Harper Lee', '9780061120084', '1960-07-11', 1, 'A gripping tale of racial injustice and childhood innocence', 'Fiction', NOW(), NOW(), 'Administrator', 'Administrator'),
('BOOK-003', '1984', 'George Orwell', '9780451524935', '1949-06-08', 1, 'A dystopian social science fiction novel', 'Science Fiction', NOW(), NOW(), 'Administrator', 'Administrator'),
('BOOK-004', 'Pride and Prejudice', 'Jane Austen', '9780141439518', '1813-01-28', 1, 'A romantic novel of manners', 'Romance', NOW(), NOW(), 'Administrator', 'Administrator'),
('BOOK-005', 'The Catcher in the Rye', 'J.D. Salinger', '9780316769174', '1951-07-16', 1, 'A controversial novel about teenage rebellion', 'Fiction', NOW(), NOW(), 'Administrator', 'Administrator'),
('BOOK-006', 'Lord of the Flies', 'William Golding', '9780571056866', '1954-09-17', 1, 'A novel about British boys stranded on an island', 'Fiction', NOW(), NOW(), 'Administrator', 'Administrator'),
('BOOK-007', 'The Hobbit', 'J.R.R. Tolkien', '9780547928227', '1937-09-21', 1, 'A fantasy adventure novel', 'Fantasy', NOW(), NOW(), 'Administrator', 'Administrator'),
('BOOK-008', 'Fahrenheit 451', 'Ray Bradbury', '9781451673319', '1953-10-19', 1, 'A dystopian novel about book burning', 'Science Fiction', NOW(), NOW(), 'Administrator', 'Administrator'),
('BOOK-009', 'Jane Eyre', 'Charlotte Brontë', '9780141441146', '1847-10-16', 1, 'A bildungsroman following the experiences of its eponymous heroine', 'Romance', NOW(), NOW(), 'Administrator', 'Administrator'),
('BOOK-010', 'The Lord of the Rings', 'J.R.R. Tolkien', '9780544003415', '1954-07-29', 1, 'An epic high fantasy novel', 'Fantasy', NOW(), NOW(), 'Administrator', 'Administrator');

-- Insert sample members
INSERT INTO `tabMember` (name, name1, membership_id, email, phone, address, join_date, status, creation, modified, modified_by, owner) VALUES
('MEM-001', 'John Smith', 'LIB-2025-001', 'john.smith@email.com', '+1-555-0101', '123 Main St, Anytown, USA', '2025-01-01', 'Active', NOW(), NOW(), 'Administrator', 'Administrator'),
('MEM-002', 'Sarah Johnson', 'LIB-2025-002', 'sarah.johnson@email.com', '+1-555-0102', '456 Oak Ave, Anytown, USA', '2025-01-02', 'Active', NOW(), NOW(), 'Administrator', 'Administrator'),
('MEM-003', 'Michael Brown', 'LIB-2025-003', 'michael.brown@email.com', '+1-555-0103', '789 Pine St, Anytown, USA', '2025-01-03', 'Active', NOW(), NOW(), 'Administrator', 'Administrator'),
('MEM-004', 'Emily Davis', 'LIB-2025-004', 'emily.davis@email.com', '+1-555-0104', '321 Elm St, Anytown, USA', '2025-01-04', 'Active', NOW(), NOW(), 'Administrator', 'Administrator'),
('MEM-005', 'David Wilson', 'LIB-2025-005', 'david.wilson@email.com', '+1-555-0105', '654 Maple Ave, Anytown, USA', '2025-01-05', 'Active', NOW(), NOW(), 'Administrator', 'Administrator');

-- Create default users
INSERT INTO `tabUser` (name, email, first_name, last_name, full_name, user_type, enabled, creation, modified, modified_by, owner) VALUES
('admin@example.com', 'admin@example.com', 'Admin', 'User', 'Admin User', 'System User', 1, NOW(), NOW(), 'Administrator', 'Administrator'),
('lib@example.com', 'lib@example.com', 'Librarian', 'User', 'Librarian User', 'System User', 1, NOW(), NOW(), 'Administrator', 'Administrator'),
('member@example.com', 'member@example.com', 'Member', 'User', 'Member User', 'Website User', 1, NOW(), NOW(), 'Administrator', 'Administrator');

-- Assign roles
INSERT INTO `tabHas Role` (parent, parenttype, role, creation, modified, modified_by, owner) VALUES
('admin@example.com', 'User', 'System Manager', NOW(), NOW(), 'Administrator', 'Administrator'),
('lib@example.com', 'User', 'Librarian', NOW(), NOW(), 'Administrator', 'Administrator'),
('member@example.com', 'User', 'Library Member', NOW(), NOW(), 'Administrator', 'Administrator');
