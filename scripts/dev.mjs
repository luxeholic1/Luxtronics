import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const childProcesses = [];
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function start(command, args, label) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    cwd: repoRoot,
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (signal || code !== 0) {
      console.log(`[${label}] exited with ${signal || code}`);
      shutdown();
    }
  });

  childProcesses.push(child);
  return child;
}

function shutdown() {
  for (const child of childProcesses) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start('npm', ['run', 'dev:server'], 'server');
start('npm', ['run', 'dev:client', '--', '--host', '::', '--port', '5173'], 'client');