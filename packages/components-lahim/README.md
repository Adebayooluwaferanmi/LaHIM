# @lahim/components

Modern React components for LaHIM LIMS - Compatible with React 18 and Bootstrap 4.

## Overview

This package provides React components compatible with the current LaHIM tech stack:
- React 18.3.0
- Bootstrap 4.4.1
- React-Bootstrap 2.10.0
- TypeScript 5.7.0

## Status

### ✅ Phase 1: Core Components (Complete)
- Button
- Panel
- Alert (converted from class to function component for React 18)
- Spinner
- Container, Row, Column (Layout)
- Icon

### 🚧 Phase 2: Remaining Components (In Progress)
- TextInput, TextField
- Label
- DateTimePicker
- Modal
- Toast, Toaster
- Badge
- Breadcrumb
- List, ListItem
- Table
- And 60+ more components

## Installation

### As an npm package

Install the package as a dependency:

```bash
npm install @lahim/components
```

or with yarn:

```bash
yarn add @lahim/components
```

### Peer Dependencies

Make sure you have the required peer dependencies installed:

```bash
npm install bootstrap@~4.4.1 react@^18.3.0 react-bootstrap@^2.10.0 react-dom@^18.3.0
```

### Monorepo Usage

This package is part of the LaHIM monorepo and is automatically available to other packages via workspace protocol when working within the monorepo.

## Usage

### Import Components

```typescript
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@lahim/components'
```

### Import Styles

You'll need to import the Bootstrap CSS and optionally the component styles:

```typescript
// In your main entry file (e.g., index.tsx or App.tsx)
import 'bootstrap/dist/css/bootstrap.min.css'
import '@lahim/components/scss/main.scss'  // Optional: component-specific styles
```

### Use Components

```typescript
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@lahim/components'

// Use components
<Button color="primary" onClick={handleClick}>
  Click Me
</Button>

<Panel title="My Panel" collapsible>
  Content here
</Panel>

<Alert color="success" message="Operation successful!" />
```

## Build

```bash
yarn build
```

## Development

```bash
yarn dev  # Watch mode
```

## Migration from @hospitalrun/components

The API is designed to be compatible with `@hospitalrun/components`, so you can replace imports:

```typescript
// Old
import { Button } from '@hospitalrun/components'

// New
import { Button } from '@lahim/components'
```

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

