# SyncLyrics

**SyncLyrics** is a free, browser-based app for creating and playing synchronized lyrics — inspired by Instagram Story–style typography. Upload a song, align lyrics to the beat, and preview them in multiple display modes.

> **Work in progress** — This project is under active development. Features, UI, and behavior may change between releases. Some areas are still being refined.

## Features

- **Lyric sync editor** — Align lyrics line-by-line or word-by-word using keyboard shortcuts and a waveform view
- **LRC import** — Load existing `.lrc` files into the editor
- **Three display modes**
  - **Block** — Progressive word reveal (story-style)
  - **Flow** — Scrolling line view
  - **Karaoke** — Horizontal word highlight
- **Player tools** — Playback speed, A–B loop, custom background image, Google Fonts
- **Story preview** — Full-screen 9:16 preview
- **Local library** — Songs stored in the browser (IndexedDB + metadata); no account or server required
- **100% client-side** — No paid APIs; runs entirely in your browser

## Tech stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [React Router](https://reactrouter.com/)
- [wavesurfer.js](https://wavesurfer.xyz/) for waveform visualization

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ recommended

### Install & run

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Home |
| `/library` | Song library — import, search, sort, manage tracks |
| `/editor` | Create a new synced song |
| `/editor/:id` | Edit an existing song |
| `/play/:id` | Play lyrics with chosen display mode and settings |

## How it works

1. **Import or create** — Add an audio file and lyrics (paste text or import LRC) in the editor or library
2. **Sync** — Use the waveform and **Space** to mark line or word timestamps
3. **Play** — Open the player, pick Block / Flow / Karaoke, adjust font and background, optionally use Story mode

Audio and song data are stored locally in your browser. Clearing site data will remove your library.

## Project status

Development is ongoing. Planned and in-progress improvements may include:

- UI polish across all pages
- Additional export and sharing options
- Further editor and player refinements

Contributions, feedback, and issue reports are welcome as the project evolves.

## License

Private / personal project unless otherwise noted. Check with the repository owner before redistribution.
