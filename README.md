# mostly.os

**mostly.os** is my personal portfolio redesigned as an interactive desktop operating system inspired by Windows 2000.

Instead of presenting a conventional portfolio page, mostly.os lets visitors interact with my work through a simulated operating-system environment: open applications, move and resize windows, switch themes, play games, browse projects, and explore my contact information.

> Built as a portfolio experiment to explore how far a web application can push the idea of a personal website while remaining usable and accessible.

## Features

- 🖥️ **Interactive desktop environment** with draggable application windows
- 🪟 **Window management** with multiple open windows, minimize, maximize, restore, and close
- 🎨 **Multiple themes**, including mostly.blue, mostly.night, and Windows Classic
- ♿ **Accessibility settings** including larger UI and high-contrast mode
- 🐍 **Built-in Snake game** with keyboard controls and a persistent high score
- 📁 **Desktop applications** for projects, contact information, help, system information, games, and more
- 🔎 **Built-in search** for navigating the portfolio
- 🧮 **Calculator application**
- 🌐 **Browser-style interface** for opening external links
- 💻 **Responsive mobile experience** with a dedicated mobile interface
- 💾 **Local persistence** for supported user preferences and game data

## Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **CSS custom properties** for the theme system
- **LocalStorage** for persistent client-side state

## Project Structure

```text
.
├── public/
│   └── pfp.png
├── src/
│   ├── imports/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── vite.config.ts
```

The main application currently lives in `src/App.tsx`. The project intentionally keeps the UI in one application module because the portfolio is designed as a single cohesive desktop environment.

## Getting Started

### Requirements

- Node.js 22+
- pnpm 10+

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Vite will provide a local development URL.

### Production build

```bash
pnpm build
```

### Type checking

```bash
pnpm typecheck
```

### Formatting

```bash
pnpm format
```

## Live Site

**[mostlydanny.dev](https://mostlydanny.dev)**

## Screenshots
<img width="1920" height="1080" alt="mostlyosMktImg01" src="https://github.com/user-attachments/assets/c7d45b3d-2209-4809-adad-14db584974d4" />
<img width="1920" height="1080" alt="mostlyosMktImg02" src="https://github.com/user-attachments/assets/bac8faf7-8f79-4f0b-89db-07cf5c7ad40c" />
<img width="1920" height="1080" alt="mostlyosMktImg03" src="https://github.com/user-attachments/assets/e9e2e5f4-b7c6-4569-9402-9393065ffa39" />

## About

I'm **Daniel Bryant**, a web designer and full-stack developer interested in web development, systems administration, networking, Linux, servers, and infrastructure.

This project is both my personal portfolio and an experiment in interactive web design.

## License

The source code is publicly available for viewing and reference. No license has been granted for redistribution, modification, or commercial reuse unless otherwise stated.
