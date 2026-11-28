# ISD Messaging

ISD Messaging is a cross-platform messaging app built with Expo and React Native. It includes a message inbox, contacts, conversation threads, message search, profile and settings screens.

> This is a demo application. It does not send real SMS messages or provide production authentication.

## Features

- Browse conversations, filter unread or pinned threads, and search conversations and messages.
- View contacts and start a new conversation.
- Send demo messages and see simulated delivery statuses and optional automatic replies.
- Pin conversations, mark messages as read, clear conversation history, and manage threads.
- Customize the theme and other app preferences.
- Keep the demo session, conversations, messages, and preferences on the device.

## Tech stack

- **Expo SDK 58** and **React Native 0.88** for iOS, Android, and web.
- **React 19** with JavaScript and JSX.
- **Expo Router** for file-based navigation.
- **AsyncStorage** for local session, settings, contacts, and conversation data.
- **DummyJSON** for optional demo conversation/contact data and simulated replies. Local sample data is available as a fallback.
- **React Native Safe Area Context**, **React Native Gesture Handler**, **React Native Reanimated**, Expo vector icons, and **Lucide React Native** for mobile UI and icons.

## Getting started

Install the dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

Then open the app in Expo Go or a development build. Platform-specific commands are also available:

```bash
npm run android
npm run ios
npm run web
```

## Useful commands

Run the linter:

```bash
npm run lint
```

Check the JavaScript project configuration with TypeScript:

```bash
npx tsc --noEmit -p jsconfig.json
```

## Project structure

```text
src/
  app/          Expo Router screens and layouts
  components/   Reusable UI components
  constants/    Theme and shared constants
  context/      Authentication and settings state
  hooks/        Theme and color-scheme hooks
  services/     Local storage repositories, sample data, and demo API access
  utils/        Shared formatting, alert, and reply helper functions
```

The main routes are:

- `src/app/index.jsx` — inbox and contacts tabs.
- `src/app/chat/[id].jsx` — conversation thread.
- `src/app/compose.jsx` — compose a message.
- `src/app/profile.jsx` — profile and appearance settings.
- `src/app/settings.jsx` — app settings.
- `src/app/(auth)/login.jsx` — local demo sign-in.

## Demo data and behavior

The app stores its demo session, conversations, messages, and preferences in device storage using AsyncStorage. On first run, it attempts to load sample data from DummyJSON and falls back to bundled sample data when that request is unavailable. Sending messages and automatic replies are simulated; no message is delivered to a phone number.
