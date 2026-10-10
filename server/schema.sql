-- ====================================================================
-- SNJB COE LIBRARY SYSTEM - Database Schema & Initial Data Script
-- Target Database: MySQL 8.0+ / MariaDB 10.5+
-- ====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. DROP EXISTING TABLES (IF EXISTS)
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `borrowings`;
DROP TABLE IF EXISTS `announcements`;
DROP TABLE IF EXISTS `members`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `authors`;

-- 2. AUTHORS TABLE
CREATE TABLE `authors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `nationality` VARCHAR(100) DEFAULT NULL,
  `biography` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_author_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CATEGORIES TABLE
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `floor_section` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BOOKS TABLE
CREATE TABLE `books` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `isbn` VARCHAR(20) NOT NULL UNIQUE,
  `title` VARCHAR(300) NOT NULL,
  `author_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `publication_year` INT DEFAULT NULL,
  `publisher` VARCHAR(200) DEFAULT NULL,
  `edition` VARCHAR(50) DEFAULT '1st Edition',
  `shelf_location` VARCHAR(100) NOT NULL COMMENT 'e.g. Rack A-14, Shelf 1',
  `call_number` VARCHAR(50) NOT NULL COMMENT 'e.g. CS.AI.RUS.2020',
  `total_copies` INT NOT NULL DEFAULT 1,
  `available_copies` INT NOT NULL DEFAULT 1,
  `description` TEXT DEFAULT NULL,
  `cover_url` VARCHAR(500) DEFAULT NULL,
  `tags` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_books_author` FOREIGN KEY (`author_id`) REFERENCES `authors` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  INDEX `idx_book_title` (`title`),
  INDEX `idx_book_call_no` (`call_number`),
  INDEX `idx_book_shelf` (`shelf_location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. MEMBERS TABLE (STUDENTS & LIBRARIANS)
