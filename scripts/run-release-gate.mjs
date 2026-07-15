import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const startedAt = Date.now();
const compile = spawnSync('./node_modules/.bin/tsc', ['-p', 'tsconfig.scripts.json'], {
  cwd: process.cwd(),
  encoding: 'utf8',
});

if (compile.stdout) process.stdout.write(compile.stdout);
if (compile.stderr) process.stderr.write(compile.stderr);

const compileDurationMs = Date.now() - startedAt;
if ((compile.status ?? 1) !== 0) {
  mkdirSync('artifacts', { recursive: true });
  const summary = {
    timestamp: new Date().toISOString(),
    commit: 'unavailable',
    nodeVersion: process.version,
    npmVersion: 'unavailable',
    status: 'failed',
    failures: ['scripts TypeScript compilation failed'],
    checks: [{
      name: 'Scripts TypeScript',
      command: './node_modules/.bin/tsc -p tsconfig.scripts.json',
      status: 'failed',
      exitCode: compile.status ?? 1,
      durationMs: compileDurationMs,
      detail: 'Compilation failed before the release gate runner could start.',
    }],
  };
  writeFileSync('artifacts/release-gate-summary.json', `${JSON.stringify(summary, null, 2)}\n`);
  writeFileSync('artifacts/release-gate-summary.md', `## Release Gate\n\n- Final status: **FAILED**\n- Scripts TypeScript: failed (${compileDurationMs}ms)\n`);
  process.exit(compile.status ?? 1);
}

const gate = spawnSync(process.execPath, ['.sync-build/scripts/release-gate.js', ...process.argv.slice(2)], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: {
    ...process.env,
    RELEASE_GATE_SCRIPTS_TSC_DURATION_MS: String(compileDurationMs),
  },
});

process.exit(gate.status ?? 1);
