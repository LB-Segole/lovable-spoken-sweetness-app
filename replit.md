# Voice AI Platform - replit.md

## Overview

This is a full-stack Voice AI platform built with React/TypeScript on the frontend and Express/Node.js on the backend. The application provides voice agents, assistants, and campaign management capabilities with real-time voice processing through WebSocket connections.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server:

- **Frontend**: React 18 with TypeScript, using Vite as the build tool
- **Backend**: Express.js with TypeScript, serving both API endpoints and static files
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state, React Context for auth
- **Real-time Communication**: WebSocket connections for voice processing

## Key Components

### Frontend Architecture
- **Component System**: Built on shadcn/ui with Radix UI primitives
- **Routing**: React Router for navigation with protected routes
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Voice Processing**: Custom hooks for WebSocket voice communication
- **Authentication**: Context-based auth with protected route patterns

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **Database Layer**: Drizzle ORM with connection pooling via Neon serverless
- **File Structure**: Modular approach with separate routes, storage, and utility modules
- **Development Setup**: Vite integration for seamless dev experience

### Database Schema
- **Users Table**: Basic user authentication with username/password
- **Voice Agents**: AI-powered voice assistants with configuration
- **Assistants**: Text and voice-based AI helpers
- **Campaigns**: Bulk calling campaign management
- **Call History**: Detailed call logs and analytics

## Data Flow

1. **Authentication**: User signs in through React context, backend validates credentials
2. **Voice Processing**: WebSocket connections handle real-time audio streaming
3. **API Calls**: Frontend uses TanStack Query for server state management
4. **Database Operations**: Drizzle ORM provides type-safe database interactions
5. **File Uploads**: Handled through backend with storage abstraction layer

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui**: Accessible UI components

### Voice & Audio Processing
- WebSocket connections for real-time voice communication
- Browser audio APIs for recording and playback
- Integration points for voice AI services

### Development Tools
- **TypeScript**: Full type safety across the stack
- **Vite**: Fast development and optimized builds
- **ESBuild**: Production backend bundling
- **PostCSS**: CSS processing with Tailwind

## Deployment Strategy

The application is configured for deployment with the following approach:

1. **Build Process**: 
   - Frontend: Vite builds static assets to `dist/public`
   - Backend: ESBuild bundles server code to `dist/index.js`

2. **Production Setup**:
   - Single server deployment serving both API and static files
   - Database migrations handled via Drizzle Kit
   - Environment variables for database connection

3. **Development Mode**:
   - Vite dev server with HMR for frontend
   - TSX for backend development with auto-reload
   - Integrated development experience

## Changelog
- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.