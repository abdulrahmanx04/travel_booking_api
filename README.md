# Travel Booking Platform

A comprehensive NestJS-based travel booking application with user authentication, package management, booking system, and integrated payment processing via Stripe.

## 🛠️ Tech Stack

### Core Framework
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **TypeORM** - Database ORM

### Database
- **PostgreSQL** - Primary database

### Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **Passport** - Authentication middleware
- **bcrypt** - Password hashing
- **Helmet** - HTTP security headers
- **Throttler** - Rate limiting

### External Services
- **Stripe** - Payment processing
- **Cloudinary** - File storage and management
- **Nodemailer** - Email notifications (Mailtrap)

### Utilities
- **nestjs-paginate** - Pagination support
- **class-validator** - DTO validation
- **crypto** - Cryptographic operations

## 📋 Overview

This is a full-featured travel booking platform that allows users to browse travel packages, create bookings, process payments, and manage their profiles. Admins can manage packages, view bookings, and process refunds.

## 🎯 Key Features

### Authentication & User Management
- User registration with OTP email verification
- JWT-based authentication
- Password reset functionality
- User profile management with avatar upload
- Role-based access control (USER, ADMIN)

### Travel Packages
- Create and manage travel packages (Admin only)
- Upload multiple media files (images/PDFs) for packages
- View all packages with pagination
- Detailed package information including destination, price, duration, dates

### Booking System
- Create bookings for available packages
- View all user bookings with pagination
- Update booking details
- Delete bookings
- Track booking status (pending, confirmed, cancelled)
- Rate limiting to prevent abuse

### Payment Processing
- Stripe integration for secure payments
- Create checkout sessions
- Process refunds
- Webhook support for payment events
- Payment status tracking

### Admin Features
- Admin dashboard for payments
- View payment details with associated booking and user information
- Manage user bookings and packages

### File Management
- Cloudinary integration for image/file uploads
- Support for multiple file types (JPEG, PNG, WEBP, PDF)
- File deletion with cleanup

## 📁 Project Structure

```
src/
├── app.module.ts                 # Main application module
├── main.ts                       # Application entry point
├── auth/                         # Authentication module
│   ├── auth.service.ts          # Auth business logic
│   ├── auth.controller.ts       # Auth endpoints
│   ├── dto/                     # Data transfer objects
│   └── entities/                # User entity
├── user/                         # User management module
│   ├── users.service.ts         # User operations
│   ├── users.controller.ts      # User endpoints
│   └── dto/                     # User DTOs
├── booking/                      # Booking module
│   ├── booking.service.ts       # Booking logic
│   ├── booking.controller.ts    # Booking endpoints
│   ├── dto/                     # Booking DTOs
│   └── entities/                # Booking entity
├── package/                      # Package management module
│   ├── package.service.ts       # Package operations
│   ├── package.controller.ts    # Package endpoints
│   ├── dto/                     # Package DTOs
│   ├── entity/                  # Package entities
│   └── package-media.entity.ts  # Media files entity
├── payment/                      # Payment module
│   ├── payment.service.ts       # Payment processing
│   ├── payment.controller.ts    # Payment endpoints
│   └── entities/                # Payment entity
├── stripe/                       # Stripe integration
│   ├── stripe.service.ts        # Stripe operations
│   └── stripe.module.ts         # Stripe module
├── admin/                        # Admin features
│   ├── payments/                # Admin payment management
│   ├── bookings/                # Admin booking management
│   └── users/                   # Admin user management
├── cloudinary/                   # File upload service
│   ├── cloudinary.service.ts    # Upload/delete operations
│   ├── cloudinary.config.ts     # Cloudinary configuration
│   └── cloudinary.module.ts     # Cloudinary module
├── common/                       # Shared utilities
│   ├── guards/                  # Auth guards
│   ├── decorators/              # Custom decorators
│   ├── filters/                 # Exception filters
│   ├── interfaces/              # Shared interfaces
│   └── utils/                   # Email utilities
└── generated/                    # Generated types
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd travelbooking
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file with the following variables:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_DATABASE=travelbooking

# JWT
JWT_SECRET=your_jwt_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Cloudinary
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret

# Email (Mailtrap)
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_password

# Application
PORT=3000
FRONTEND_URL=http://localhost:3000
```

4. **Run the application**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/change-password` - Change password (authenticated)

### Users
- `GET /users/me` - Get current user profile (authenticated)
- `PUT /users/me` - Update user profile (authenticated)
- `DELETE /users/me` - Delete user account (authenticated)

### Packages
- `GET /packages` - Get all packages
- `GET /packages/:id` - Get package details
- `POST /packages` - Create package (Admin only)
- `POST /packages/files/:id` - Upload package media (Admin only)
- `PUT /packages/:id` - Update package (Admin only)
- `DELETE /packages/:id` - Delete package (Admin only)
- `DELETE /packages/files/:mediaId` - Delete media file (Admin only)

### Bookings
- `GET /booking` - Get user bookings (authenticated)
- `GET /booking/:id` - Get booking details (authenticated)
- `POST /booking` - Create booking (authenticated)
- `PUT /booking/:id` - Update booking (authenticated)
- `DELETE /booking/:id` - Cancel booking (authenticated)

### Payments
- `POST /payment/checkout` - Create Stripe checkout session (authenticated)
- `GET /payment/:bookingId` - Get payment details (authenticated)
- `POST /payment/refund` - Request refund (authenticated)
- `POST /payment/webhook` - Stripe webhook endpoint

## 🔐 Security Features

- JWT authentication with role-based access control
- Password hashing with bcrypt
- Rate limiting (100 requests per minute globally)
- HTTP security headers with Helmet
- CORS protection
- Input validation with class-validator
- Exception handling and logging

## 📦 Database Schema

### User
- User authentication and profile information
- Role-based access (USER, ADMIN)
- OTP verification for email
- Password reset tokens

### Package
- Travel package details
- Pricing and duration
- Start and end dates
- Associated media files

### Booking
- User bookings for packages
- Booking status tracking
- Travel date and guest count
- Price information

### Payment
- Payment transactions
- Stripe integration
- Payment status tracking
- Refund management

### PackageMedia
- Media files for packages
- File URLs and metadata
- Cloudinary public IDs

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Scripts

```bash
npm run build        # Build for production
npm run start        # Start production server
npm run start:dev    # Start development server with auto-reload
npm run start:debug  # Start with debugging enabled
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🤝 Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Open a pull request

## 📄 License

This project is licensed under the UNLICENSED license.

## 📧 Support

For support, please reach out to the development team or check the [NestJS Documentation](https://docs.nestjs.com).

---

Built with ❤️ using NestJS
