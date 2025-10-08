# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EPIK (Every Place In Korea) is a Nuxt 3 application for discovering cultural events in Korea, including concerts, exhibitions, musicals, and pop-up stores. The application features both a public-facing frontend and an admin dashboard.

## Development Commands

### Running the Application
```bash
npm run dev        # Start dev server on localhost:3001
npm run build      # Build for production
npm run preview    # Preview production build
npm run generate   # Generate static site
```

### Backend Connection
The application connects to a backend API at `http://localhost:8081/api/v1` (configurable via `nuxt.config.ts` runtimeConfig).

## Architecture

### State Management
- **Pinia** stores in `stores/`:
  - `auth.js`: Handles JWT authentication, token storage, user session
  - `pagination.js`: Manages pagination state across list views

### Data Fetching Patterns
- `useAuthFetch()` (composables/useAuthFetch.js): For authenticated API calls, automatically includes Bearer token
- `useDataFetch()` (composables/useDataFetch.js): For public API calls
- `$api` plugin (plugins/api.js): Base API configuration with runtime config

### Routing Structure
- **Public pages**: `/concert`, `/exhibition`, `/musical`, `/popup`, `/feed`
- **Admin pages**: `/admin/*` - Content management for all event types
- **Dynamic routes**: `[id]/index.vue` for detail pages, `[id]/edit.vue` for admin editing

### Layout System
- `layouts/default.vue`: Public pages with Header/Footer
- `layouts/admin.vue`: Admin dashboard layout
- Auto-imported components from `components/`

### Rich Text Editing
Toast UI Editor is used for content management with SSR disabled for specific admin routes (see `nuxt.config.ts` nitro.routeRules).

### Smooth Scrolling
Lenis smooth scroll is implemented via `plugins/lenis.client.js` with:
- Scroll position memory for back navigation
- Automatic scroll-to-top on forward navigation
- FIFO cache with max 50 stored positions

### Composables
Reusable logic in `composables/`:
- `useContentList.js`: List fetching/filtering for concerts, exhibitions, etc.
- `useUserDetails.js`: User authentication state and token management
- `useKakaoMap.js`: Kakao Maps API integration
- `useImageUtils.js`: Image URL handling and optimization
- `useDateUtils.js`: Date formatting utilities
- `useDateRangePicker.js`: Date range picker integration
- `useAdminDashboard.js`: Admin dashboard utilities

### Key Dependencies
- **Nuxt 3.13.2**: Framework
- **Vue 3**: UI framework
- **Pinia**: State management
- **Lenis**: Smooth scrolling
- **Axios**: HTTP client
- **Toast UI Editor**: Rich text editor
- **jwt-decode**: JWT token parsing
- **vue3-google-login**: Google OAuth integration

## Important Configuration

### Environment Variables
Required in `.env`:
- `NUXT_PUBLIC_KAKAO_MAP_API_KEY`: Kakao Maps API key
- `NUXT_PUBLIC_KAKAO_LOGIN_API_KEY`: Kakao Login API key

### SSR Considerations
Several admin routes have SSR disabled due to Toast UI Editor compatibility (see `nuxt.config.ts` line 26-35).

### CSS Organization
Global styles in `public/css/`:
- `global.css`: Base styles
- `fonts.css`: Font definitions
- `icon.css`: Icon system
- `p-style.css`: Typography styles
- `admin/`: Admin-specific styles

## Known Issues

- Typo in `stores/auth.js:12` - `windwo` should be `window`
- The application uses client-side token storage in localStorage (consider security implications)
