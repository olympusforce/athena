# File Organization

Proper file and directory structure for maintainable, scalable frontend code in the the application.

---

## FSD Layers

Code is organized with **Feature-Sliced Design**, with the `features` layer
renamed **`modules`**.

```
src/
  app/          # providers, router mount, global styles, entrypoint
  pages/        # route-level screens, one slice per screen
  widgets/      # self-contained composite UI blocks
  modules/      # user-facing interactions (FSD "features", renamed)
  entities/     # business entities and their data access
  shared/       # reusable, domain-agnostic: ui, lib, api, config
```

**Import rule**: a layer may import only from layers **below** it.

```
app → pages → widgets → modules → entities → shared
```

Never sideways within a layer, never upward. `shared` imports nothing above it.

**Slice segments**: every slice under `pages/`, `widgets/`, `modules/`, and
`entities/` uses these five segments.

| Segment   | Holds                                              |
| --------- | -------------------------------------------------- |
| `ui/`     | Components and their styles                        |
| `model/`  | Hooks, context, types, query keys, state           |
| `api/`    | HTTP services, request/response mapping            |
| `lib/`    | Slice-local pure utilities                         |
| `config/` | Slice-local constants                              |

`shared/` has no slices — its segments sit directly under it: `shared/ui/`,
`shared/lib/`, `shared/api/`, `shared/config/`.

**TanStack Router**: the router owns a physical `src/routes/` tree and generates
into it. That tree is **not** an FSD layer. Each `routes/**/index.tsx` stays a
thin binding — `createFileRoute`, loader, lazy import — and delegates all
rendering to a `pages/` slice.

```
src/routes/post-list/index.tsx  ->  lazy imports  ->  src/pages/post-list/
```

---

## modules/ vs shared/ui/ Distinction

### modules/ Directory

**Purpose**: Domain-specific interactions with their own logic, API, and components

**When to use:**

- Module has multiple related components
- Module has its own API endpoints
- Module has domain-specific logic
- Module has custom hooks/utilities

**Examples:**

- `modules/post-manage/` - Project catalog/post management
- `modules/blog-build/` - Blog builder and rendering
- `modules/auth/` - Authentication flows

**Structure:**

```
modules/
  my-module/
    ui/
      my-module-main.tsx      # Main component
      sub-components/         # Related components
    model/
      use-my-module.ts        # Custom hooks
      use-suspense-my-module.ts # Suspense hooks
      my-module.type.ts       # TypeScript types
    api/
      my-module.api.ts        # API service layer
    lib/
      my-module.util.ts       # Utility functions
    config/
      my-module.const.ts      # Constants
    index.ts                  # Public exports
```

### shared/ui/ Directory

**Purpose**: Truly reusable components used across multiple modules

**When to use:**

- Component is used in 3+ places
- Component is generic (no domain-specific logic)
- Component is a UI primitive or pattern

**Examples:**

- `shared/ui/suspense-loader/` - Loading wrapper
- `shared/ui/custom-app-bar/` - Application header
- `shared/ui/error-boundary/` - Error handling
- `shared/ui/loading-overlay/` - Loading overlay

**Structure:**

```
shared/ui/
  suspense-loader/
    suspense-loader.tsx
    suspense-loader.test.tsx
  custom-app-bar/
    custom-app-bar.tsx
    custom-app-bar.test.tsx
```

---

## Module Directory Structure (Detailed)

### Complete Module Example

Based on the post management structure. Note how one old "posts feature" splits
across three FSD layers: the entity owns the data, the module owns the
interaction, the widget owns the composed block.

