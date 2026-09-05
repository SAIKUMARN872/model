# AI Workspace Frontend

A modern AI-powered web application built with **Next.js**, **React**, and **TypeScript**.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack React Query
- Axios
- Lucide React
- React Hook Form
- Zod

---

## Project Structure

```text
apps/web
│
├── public/
│
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── hooks/
│   ├── layouts/
│   ├── lib/
│   ├── middleware/
│   ├── providers/
│   ├── services/
│   ├── stores/
│   ├── styles/
│   └── utils/
│
├── fonts/
├── icons/
├── images/
├── logos/
│
├── package.json
└── README.md
```

---

## Installation

Install dependencies:

```bash
npm install
```

or

```bash
npm install --legacy-peer-deps
```

---

## Run Development Server

```bash
npm run dev
```

The application starts at:

```
http://localhost:3000
```

---

## Production Build

```bash
npm run build
```

Run production:

```bash
npm start
```

---

## Environment Variables

Create a `.env.local` file.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SOCKET_URL=ws://localhost:8000
NEXT_PUBLIC_APP_NAME=AI Workspace
NEXT_PUBLIC_APP_ENV=development
```

---

## Features

- AI Chat
- AI Agents
- AI Workspace
- Document Management
- Voice Features
- Search
- Analytics Dashboard
- Authentication
- Role-based Permissions
- Organization Management
- Theme Support
- Notifications
- Responsive UI

---

## Folder Overview

### app

Application routes and pages.

### components

Reusable UI components.

### config

Application configuration.

### layouts

Application layouts.

### lib

API clients and shared libraries.

### middleware

Authentication and permission helpers.

### providers

React Context providers.

### services

Business logic and API services.

### stores

Global state management.

### styles

Global styles and themes.

### utils

Utility functions.

### assets

Static asset registry.

---

## Coding Guidelines

- Use TypeScript whenever possible.
- Keep components small and reusable.
- Store reusable logic inside `utils`.
- Place API logic inside `lib` or `services`.
- Use Context Providers for global state.
- Follow consistent naming conventions.

---

## License

This project is intended for educational and development purposes.