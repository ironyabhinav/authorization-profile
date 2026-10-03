# MLCOE Authentication & User Profile API

A Node.js + Express + MongoDB backend implementing the MLCOE Authentication & User Profile API task.

## Features

- User signup with name, email and bcrypt-hashed password
- 6-digit OTP email verification
- OTP expiry after 10 minutes
- OTP resend with rate limiting (3 requests / 10 minutes per IP)
- JWT login for verified users
- Protected profile routes
- Profile update
- Profile image upload to Cloudinary
- Old profile image removal when replaced
- JPG/JPEG/PNG validation
- 2 MB upload limit
- Joi request validation
- Secrets stored in `.env`
- Postman collection included

## Project structure

```text
auth-user-profile-api/
├── config/
│   ├── cloudinary.js
│   ├── db.js
│   └── mailer.js
├── controllers/
│   ├── authController.js
│   └── userController.js
├── middleware/
│   ├── auth.js
│   ├── otpLimiter.js
│   ├── upload.js
│   └── validate.js
├── models/
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── cloudinaryUpload.js
│   ├── generateOtp.js
│   ├── hashOtp.js
│   └── sendOtpEmail.js
├── .env.example
├── .gitignore
├── package.json
├── postman_collection.json
├── README.md
└── server.js
```

## 1. Install

```bash
npm install
```

For development:

```bash
npm run dev
```

For normal run:

```bash
npm start
```

## 2. Environment variables

Copy `.env.example` to `.env` and fill in your real credentials.

Do not upload `.env` to GitHub.

Required services:

- MongoDB Atlas
- Gmail SMTP/App Password
- Cloudinary

## 3. MongoDB Atlas

Create a free MongoDB Atlas cluster.

Create a database user and allow your development IP address in Network Access.

Copy the Node.js connection string and put it in:

```env
MONGO_URI=your_connection_string
```

## 4. Gmail SMTP

Use a Gmail account with an App Password.

Set:

```env
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_16_character_app_password
```

The Gmail account's normal password should not be used as the SMTP password.

## 5. Cloudinary

Create a Cloudinary account and copy:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 6. API flow for evaluation

### A. Start server

```bash
npm run dev
```

Expected:

```text
MongoDB connected successfully
Server running on http://localhost:8001
```

### B. Check server

```http
GET http://localhost:8001/
```

### C. Signup

```http
POST http://localhost:8001/api/auth/signup
Content-Type: application/json

{
  "name": "Abhinav Gupta",
  "email": "your-real-email@example.com",
  "password": "password123"
}
```

An OTP is sent to the email.

### D. Verify OTP

```http
POST http://localhost:8001/api/auth/verify-otp
Content-Type: application/json

{
  "email": "your-real-email@example.com",
  "otp": "123456"
}
```

Replace `123456` with the OTP received by email.

### E. Login

```http
POST http://localhost:8001/api/auth/login
Content-Type: application/json

{
  "email": "your-real-email@example.com",
  "password": "password123"
}
```

Copy the returned JWT token.

### F. Get profile

```http
GET http://localhost:8001/api/user/profile
Authorization: Bearer YOUR_TOKEN
```

The password and OTP fields are not returned.

### G. Update profile

```http
PUT http://localhost:8001/api/user/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Abhinav",
  "mobile": "9876543210"
}
```

### H. Upload profile image

```http
PUT http://localhost:8001/api/user/profile/image
Authorization: Bearer YOUR_TOKEN
```

Use `multipart/form-data` and a file field named:

```text
image
```

Only JPG/JPEG/PNG up to 2 MB are accepted.

The returned Cloudinary `secure_url` and `public_id` are saved in MongoDB.

When a new image replaces the old image, the old Cloudinary asset is deleted.

## API endpoints

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/signup` | No |
| POST | `/api/auth/verify-otp` | No |
| POST | `/api/auth/resend-otp` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/user/profile` | JWT |
| PUT | `/api/user/profile` | JWT |
| PUT | `/api/user/profile/image` | JWT |

## Postman

Import `postman_collection.json`.

The collection uses:

- `baseUrl` = `http://localhost:8001`
- `email` = your test email
- `token` = JWT returned from login

After login, copy the token into the `token` collection variable before testing protected routes.

## Evaluation checklist

- [x] Signup
- [x] Password hashing with bcrypt
- [x] OTP generation
- [x] OTP email delivery
- [x] OTP expiry
- [x] OTP resend
- [x] OTP rate limiting
- [x] Login
- [x] JWT generation
- [x] JWT protected routes
- [x] Profile GET
- [x] Profile UPDATE
- [x] Cloudinary upload
- [x] Old Cloudinary image deletion
- [x] File type restriction
- [x] 2 MB file size restriction
- [x] Joi validation
- [x] No password in API responses
- [x] `.env` excluded from Git
