# 📖 Library Management System

A comprehensive full-stack library management system built with **Frappe Framework 15** (backend) and **React 18 + TypeScript** (frontend). This application provides complete library operations including book management, member registration, loan tracking, reservation queues, overdue notifications, and detailed reporting - all through a custom REST API and modern web interface.

## ✨ Features & User Stories Implemented

### MUST-HAVE Features ✅

| ID | Feature | Status | Description |
|---|---|---|---|
| US-01 | Book CRUD from custom UI | ✅ | Complete book management with add/edit/delete/search |
| US-02 | Member CRUD from custom UI | ✅ | Member registration and management interface |
| US-03 | Book loaning with date tracking | ✅ | Loan creation with automatic due dates and tracking |
| US-04 | Prevent duplicate loans | ✅ | System prevents loaning unavailable books |
| US-05 | Reservation queue system | ✅ | Queue management for unavailable books |
| US-06 | Overdue email notifications | ✅ | Automated daily email reminders |
| US-07 | Reports: Active Loans & Overdue | ✅ | Comprehensive reporting dashboard |
| US-08 | Secure REST API | ✅ | Token-based API for external integrations |
| US-09 | Auth + Role-based Access | ✅ | Admin, Librarian, Member roles with permissions |
| US-10 | Custom frontend UI | ✅ | No Frappe Desk - fully custom React interface |

### Additional Features 🚀

- **Real-time Dashboard** - Library statistics and quick actions
- **Advanced Search** - Multi-field book and member search
- **Reservation Management** - Queue position tracking and notifications
- **Fine Calculation** - Automatic overdue fine computation
- **Popular Books Report** - Analytics based on loan frequency
- **Member Activity Tracking** - Usage statistics and history
- **Responsive Design** - Mobile-friendly interface
- **Email Notifications** - Reservation ready alerts and overdue reminders

## 🌐 Technology Stack

### Backend
- **Framework**: Frappe Framework 15
- **Database**: MariaDB with Frappe ORM
- **API**: RESTful endpoints with JSON responses
- **Authentication**: Token-based with role permissions
- **Email**: SMTP integration for notifications
- **Scheduler**: Automated background tasks

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS + Custom Components
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API
- **Build Tool**: Create React App

