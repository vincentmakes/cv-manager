# CV Manager Desktop App

Desktop version of CV Manager using [Tauri 2.0](https://v2.tauri.app/). The existing Express server runs as a sidecar process inside a native webview window.

## Architecture

```
┌──────────────────────────────────┐
│  Tauri Native Window (WebView)   │
│  ┌────────────────────────────┐  │
│  │  http://127.0.0.1:{port}   │  │
│  │  (Admin UI)                │  │
│  └────────────────────────────┘  │
│             ▲                    │
│             │ HTTP               │
│             ▼                    │
│  ┌────────────────────────────┐  │
│  │  Sidecar: Express Server   │  │
│  │  (compiled with @yao-pkg)  │  │
│  │  SQLite DB in app data dir │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

- The Express server (`src/server.js`) is compiled into a self-contained binary using `@yao-pkg/pkg`
- Tauri spawns it as a sidecar on a random available port, bound to `127.0.0.1`
- The webview loads the admin UI from the sidecar's HTTP server
- Database is stored in the OS app data directory (`~/.config/cv-manager/` on Linux, `~/Library/Application Support/me.verdet.cv-manager/` on macOS, `%APPDATA%/me.verdet.cv-manager/` on Windows)

## Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Rust toolchain](https://rustup.rs/)
- Platform-specific dependencies:
  - **Linux**: `sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Windows**: [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

## Development

```bash
# 1. Install app dependencies (from project root)
npm install

# 2. Install desktop build tools
cd desktop && npm install && cd ..

# 3. Build the sidecar for your platform
node desktop/build-sidecar.js

# 4. Run in development mode
cd src-tauri && cargo tauri dev
```

In dev mode, the webview points to `http://localhost:3000`. You can run the Express server separately with `npm run dev` for hot-reload during development.

## Building for Production

```bash
# Build sidecar + Tauri app
node desktop/build-sidecar.js
cd src-tauri && cargo tauri build
```

Output binaries will be in `src-tauri/target/release/bundle/`.

## CI/CD

The GitHub Actions workflow (`.github/workflows/desktop.yml`) builds for all platforms on push of `desktop-v*` tags:

```bash
git tag desktop-v0.1.0
git push origin desktop-v0.1.0
```

This creates a draft GitHub Release with `.dmg` (macOS), `.AppImage`/`.deb` (Linux), and `.msi` (Windows) installers.

## Build Targets

| Platform    | Sidecar Target | Tauri Triple                  |
|-------------|----------------|-------------------------------|
| macOS ARM   | `macos-arm64`  | `aarch64-apple-darwin`        |
| macOS Intel | `macos-x64`    | `x86_64-apple-darwin`         |
| Linux x64   | `linux-x64`    | `x86_64-unknown-linux-gnu`    |
| Windows x64 | `win-x64`      | `x86_64-pc-windows-msvc`      |