CREATE TABLE `members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. STU-2024-101, LIB-2024-001',
  `name` VARCHAR(200) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'librarian') NOT NULL DEFAULT 'student',
  `department` VARCHAR(150) NOT NULL,
  `max_allowed_books` INT NOT NULL DEFAULT 3,
  `status` ENUM('active', 'suspended', 'graduated') NOT NULL DEFAULT 'active',
  `phone` VARCHAR(30) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_member_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BORROWINGS TABLE (CIRCULATION TRANSACTIONS)
CREATE TABLE `borrowings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `book_id` INT NOT NULL,
  `member_id` INT NOT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `return_date` DATE DEFAULT NULL,
  `renewal_count` INT NOT NULL DEFAULT 0,
  `status` ENUM('active', 'returned', 'overdue') NOT NULL DEFAULT 'active',
  `fine_amount` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `fine_paid` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_borrowing_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_borrowing_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  INDEX `idx_borrow_status` (`status`),
  INDEX `idx_borrow_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. RESERVATIONS TABLE (HOLD QUEUE)
CREATE TABLE `reservations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `book_id` INT NOT NULL,
  `member_id` INT NOT NULL,
  `reservation_date` DATE NOT NULL,
  `status` ENUM('waiting', 'ready', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'waiting',
  `queue_position` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reservation_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reservation_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  INDEX `idx_reservation_book_status` (`book_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. ANNOUNCEMENTS TABLE
CREATE TABLE `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `type` ENUM('notice', 'rule', 'hours', 'event') NOT NULL DEFAULT 'notice',
  `date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- SEED DATA INSERTION
-- ====================================================================

-- Authors
INSERT INTO `authors` (`id`, `name`, `nationality`, `biography`) VALUES
(1, 'Dr. A. P. J. Abdul Kalam', 'Indian', 'Renowned aerospace scientist and the 11th President of India, author of inspirational autobiographies.'),
(2, 'Stuart Russell & Peter Norvig', 'American', 'Pioneering computer scientists and authors of the standard global textbook on Artificial Intelligence.'),
(3, 'Robert C. Martin', 'American', 'Software engineer and author of the Agile Software Development Series (Uncle Bob).'),
(4, 'Herbert Schildt', 'American', 'Leading authority on C, C++, and Java programming with millions of copies sold worldwide.'),
(5, 'F. Scott Fitzgerald', 'American', 'Iconic novelist of the Jazz Age, author of The Great Gatsby.'),
(6, 'Harper Lee', 'American', 'Pulitzer Prize winning novelist, author of To Kill a Mockingbird.'),
(7, 'Yuval Noah Harari', 'Israeli', 'Historian, philosopher, and author of Sapiens: A Brief History of Humankind.'),
(8, 'Andrew S. Tanenbaum', 'American-Dutch', 'Computer scientist, author of foundational books on Computer Networks.'),
(9, 'Thomas H. Cormen et al.', 'American', 'Authors of Introduction to Algorithms (CLRS).'),
(10, 'Jane Austen', 'British', 'Acclaimed English novelist famous for Pride and Prejudice.');

-- Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `floor_section`, `description`) VALUES
(1, 'Computer Science & AI', 'computer-science', 'Floor 2, Wing A', 'Algorithms, machine learning, systems, and software engineering'),
(2, 'Programming & Web', 'programming', 'Floor 2, Wing B', 'Java, Python, C++, web development and programming languages'),
(3, 'Biography & Inspiration', 'biography', 'Floor 1, Wing C', 'Lives of inspiring scientists, leaders, and thinkers'),
(4, 'Literature & Classics', 'literature', 'Floor 1, Wing A', 'World classics, historical fiction, and award-winning novels'),
(5, 'History & Philosophy', 'history', 'Floor 3, Wing B', 'Human history, anthropology, civilization and philosophy'),
(6, 'Electronics & Networks', 'networking', 'Floor 2, Wing C', 'Hardware architectures, protocols, routing and distributed computing');

-- Books
INSERT INTO `books` (`id`, `isbn`, `title`, `author_id`, `category_id`, `publication_year`, `publisher`, `edition`, `shelf_location`, `call_number`, `total_copies`, `available_copies`, `description`, `cover_url`, `tags`) VALUES
(1, '978-8173711466', 'Wings of Fire: An Autobiography', 1, 3, 1999, 'Universities Press', '1st Edition', 'Rack C-02, Shelf 3', 'BIO.KAL.1999', 5, 3, 'An inspiring autobiography recounting Dr. Kalam\'s journey from humble roots to leading India\'s space and missile program.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80', 'kalam,autobiography,inspiration,space,science'),
(2, '978-0134610993', 'Artificial Intelligence: A Modern Approach', 2, 1, 2020, 'Pearson', '4th Edition', 'Rack A-14, Shelf 1', 'CS.AI.RUS.2020', 6, 2, 'The authoritative, comprehensive overview of the theory and practice of AI, covering machine learning, search, neural networks, robotics.', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=80', 'ai,artificial intelligence,machine learning,robotics'),
(3, '978-0132350884', 'Clean Code: A Handbook of Agile Software Craftsmanship', 3, 1, 2008, 'Prentice Hall', '1st Edition', 'Rack A-08, Shelf 4', 'CS.SE.MAR.2008', 4, 0, 'Best practices for writing readable, maintainable, testable code for software engineers and craftsmen.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=80', 'clean code,software engineering,refactoring,agile'),
(4, '978-1260440232', 'Java: The Complete Reference', 4, 2, 2021, 'McGraw Hill', '12th Edition', 'Rack B-03, Shelf 2', 'PROG.JAV.SCH.2021', 8, 5, 'Comprehensive coverage of the Java language syntax, libraries, OOP principles, generics, and concurrent programming.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80', 'java,programming,oop,software,concurrency'),
(5, '978-0262033848', 'Introduction to Algorithms (CLRS)', 9, 1, 2009, 'MIT Press', '3rd Edition', 'Rack A-01, Shelf 2', 'CS.ALG.COR.2009', 6, 1, 'The definitive reference guide on data structures, sorting, graph theory, dynamic programming, and complexity classes.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80', 'algorithms,data structures,mit,graph theory'),
(6, '978-0130661029', 'Computer Networks', 8, 6, 2011, 'Pearson', '5th Edition', 'Rack C-10, Shelf 1', 'NET.TAN.2011', 5, 3, 'Classic introduction to computer networking principles, TCP/IP protocol suite, wireless networks, and network routing.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80', 'networks,tcp/ip,protocols,tanenbaum,routing'),
(7, '978-0062316097', 'Sapiens: A Brief History of Humankind', 7, 5, 2015, 'Harper', '1st Edition', 'Rack D-05, Shelf 3', 'HIS.HAR.2015', 4, 4, 'A thrilling exploration of human history, biological evolution, and cognitive revolutions that shaped humanity.', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&auto=format&fit=crop&q=80', 'history,sapiens,anthropology,philosophy'),
(8, '978-0743273565', 'The Great Gatsby', 5, 4, 1925, 'Scribner', 'Reprint Edition', 'Rack E-02, Shelf 2', 'LIT.FIT.1925', 6, 5, 'Tragic story of Jay Gatsby and Daisy Buchanan exploring wealth, love, and disillusionment in 1920s America.', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80', 'literature,classics,gatsby,fiction'),
(9, '978-0060935467', 'To Kill a Mockingbird', 6, 4, 1960, 'Harper Perennial', '50th Anniversary', 'Rack E-04, Shelf 4', 'LIT.LEE.1960', 5, 4, 'Memorable coming-of-age story and courtroom drama challenging racial prejudice in Maycomb, Alabama.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80', 'classics,literature,pulitzer,justice'),
(10, '978-0141439518', 'Pride and Prejudice', 10, 4, 1813, 'Penguin Classics', 'Penguin Classics', 'Rack E-01, Shelf 3', 'LIT.AUS.1813', 4, 3, 'Humorous and romantic novel revolving around Elizabeth Bennet and Fitzwilliam Darcy.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80', 'classics,romance,austen,british'),
(11, '978-8122308365', 'Ignited Minds: Unleashing the Power Within India', 1, 3, 2002, 'Penguin India', '1st Edition', 'Rack C-02, Shelf 4', 'BIO.KAL.2002', 4, 2, 'Inspirational manifesto for national transformation, youth education, and scientific innovation by Dr. APJ Abdul Kalam.', 'https://images.unsplash.com/photo-1532012164546-f432f2e3777d?w=500&auto=format&fit=crop&q=80', 'kalam,youth,inspiration,india'),
(12, '978-0131489066', 'Effective Java', 4, 2, 2018, 'Addison-Wesley', '3rd Edition', 'Rack B-03, Shelf 3', 'PROG.JAV.BLO.2018', 4, 2, 'Industry standard guidelines for writing robust, concise, and clean Java applications.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80', 'java,best practices,programming,effective');

-- Members
INSERT INTO `members` (`id`, `member_id`, `name`, `email`, `password_hash`, `role`, `department`, `max_allowed_books`, `status`, `phone`) VALUES
(1, 'STU-2024-101', 'Arpita Shah', 'arpita@snjbcoe.edu.in', '$2b$10$SampleHashedPasswordForStudentDemo1234567890', 'student', 'Computer Engineering', 3, 'active', '+91 98765 43210'),
(2, 'STU-2024-102', 'Rohan Patil', 'rohan@snjbcoe.edu.in', '$2b$10$SampleHashedPasswordForStudentDemo1234567890', 'student', 'Electronics & Computer Eng.', 3, 'active', '+91 98765 12345'),
(3, 'LIB-2024-001', 'Dr. Eleanor Vance', 'librarian@snjbcoe.edu.in', '$2b$10$SampleHashedPasswordForLibrarianDemo12345678', 'librarian', 'Library Services & Archives', 15, 'active', '+91 98220 54321');

-- Borrowings
INSERT INTO `borrowings` (`id`, `book_id`, `member_id`, `issue_date`, `due_date`, `return_date`, `renewal_count`, `status`, `fine_amount`, `fine_paid`) VALUES
(1, 3, 1, '2026-09-20', '2026-10-04', NULL, 0, 'overdue', 3.00, FALSE),
(2, 2, 1, '2026-10-02', '2026-10-16', NULL, 1, 'active', 0.00, FALSE),
(3, 5, 2, '2026-09-28', '2026-10-12', NULL, 0, 'active', 0.00, FALSE);

-- Reservations
INSERT INTO `reservations` (`id`, `book_id`, `member_id`, `reservation_date`, `status`, `queue_position`) VALUES
(1, 3, 2, '2026-10-05', 'waiting', 1);

-- Announcements
INSERT INTO `announcements` (`id`, `title`, `content`, `type`, `date`) VALUES
(1, 'Mid-Term Extended Study Hours', 'The library Main Reading Hall will remain open 24/7 starting Monday next week. Free coffee will be served after 10 PM.', 'hours', '2026-10-08'),
(2, 'Overdue Policy Reminder', 'Standard loan period is 14 days with up to 2 renewals. Overdue fines accrue at $0.50 per day.', 'rule', '2026-10-01'),
(3, 'New AI & Data Science Collection', 'Over 40 new hardcovers on generative AI, deep learning, and transformer architectures have been cataloged in Floor 2, Wing A.', 'notice', '2026-09-25');
