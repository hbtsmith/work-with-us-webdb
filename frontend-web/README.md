# Work With Us - Frontend

A modern React application for managing job applications, built with TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

- **Modern React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** for form handling
- **Lucide React** for icons
- **Responsive design** with mobile-first approach
- **Authentication** with JWT tokens
- **Protected routes** for admin access

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Vitest** - Testing framework
- **Testing Library** - Component testing

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── assets/             # Static assets
└── test/               # Test setup and utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3002`

### Building

Build for production:
```bash
npm run build
```

### Testing

Run tests:
```bash
npm run test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Linting

Run ESLint:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

Format code with Prettier:
```bash
npm run format
```

## 🎨 Design System

The application uses a custom design system built on Tailwind CSS:

- **Primary Colors**: Blue palette for main actions
- **Secondary Colors**: Gray palette for text and backgrounds
- **Typography**: Inter font family
- **Components**: Custom button, input, and card components
- **Responsive**: Mobile-first approach with breakpoints

## 🔐 Authentication

The app uses JWT-based authentication:

- Login with email/password
- Token stored in localStorage
- Automatic token refresh
- Protected routes for admin access
- Logout functionality

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly** interface
- **Accessible** navigation with keyboard support

## 🧪 Testing

- **Unit tests** for components and hooks
- **Integration tests** for user interactions
- **Coverage reporting** with Vitest
- **Testing Library** for component testing

## 🚀 Deployment

The app can be deployed to:

- **Vercel** (recommended)
- **Netlify**
- **Cloudflare Pages**
- **Any static hosting service**

Build command: `npm run build`
Output directory: `dist/`

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 🤝 Contributing

1. Follow the coding standards (ESLint + Prettier)
2. Write tests for new features
3. Use TypeScript for type safety
4. Follow the component structure
5. Update documentation as needed

## 📄 License

This project is part of the Work With Us system.
