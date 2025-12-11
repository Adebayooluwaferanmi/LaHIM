# @lahim/loinc

LOINC code lookup and search package for LaHIM LIMS.

## Overview

This package provides search and lookup functionality for LOINC (Logical Observation Identifiers Names and Codes) codes used in the LaHIM Laboratory Information Management System.

## Features

- **369,000+ LOINC codes** - Complete LOINC code database
- **Fast search** - Search by code or description text
- **Type-safe** - Full TypeScript support
- **Lightweight** - Minimal dependencies

## Installation

### As an npm package

Install the package as a dependency:

```bash
npm install @lahim/loinc
```

or with yarn:

```bash
yarn add @lahim/loinc
```

### Monorepo Usage

This package is part of the LaHIM monorepo and is automatically available to other packages via workspace protocol when working within the monorepo.

## Usage

```typescript
import { searchLOINC, getLOINCByCode } from '@lahim/loinc'

// Search for LOINC codes
const results = searchLOINC('glucose', 10)
// Returns array of matching LOINC codes

// Get specific code
const code = getLOINCByCode('2339-0')
// Returns: { coding: '2339-0', text: 'Glucose [Mass/volume] in Blood' }
```

## API

### `searchLOINC(query: string, limit?: number): LOINCCode[]`

Search LOINC codes by code or description.

- **query**: Search term (searches in both `coding` and `text` fields)
- **limit**: Maximum results (default: 50)
- **Returns**: Array of matching LOINC codes

### `getLOINCByCode(coding: string): LOINCCode | undefined`

Get a specific LOINC code by its coding value.

- **coding**: The LOINC code (e.g., "2339-0")
- **Returns**: LOINC code object or undefined if not found

### `getLOINCCount(): number`

Get the total number of LOINC codes available.

## Types

```typescript
interface LOINCCode {
  coding: string  // LOINC code (e.g., "2339-0")
  text: string   // Description (e.g., "Glucose [Mass/volume] in Blood")
}
```

## Server API Endpoints

The server exposes these endpoints:

- `GET /loinc/search?q=glucose&limit=50` - Search LOINC codes
- `GET /loinc/:code` - Get specific LOINC code by coding value

## Publishing

This package can be published to npm. Before publishing:

1. **Build the package**:
   ```bash
   npm run build
   ```

2. **Test the build**:
   ```bash
   npm pack
   ```
   This creates a tarball you can test locally.

3. **Publish to npm** (requires npm login):
   ```bash
   npm publish --access public
   ```

   Note: The `--access public` flag is required for scoped packages (`@lahim/*`) to publish to the public npm registry.

## License

MIT