```
entities/
  post/
    api/
      post.api.ts                  # API service layer (GET, POST, PUT, DELETE)

    model/
      post.type.ts                 # TypeScript types/interfaces
      post.query.ts                # Query key factories

    ui/
      post-card.tsx                # Entity-level presentation

    index.ts                       # Public API exports

modules/
  post-manage/
    ui/
      drawers/
        project-post-drawer/
          project-post-drawer.tsx
      cells/
        editors/
          text-edit-cell.tsx
        renderers/
          date-cell.tsx
      toolbar/
        custom-toolbar.tsx

    model/
      use-post-query.ts            # Regular queries
      use-suspense-post.ts         # Suspense queries
      use-post-mutation.ts         # Mutations
      use-grid-layout.ts           # Module-specific hooks
      post.context.tsx             # React context (if needed)

    lib/
      post.util.ts                 # Utility functions
      validation.util.ts           # Validation logic

    index.ts                       # Public API exports

widgets/
  post-table/
    ui/
      post-table.tsx               # Main container component
      grids/
        post-data-grid/
          post-data-grid.tsx

    index.ts                       # Public API exports
```

### Subdirectory Guidelines

#### api/ Directory

**Purpose**: Centralized API calls for the slice

**Files:**

- `{slice}.api.ts` - Main API service

**Pattern:**

```typescript
// modules/my-module/api/my-module.api.ts
import apiClient from '~shared/api/api-client';

export const myModuleApi = {
  getItem: async (id: number) => {
    const { data } = await apiClient.get(`/blog/items/${id}`);
    return data;
  },
  createItem: async (payload) => {
    const { data } = await apiClient.post('/blog/items', payload);
    return data;
  },
};
```

#### ui/ Directory

**Purpose**: Slice-specific components

**Organization:**

- Flat structure if <5 components
- Subdirectories by responsibility if >5 components

**Examples:**

```
ui/
  my-module-main.tsx          # Main component
  my-module-header.tsx        # Supporting components
  my-module-footer.tsx

  # OR with subdirectories:
  containers/
    my-module-container.tsx
  presentational/
    my-module-display.tsx
  blogs/
    my-module-blog.tsx
```

#### model/ Directory

**Purpose**: Custom hooks, types, and state for the slice

**Naming:**

- `use` prefix (kebab-case)
- Descriptive of what they do

**Examples:**

```
model/
  use-my-module.ts              # Main hook
  use-suspense-my-module.ts     # Suspense version
  use-my-module-mutation.ts     # Mutations
  use-my-module-filter.ts       # Filters/search
  my-module.type.ts             # Types and interfaces
```

#### lib/ Directory

**Purpose**: Utility functions specific to the slice

**Examples:**

```
lib/
  my-module.util.ts             # General utilities
  validation.util.ts            # Validation logic
  transblogers.util.ts          # Data transblogations
```

#### config/ Directory

**Purpose**: Slice-local constants and configuration

**Files:**

```
config/
  my-module.const.ts            # Main constants, exported
  internal.const.ts             # Internal constants (not exported)
```

---

## Import Aliases (Vite Configuration)

### Available Aliases

From `vite.config.ts`:

| Alias        | Resolves To      | Use For                        |
| ------------ | ---------------- | ------------------------------ |
| `@/`         | `src/`           | Absolute imports from src root |
| `~app`       | `src/app`        | App-level setup                |
| `~pages`     | `src/pages`      | Route-level screens            |
| `~widgets`   | `src/widgets`    | Composite UI blocks            |
| `~modules`   | `src/modules`    | Module imports                 |
| `~entities`  | `src/entities`   | Business entity imports        |
| `~shared`    | `src/shared`     | Reusable, domain-agnostic code |

### Usage Examples

```typescript
// ✅ PREFERRED - Use aliases for absolute imports
import { apiClient } from '~shared/api/api-client';
import { SuspenseLoader } from '~shared/ui/suspense-loader';
import { postApi } from '~entities/post/api/post.api';
import type { User } from '~entities/user/model/user.type';

// ❌ AVOID - Relative paths from deep nesting
import { apiClient } from '../../../shared/api/api-client';
import { SuspenseLoader } from '../../../shared/ui/suspense-loader';
```

### When to Use Which Alias

**@/ (General)**:

