# Patient Portal Frontend

React frontend application for the LaHIM Patient Portal.

## Overview

This is a React application built with Vite that provides:
- Patient authentication and profile management
- Consultation viewing and messaging
- Document access
- External consultant dashboard and case management

## Setup

### Prerequisites

- Node.js >= 18.0.0
- Yarn or npm

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

The application will be available at `http://localhost:3002`

### Environment Variables

Create a `.env` file in the root of this package:

```env
VITE_PORTAL_API_URL=http://localhost:4001
```

## Development

```bash
# Start development server with hot reload
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

## Project Structure

```
src/
  api/              # API client and service modules
  components/       # Reusable React components
  contexts/        # React contexts (Auth, etc.)
  pages/           # Page components
    - Public pages (Login, Register, etc.)
    - Patient pages (Dashboard, Profile, Consultations)
    - Consultant pages (ConsultantDashboard, etc.)
```

## Features

### Patient Features
- Registration and login
- Profile management
- View consultations and appointments
- Secure messaging with consultants
- Document viewing and download

### Consultant Features
- Invite activation
- Consultation case management
- Appointment slot proposal
- Consultation completion with notes
- Document upload

## Technologies

- React 18
- React Router 6
- TanStack Query (React Query)
- Bootstrap 4
- @lahim/components
- Vite

## License

MIT