### Infrastructure
- **Environment**: WSL Ubuntu (Windows Subsystem for Linux)
- **Web Server**: Frappe's built-in development server
- **Database**: MariaDB 10.x
- **Cache**: Redis for session management
- **Process Manager**: Bench (Frappe's CLI tool)

## 📁 Project Structure

\`\`\`
library-management-system/
├── frappe-bench/                 # Frappe backend
│   ├── sites/library.local/      # Site configuration
│   └── apps/library_app/         # Custom Frappe application
│       ├── library_app/
│       │   ├── doctype/          # Data models (Book, Member, Loan, Reservation)
│       │   │   ├── book/
│       │   │   ├── member/
│       │   │   ├── loan/
│       │   │   └── reservation/
│       │   └── api/              # REST API endpoints
│       │       ├── auth.py       # Authentication endpoints
│       │       ├── book.py       # Book CRUD operations
│       │       ├── member.py     # Member management
│       │       ├── loan.py       # Loan processing
│       │       ├── reservation.py # Reservation handling
│       │       └── reports.py    # Analytics and reporting
│       ├── tasks.py              # Scheduled tasks (overdue notifications)
│       └── hooks.py              # Frappe configuration
├── frontend/                     # React TypeScript application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Layout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/             # React Context providers
│   │   │   └── AuthContext.tsx
│   │   ├── pages/                # Main application pages
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Books.tsx
│   │   │   ├── Members.tsx
│   │   │   ├── Loans.tsx
│   │   │   ├── Reservations.tsx
│   │   │   └── Reports.tsx
│   │   ├── services/             # API integration
│   │   │   └── api.ts
│   │   ├── types/                # TypeScript definitions
│   │   │   └── index.ts
│   │   └── App.tsx
│   └── package.json
├── scripts/                      # Database initialization
│   ├── 01_create_database.sql
│   └── 02_seed_data.sql
├── setup.sh                     # Environment setup script
├── Makefile                     # Build and deployment commands
└── README.md
\`\`\`

## 🚀 Quick Start Guide

### Prerequisites

- **Operating System**: WSL Ubuntu (or native Linux)
- **Python**: 3.8+ with pip and venv
- **Node.js**: 16+ with npm
- **Database**: MariaDB 10.x
- **Cache**: Redis server
- **Git**: For version control

### 1. Environment Setup

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd library-management-system

# Make setup script executable and run
chmod +x setup.sh
./setup.sh
\`\`\`

### 2. Initialize the System

\`\`\`bash
# Initialize Frappe bench and create site
make init

# This will:
# - Create frappe-bench directory
# - Set up library.local site
# - Install the library_app
# - Configure database and permissions
\`\`\`

### 3. Start the Application

\`\`\`bash
# Start both backend and frontend
make start

# Or start individually:
make backend-dev    # Starts Frappe on http://localhost:8000
make frontend-dev   # Starts React on http://localhost:3000
\`\`\`

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/method/library_app.api.*
- **Frappe Desk** (admin only): http://localhost:8000/desk

### 5. Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | admin@example.com | admin123 | Full system access |
| **Librarian** | lib@example.com | lib123 | Book/member/loan management |
| **Member** | member@example.com | member123 | Book browsing and reservations |

## 📡 API Documentation

### Authentication Endpoints

\`\`\`bash
# Login
POST /api/method/library_app.api.auth.login
Body: {"usr": "email", "pwd": "password"}

# Register new member
POST /api/method/library_app.api.auth.register_member
Body: {"full_name": "...", "email": "...", "password": "..."}

# Get current user
GET /api/method/library_app.api.auth.get_current_user
\`\`\`

### Book Management

\`\`\`bash
# Get all books
GET /api/method/library_app.api.book.get_all_books?limit=20&start=0

# Get book details
GET /api/method/library_app.api.book.get_book?book_id=BOOK-001

# Create book (Librarian+)
POST /api/method/library_app.api.book.create_book
Body: {"title": "...", "author": "...", "isbn": "..."}

# Search books
GET /api/method/library_app.api.book.search_books?query=gatsby&limit=10
\`\`\`

### Loan Operations

\`\`\`bash
# Create loan (Librarian+)
POST /api/method/library_app.api.loan.create_loan
Body: {"book": "BOOK-001", "member": "MEM-001"}

# Return book (Librarian+)
POST /api/method/library_app.api.loan.return_book
Body: {"loan_id": "LOAN-001"}

# Get active loans
GET /api/method/library_app.api.loan.get_active_loans

# Get overdue loans
GET /api/method/library_app.api.loan.get_overdue_loans
\`\`\`

### Reservation System

\`\`\`bash
# Create reservation
POST /api/method/library_app.api.reservation.create_reservation
Body: {"book": "BOOK-001", "member": "MEM-001"}

# Get member reservations
GET /api/method/library_app.api.reservation.get_member_reservations?member=MEM-001

# Cancel reservation
POST /api/method/library_app.api.reservation.cancel_reservation
Body: {"reservation_id": "RES-001"}
\`\`\`

### Reports & Analytics

\`\`\`bash
# Library statistics
GET /api/method/library_app.api.reports.get_library_statistics

# Active loans report
GET /api/method/library_app.api.reports.get_active_loans_report

# Overdue books report
GET /api/method/library_app.api.reports.get_overdue_books_report

# Popular books
GET /api/method/library_app.api.reports.get_popular_books_report?limit=10
\`\`\`

## 🔧 Development Commands

\`\`\`bash
# Backend development
make backend-dev          # Start Frappe development server
bench migrate            # Run database migrations
bench clear-cache        # Clear application cache
bench execute library_app.tasks.send_overdue_notifications  # Test email task

# Frontend development
make frontend-dev         # Start React development server
cd frontend && npm test   # Run frontend tests
cd frontend && npm run build  # Build for production

# Database operations
mysql -u root -p library_db < scripts/02_seed_data.sql  # Load sample data
bench backup             # Backup site data
bench restore           # Restore from backup

# System management
make stop               # Stop all services
make install-app        # Reinstall library app
bench update           # Update Frappe framework
\`\`\`

## 📊 Key Features Deep Dive

### 1. Book Management System
- **CRUD Operations**: Complete create, read, update, delete functionality
- **Advanced Search**: Multi-field search across title, author, ISBN, category
- **Availability Tracking**: Real-time status updates based on loans
- **Validation**: ISBN format validation, duplicate prevention
- **Categories**: Flexible categorization system

### 2. Member Management
- **Registration**: Self-service member registration with email verification
- **Profile Management**: Complete member information tracking
- **Status Management**: Active/Inactive/Suspended status control
- **Loan History**: Complete borrowing history with fines
- **Contact Information**: Phone, email, address management

### 3. Loan Processing System
- **Automated Workflows**: Loan creation with automatic due date calculation
- **Availability Checks**: Prevents duplicate loans and validates member eligibility
- **Return Processing**: Simple return workflow with fine calculation
- **Extension Support**: Loan period extensions for eligible members
- **Overdue Tracking**: Automatic overdue detection and fine calculation

### 4. Reservation Queue System
- **Queue Management**: First-come-first-served reservation system
- **Automatic Notifications**: Email alerts when books become available
- **Expiration Handling**: Automatic reservation expiry and queue progression
- **Status Tracking**: Pending, Ready, Fulfilled, Cancelled, Expired states
- **Member Dashboard**: Personal reservation tracking interface

### 5. Notification System
- **Overdue Reminders**: Daily automated email notifications
- **Reservation Alerts**: Instant notifications when books are ready
- **Expiry Warnings**: Advance notice for expiring reservations
- **Email Templates**: Professional, branded email communications
- **Delivery Tracking**: Communication logs for audit trails

### 6. Reporting & Analytics
- **Real-time Dashboard**: Key metrics and quick actions
- **Active Loans Report**: Current loan status with due date tracking
- **Overdue Analysis**: Detailed overdue reports with fine calculations
- **Popular Books**: Analytics based on loan frequency and reservations
- **Member Activity**: Usage statistics and engagement metrics
- **Export Capabilities**: Data export for external analysis

## 🔐 Security & Permissions

### Role-Based Access Control

| Feature | Admin | Librarian | Member |
|---|---|---|---|
| View Dashboard | ✅ | ✅ | ✅ |
| Browse Books | ✅ | ✅ | ✅ |
| Manage Books | ✅ | ✅ | ❌ |
| View All Members | ✅ | ✅ | ❌ |
| Manage Members | ✅ | ✅ | ❌ |
| Process Loans | ✅ | ✅ | ❌ |
| Create Reservations | ✅ | ✅ | ✅ |
| View Reports | ✅ | ✅ | ❌ |
| System Configuration | ✅ | ❌ | ❌ |

### Security Features
- **Authentication**: Secure login with session management
- **Authorization**: Role-based permissions at API level
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Frappe ORM prevents SQL injection
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: Frappe's CSRF token validation

## 🧪 Testing & Quality Assurance

### Manual Testing Checklist

#### Authentication Flow
- [ ] User registration with email validation
- [ ] Login with valid/invalid credentials
- [ ] Role-based access control
- [ ] Session management and logout

#### Book Management
- [ ] Add new books with validation
- [ ] Edit existing book information
- [ ] Delete books (with constraint checking)
- [ ] Search functionality across multiple fields
- [ ] Availability status updates

#### Loan Processing
- [ ] Create loans for available books
- [ ] Prevent duplicate loans
- [ ] Process book returns
- [ ] Calculate overdue fines
- [ ] Extend loan periods

#### Reservation System
- [ ] Create reservations for unavailable books
- [ ] Queue position tracking
- [ ] Automatic notifications when ready
- [ ] Reservation expiry handling
- [ ] Cancel reservations

#### Notifications
- [ ] Overdue email notifications
- [ ] Reservation ready alerts
- [ ] Email template formatting
- [ ] Delivery confirmation

#### Reports
- [ ] Dashboard statistics accuracy
- [ ] Active loans report
- [ ] Overdue books analysis
- [ ] Popular books ranking
- [ ] Member activity metrics

## 🚀 Production Deployment

### Environment Configuration

\`\`\`bash
# Production environment variables
export FRAPPE_ENV=production
export DB_HOST=localhost
export DB_NAME=library_db
export DB_USER=library_user
export DB_PASSWORD=secure_password
export REDIS_URL=redis://localhost:6379
export MAIL_SERVER=smtp.gmail.com
export MAIL_PORT=587
export MAIL_USERNAME=library@yourdomain.com
export MAIL_PASSWORD=app_password
\`\`\`

### Deployment Steps

1. **Server Setup**
   \`\`\`bash
   # Install production dependencies
   sudo apt install nginx supervisor
   
   # Configure Nginx reverse proxy
   sudo cp nginx.conf /etc/nginx/sites-available/library
   sudo ln -s /etc/nginx/sites-available/library /etc/nginx/sites-enabled/
   \`\`\`

2. **Application Deployment**
   \`\`\`bash
   # Build frontend for production
   cd frontend && npm run build
   
   # Configure Frappe for production
   bench setup production
   bench setup nginx
   bench setup supervisor
   \`\`\`

3. **SSL Configuration**
   \`\`\`bash
   # Install SSL certificate
   sudo certbot --nginx -d yourdomain.com
   \`\`\`

4. **Monitoring Setup**
   \`\`\`bash
   # Configure log rotation
   sudo logrotate -d /etc/logrotate.d/frappe
   
   # Set up monitoring
   bench setup monitoring
   \`\`\`

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** with proper testing
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open Pull Request** with detailed description

### Code Standards

- **Backend**: Follow Frappe coding standards
- **Frontend**: ESLint + Prettier configuration
- **Database**: Use Frappe ORM, avoid raw SQL
- **API**: RESTful conventions with proper error handling
- **Documentation**: Update README for new features

## 📞 Support & Contact

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact judeaio120@gmail.com for urgent issues

### Common Issues & Solutions

#### Backend Issues
\`\`\`bash
# Frappe bench not starting
bench restart
bench clear-cache

# Database connection errors
bench migrate
bench setup requirements

# Permission errors
bench setup production --user frappe
\`\`\`

#### Frontend Issues
\`\`\`bash
# Node modules issues
rm -rf node_modules package-lock.json
npm install

# Build errors
npm run build
npm start
\`\`\`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Frappe Framework** - Robust backend framework
- **React Community** - Frontend ecosystem
- **TailwindCSS** - Utility-first CSS framework
- **Contributors** - All developers who contributed to this project

----

**Built with ❤️ for efficient library management**

*Last updated: January 2025*
