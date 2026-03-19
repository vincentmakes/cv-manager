#!/usr/bin/env node

/**
 * Build the CV Manager Express server as a self-contained sidecar binary
 * using @yao-pkg/pkg. The output binary includes the Node.js runtime,
 * all JavaScript source, and native modules (better-sqlite3).
 *
 * Usage:
 *   node build-sidecar.js              # Build for current platform
 *   node build-sidecar.js --target linux-x64
 *   node build-sidecar.js --target macos-arm64
 *   node build-sidecar.js --target macos-x64
 *   node build-sidecar.js --target win-x64
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '..');
const BINARIES_DIR = path.join(ROOT_DIR, 'src-tauri', 'binaries');
const SERVER_ENTRY = path.join(ROOT_DIR, 'src', 'server.js');

// Map of our shorthand targets to pkg targets and Tauri target triples
const TARGETS = {
    'linux-x64': {
        pkg: 'node20-linux-x64',
        triple: 'x86_64-unknown-linux-gnu',
        ext: '',
    },
    'macos-x64': {
        pkg: 'node20-macos-x64',
        triple: 'x86_64-apple-darwin',
        ext: '',
    },
    'macos-arm64': {
        pkg: 'node20-macos-arm64',
        triple: 'aarch64-apple-darwin',
        ext: '',
    },
    'win-x64': {
        pkg: 'node20-win-x64',
        triple: 'x86_64-pc-windows-msvc',
        ext: '.exe',
    },
};

function detectCurrentTarget() {
    const platform = process.platform;
    const arch = process.arch;

    if (platform === 'linux' && arch === 'x64') return 'linux-x64';
    if (platform === 'darwin' && arch === 'x64') return 'macos-x64';
    if (platform === 'darwin' && arch === 'arm64') return 'macos-arm64';
    if (platform === 'win32' && arch === 'x64') return 'win-x64';

    console.error(`Unsupported platform: ${platform}-${arch}`);
    process.exit(1);
}

function main() {
    // Parse --target argument
    const args = process.argv.slice(2);
    let targetName;

    const targetIdx = args.indexOf('--target');
    if (targetIdx !== -1 && args[targetIdx + 1]) {
        targetName = args[targetIdx + 1];
    } else {
        targetName = detectCurrentTarget();
    }

    const target = TARGETS[targetName];
    if (!target) {
        console.error(`Unknown target: ${targetName}`);
        console.error(`Available targets: ${Object.keys(TARGETS).join(', ')}`);
        process.exit(1);
    }

    console.log(`Building sidecar for ${targetName} (${target.triple})...`);

    // Ensure binaries directory exists
    fs.mkdirSync(BINARIES_DIR, { recursive: true });

    // Output path with Tauri target triple suffix
    const outputName = `cv-manager-server-${target.triple}${target.ext}`;
    const outputPath = path.join(BINARIES_DIR, outputName);

    // Run pkg from the project root so it can find node_modules
    const pkgBin = path.join(__dirname, 'node_modules', '.bin', 'pkg');
    const cmd = [
        pkgBin,
        `"${SERVER_ENTRY}"`,
        '--target', target.pkg,
        '--output', `"${outputPath}"`,
        '--compress', 'GZip',
    ].join(' ');

    console.log(`Running: ${cmd}`);
    execSync(cmd, {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        env: { ...process.env },
    });

    // Verify output exists
    if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        console.log(`\nSidecar built successfully: ${outputPath} (${sizeMB} MB)`);
    } else {
        console.error('\nERROR: Sidecar binary was not created');
        process.exit(1);
    }
}

main();
