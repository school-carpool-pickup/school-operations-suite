# SafePickup Architecture Context

Welcome to the SafePickup codebase! This document outlines exactly how the architecture is established and how features should be implemented.

## Ecosystem Overview
SafePickup is a comprehensive school management ecosystem consisting of **3 distinct portals**. Currently, it runs in a single Next.js app using **Mock Data**. DO NOT connect to real external APIs during this demo phase; strictly use our mock infrastructure.

### Portals
1. **Admin Portal** (`/admin`): School CRM, Users & Roles. Theme: **Purple**.
2. **Staff Portal** (`/staff`): Pickup management, active boards. Theme: **Blue**.
3. **Business Portal** (`/business`): Analytics, BLE Beacon tracking. Theme: **Orange**.

## Tech Stack Rules
- **Framework:** Next.js 15 App Router. Add `use client` strictly where interactivity is needed.
- **Styling:** Tailwind CSS v4 + Shadcn UI.
  - **CRITICAL:** Dark mode is strictly disabled. Use `bg-white`, `bg-zinc-50`.
  - **Theming:** The portals use CSS variables. Themes are defined in `globals.css` and scoped using wrappers like `theme-admin`, `theme-staff`, etc. `PortalShell` maps these automatically.
- **State:** `zustand` (global, synchronous) and `@tanstack/react-query` v5 (asynchronous mock server state). Use Axios to fetch from mock endpoints or MSW when applicable.
- **UI & Aesthetics:** "vibrant colors, glassmorphism, dynamic animations". This is NOT a basic MVP. Ensure polished hover effects and highly professional layouts.

## Directory Structure
- `src/app/(portals)`: Contains the 3 routing environments. They share `PortalShell` layout. 
- `src/components/layout`: Shared headers and sidebars.
- `src/components/ui`: Shadcn primitives.
- `src/mocks`: Store all fake API endpoints, JSON responses, and test data here.
- `src/config`: Static runtime info (`site.ts`, `portals.ts`).
- `src/tests`: Vitest environment.

When instructed to build features, check if there's a shared component first. Follow the mock-first architecture.