- App entry: `@/app/main`
- Router tree: `@/routes/__root`

**~entities (Entity Imports)**:

```typescript
import type { Post } from '~entities/post/model/post.type';
import type { User, UserRole } from '~entities/user/model/user.type';
```

**~shared (Reusable Code)**:

```typescript
import { SuspenseLoader } from '~shared/ui/suspense-loader';
import { CustomAppBar } from '~shared/ui/custom-app-bar';
import { ErrorBoundary } from '~shared/ui/error-boundary';
```

**~modules (Module Imports)**:

```typescript
import { postApi } from '~entities/post/api/post.api';
import { useAuth } from '~modules/auth/model/use-auth';
```

---

## File Naming Conventions

All file and directory names are **fully lowercase with hyphens**. Files with a
specific scope add a scope token: `<slug>.<scope>.<ext>`.

Exported identifiers are unaffected — `post-table.tsx` still exports
`PostTable`. Only the path string is kebab-case.

### Components

**Pattern**: kebab-case with `.tsx` extension, no scope token

```
my-component.tsx
post-data-grid.tsx
custom-app-bar.tsx
```

**Avoid:**

- camelCase: `myComponent.tsx` ❌
- PascalCase: `MyComponent.tsx` ❌
- All caps: `MYCOMPONENT.tsx` ❌

**Exception — router parameter files:**

TanStack Router derives the parameter name from the filename, and that name must
be a valid JavaScript identifier for destructuring. `$postId.tsx` yields
`const { postId } = Route.useParams()`. A kebab-cased `$post-id.tsx` would yield
`params['post-id']`, which cannot be destructured. Keep `$param` segments in
camelCase.

```
routes/posts/$postId.tsx        ✅
routes/posts/$post-id.tsx       ❌ breaks useParams destructuring
```

### Hooks

**Pattern**: kebab-case with `use` prefix, `.ts` extension, no scope token

```
use-my-module.ts
use-suspense-post.ts
use-auth.ts
use-grid-layout.ts
```

The `use` prefix already declares the scope, so no `.hook` token is added.

### API Services

**Pattern**: kebab-case with `.api` scope, `.ts` extension

```
my-module.api.ts
post.api.ts
user.api.ts
```

### Helpers/Utilities

**Pattern**: kebab-case with `.util` scope, `.ts` extension

```
my-module.util.ts
validation.util.ts
transblogers.util.ts
```

### Types

**Pattern**: kebab-case with `.type` scope, or `index.ts` for a barrel

```
model/index.ts
model/post.type.ts
model/user.type.ts
```

### Other Scopes

**Pattern**: one singular scope token per concept

```
post.query.ts            # Query key factories
post.context.tsx         # React context
post.schema.ts           # Zod / validation schemas
post.const.ts            # Constants
post-card.style.ts       # Component styles
token.storage.ts         # Browser storage
```

---

## When to Create a New Module

### Create New Module When:

- Multiple related components (>3)
- Has own API endpoints
- Domain-specific logic
- Will grow over time
- Reused across multiple routes

**Example:** `modules/post-manage/`

- 20+ components
- Own API service
- Complex state management
- Used in multiple routes

### Add to Existing Module When:

- Related to existing module
- Shares same API
- Logically grouped
- Extends existing functionality

**Example:** Adding export dialog to post-manage module

### Create Reusable Component When:

- Used across 3+ modules
- Generic, no domain logic
- Pure presentation
- Shared pattern

**Example:** `shared/ui/suspense-loader/`

---

## Import Organization

### Import Order (Recommended)

