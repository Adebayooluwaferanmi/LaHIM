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

This package is part of the LaHIM monorepo and is automatically available to other packages via workspace protocol.

## Usage

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

## License

MIT

