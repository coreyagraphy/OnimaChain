// Starts the Vite dev server from this project directory regardless of the caller's cwd.
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const port = process.argv[2] ?? '8080'
process.chdir(root)
const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', 'dev', '--host', '127.0.0.1', '--port', port, '--strictPort'], { stdio: 'inherit', shell: process.platform === 'win32' })
child.on('exit', (c) => process.exit(c ?? 0))
