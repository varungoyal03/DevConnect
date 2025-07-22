# DevConnect - Professional Networking Platform

## Overview

DevConnect is a backend API for a professional networking platform that enables developers to connect, share profiles, and build professional relationships.

---

## 🚀 Features

### Authentication & Security
- **JWT-based Authentication**: Secure token-based authentication system.
- **Password Security**: Strong password validation and bcrypt hashing.
- **HTTP-Only Cookies**: Secure cookie implementation for token storage.

### User Management
- **User Profiles**: Comprehensive user profiles with personal information, skills, and photos.
- **Email Validation**: Built-in email validation using validator library.

### Networking Features
- **Connection Requests**: Send and manage connection requests between users.
- **User Feed**: Discovery feed showing potential connections.
- **Connection Management**: View pending requests and established connections.

---

## 🛠 Tech Stack

- **Runtime**: Node.js with Express.js framework.
- **Database**: MongoDB with Mongoose ODM.
- **Authentication**: JWT tokens with bcrypt password hashing.
- **Validation**: Validator.js for input validation.
- **CORS**: Cross-origin resource sharing support.

---

## 📡 API Structure

The API follows a versioned structure with the following main routes:

- **Authentication**: `/api/v1/` - signup, login, logout.
- **Profile Management**: `/api/v1/profile` - user profile operations.
- **Connection Requests**: `/api/v1/request` - sending and managing connection requests.
- **User Operations**: `/api/v1/user` - connections, feed, and user data.

---

## 🔧 Configuration

### Environment Variables
The application requires the following environment variables:
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key for JWT token generation.
- `PORT`: Server port (defaults to 4000).
- `NODE_ENV`: Environment setting for security configurations.

### CORS Configuration
The application is configured to accept requests from:
- Local development: `http://localhost:5173`
- Production frontend: `https://codersconnect.vercel.app`

---

## 🚦 Getting Started

1.  **Database Connection**: The server automatically connects to MongoDB on startup.
2.  **Server Initialization**: The application starts on the configured port with proper error handling.
3.  **Security Features**:
    - Automatic prevention of self-connection requests.
    - Global error handling middleware.

---

## 🔐 Security Features

- **Password Strength**: Enforced strong password requirements.
- **Secure Cookies**: HTTP-only cookies with production HTTPS enforcement.
- **Input Validation**: Comprehensive validation for user inputs and email formats.
- **Database Indexing**: Optimized database queries with proper indexing.

---

## 📊 Data Models

### User Schema
Includes personal information, contact details, skills, and profile settings with built-in validation and security methods.

### Connection Request Schema
Manages the relationship states between users with status tracking (interested, accepted, rejected, ignored).

---

## Notes

This is a comprehensive backend API for a professional networking platform similar to LinkedIn, built with modern Node.js practices and security considerations. The application implements a complete authentication system, user profile management, and social networking features with proper data validation and security measures.
