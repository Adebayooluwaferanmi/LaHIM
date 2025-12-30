# Patient Portal Server

Patient Portal & External Consultation API service for LaHIM.

## Overview

This microservice provides:
- Patient authentication and profile management
- External consultation workflow (referrals, scheduling, messaging)
- Secure document sharing
- Integration endpoints for LaHIM core

## Setup

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database
- SMTP server (optional, for email notifications)

### Installation

```bash
# Install dependencies
yarn install

# Generate Prisma client
yarn db:generate

# Run database migrations
yarn db:migrate
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:

- `PORTAL_DATABASE_URL` - PostgreSQL connection string
- `PATIENT_PORTAL_JWT_SECRET` - JWT signing secret (use a secure random string)
- `PORTAL_SERVICE_TOKEN` - Token for LaHIM core integration calls
- `PATIENT_PORTAL_FRONTEND_URL` - Frontend URL for CORS and email links

Optional (for email notifications):

- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (default: 587)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - From address for emails

### Development

```bash
# Start development server with hot reload
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

## API Endpoints

### Authentication

- `POST /auth/register-patient` - Register new patient
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/activate-invite` - Activate consultant invite
- `POST /auth/request-reset` - Request password reset
- `POST /auth/reset` - Reset password with token
- `POST /auth/verify-reset-token` - Verify reset token

### Patients

- `GET /patients/me` - Get current patient profile
- `PATCH /patients/me` - Update patient profile
- `GET /patients/me/appointments` - Get patient appointments
- `GET /patients/me/consultations` - Get patient consultations

### Consultations

- `GET /consultations` - List consultations (role-based)
- `GET /consultations/:id` - Get consultation details
- `POST /consultations/:id/slots` - Propose appointment slots (consultant)
- `POST /consultations/:id/complete` - Complete consultation (consultant)

### Messaging

- `GET /consultations/:id/messages` - Get messages for consultation
- `POST /consultations/:id/messages` - Send message

### Documents

- `GET /consultations/:id/documents` - List documents
- `POST /consultations/:id/documents` - Create document metadata
- `POST /consultations/:id/documents/upload` - Upload file
- `GET /documents/:id/download` - Download document

### Integrations (LaHIM Core)

- `POST /integrations/referrals` - Create referral (requires X-Service-Token)
- `POST /integrations/consultant-invites` - Invite consultant (requires X-Service-Token)

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

Key entities:
- `PortalUser` - Authentication and user accounts
- `PatientProfile` - Patient demographics and preferences
- `ExternalConsultant` - Consultant information
- `ConsultationReferral` - Referral from LaHIM core
- `ConsultationCase` - Consultation lifecycle
- `AppointmentSlot` - Proposed/confirmed appointment times
- `MessageThread` / `Message` - Secure messaging
- `ConsultationDocument` - Document metadata and storage

## Integration with LaHIM Core

The portal service exposes integration endpoints that LaHIM core can call:

1. **Create Referral**: `POST /integrations/referrals`
   - Requires `X-Service-Token` header
   - Creates patient profile if needed
   - Creates referral and consultation case

2. **Invite Consultant**: `POST /integrations/consultant-invites`
   - Requires `X-Service-Token` header
   - Creates consultant user account
   - Sends activation email

## File Storage

Documents are stored in `uploads/consultations/` directory by default. For production, consider:
- Using S3-compatible object storage
- Implementing secure download tokens
- Adding virus scanning

## Security

- JWT-based authentication with access/refresh tokens
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- Service token authentication for integration endpoints

## License

MIT


