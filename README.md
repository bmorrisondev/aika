# Aika ⏳ - Time Tracking Made Simple

## Project Overview

Aika is a cross-platform time tracking application built with Expo and React Native. The name "Aika" means "time" in Finnish, reflecting the app's focus on simple, efficient time management. Aika helps users track their work sessions with an intuitive timer interface and comprehensive history of previous time entries.

Key features include:
- Simple start/stop timer functionality
- Task description for each time entry
- History of previous time entries with duration calculation
- User authentication and data persistence
- Cross-platform support (iOS, Android, Web)

## Clerk Authentication Integration

This project showcases how to implement secure, modern authentication in a React Native app using Expo with [Clerk](https://clerk.dev). Clerk provides a complete authentication and user management solution that's easy to implement and highly customizable.

In Aika, Clerk powers:
- User sign-up and sign-in flows
- Session management across devices
- Secure access token handling for backend API calls
- Integration with Supabase for authenticated database access

## Local Development

### Prerequisites

- Node.js 16+
- pnpm (preferred package manager)
- Expo CLI
- Clerk account and API keys
- Supabase account and API keys

### Setup

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/aika.git
   cd aika
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory with your Clerk and Supabase credentials

   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server

   ```bash
   pnpm expo start
   ```

5. Open the app in your preferred environment:
   - iOS simulator
   - Android emulator
   - Web browser
   - Physical device with Expo Go app

## Technologies Used

- **Frontend**:
  - [Expo](https://expo.dev) - React Native framework
  - [React Native](https://reactnative.dev) - Cross-platform UI
  - [Expo Router](https://docs.expo.dev/router/introduction) - File-based routing
  - [TypeScript](https://www.typescriptlang.org) - Type safety

- **Authentication**:
  - [Clerk](https://clerk.dev) - User authentication and session management

- **Backend**:
  - [Supabase](https://supabase.com) - PostgreSQL database and API

- **Styling**:
  - [React Native StyleSheet](https://reactnative.dev/docs/stylesheet) - Component styling

## Contribution Guidelines

We welcome contributions to Aika! Here's how you can help:

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing TypeScript patterns
- Use async/await for asynchronous operations

### Issues

Please use the GitHub issue tracker to report bugs or request features.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
