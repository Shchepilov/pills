# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` - Starts Vite dev server with HMR
- **Build for production**: `npm run build` - TypeScript compilation + Vite build
- **Lint code**: `npm run lint` - ESLint with TypeScript and React rules
- **Preview production build**: `npm run preview` - Serves production build locally

## Project Architecture

This is a React + TypeScript + Vite application with the following key characteristics:

### Build System
- **Vite**: Uses `rolldown-vite@7.1.12` (custom Vite distribution) for faster builds
- **TypeScript**: Project references setup with separate configs for app (`tsconfig.app.json`) and Node (`tsconfig.node.json`)
- **React Compiler**: Enabled via Babel plugin for automatic optimizations (impacts dev/build performance)

### Code Quality
- **ESLint**: Configured with TypeScript, React Hooks, and React Refresh rules
- **React 19**: Latest React version with new features and patterns
- **Strict Mode**: React StrictMode enabled in production

### Project Structure
```
src/
├── App.tsx          # Main app component
├── App.css          # App-specific styles
├── main.tsx         # React app entry point
├── index.css        # Global styles
└── assets/          # Static assets (SVGs, images)
```

### Notable Dependencies
- React 19.1.1 with latest features
- Babel React Compiler for automatic optimizations
- TypeScript 5.8+ for latest language features
- ESLint 9+ with flat config format

## Key Notes
- The project uses a custom Vite distribution (`rolldown-vite`) which may affect plugin compatibility
- React Compiler is enabled and will automatically optimize components
- No test framework is currently configured
- Standard Vite project structure with single-page app setup