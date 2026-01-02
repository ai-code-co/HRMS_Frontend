# Excellence HRMS

Human Resource Management System built with Nuxt 3, Vue 3, and TypeScript.

## Features

- 👤 **Employee Management** - Profile management, personal details, bank information
- 📅 **Leave Management** - Apply leaves, view leave balances, track leave requests
- ✅ **Attendance Tracking** - View attendance records with calendar interface
- 📦 **Inventory Management** - Track devices and equipment assigned to employees
- 🎉 **Holidays** - View company holidays and upcoming events
- 📊 **Dashboard** - Overview of key metrics and activities

## Tech Stack

- **Framework**: Nuxt 3
- **UI Library**: Nuxt UI (Vue 3 + Tailwind CSS)
- **State Management**: Pinia
- **Validation**: Zod
- **Icons**: Lucide Vue Next
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ 
- npm or pnpm

## Setup

1. Clone the repository

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:5000/api
```

For production, update the API_BASE_URL to your production API endpoint.

4. Start the development server:

```bash
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
app/
├── components/     # Vue components
├── composables/    # Composable functions (useApi, useAuth, etc.)
├── layouts/        # Layout components
├── middleware/     # Route middleware
├── pages/          # Application pages (file-based routing)
├── plugins/        # Nuxt plugins
├── schemas/        # Zod validation schemas
├── stores/         # Pinia stores
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Authentication

The application uses JWT-based authentication with refresh tokens. Tokens are stored in cookies and automatically refreshed when expired.

## API Integration

All API calls are made through the `useApi` composable which handles:
- Automatic token injection
- Token refresh on 401 errors
- Error handling
- Base URL configuration

## Development

See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for a comprehensive list of improvement recommendations and implementation roadmap.

## License

Proprietary - Excellence Technologies
