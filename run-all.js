/**
 * CIS046-3 Software For Enterprise
 * Root Process Orchestrator
 * Spawns both the Express Backend (Port 5000) and Vite React Frontend (Port 5173)
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('🍌 STARTING THE BANANA GAME ENTERPRISE FULL-STACK SYSTEM');
console.log('================================================================');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Launch Backend Server
const serverProc = spawn(npmCmd, ['run', 'start'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// 2. Launch React Frontend
const clientProc = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\nShutting down The Banana Game processes...');
  try { serverProc.kill(); } catch (e) {}
  try { clientProc.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
