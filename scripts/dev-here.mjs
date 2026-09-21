// Starts the Vite dev server from this project directory regardless of the caller's cwd.
// Spawned without a shell so the child dies with this process (no orphaned port holders).
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const port = process.argv[2] ?? '8080'
process.chdir(root)
const vite = resolve(root, 'node_modules', 'vite', 'bin', 'vite.js')
const child = spawn(process.execPath, [vite, 'dev', '--host', '127.0.0.1', '--port', port, '--strictPort'], { stdio: 'inherit' })
const stop = () => { try { child.kill() } catch { /* already gone */ } }
process.on('exit', stop)
process.on('SIGINT', () => { stop(); process.exit(0) })
process.on('SIGTERM', () => { stop(); process.exit(0) })
child.on('exit', (c) => process.exit(c ?? 0))
