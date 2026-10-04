# Saraha

A backend API for an anonymous messaging app, inspired by Saraha. Users can register, verify their account, and receive anonymous (or signed-in) messages from others via a shareable profile link. Supports local and cloud (Cloudinary) profile picture uploads, email OTP verification, Google Sign-In, and JWT-based auth with refresh tokens.

## Features

- Register with **email or phone number** (at least one required)
- Email OTP verification on signup, with resend support
- Login with email or phone + password
- Google Sign-In (OAuth)
- Access + refresh token auth, with automatic token refresh on expiry
- Logout with token revocation (blocklist)
- Forgot/reset password via OTP
- Send anonymous or signed-in messages to a user, with optional attachments
- View received messages (with sender info populated for signed-in messages)
- Upload a profile picture (local disk or Cloudinary)
- Soft-delete account, with a scheduled job that permanently deletes accounts (and their data) after 3 months

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express 5
- **Database:** MongoDB with Mongoose
- **Auth:** JSON Web Tokens (access + refresh), bcrypt password hashing
- **Validation:** Joi
- **File uploads:** Multer (local disk + Cloudinary)
- **Email:** Nodemailer
- **Scheduled jobs:** node-schedule
- **Rate limiting:** express-rate-limit

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A running MongoDB instance (local or Atlas)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for sending OTP emails
- A Cloudinary account (if using cloud profile picture uploads)
- A Google OAuth Client ID (if using Google Sign-In)

### Installation

```bash
git clone <this-repo-url>
cd saraha
npm install
```

### Environment Variables

Create a file at `configs/local.env` in the project root with the following:

```env
PORT=3000
DB_URL=mongodb://127.0.0.1:27017/saraha

JWT_SECRET=your-long-random-secret-string

EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

> `configs/` and `node_modules/` and `uploads/` are git-ignored — never commit real credentials.

### Running the app

```bash
npm run start:dev
```

This starts the server with `--watch`, auto-restarting on file changes, and loads environment variables from `configs/local.env`.

The server runs on `http://localhost:3000` by default (or whatever `PORT` you set).

## API Endpoints

All responses follow the shape:
```json
{ "message": "...", "success": true, "data": { ... } }
```
Protected routes require an `Authorization` header with a raw JWT access token (no `Bearer` prefix).

### Auth — `/auth`

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/auth/register` | Register with email and/or phone |
| POST | `/auth/verify-account` | Confirm an account using the emailed OTP |
| POST | `/auth/resend-otp` | Resend a new OTP |
| POST | `/auth/login` | Log in with email or phone + password |
| POST | `/auth/google-login` | Log in / sign up with a Google ID token |
| PATCH | `/auth/reset-password` | Reset a forgotten password using OTP |
| POST | `/auth/logout` | Log out and revoke the current access token |

### User — `/user`

| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | `/user/` | Get the logged-in user's profile (with received messages) |
| DELETE | `/user/` | Soft-delete the logged-in user's account |
| POST | `/user/upload-profile-picture` | Upload a profile picture to local disk |
| POST | `/user/upload-profile-picture-cloud` | Upload a profile picture to Cloudinary |

### Message — `/message`

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/message/:receiver` | Send an anonymous message to a user, with optional attachments |
| POST | `/message/:receiver/sender` | Send a message as a logged-in (non-anonymous) sender |
| GET | `/message/:id` | Get a single message you received |

## Project Structure

```
src/
├── DB/
│   ├── connection.js
│   └── model/            # Mongoose schemas (user, message, token)
├── middleware/            # Auth, validation, and file-validation middleware
├── modules/
│   ├── auth/
│   ├── user/
│   └── message/           # Each module: controller, service, validation
├── utils/
│   ├── cloud/              # Cloudinary config and upload helpers
│   ├── cron-job/           # Scheduled account/data cleanup
│   ├── email/
│   ├── error/               # Async handler + global error handler
│   ├── hash/
│   ├── multer/              # Local and cloud upload configs
│   ├── otp/
│   └── token/
├── app.controller.js        # Express app bootstrap (middleware, routes, error handler)
└── index.js                 # Entry point
```

## Notes

- Verification codes (OTP) are 6 digits and expire after 15 minutes by default.
- Access tokens expire in 15 minutes; refresh tokens in 7 days. The client should send the refresh token in a `refreshtoken` header when the access token expires, and the server will issue a new token pair automatically.
- Accounts soft-deleted for more than 3 months, along with their messages and uploaded profile pictures, are permanently removed by a scheduled job that runs daily.