```typescript
// 1. React and React-related
import React, { useState, useCallback, useMemo } from 'react';
import { lazy } from 'react';

// 2. Third-party libraries (alphabetical)
import { Box, Paper, Button, Grid } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

// 3. Alias imports (@ first, then ~ by descending layer)
import { router } from '@/app/router';
import { PostTable } from '~widgets/post-table';
import { useAuth } from '~modules/auth/model/use-auth';
import { postApi } from '~entities/post/api/post.api';
import { apiClient } from '~shared/api/api-client';
import { useMuiSnackbar } from '~shared/lib/use-mui-snackbar';
import { SuspenseLoader } from '~shared/ui/suspense-loader';

// 4. Type imports (grouped)
import type { Post } from '~entities/post/model/post.type';
import type { User } from '~entities/user/model/user.type';

// 5. Relative imports (same slice)
import { MySubComponent } from './my-sub-component';
import { useMyModule } from '../model/use-my-module';
import { myModuleUtil } from '../lib/my-module.util';
```

**Use single quotes** for all imports (project standard)

---

## Public API Pattern

### slice/index.ts

Export public API from the slice for clean imports:

```typescript
// modules/my-module/index.ts

// Export main components
export { MyModuleMain } from './ui/my-module-main';
export { MyModuleHeader } from './ui/my-module-header';

// Export hooks
export { useMyModule } from './model/use-my-module';
export { useSuspenseMyModule } from './model/use-suspense-my-module';

// Export API
export { myModuleApi } from './api/my-module.api';

// Export types
export type { MyModuleData, MyModuleConfig } from './model/my-module.type';
```

**Usage:**

```typescript
// ✅ Clean import from slice index
import { MyModuleMain, useMyModule } from '~modules/my-module';

// ❌ Avoid deep imports (but OK if needed)
import { MyModuleMain } from '~modules/my-module/ui/my-module-main';
```

---

## Directory Structure Visualization

```
src/
├── app/                         # Providers, router mount, global styles
│   ├── providers/
│   ├── styles/
│   └── main.tsx
│
├── routes/                      # TanStack Router tree (router-owned, not a layer)
│   ├── __root.tsx
│   ├── index.tsx
│   ├── project-catalog/
│   │   ├── index.tsx
│   │   └── create/
│   └── blogs/
│
├── pages/                       # Route-level screens
│   ├── post-list/
│   │   ├── ui/
│   │   ├── model/
│   │   └── index.ts
│   ├── blog-list/
│   └── login/
│
├── widgets/                     # Composite UI blocks
│   ├── post-table/
│   ├── app-bar/
│   └── side-nav/
│
├── modules/                     # Domain-specific interactions
│   ├── post-manage/
│   │   ├── ui/
│   │   ├── model/
│   │   ├── api/
│   │   ├── lib/
│   │   ├── config/
│   │   └── index.ts
│   ├── blog-build/
│   └── auth/
│
├── entities/                    # Business entities and data access
│   ├── post/
│   │   ├── ui/
│   │   ├── model/
│   │   ├── api/
│   │   └── index.ts
│   ├── blog/
│   └── user/
│
└── shared/                      # Reusable, domain-agnostic
    ├── ui/                      # Reusable components
    │   ├── suspense-loader/
    │   ├── custom-app-bar/
    │   ├── error-boundary/
    │   └── loading-overlay/
    ├── lib/                     # Shared hooks and utilities
    │   ├── use-mui-snackbar.ts
    │   ├── use-debounce.ts
    │   └── utils.ts
    ├── api/                     # HTTP client
    │   └── api-client.ts
    └── config/                  # Configuration
        └── theme.ts
```

---

## Summary

**Key Principles:**

1. **modules/** for domain-specific interactions
2. **shared/ui/** for truly reusable UI
3. Use slice segments: ui/, model/, api/, lib/, config/
4. Import aliases for clean imports (@/, ~pages, ~widgets, ~modules, ~entities, ~shared)
5. Consistent naming: kebab-case everywhere, `<slug>.<scope>.<ext>` for scoped files
6. Export public API from slice index.ts
7. Import downward only: app → pages → widgets → modules → entities → shared

**See Also:**

- [component-patterns.md](component-patterns.md) - Component structure
- [data-fetching.md](data-fetching.md) - API service patterns
- [complete-examples.md](complete-examples.md) - Full feature example
