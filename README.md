# DevConnect - Professional Developer Networking Platform

A full-stack backend API for connecting developers worldwide. Built with Node.js, Express, and MongoDB to facilitate professional networking, skill sharing, and career growth within the developer community.

---

## 🌟 Key Features

### 🔐 Secure Authentication System
- **JWT-based Authentication** with HTTP-only cookies.
- **Password Security** with bcrypt hashing and strength validation.
- **Session Management** with automatic expiration and secure cookie configuration.

### 👤 Rich User Profiles
- **Comprehensive Profiles** including skills, experience, and personal information.
- **Profile Validation** with email verification and URL validation.
- **Default Profile Images** and customizable about sections.

### 🤝 Smart Connection System
- **Connection Requests** with status tracking (interested, accepted, rejected, ignored).
- **Intelligent Feed Algorithm** that excludes already connected users.
- **Connection Management** with pending requests and established connections.

---

## 🏗 Architecture & Tech Stack

### Backend Technologies
- **Node.js** with Express.js framework.
- **MongoDB** with Mongoose ODM for data persistence.
- **JWT** for stateless authentication.
- **bcrypt** for password hashing.
- **Validator.js** for input validation.

### Security Features
- **CORS Configuration** for cross-origin requests.
- **Environment-based Security** with production HTTPS enforcement.
- **Input Sanitization** and validation at multiple layers.
- **Self-connection Prevention**.

---

## 📡 API Endpoints

### Authentication Routes (`/api/v1/`)
- `POST /signup` - Create new developer account.
- `POST /login` - Authenticate existing user.
- `POST /logout` - Clear authentication session.

### Profile Management (`/api/v1/profile/`)
- `GET /view` - View user profile.
- `PATCH /edit` - Update profile information.

### Connection System (`/api/v1/request/`)
- `POST /send/:status/:toUserId` - Send connection request.
- `POST /review/:status/:requestId` - Accept/reject connection request.

### User Operations (`/api/v1/`)
- `GET /user/connections` - Get established connections.
- `GET /user/requests/received` - Get pending connection requests.
- `GET /feed` - Get discovery feed with potential connections.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance
- Environment variables configured

### Environment Configuration
Create a `.env` file with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=4000
NODE_ENV=development
