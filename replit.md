# Overview

ToolHub is a comprehensive web application that provides a collection of productivity tools and utilities in a unified dashboard interface. The application serves as a one-stop solution for various tasks including media processing, developer tools, text analysis, security utilities, and productivity features. Users can access tools like image resizing, PDF merging, JSON formatting, password generation, word counting, and more through an intuitive categorized interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built using **React 18** with **TypeScript** and follows a modern component-based architecture. The application uses **Wouter** for lightweight client-side routing instead of React Router, providing efficient navigation between different tool pages. State management is handled through React's built-in hooks and **TanStack Query** for server state management and caching.

The UI is constructed using **shadcn/ui** components built on top of **Radix UI** primitives, providing accessible and customizable interface elements. **Tailwind CSS** handles styling with a comprehensive design system that includes dark mode support through CSS variables and theme switching functionality.

## Backend Architecture
The server is built with **Express.js** and follows a RESTful API design pattern. The application uses an in-memory storage implementation (`MemStorage`) for development, which can be easily swapped with a database-backed storage solution. The server includes middleware for request logging, JSON parsing, and error handling.

File upload functionality is implemented using **Multer** with configurable size limits and storage destinations. The API includes endpoints for tool usage tracking, bookmark management, and file processing operations.

## Data Storage Design
The database schema is defined using **Drizzle ORM** with PostgreSQL as the target database. The schema includes tables for:
- **Users**: Authentication and user management
- **Tools**: Tool metadata and configuration
- **Tool Usage**: Analytics and usage tracking
- **Bookmarks**: User's saved tools

The schema uses UUIDs for primary keys and includes proper foreign key relationships between entities.

## Build and Development Setup
The application uses **Vite** as the build tool for fast development and optimized production builds. The development server includes hot module replacement (HMR) and runtime error overlays for enhanced developer experience. The build process creates optimized bundles with automatic code splitting.

TypeScript configuration includes path mapping for clean imports (@/ for client components, @shared for shared types). The project structure separates client, server, and shared code into distinct directories.

## Theming and Styling
The application implements a comprehensive theming system using CSS custom properties, supporting both light and dark modes. The theme system includes predefined color palettes, typography scales, and spacing systems. Theme switching is handled through React context and persisted in localStorage.

## Component Architecture
The UI follows atomic design principles with reusable components organized hierarchically. Base UI components are provided by shadcn/ui, while application-specific components are built on top of these primitives. The component library includes form controls, navigation elements, data display components, and layout utilities.

# External Dependencies

## Core Frontend Libraries
- **React 18**: Component framework with hooks and concurrent features
- **TypeScript**: Type safety and enhanced developer experience
- **Vite**: Build tool and development server
- **Wouter**: Lightweight client-side routing

## UI and Styling
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling
- **Lucide React**: Icon library

## Backend Dependencies
- **Express.js**: Web application framework
- **Multer**: File upload middleware
- **Drizzle ORM**: Type-safe database ORM
- **Zod**: Schema validation library

## Database
- **PostgreSQL**: Primary database (configured via Drizzle)
- **Neon Database**: Serverless PostgreSQL provider (via @neondatabase/serverless)

## Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development
- **PostCSS**: CSS processing with Autoprefixer

## Form and State Management
- **React Hook Form**: Form handling and validation
- **TanStack Query**: Server state management and caching
- **Hookform Resolvers**: Validation resolver for React Hook Form

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional className utility
- **nanoid**: Unique ID generation