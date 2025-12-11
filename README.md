# LaHIM - Laboratory & Health Information Management System

<div align="center">

<img src="https://raw.githubusercontent.com/HospitalRun/design/master/logo/horizontal/logo-on-transparent.png" alt="HospitalRun logo"/>

**A Modern Transformation of HospitalRun for Laboratory-First Healthcare Systems**

[![License](https://img.shields.io/github/license/Adebayooluwaferanmi/LaHIM)](LICENSE)

</div>

---

## Overview

**LaHIM** (Laboratory & Health Information Management System) is a comprehensive transformation of the HospitalRun open-source healthcare information system, specifically architected for laboratory-first workflows with structured data entry, ML-ready analytics, and modern microservices architecture.

This project modernizes HospitalRun by introducing:
- **Structured Laboratory Data Management** with controlled vocabularies
- **ML-Ready Data Exports** for research and analytics
- **Microservices Architecture** with modular, scalable design
- **Modern Technology Stack** (React 18, Fastify 4, TypeScript 5, Vite)
- **FHIR R4 Compliance** for interoperability

---

## Transformation Vision

### From HospitalRun to LaHIM

LaHIM transforms HospitalRun from a general-purpose HIS into a **laboratory-centric healthcare system** that prioritizes:

1. **Structured Data Entry**: All lab results use controlled vocabularies (SNOMED-CT, LOINC, UCUM) instead of free text
2. **ML-Ready Architecture**: Data is structured and coded from the start, enabling machine learning and research analytics
3. **Modular Microservices**: Each domain (LIMS, Vocabulary, Patient Portal) is a separate, scalable service
4. **Modern Technology**: Upgraded to latest stable versions of React, Fastify, TypeScript, and build tools
5. **Interoperability First**: FHIR R4 compliant, terminology-driven design

### Key Architectural Changes

- **Monorepo Structure**: Consolidated frontend, server, components, and core into a single repository
- **Service-Oriented**: Each module (Vocabulary, LIMS, Patient Portal) is an independent service
- **Offline-First**: Maintains HospitalRun's offline capabilities with improved sync mechanisms
- **Event-Driven**: Analytics-ready with event bus architecture for real-time processing
- **Terminology-Driven**: Controlled vocabularies ensure data quality and interoperability

---

## Current Status

### ✅ Completed Modules

#### 1. Vocabulary Service Module
**Status**: Complete and Production-Ready

The foundational module providing controlled vocabularies for structured data entry:
- **Organisms**: Microorganisms database with SNOMED-CT codes
- **Antibiotics**: Antimicrobial agents with ATC/RxNorm codes
- **Value Sets**: Custom dropdowns for coded lab results (blood type, urine appearance, etc.)

**Features**:
- Full CRUD API with pagination, search, and filtering
- Bulk import/export capabilities
- Frontend React hooks and reusable components
- Seed data with common pathogens and antibiotics

#### 2. LIMS (Laboratory Information Management System) Module
**Status**: Core Complete, Comprehensive Expansion In Progress

**Current Implementation** (Complete):
- **Result Management**: Comprehensive lab result entry and management
  - Numeric Results: Quantitative tests (glucose, hemoglobin, etc.)
  - Coded Results: Qualitative tests with controlled vocabularies
  - Microbiology Results: Complex structured data (organisms + antibiotic susceptibilities)
  - Text Results: Free text (minimized, discouraged)
  - Image Results: Microscope/lab images
- **Features**: Complete CRUD API, validation, ML-ready exports, frontend hooks

**Comprehensive Expansion** (In Progress):
A complete laboratory workflow management system covering:

**Pre-Analytical Stage**:
- Test order management with routing and validation
- Specimen collection tracking and scheduling
- Specimen reception, registration, and chain of custody
- Specimen processing, aliquoting, and storage management

**Analytical Stage**:
- Worklist generation and workload management
- Instrument integration and data interface
- Manual testing and data entry
- Quality Control (QC) with Westgard rules and ISO 15189 compliance
- Result validation with auto-validation and critical value detection

**Post-Analytical Stage**:
- Report generation and customization (PDF, JSON, HL7, FHIR)
- Result delivery (print, email, portal, API)
- Critical value notification
- Result interpretation and consultation

**Supporting Systems**:
- **Inventory Management**: Reagent and supply tracking, stock levels, expiration management
- **Financial Management**: Test pricing, billing, cost accounting, revenue tracking
- **Logistics Management**: Specimen transport, equipment tracking, personnel scheduling
- **Quality & Compliance**: ISO 15189 compliance, document control, audit management
- **Analytics & Reporting**: Operational, financial, quality, and clinical analytics with BI dashboards

See `LIMS_COMPREHENSIVE_DESIGN.md` for detailed architecture.

### 📋 Planned Modules

#### 3. Patient Portal Module
**Status**: Designed, Ready for Implementation

Patient access to health information:
- View health records (labs, notes, medications)
- Generate health history reports (PDF/JSON/FHIR)
- Print and email reports to external doctors
- Secure patient authentication and consent management

#### 4. External Consultation Module
**Status**: Designed, Ready for Implementation

External consultation workflow:
- Patient requests external consultation
- External doctor inputs consultation data
- Pending state until internal doctor approval
- Approved data integrated into patient record

---

## Technology Stack

### Frontend
- **React 18.3** with TypeScript 5.7
- **Vite 6.0** for modern build tooling
- **React Router v6** for navigation
- **Redux Toolkit 2.2** for state management
- **React Query (TanStack Query)** for server state
- **React Bootstrap 2.10** for UI components

### Backend
- **Fastify 4.24** with TypeScript
- **CouchDB** for primary data storage
- **PouchDB** for offline-first client sync
- **Nano** for CouchDB client

### Development Tools
- **TypeScript 5.7** for type safety
- **ESLint & Prettier** for code quality
- **Yarn Workspaces** for monorepo management
- **Docker Compose** for local CouchDB

---

## Architecture

### Module Dependencies

```
Vocabulary Service (Complete)
    ↓
LIMS Module (Complete)
    ↓
Patient Portal (Planned)
    ↓
External Consultation (Planned)
```

### Service Architecture

- **API Gateway**: Centralized routing and authentication
- **Microservices**: Each module is an independent service
- **Shared Services**: Notifications, Documents, Audit
- **Event Bus**: Cross-module communication (Kafka/Redpanda planned)
- **Database**: Separate CouchDB databases per module

### Data Standards

- **Terminologies**: SNOMED-CT, LOINC, UCUM, RxNorm/ATC
- **Interoperability**: FHIR R4 compliant
- **Structured Data**: All non-numeric results use controlled vocabularies
- **ML-Ready**: Structured exports for analytics and research

---

## Roadmap

### Phase 1: Foundation ✅ COMPLETE
1. ✅ **Vocabulary Service** - Controlled vocabularies for structured data
2. ✅ **LIMS Core** - Lab result management (result entry, validation, export)
3. ✅ **Modernization** - Upgraded to React 18, Fastify 4, TypeScript 5, Vite

### Phase 2: Comprehensive LIMS Expansion 🔄 IN PROGRESS
**Pre-Analytical Stage**:
1. 📋 **Order Management** - Test order entry, validation, routing, status tracking
2. 📋 **Specimen Management** - Collection, reception, registration, processing, storage
3. 📋 **Chain of Custody** - Complete specimen tracking and documentation

**Analytical Stage**:
4. 📋 **Worklist Management** - Worklist generation, workload balancing, batch processing
5. 📋 **Instrument Integration** - Instrument registration, calibration, data interface
6. 📋 **Quality Control** - QC testing, Westgard rules, ISO 15189 compliance
7. 📋 **Result Validation** - Auto-validation, critical values, delta checks

**Post-Analytical Stage**:
8. 📋 **Report Generation** - Multi-format reports (PDF, JSON, HL7, FHIR)
9. 📋 **Result Delivery** - Multi-channel delivery, critical value notification
10. 📋 **Result Interpretation** - Pathologist review, clinical correlation

**Supporting Systems**:
11. 📋 **Inventory Management** - Reagent tracking, stock management, expiration alerts
12. 📋 **Financial Management** - Test pricing, billing, cost accounting, revenue tracking
13. 📋 **Logistics Management** - Specimen transport, equipment tracking, personnel scheduling
14. 📋 **Quality & Compliance** - ISO 15189 compliance, document control, audit management
15. 📋 **Analytics & Reporting** - Operational, financial, quality, and clinical analytics

### Phase 3: Patient Access & Integration 📋 PLANNED
1. 📋 **Patient Portal Module** - Patient access to health information
2. 📋 **External Consultation Module** - External consultation workflow
3. 📋 **Cross-Module Integration** - Connect all modules together
4. 📋 **Notification System** - SMS/Email/WhatsApp notifications

### Phase 4: Advanced Features 📋 FUTURE
1. 📋 **Analytics Pipeline** - Real-time analytics with Kafka/ClickHouse
2. 📋 **ML/AI Integration** - Predictive analytics, anomaly detection
3. 📋 **Microscope Integration** - Direct integration with digital microscopes
4. 📋 **HL7 v2 Interfaces** - Legacy system integration
5. 📋 **Mobile Apps** - React Native offline-first mobile applications
6. 📋 **Multi-Tenancy** - Support for multiple healthcare facilities
7. 📋 **Security Hardening** - Enhanced authentication, authorization, audit logging

---

## Getting Started

### Prerequisites

- **Node.js 18+** (use `nvm` with `.nvmrc`)
- **Yarn 1.22+** or npm 9+
- **Docker** (for CouchDB)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LaHIM
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start CouchDB**
   ```bash
   docker compose up -d couchdb
   ```
   - Admin UI: http://localhost:5984/_utils (credentials: `dev/dev`)

4. **Configure environment**
   ```bash
   # Backend
   cp packages/server/.env.example packages/server/.env
   # Ensure COUCHDB_URL=http://dev:dev@localhost:5984
   
   # Frontend
   cp packages/frontend/.env.example packages/frontend/.env
   # Set REACT_APP_HOSPITALRUN_API=http://localhost:3000
   ```

5. **Seed vocabularies** (optional but recommended)
   ```bash
   yarn workspace @hospitalrun/server seed:vocabularies
   ```

6. **Start development servers**
   ```bash
   # Backend (port 3000)
   yarn dev:server
   
   # Frontend (port 3001) - in another terminal
   yarn dev:frontend
   ```

7. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health
   - CouchDB Admin: http://localhost:5984/_utils

---

## API Endpoints

### Vocabulary Service
- `GET /vocabularies/organisms` - List organisms
- `GET /vocabularies/antibiotics` - List antibiotics
- `GET /vocabularies/value-sets` - List value sets
- `POST /vocabularies/bulk-import` - Bulk import
- `GET /vocabularies/export` - Export all vocabularies

### LIMS Service

**Result Management** (Current):
- `POST /lab-results` - Create lab result
- `GET /lab-results` - Query lab results
- `GET /lab-results/:id` - Get result by ID
- `PUT /lab-results/:id` - Update result
- `DELETE /lab-results/:id` - Soft delete
- `GET /lab-results/export/ml` - ML-ready export

**Pre-Analytical** (Planned):
- `POST /lab-orders` - Create lab order
- `GET /lab-orders` - Query orders
- `POST /specimens` - Register specimen
- `GET /specimens` - Query specimens

**Analytical** (Planned):
- `POST /worklists` - Generate worklist
- `POST /qc-results` - Enter QC result
- `GET /qc-results` - Query QC results
- `POST /instrument-results` - Import instrument results

**Post-Analytical** (Planned):
- `POST /reports/generate` - Generate report
- `POST /reports/:id/deliver` - Deliver report

**Inventory** (Planned):
- `GET /inventory/items` - List inventory items
- `POST /inventory/receive` - Receive inventory
- `POST /inventory/issue` - Issue inventory

**Financial** (Planned):
- `GET /financial/pricing` - Get test pricing
- `POST /financial/bills` - Generate bill
- `GET /financial/revenue` - Revenue reports

**Analytics** (Planned):
- `GET /analytics/dashboard` - Dashboard data
- `GET /analytics/reports` - Generate analytics report

### Health Check
- `GET /health` - Service health status

---

## Development

### Project Structure

```
LaHIM/
├── packages/
│   ├── frontend/          # React frontend application
│   ├── server/            # Fastify backend server
│   ├── components/        # Shared React components
│   ├── core/              # Core models and schemas
│   └── cli/               # Command-line tools
├── docs/                  # Detailed documentation (gitignored)
└── docker-compose.yml     # Local CouchDB setup
```

### Available Scripts

```bash
# Development
yarn dev:server          # Start backend server
yarn dev:frontend         # Start frontend dev server
yarn dev:db              # Start CouchDB

# Building
yarn build:frontend      # Build frontend for production

# Database
yarn workspace @hospitalrun/server seed:vocabularies  # Seed vocabularies
```

---

## Key Improvements Over Original HospitalRun

### 1. Structured Data Entry
- **Before**: Free text lab results
- **After**: Controlled vocabularies for all non-numeric results
- **Benefit**: ML-ready data, better analytics, interoperability

### 2. Modern Technology Stack
- **Before**: React 16, Fastify 2, TypeScript 3.8, Webpack
- **After**: React 18, Fastify 4, TypeScript 5.7, Vite
- **Benefit**: Better performance, modern features, improved DX

### 3. Modular Architecture
- **Before**: Monolithic structure
- **After**: Microservices with clear boundaries
- **Benefit**: Scalability, maintainability, independent deployment

### 4. ML-Ready Exports
- **Before**: No structured export capability
- **After**: JSON/CSV exports with coded, structured data
- **Benefit**: Research-ready, analytics-friendly

### 5. Enhanced Type Safety
- **Before**: Minimal TypeScript usage
- **After**: Comprehensive type definitions
- **Benefit**: Fewer runtime errors, better IDE support

---

## Publishable Packages

This monorepo contains several packages that can be published to npm and used as dependencies in other projects:

### Available Packages

1. **[@hospitalrun/core](packages/core/)** - Shared interfaces and models
   - Install: `npm install @hospitalrun/core`
   - Provides: TypeScript types, schemas, and shared models

2. **[@hospitalrun/components](packages/components/)** - React component library (React 16 compatible)
   - Install: `npm install @hospitalrun/components`
   - Provides: Reusable React components for HospitalRun

3. **[@lahim/components](packages/components-lahim/)** - Modern React components (React 18 compatible)
   - Install: `npm install @lahim/components`
   - Provides: Modern React components compatible with React 18 and Bootstrap 4

4. **[@hospitalrun/cli](packages/cli/)** - Command-line interface
   - Install: `npm install -g @hospitalrun/cli` (global) or `npm install --save-dev @hospitalrun/cli` (local)
   - Provides: CLI tools for CouchDB design document management

5. **[@lahim/loinc](packages/loinc/)** - LOINC code lookup and search
   - Install: `npm install @lahim/loinc`
   - Provides: Search and lookup functionality for LOINC codes (369,000+ codes)

### Using Packages as Dependencies

Each package has detailed installation and usage instructions in its README file:
- See `packages/core/README.md` for `@hospitalrun/core`
- See `packages/components/README.md` for `@hospitalrun/components`
- See `packages/components-lahim/README.md` for `@lahim/components`
- See `packages/cli/README.md` for `@hospitalrun/cli`
- See `packages/loinc/README.md` for `@lahim/loinc`

### Publishing Packages

To publish a package to npm:

1. Navigate to the package directory: `cd packages/<package-name>`
2. Build the package: `npm run build`
3. Test the build: `npm pack` (creates a tarball for local testing)
4. Publish: `npm publish --access public` (required for scoped packages)

Note: Some packages use semantic-release for automated versioning and publishing based on conventional commits.

---

## Contributing

We welcome contributions! Please see our contributing guidelines for:
- Code style and standards
- Pull request process
- Testing requirements
- Documentation standards

---

## License

Released under the [MIT License](LICENSE).

---

## Acknowledgments

Built on the foundation of [HospitalRun](https://github.com/HospitalRun/hospitalrun), an open-source healthcare information system.

**Original HospitalRun Team**: Thank you for creating an excellent foundation for healthcare systems in resource-limited settings.

---

## Contact & Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join our community discussions
- **Documentation**: See detailed docs in the `docs/` directory (local development)

---

<div align="center">

**LaHIM** - Transforming HospitalRun for Laboratory-First Healthcare

*Last Updated: November 2024*

</div>
