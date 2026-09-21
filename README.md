# Timeline Creator

Timeline Creator is a React + Vite application for exploring historical events on an interactive timeline. It lets users pan across eras, zoom in on specific periods, and view major events in a visual, time-based layout.

The project is designed as a flexible foundation for building historical, biographical, or event-driven storytelling interfaces. It includes sample data for a wide range of periods and has hooks for pulling structured event metadata from Wikimedia sources.

## Features

- Interactive timeline visualization with zoom and pan controls
- Mouse-wheel zoom centered on the cursor position
- Drag-to-pan navigation across time
- Animated timeline transitions for presentation/demo purposes
- Built-in sample historical dataset spanning ancient, medieval, and modern history
- Planned/experimental Wikipedia and Wikidata API integration for enrichment and event lookup

## Tech Stack

- React 19
- TypeScript
- Vite
- Axios
- Wikimedia APIs (Wikipedia / Wikidata)

## Project Goals

This project aims to make historical timelines easier to explore and present visually. It can serve as:

- a research tool for comparing periods and events
- a presentation UI for educational content
- a starting point for a larger historical knowledge app
- a testbed for timeline rendering and event data aggregation

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

This will launch the app in Vite’s local development environment, typically at a local URL such as http://localhost:5173.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Project Structure

```text
timeline-creator/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
└── README.md
```

## Notes

This project is still evolving and includes experimental integration work with Wikimedia data sources. The timeline itself is already functional with sample data, while the API-driven event lookup can be expanded or refined as the app matures.

## License

This project does not currently declare a license. If you plan to publish or distribute it, add an appropriate open-source license before doing so.
